import { useState, useRef, useEffect } from "react"
import api from "../api/axios"
import {
  Upload, FileDown, Loader, Search, HardDrive, CheckCircle,
  Zap, Trash2, RefreshCw, X, File, AlertCircle
} from "lucide-react"

/* ─── Tailwind colour tokens (matching original palette) ───────────────────
   bg-cream        = #F4F0E4
   bg-card         = #FDFAF2
   teal-900        = #183D3D
   teal-700        = #2a5c5c  (hover darken)
   teal-600        = #5A8A8A
   teal-400        = #7A9E9E
   teal-300        = #9BB5B5
   teal-200        = #6A9090
   red-brand       = #EA5455
   green-brand     = #2a7a4e
   We map these to arbitrary-value Tailwind classes throughout.
─────────────────────────────────────────────────────────────────────────── */

export default function BinaryUpload() {
  const [files, setFiles] = useState([])
  const [uploadedFilenames, setUploadedFilenames] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [foundFiles, setFoundFiles] = useState([])
  const [allFiles, setAllFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadProgress, setUploadProgress] = useState({})
  const [searchStatus, setSearchStatus] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [confirmModal, setConfirmModal] = useState({ show: false, file: null })
  const [replaceModal, setReplaceModal] = useState({ show: false, file: null })
  const [replaceFile, setReplaceFile] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const filesPerPage = 5
  const [filterTerm, setFilterTerm] = useState("")

  useEffect(() => { fetchAllFiles() }, [])

  const fetchAllFiles = async () => {
    try {
      setLoadingFiles(true)
      const res = await api.get("/list-bin")
      setAllFiles(res.data.files || [])
    } catch (err) {
      console.error("Failed to fetch files", err)
    } finally {
      setLoadingFiles(false)
    }
  }

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2800)
  }

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    const binFiles = fileArray.filter(f => f.name.toLowerCase().endsWith(".bin"))
    const nonBin = fileArray.filter(f => !f.name.toLowerCase().endsWith(".bin"))
    if (nonBin.length > 0) showToast(`${nonBin.length} file(s) skipped — only .bin allowed`, "error")
    if (!binFiles.length) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...binFiles.filter(f => !existing.has(f.name))]
    })
    setUploadStatus(null)
    setUploadedFilenames([])
  }

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))
  const clearAllFiles = () => { setFiles([]); setUploadedFilenames([]); setUploadProgress({}) }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files)
  }

  const handleUploadAll = async () => {
    if (!files.length) return
    setLoading(true); setUploadStatus("uploading"); setUploadProgress({})
    const ok = [], fail = []
    for (const file of files) {
      const fd = new FormData(); fd.append("file", file)
      try {
        setUploadProgress(p => ({ ...p, [file.name]: "uploading" }))
        const res = await api.post("/upload-bin", fd, { headers: { "Content-Type": "multipart/form-data" } })
        ok.push(res.data.filename)
        setUploadProgress(p => ({ ...p, [file.name]: "success" }))
      } catch {
        fail.push(file.name)
        setUploadProgress(p => ({ ...p, [file.name]: "error" }))
      }
    }
    if (ok.length) {
      setUploadedFilenames(ok); setUploadStatus("success")
      showToast(`Uploaded ${ok.length} file(s) 🚀`); fetchAllFiles(); setFiles([])
    } else if (fail.length === files.length) {
      setUploadStatus("error"); showToast("Upload failed ❌", "error")
    } else {
      setUploadStatus("partial"); showToast(`${ok.length} uploaded, ${fail.length} failed`, "error")
    }
    setLoading(false)
    setTimeout(() => setUploadProgress({}), 3000)
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    try {
      setSearching(true); setSearchStatus(null); setFoundFiles([])
      const res = await api.get(`/search-bin/${searchTerm.trim()}`)
      if (res.data.exists) { setFoundFiles(res.data.matches || [res.data.filename]); setSearchStatus("found") }
    } catch { setSearchStatus("notfound") }
    finally { setSearching(false) }
  }

  const handleDownload = async (name) => {
    try {
      const res = await api.get(`/getbin/${name}`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url; a.download = name; a.click()
      window.URL.revokeObjectURL(url)
    } catch { showToast("Download failed ❌", "error") }
  }

  const confirmDeleteFile = async () => {
    try {
      await api.delete(`/delete-bin/${confirmModal.file}`)
      setFoundFiles(p => p.filter(f => f !== confirmModal.file))
      showToast("File deleted 🗑️"); fetchAllFiles()
    } catch { showToast("Delete failed ❌", "error") }
    finally { setConfirmModal({ show: false, file: null }) }
  }

  const handleReplaceFile = async () => {
    if (!replaceModal.file || !replaceFile) return
    const fd = new FormData(); fd.append("file", replaceFile); fd.append("filename", replaceModal.file)
    try {
      setLoading(true); await api.put("/replace-bin", fd)
      setReplaceFile(null); showToast("File replaced 🔁")
      setReplaceModal({ show: false, file: null }); fetchAllFiles()
    } catch (err) { showToast(err?.response?.data?.message || "Replace failed ❌", "error") }
    finally { setLoading(false) }
  }

  const fmt = (b) => {
    if (!b) return "—"
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1048576).toFixed(1)} MB`
  }
  const fmtDate = (ts) => ts ? new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""

  const filteredFiles = allFiles.filter(f => f.filename.toLowerCase().includes(filterTerm.toLowerCase()))
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage)
  const currentFiles = filteredFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage)

  const handlePageChange = (p) => {
    setCurrentPage(p)
    document.getElementById("all-files-list")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  useEffect(() => setCurrentPage(1), [filterTerm])

  const ProgressIcon = ({ status }) => {
    if (status === "uploading") return <Loader size={12} className="animate-spin text-[#7A9E9E]" />
    if (status === "success") return <CheckCircle size={12} className="text-[#2a7a4e]" />
    if (status === "error") return <AlertCircle size={12} className="text-[#EA5455]" />
    return null
  }

  /* ── File row ────────────────────────────────────────────────────── */
  const FileRow = ({ name, size, modified }) => (
    <div className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#183D3D]/[0.04] border border-[#183D3D]/10 hover:bg-[#183D3D]/[0.07] transition-colors duration-150">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <CheckCircle size={13} className="text-[#2a7a4e] shrink-0" />
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-semibold truncate text-[#183D3D] leading-tight">{name}</p>
          <p className="m-0 text-[11px] font-mono text-[#6A9090] leading-tight">
            {fmt(size)}{modified ? ` · ${fmtDate(modified)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
        <button onClick={() => handleDownload(name)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#183D3D] hover:bg-[#0f2a2a] text-white transition-colors duration-150 border-0 cursor-pointer">
          <FileDown size={11} /><span>Download</span>
        </button>
        <button onClick={() => { setReplaceFile(null); setReplaceModal({ show: true, file: name }) }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#5A8A8A] hover:bg-[#3d6b6b] text-white transition-colors duration-150 border-0 cursor-pointer">
          <RefreshCw size={11} /><span>Replace</span>
        </button>
        <button onClick={() => setConfirmModal({ show: true, file: name })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#EA5455] hover:bg-[#d43f40] text-white transition-colors duration-150 border-0 cursor-pointer">
          <Trash2 size={11} /><span>Delete</span>
        </button>
      </div>
    </div>
  )

  /* ── Section label ───────────────────────────────────────────────── */
  const SectionLabel = ({ children }) => (
    <p className="m-0 mb-4 text-[10.5px] font-bold uppercase tracking-widest text-[#7A9E9E]">{children}</p>
  )

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <div className="min-h-screen bg-[#F4F0E4] flex items-start justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-['DM_Sans','Segoe_UI',sans-serif]">

      {/* Background decorations */}
      <div className="pointer-events-none absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(24,61,61,0.07) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(24,61,61,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(24,61,61,0.045) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[2000] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-[13px] font-semibold border transition-all duration-300 max-w-[90vw]
          ${toast.type === "error"
            ? "bg-[#FFF0F0] border-[#EA5455]/30 text-[#EA5455]"
            : "bg-[#F0FFF7] border-[#2a7a4e]/30 text-[#2a7a4e]"}`}>
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#183D3D]/10 border border-[#183D3D]/20">
            <HardDrive size={18} className="text-[#183D3D]" />
          </div>
          <div>
            <h1 className="m-0 text-xl sm:text-2xl font-bold tracking-tight text-[#183D3D]" style={{ letterSpacing: "-0.3px" }}>
              Binary Upload
            </h1>
            <p className="m-0 mt-0.5 text-[12px] sm:text-[13px] text-[#6A9090]">Upload, search, or download .bin files</p>
          </div>

        </div>

        {/* ── Main Card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden bg-[#FDFAF2] border border-[#183D3D]/12"
          style={{ boxShadow: "0 8px 32px rgba(24,61,61,0.09), 0 2px 6px rgba(24,61,61,0.04)" }}>

          {/* Accent bar */}
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#EA5455 0%,#183D3D 60%,transparent 100%)" }} />

          <div className="p-5 sm:p-7 lg:p-8 space-y-8">

            {/* ════ UPLOAD SECTION ════════════════════════════════════ */}
            <section>
              <SectionLabel>Upload Binary Files</SectionLabel>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-xl cursor-pointer transition-all duration-200 ${dragOver
                  ? "border-2 border-dashed border-[#EA5455] bg-[#FFF6F6]"
                  : "border-2 border-dashed border-[#183D3D]/20 bg-[#F4F0E4] hover:border-[#183D3D]/35 hover:bg-[#EDE9DA]"}`}
                style={{ padding: "28px 16px" }}
              >
                <input ref={fileInputRef} type="file" multiple accept=".bin" className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)} />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${dragOver ? "bg-[#EA5455]/10" : "bg-[#183D3D]/08"}`}>
                    <Upload size={20} className={dragOver ? "text-[#EA5455]" : "text-[#9BB5B5]"} />
                  </div>
                  <p className="m-0 text-[13px] text-[#6A9090]">
                    <span className="text-[#EA5455] font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="m-0 text-[11px] text-[#9BB5B5]">Only .bin files · Multiple files supported</p>
                </div>
              </div>

              {/* Selected file list */}
              {files.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#183D3D]">
                      {files.length} file{files.length !== 1 ? "s" : ""} selected · {fmt(totalSize)}
                    </span>
                    <button onClick={clearAllFiles}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#EA5455] bg-transparent border-0 cursor-pointer px-2 py-0.5 rounded hover:bg-[#EA5455]/8 transition-colors">
                      <X size={12} /> Clear all
                    </button>
                  </div>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-[#183D3D]/10 divide-y divide-[#183D3D]/05">
                    {files.map((f, idx) => (
                      <div key={`${f.name}-${idx}`}
                        className={`flex items-center justify-between px-3 py-2 ${idx % 2 === 0 ? "bg-transparent" : "bg-[#183D3D]/[0.015]"}`}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <File size={12} className="text-[#6A9090] shrink-0" />
                          <span className="text-[12px] truncate text-[#183D3D]">{f.name}</span>
                          <span className="text-[10px] text-[#9BB5B5] shrink-0">({fmt(f.size)})</span>
                          {uploadProgress[f.name] && <ProgressIcon status={uploadProgress[f.name]} />}
                        </div>
                        <button onClick={() => removeFile(idx)}
                          disabled={uploadProgress[f.name] === "uploading"}
                          className="opacity-50 hover:opacity-100 transition-opacity bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed p-0.5">
                          <X size={12} className="text-[#9BB5B5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload button */}
              <div className="flex flex-col items-center justify-center w-full">
                <button onClick={handleUploadAll} disabled={!files.length || loading}
                  className={`mt-4 w-50 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white text-sm font-semibold transition-all duration-200 border-0
      ${files.length && !loading ? "bg-[#EA5455] hover:bg-[#d43f40] cursor-pointer shadow-sm" : "bg-[#EA5455]/40 cursor-not-allowed"}`}>
                  {loading
                    ? <><Loader size={15} className="animate-spin" /><span>Uploading {files.length} file(s)…</span></>
                    : <><Zap size={15} /><span>Upload All ({files.length} file{files.length !== 1 ? "s" : ""})</span></>}
                </button>
              </div>

              {/* Status banners */}
              {uploadStatus === "success" && uploadedFilenames.length > 0 && (
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl mt-3 bg-[#2a7a4e]/06 border border-[#2a7a4e]/18">
                  <CheckCircle size={13} className="text-[#2a7a4e] mt-0.5 shrink-0" />
                  <div>
                    <p className="m-0 text-[13px] text-[#2a7a4e]">Uploaded {uploadedFilenames.length} file(s) successfully</p>
                    {uploadedFilenames.length <= 3 && (
                      <p className="m-0 text-[11px] text-[#6A9090] mt-0.5">{uploadedFilenames.join(", ")}</p>
                    )}
                  </div>
                </div>
              )}
              {uploadStatus === "partial" && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mt-3 bg-[#EA5455]/06 border border-[#EA5455]/18">
                  <AlertCircle size={13} className="text-[#EA5455] shrink-0" />
                  <p className="m-0 text-[13px] text-[#EA5455]">Some files failed — check and retry</p>
                </div>
              )}
              {uploadStatus === "error" && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mt-3 bg-[#EA5455]/06 border border-[#EA5455]/18">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455] shrink-0" />
                  <p className="m-0 text-[13px] text-[#EA5455]">Upload failed — please try again</p>
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-[#183D3D]/08" />

            {/* ════ SEARCH SECTION ════════════════════════════════════ */}
            {/* <section>
              <SectionLabel>Search Files (API)</SectionLabel>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BB5B5]" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[#F4F0E4] border border-[#183D3D]/16 text-[#183D3D] placeholder:text-[#9BB5B5] focus:bg-[#FFF6F6] focus:border-[#EA5455]/50"
                    placeholder="Type filename…"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setSearchStatus(null); setFoundFiles([]) }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button onClick={handleSearch} disabled={!searchTerm.trim() || searching}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border border-[#183D3D]/25 text-[#183D3D] bg-transparent hover:bg-[#183D3D]/08 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap">
                  {searching ? <><Loader size={14} className="animate-spin" />Searching…</> : <><Search size={14} />Search</>}
                </button>
              </div>

              {searchStatus === "notfound" && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mt-3 bg-[#EA5455]/06 border border-[#EA5455]/18">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455] shrink-0" />
                  <p className="m-0 text-[13px] text-[#EA5455]">No file found matching "{searchTerm}"</p>
                </div>
              )}

              {searchStatus === "found" && foundFiles.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {foundFiles.map(name => {
                    const info = allFiles.find(f => f.filename === name)
                    return <FileRow key={name} name={name} size={info?.size} modified={info?.modified} />
                  })}
                </div>
              )}
            </section> */}

            {/* Divider */}
            <div className="border-t border-[#183D3D]/08" />

            {/* ════ ALL FILES SECTION ═════════════════════════════════ */}
            <section id="all-files-list">
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between">

                  <button onClick={fetchAllFiles}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg text-[#6A9090] bg-transparent border border-[#183D3D]/15 cursor-pointer hover:bg-[#183D3D]/06 transition-colors">
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>

                {/* Filter */}
                <div className="relative flex flex-col sm:flex-row items-center justify-end ">
                  <Search size={19} className="absolute ml-103 left-3.5 top-1/2 -translate-y-1/2 text-[#9BB5B5]" />
                  <input
                    type="text"
                    placeholder="Search by Filename "
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="w-50 text-center pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 bg-[#F4F0E4] border border-[#183D3D]/16 text-[#183D3D] placeholder:text-[#9BB5B5] focus:bg-[#FFF6F6] focus:border-[#EA5455]/50"
                  />
                  {filterTerm && (
                    <button onClick={() => setFilterTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BB5B5] hover:text-[#EA5455] bg-transparent border-0 cursor-pointer text-xs transition-colors">
                      ✕
                    </button>
                  )}

                </div>
                <p className="ml-4 text-[10.5px] font-bold uppercase tracking-widest text-[#213C51]">
                  All uploaded Files
                  {allFiles.length > 0 && <span className="ml-1.5 text-[#183D3D]">({allFiles.length})</span>}
                </p>
              </div>


              {loadingFiles ? (
                <div className="flex items-center justify-center py-8 gap-2 text-[#9BB5B5]">
                  <Loader size={14} className="animate-spin" />
                  <span className="text-[13px]">Loading files…</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-[#F4F0E4] border border-dashed border-[#183D3D]/15">
                  <HardDrive size={20} className="mx-auto mb-2 text-[#C5BBAA]" />
                  <p className="m-0 text-[13px] text-[#9BB5B5]">
                    {filterTerm ? `No files match "${filterTerm}"` : "No files uploaded yet"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    {currentFiles.map(f => (
                      <FileRow key={f.filename} name={f.filename} size={f.size} modified={f.modified} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-center  gap-3 mt-4 pt-3 border-t border-[#183D3D]/08">
                      <div className="flex items-center gap-1 order-1 sm:order-2">
                        {/* Prev */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#183D3D]/08 text-[#183D3D] border-0 cursor-pointer hover:bg-[#183D3D]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          ‹ Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            // always show first 2 & last 2
                            if (p === 1 || p === 2 || p === totalPages || p === totalPages - 1) return true;
                            // show current page
                            if (p === currentPage) return true;
                            return false;
                          })
                          .map((p, i, arr) => {
                            const prevPage = arr[i - 1];
                            return (
                              <span key={p} className="flex items-center gap-1">
                                {/* ellipsis */}
                                {prevPage && p - prevPage > 1 && (
                                  <span className="px-1 text-[11px] text-[#9BB5B5]">…</span>
                                )}

                                <button
                                  onClick={() => handlePageChange(p)}
                                  className={`min-w-[28px] px-2 py-1 rounded-lg text-[11px] font-medium border-0 cursor-pointer transition-colors
                  ${currentPage === p
                                      ? "bg-[#EA5455] text-white"
                                      : "bg-[#183D3D]/08 text-[#183D3D] hover:bg-[#183D3D]/15"
                                    }`}
                                >
                                  {p}
                                </button>
                              </span>
                            );
                          })}

                        {/* Next */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#183D3D]/08 text-[#183D3D] border-0 cursor-pointer hover:bg-[#183D3D]/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-[#9BB5B5] mt-4">Only .bin files · Max size governed by server config</p>
      </div>

      {/* ── DELETE MODAL ─────────────────────────────────────────────── */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 bg-[#FDFAF2] border border-[#183D3D]/15 animate-[scaleIn_0.2s_ease]"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EA5455]/10">
                <Trash2 size={16} className="text-[#EA5455]" />
              </div>
              <h3 className="m-0 text-[16px] font-bold text-[#183D3D]">Delete File?</h3>
            </div>
            <p className="m-0 text-[13px] text-[#6A9090]">
              This will permanently delete <span className="text-[#EA5455] font-semibold">{confirmModal.file}</span>.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmModal({ show: false, file: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-[#183D3D]/25 text-[#183D3D] cursor-pointer hover:bg-[#183D3D]/05 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteFile}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#EA5455] hover:bg-[#d43f40] border-0 cursor-pointer transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPLACE MODAL ────────────────────────────────────────────── */}
      {replaceModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 bg-[#FDFAF2] border border-[#183D3D]/15 animate-[scaleIn_0.2s_ease]"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#5A8A8A]/15">
                <RefreshCw size={16} className="text-[#5A8A8A]" />
              </div>
              <h3 className="m-0 text-[16px] font-bold text-[#183D3D]">Replace File</h3>
            </div>
            <p className="m-0 text-[13px] text-[#6A9090]">
              Replacing <span className="font-semibold text-[#183D3D]">{replaceModal.file}</span>
            </p>

            <input id="replace-file-input" type="file" accept=".bin" className="hidden"
              onChange={(e) => { const f = e.target.files[0]; if (f) setReplaceFile(f); e.target.value = "" }} />

            <div onClick={() => document.getElementById("replace-file-input").click()}
              className={`mt-4 w-full flex flex-col items-center justify-center gap-1.5 rounded-xl cursor-pointer transition-all duration-200 p-4
                ${replaceFile
                  ? "border border-[#2a7a4e]/40 bg-[#2a7a4e]/05"
                  : "border-2 border-dashed border-[#183D3D]/20 bg-[#F4F0E4] hover:border-[#183D3D]/35"}`}>
              {replaceFile ? (
                <>
                  <CheckCircle size={18} className="text-[#2a7a4e]" />
                  <p className="m-0 text-[13px] font-semibold text-[#2a7a4e]">{replaceFile.name}</p>
                  <p className="m-0 text-[11px] text-[#6A9090]">{fmt(replaceFile.size)} — click to change</p>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-[#9BB5B5]" />
                  <p className="m-0 text-[13px] text-[#9BB5B5]">Click to select .bin file</p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setReplaceModal({ show: false, file: null }); setReplaceFile(null) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-[#183D3D]/25 text-[#183D3D] cursor-pointer hover:bg-[#183D3D]/05 transition-colors">
                Cancel
              </button>
              <button onClick={handleReplaceFile} disabled={!replaceFile || loading}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white border-0 flex items-center gap-2 transition-colors
                  ${replaceFile && !loading ? "bg-[#183D3D] hover:bg-[#0f2a2a] cursor-pointer" : "bg-[#999] cursor-not-allowed"}`}>
                {loading ? <><Loader size={14} className="animate-spin" />Replacing…</> : "Replace"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  )
}
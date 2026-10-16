// import { useState, useEffect } from "react"
// import api from "../api/axios";
// import { useNavigate } from "react-router-dom"
// import { Cpu, CheckCircle, Loader, ArrowRight } from "lucide-react"

// export default function Instrument() {
//   const [name, setName] = useState("")
//   const [code, setCode] = useState("")
//   const [RTUserialNumber, setRTUserialNumber] = useState("")
//   const [existingId, setExistingId] = useState("")
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [verifying, setVerifying] = useState(false)
//   const [list, setList] = useState([])
//   const [searchCode, setSearchCode] = useState("")
//   const [showModal, setShowModal] = useState(false)
//   const nav = useNavigate()

//   const fetchAvailable = async (codeParam = "") => {
//     try {
//       const res = await api.get(`/instrument/available?code=${codeParam}`)
//       setList(res.data)
//     } catch (err) {
//       console.log("Fetch error")
//     }
//   }

//   useEffect(() => {
//     const stored = localStorage.getItem("RTUserialNumber")
//     if (stored) {
//       nav("/dashboard")
//     }
//   }, [])

//   const generate = async () => {
//     setError("")

//     if (!name.trim() || !code.trim()) {
//       setError("Instrument name and code required")
//       return
//     }

//     try {
//       setLoading(true)

//       await api.post("/instrument/create", {
//         instrumentName: name.trim(),
//         instrumentCode: code.trim()
//       })

//       // ✅ open modal + refresh list
//       setShowModal(true)
//       fetchAvailable(code)

//     } catch (err) {
//       setError(err.response?.data?.error || "Error generating serial ID")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const verifyDevice = async () => {
//     setError("")
//     if (!existingId.trim()) {
//       setError("Enter Serial ID")
//       return
//     }
//     try {
//       setVerifying(true)
//       const res = await api.get(`/device/check/${existingId}`);
//       if (res.data.exists) {
//         localStorage.setItem("RTUserialNumber", existingId)
//         nav("/dashboard")
//       } else {
//         setError("Serial ID not found")
//       }
//     } catch (err) {
//       setError("Server error")
//     } finally {
//       setVerifying(false)
//     }
//   }

//   return (
//     <div style={styles.page}>
//       <div style={styles.bgGlow} />
//       <div style={styles.bgGrid} />

//       <div style={styles.container}>
//         <div style={styles.pageHeader}>
//           <div style={styles.iconWrap}>
//             <Cpu size={18} color="#183D3D" />
//           </div>
//           <div>
//             <h1 style={styles.pageTitle}>Instrument Setup</h1>
//             <p style={styles.pageSubtitle}>Initialize or connect your device</p>
//           </div>
//         </div>

//         <div style={styles.card}>
//           <div style={styles.accentBar} />
//           <div style={styles.inner}>

//             <p style={styles.sectionLabel}>New Instrument</p>

//             <div style={styles.form}>
//               <div style={styles.row}>
//                 <div style={styles.fieldGroup}>
//                   <label style={styles.label}>Instrument Name</label>
//                   <input
//                     style={styles.input}
//                     placeholder="e.g. Sensor Alpha"
//                     value={name}
//                     onChange={e => setName(e.target.value)}
//                     onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
//                     onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
//                   />
//                 </div>
//                 <div style={styles.fieldGroup}>
//                   <label style={styles.label}>Instrument Code</label>
//                   <input
//                     style={styles.input}
//                     placeholder="e.g. INS-001"
//                     value={code}
//                     onChange={e => setCode(e.target.value)}
//                     onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
//                     onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
//                   />
//                 </div>
//               </div>

//               <button
//                 onClick={generate}
//                 disabled={!name || !code || loading}
//                 style={{ ...styles.btn, ...(!name || !code || loading ? styles.btnDisabled : {}) }}
//                 onMouseEnter={e => (name && code && !loading) && Object.assign(e.currentTarget.style, styles.btnHover)}
//                 onMouseLeave={e => (name && code && !loading) && Object.assign(e.currentTarget.style, styles.btnBase)}
//               >
//                 {loading
//                   ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /><span>Generating...</span></>
//                   : <><Cpu size={15} /><span>Generate Serial ID</span></>
//                 }
//               </button>
//             </div>

//             {error && (
//               <div style={styles.errorBox}>
//                 <span style={styles.errorDot} />
//                 <p style={styles.errorText}>{error}</p>
//               </div>
//             )}

//             <div style={{ marginTop: "20px" }}>
//               <p style={styles.sectionLabel}>Search Available Devices</p>

//               <input
//                 style={styles.input}
//                 placeholder="Search Instrument Code (WRF)"
//                 value={searchCode}
//                 onFocus={() => {
//                   setShowModal(true)
//                   fetchAvailable()
//                 }}
//                 onChange={(e) => {
//                   setSearchCode(e.target.value)
//                   fetchAvailable(e.target.value)
//                 }}
//               />
//             </div>

//             <div style={styles.orDivider}>
//               <div style={styles.orLine} />
//               <span style={styles.orText}>or connect existing</span>
//               <div style={styles.orLine} />
//             </div>

//             <div style={styles.verifyRow}>
//               <input
//                 style={{ ...styles.input, flex: 1 }}
//                 placeholder="Enter existing Serial ID"
//                 value={existingId}
//                 onChange={e => setExistingId(e.target.value)}
//                 onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
//                 onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
//               />
//               <button
//                 onClick={verifyDevice}
//                 disabled={verifying}
//                 style={{ ...styles.ghostBtn, ...(verifying ? styles.btnDisabled : {}) }}
//                 onMouseEnter={e => !verifying && Object.assign(e.currentTarget.style, styles.ghostBtnHover)}
//                 onMouseLeave={e => !verifying && Object.assign(e.currentTarget.style, styles.ghostBtnBase)}
//               >
//                 {verifying
//                   ? <Loader size={15} style={{ animation: "spin 1s linear infinite" }} />
//                   : <><ArrowRight size={15} /><span>Verify</span></>
//                 }
//               </button>
//             </div>
//             {showModal && (
//               <div style={modalStyles.overlay} onClick={() => setShowModal(false)}>

//                 <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>

//                   <h3 style={{ marginBottom: "12px" }}>Available Devices</h3>

//                   {list.length === 0 && (
//                     <p style={{ fontSize: "13px", color: "#777" }}>
//                       No available devices
//                     </p>
//                   )}

//                   {list.map((item) => (
//                     <div key={item.RTUserialNumber} style={modalStyles.item}>

//                       <div>
//                         <p style={{ margin: 0, fontWeight: 600 }}>
//                           {item.instrumentName}
//                         </p>
//                         <p style={styles.serialText}>
//                           {item.RTUserialNumber}
//                         </p>
//                       </div>

//                       <button
//                         style={styles.secondaryBtn}
//                         onClick={() => {
//                           nav("/dashboard", {
//                             state: {
//                               RTUserialNumber: item.RTUserialNumber
//                             }
//                           })
//                         }}
//                       >
//                         Connect
//                       </button>

//                     </div>
//                   ))}

//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
//     </div>
//   )
// }

// const styles = {
//   page: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: "100vh",
//     backgroundColor: "#F4F0E4",
//     fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//     position: "relative",
//     overflow: "hidden",
//     padding: "24px",
//   },
//   bgGlow: {
//     position: "absolute",
//     top: "5%",
//     left: "15%",
//     width: "600px",
//     height: "600px",
//     borderRadius: "50%",
//     background: "radial-gradient(circle, rgba(24,61,61,0.06) 0%, transparent 70%)",
//     pointerEvents: "none",
//   },
//   bgGrid: {
//     position: "absolute",
//     inset: 0,
//     backgroundImage:
//       "linear-gradient(rgba(24,61,61,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(24,61,61,0.05) 1px, transparent 1px)",
//     backgroundSize: "40px 40px",
//     pointerEvents: "none",
//   },

//   container: {
//     position: "relative",
//     width: "100%",
//     maxWidth: "560px",
//     zIndex: 1,
//   },
//   pageHeader: {
//     display: "flex",
//     alignItems: "center",
//     gap: "14px",
//     marginBottom: "24px",
//   },
//   iconWrap: {
//     width: "38px",
//     height: "38px",
//     borderRadius: "10px",
//     backgroundColor: "rgba(24,61,61,0.1)",
//     border: "1px solid rgba(24,61,61,0.2)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },
//   pageTitle: {
//     margin: 0,
//     fontSize: "22px",
//     fontWeight: "700",
//     color: "#183D3D",
//     letterSpacing: "-0.3px",
//   },
//   pageSubtitle: {
//     margin: "2px 0 0",
//     fontSize: "13px",
//     color: "#6A9090",
//   },
//   card: {
//     backgroundColor: "#FDFAF2",
//     border: "1px solid rgba(24,61,61,0.12)",
//     borderRadius: "16px",
//     overflow: "hidden",
//     boxShadow: "0 8px 32px rgba(24,61,61,0.08), 0 2px 6px rgba(24,61,61,0.04)",
//   },
//   accentBar: {
//     height: "3px",
//     background: "linear-gradient(90deg, #EA5455, #183D3D, transparent)",
//   },
//   inner: { padding: "32px" },
//   sectionLabel: {
//     margin: "0 0 20px",
//     fontSize: "11px",
//     fontWeight: "700",
//     color: "#7A9E9E",
//     letterSpacing: "1px",
//     textTransform: "uppercase",
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "16px",
//     marginBottom: "16px",
//   },
//   row: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "12px",
//   },
//   fieldGroup: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px",
//   },
//   label: {
//     fontSize: "11px",
//     fontWeight: "700",
//     color: "#7A9E9E",
//     letterSpacing: "0.7px",
//     textTransform: "uppercase",
//   },
//   input: {
//     padding: "11px 14px",
//     backgroundColor: "#F4F0E4",
//     border: "1px solid rgba(24,61,61,0.16)",
//     borderRadius: "8px",
//     color: "#183D3D",
//     fontSize: "14px",
//     outline: "none",
//     fontFamily: "inherit",
//     transition: "border-color 0.2s, background-color 0.2s",
//     width: "100%",
//     boxSizing: "border-box",
//   },
//   inputFocus: {
//     borderColor: "rgba(234,84,85,0.45)",
//     backgroundColor: "#FFF6F6",
//   },
//   inputBlur: {
//     borderColor: "rgba(24,61,61,0.16)",
//     backgroundColor: "#F4F0E4",
//   },
//   btn: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "8px",
//     padding: "12px",
//     backgroundColor: "#EA5455",
//     border: "none",
//     borderRadius: "8px",
//     color: "#fff",
//     fontSize: "14px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "background-color 0.2s",
//     fontFamily: "inherit",
//   },
//   btnBase: { backgroundColor: "#EA5455" },
//   btnHover: { backgroundColor: "#d43f40" },
//   btnDisabled: { opacity: 0.4, cursor: "not-allowed" },
//   errorBox: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "10px 14px",
//     backgroundColor: "rgba(234,84,85,0.06)",
//     border: "1px solid rgba(234,84,85,0.18)",
//     borderRadius: "8px",
//     marginBottom: "16px",
//   },
//   errorDot: {
//     width: "6px",
//     height: "6px",
//     borderRadius: "50%",
//     backgroundColor: "#EA5455",
//     flexShrink: 0,
//   },
//   errorText: { margin: 0, fontSize: "13px", color: "#EA5455" },
//   resultBox: {
//     padding: "16px",
//     backgroundColor: "rgba(24,61,61,0.05)",
//     border: "1px solid rgba(24,61,61,0.14)",
//     borderRadius: "10px",
//     marginBottom: "20px",
//   },
//   resultHeader: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     marginBottom: "10px",
//   },
//   resultLabel: {
//     fontSize: "12px",
//     color: "#2a7a4e",
//     fontWeight: "700",
//     letterSpacing: "0.5px",
//   },
//   serialText: {
//     margin: "0 0 14px",
//     fontFamily: "'Fira Code', 'Courier New', monospace",
//     fontSize: "13px",
//     color: "#183D3D",
//     wordBreak: "break-all",
//     lineHeight: 1.6,
//   },
//   secondaryBtn: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: "6px",
//     padding: "9px 16px",
//     backgroundColor: "rgba(24,61,61,0.08)",
//     border: "1px solid rgba(24,61,61,0.2)",
//     borderRadius: "7px",
//     color: "#183D3D",
//     fontSize: "13px",
//     fontWeight: "600",
//     cursor: "pointer",
//     fontFamily: "inherit",
//     transition: "background-color 0.2s",
//   },
//   secondaryBtnBase: { backgroundColor: "rgba(24,61,61,0.08)" },
//   secondaryBtnHover: { backgroundColor: "rgba(24,61,61,0.15)" },
//   orDivider: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     margin: "24px 0",
//   },
//   orLine: {
//     flex: 1,
//     height: "1px",
//     backgroundColor: "rgba(24,61,61,0.12)",
//   },
//   orText: {
//     fontSize: "11px",
//     color: "#7A9E9E",
//     letterSpacing: "0.6px",
//     textTransform: "uppercase",
//     fontWeight: "700",
//     whiteSpace: "nowrap",
//   },
//   verifyRow: {
//     display: "flex",
//     gap: "10px",
//     alignItems: "center",
//   },
//   ghostBtn: {
//     display: "flex",
//     alignItems: "center",
//     gap: "6px",
//     padding: "11px 18px",
//     backgroundColor: "transparent",
//     border: "1px solid rgba(24,61,61,0.25)",
//     borderRadius: "8px",
//     color: "#183D3D",
//     fontSize: "14px",
//     fontWeight: "600",
//     cursor: "pointer",
//     fontFamily: "inherit",
//     transition: "background-color 0.2s, border-color 0.2s",
//     whiteSpace: "nowrap",
//     flexShrink: 0,
//   },
//   ghostBtnBase: {
//     backgroundColor: "transparent",
//     borderColor: "rgba(24,61,61,0.25)",
//   },
//   ghostBtnHover: {
//     backgroundColor: "rgba(24,61,61,0.08)",
//     borderColor: "rgba(24,61,61,0.4)",
//   },
// }

// const modalStyles = {
//   overlay: {
//     position: "fixed",
//     inset: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 999
//   },
//   modal: {
//     width: "420px",
//     maxHeight: "400px",
//     overflowY: "auto",
//     backgroundColor: "#fff",
//     borderRadius: "12px",
//     padding: "20px"
//   },
//   item: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "10px 0",
//     borderBottom: "1px solid #eee"
//   }
// }/


import { useState, useEffect } from "react"
import api from "../api/axios";
import { useNavigate } from "react-router-dom"
import { Cpu, Loader, ArrowRight, Search, X, Wifi, ChevronRight, Zap } from "lucide-react"

export default function Instrument() {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [RTUserialNumber, setRTUserialNumber] = useState("")
  const [existingId, setExistingId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [list, setList] = useState([])
  const [searchCode, setSearchCode] = useState("")
  const [showModal, setShowModal] = useState(false)
  const nav = useNavigate()

  const fetchAvailable = async (codeParam) => {
    try {
      let url = "/instrument/available"

      const cleanCode = (codeParam || "").trim().toUpperCase()

      if (cleanCode) {
        url += `?code=${cleanCode}`
      }

      console.log("CALLING URL:", url)

      const res = await api.get(url)

      console.log("API RESPONSE:", res.data)

      setList(Array.isArray(res.data) ? res.data : [])

    } catch (err) {
      console.log("Fetch error", err)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("RTUserialNumber")
    if (stored) {
      nav("/dashboard")
    }
  }, [])

  useEffect(() => {
    const clean = code.trim().toUpperCase()

    if (!clean || clean.length < 3) {
      setList([])
      return
    }

    const timer = setTimeout(() => {
      fetchAvailable(clean)
    }, 300) // debounce

    return () => clearTimeout(timer)
  }, [code])

  const generate = async () => {
    setError("")

    if (!name.trim() || !code.trim()) {
      setError("Instrument name and code required")
      return
    }

    const cleanCode = code.trim().toUpperCase()

    try {
      setLoading(true)

      await api.post("/instrument/create", {
        instrumentName: name.trim(),
        instrumentCode: cleanCode
      })

      setShowModal(true)
      fetchAvailable(cleanCode)

    } catch (err) {
      setError(err.response?.data?.error || "Error generating serial ID")
    } finally {
      setLoading(false)
    }
  }

  const verifyDevice = async () => {
    setError("")
    if (!existingId.trim()) {
      setError("Enter Serial ID")
      return
    }
    try {
      setVerifying(true)
      const res = await api.get(`/device/check/${existingId}`);
      if (res.data.exists) {
        localStorage.setItem("RTUserialNumber", existingId)
        nav("/dashboard")
      } else {
        setError("Serial ID not found")
      }
    } catch (err) {
      setError("Server error")
    } finally {
      setVerifying(false)
    }
  }

  // 🔹 Safe list
  let allList = Array.isArray(list) ? list : []

  // 🔹 Separate real & next
  const realDevices = allList.filter(
  item => !item.isNextAvailable  // Not "next available"
)

  const nextDevices = allList.filter(
  item => item.isNextAvailable === true  // Is "next available"
)

  // 🔹 Search
  const search = searchCode.trim().toLowerCase()

  const filteredReal = realDevices.filter(item =>
    !search ||
    (item.instrumentName || "").toLowerCase().includes(search) ||
    (item.RTUserialNumber || "").toLowerCase().includes(search) ||
    (item.instrumentCode || "").toLowerCase().includes(search)
  )

  const filteredNext = nextDevices.filter(item =>
    !search ||
    (item.RTUserialNumber || "").toLowerCase().includes(search) ||
    (item.instrumentCode || "").toLowerCase().includes(search)
  )

  // 🔹 Total count (IMPORTANT)
  const totalFiltered = filteredReal.length + filteredNext.length

  return (
    <div className="min-h-screen bg-[#F4F0E4] flex items-center justify-center p-6 font-sans relative overflow-hidden">

      {/* Background effects */}
      <div className="absolute top-[5%] left-[15%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(24,61,61,0.06) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(24,61,61,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(24,61,61,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

      <div className="relative w-full max-w-[560px] z-10">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(24,61,61,0.1)] border border-[rgba(24,61,61,0.2)] flex items-center justify-center shrink-0">
            <Cpu size={18} color="#183D3D" />
          </div>
          <div>
            <h1 className="m-0 text-[22px] font-bold text-[#183D3D] tracking-tight">Instrument Setup</h1>
            <p className="mt-0.5 text-[13px] text-[#6A9090]">Initialize or connect your device</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#FDFAF2] border border-[rgba(24,61,61,0.12)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(24,61,61,0.08),0_2px_6px_rgba(24,61,61,0.04)]">

          {/* Accent bar */}
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #EA5455, #183D3D, transparent)" }} />

          <div className="p-8">

            {/* ── NEW INSTRUMENT ── */}
            <p className="mb-5 text-[11px] font-bold text-[#7A9E9E] tracking-[1px] uppercase">New Instrument</p>

            <div className="flex flex-col gap-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#7A9E9E] tracking-[0.7px] uppercase">Instrument Name</label>
                  <input
                    className="px-3.5 py-2.5 bg-[#F4F0E4] border border-[rgba(24,61,61,0.16)] rounded-lg text-[#183D3D] text-sm outline-none transition-all duration-200 w-full box-border focus:border-[rgba(234,84,85,0.45)] focus:bg-[#FFF6F6] placeholder:text-[#9BB5B5]"
                    placeholder="e.g. Sensor Alpha"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#7A9E9E] tracking-[0.7px] uppercase">Instrument Code</label>
                  <input
                    className="px-3.5 py-2.5 bg-[#F4F0E4] border border-[rgba(24,61,61,0.16)] rounded-lg text-[#183D3D] text-sm outline-none transition-all duration-200 w-full box-border focus:border-[rgba(234,84,85,0.45)] focus:bg-[#FFF6F6] placeholder:text-[#9BB5B5]"
                    placeholder="e.g. INS-001"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={generate}
                disabled={!name || !code || loading}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#EA5455] rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 border-none hover:bg-[#d43f40] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader size={15} className="animate-spin" /><span>Generating...</span></>
                  : <><Zap size={15} /><span>Generate Serial ID</span></>
                }
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[rgba(234,84,85,0.06)] border border-[rgba(234,84,85,0.18)] rounded-lg mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455] shrink-0" />
                <p className="m-0 text-[13px] text-[#EA5455]">{error}</p>
              </div>
            )}

            {/* ── SEARCH AVAILABLE DEVICES ── */}
            <div className="mt-5">
              <p className="mb-3 text-[11px] font-bold text-[#7A9E9E] tracking-[1px] uppercase">Search Available Devices</p>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BB5B5] pointer-events-none" />
                <input
                  className="pl-9 pr-4 py-2.5 bg-[#F4F0E4] border border-[rgba(24,61,61,0.16)] rounded-lg text-[#183D3D] text-sm outline-none transition-all duration-200 w-full box-border focus:border-[rgba(234,84,85,0.45)] focus:bg-[#FFF6F6] placeholder:text-[#9BB5B5] cursor-pointer"
                  placeholder="Search by name, code, or serial..."
                  value={searchCode}
                  onFocus={() => {
                    setError("")
                    setShowModal(true)

                    const cleanCode = code.trim().toUpperCase()

                    if (!cleanCode) {
                      fetchAvailable()
                      return
                    }

                    fetchAvailable(cleanCode)
                  }}
                  onChange={e => setSearchCode(e.target.value)}
                />
              </div>
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[rgba(24,61,61,0.12)]" />
              <span className="text-[11px] text-[#7A9E9E] tracking-[0.6px] uppercase font-bold whitespace-nowrap">or connect existing</span>
              <div className="flex-1 h-px bg-[rgba(24,61,61,0.12)]" />
            </div>

            {/* Verify row */}
            <div className="flex gap-2.5 items-center">
              <input
                className="flex-1 px-3.5 py-2.5 bg-[#F4F0E4] border border-[rgba(24,61,61,0.16)] rounded-lg text-[#183D3D] text-sm outline-none transition-all duration-200 box-border focus:border-[rgba(234,84,85,0.45)] focus:bg-[#FFF6F6] placeholder:text-[#9BB5B5]"
                placeholder="Enter existing Serial ID"
                value={existingId}
                onChange={e => setExistingId(e.target.value)}
              />
              <button
                onClick={verifyDevice}
                disabled={verifying}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-[rgba(24,61,61,0.25)] rounded-lg text-[#183D3D] text-sm font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 hover:bg-[rgba(24,61,61,0.08)] hover:border-[rgba(24,61,61,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {verifying
                  ? <Loader size={15} className="animate-spin" />
                  : <><ArrowRight size={15} /><span>Verify</span></>
                }
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[460px] bg-[#FDFAF2] rounded-2xl shadow-2xl overflow-hidden border border-[rgba(24,61,61,0.12)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 pt-5 pb-4 border-b border-[rgba(24,61,61,0.1)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(24,61,61,0.08)] flex items-center justify-center">
                    <Wifi size={13} color="#183D3D" />
                  </div>
                  <div>
                    <h3 className="m-0 text-[15px] font-bold text-[#183D3D]">Available Devices</h3>
                    <p className="m-0 text-[11px] text-[#7A9E9E]">{totalFiltered} device{totalFiltered !== 1 ? "s" : ""} found</p>
                  </div>
                </div>
                <button
                  className="w-7 h-7 rounded-lg bg-[rgba(24,61,61,0.06)] hover:bg-[rgba(24,61,61,0.12)] flex items-center justify-center transition-colors duration-150 border-none cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  <X size={14} color="#183D3D" />
                </button>
              </div>

              {/* Modal search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BB5B5] pointer-events-none" />
                <input
                  className="pl-8 pr-4 py-2 bg-[#F4F0E4] border border-[rgba(24,61,61,0.16)] rounded-lg text-[#183D3D] text-[13px] outline-none w-full box-border transition-all duration-200 focus:border-[rgba(234,84,85,0.45)] focus:bg-[#FFF6F6] placeholder:text-[#9BB5B5]"
                  placeholder="Filter by name, code, or serial ID..."
                  value={searchCode}
                  autoFocus
                  onChange={e => {
                    setSearchCode(e.target.value)
                  }}
                />
                {searchCode && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center hover:bg-[rgba(24,61,61,0.1)] transition-colors border-none bg-transparent cursor-pointer"
                    onClick={() => {
                      setSearchCode("")

                      const cleanCode = code.trim().toUpperCase()
                      fetchAvailable(cleanCode)
                    }}
                  >
                    <X size={11} color="#7A9E9E" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal list */}
            <div className="max-h-[320px] overflow-y-auto">
              {totalFiltered === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(24,61,61,0.06)] flex items-center justify-center">
                    <Cpu size={20} color="#9BB5B5" />
                  </div>
                  <div className="text-center">
                    <p className="m-0 text-[13px] font-semibold text-[#183D3D]">No devices found</p>
                    <p className="mt-1 m-0 text-[12px] text-[#9BB5B5]">
                      {searchCode ? "Try a different search term" : "No available devices registered"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(24,61,61,0.08)]">

                  {/* ✅ REAL DEVICES (NICHE) */}
                  {filteredReal.length > 0 && (
                    <>
                      <div className="px-5 py-2 text-[11px] font-bold text-[#2F6B3F] uppercase">
                        Available Devices
                      </div>

                      {filteredReal.map((item, idx) => (
                        <DeviceRow
                          key={item.RTUserialNumber}
                          item={item}
                          idx={idx + filteredNext.length} // 👈 IMPORTANT
                          nav={nav}
                        />
                      ))}
                    </>
                  )}

                  {/* 🔥 NEXT AVAILABLE (UPAR) */}
                  {filteredNext.length > 0 && (
                    <>
                      <div className="px-5 py-2 text-[11px] font-bold text-[#EA5455] uppercase">
                        NEXT AVAILABLE
                      </div>

                      {filteredNext.map((item, idx) => (
                        <DeviceRow
                          key={item.RTUserialNumber}
                          item={item}
                          idx={idx}   // 👈 start from 0
                          nav={nav}
                        />
                      ))}
                    </>
                  )}

                </div>
              )}
            </div>

            {/* Modal footer */}
            {totalFiltered > 0 && (
              <div className="px-5 py-3 border-t border-[rgba(24,61,61,0.08)] bg-[rgba(24,61,61,0.02)]">
                <p className="m-0 text-[11px] text-[#9BB5B5]">
                  Showing {totalFiltered} of {list.length} devices
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
const DeviceRow = ({ item, idx, nav }) => (
  <div className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(24,61,61,0.03)] transition-colors duration-150 group">

    <div className="flex items-center gap-3 min-w-0">

      <div className="w-8 h-8 rounded-lg bg-[rgba(24,61,61,0.06)] flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-[#183D3D]">
          {String(idx + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="min-w-0">
       <p className="m-0 text-[13px] font-semibold text-[#183D3D] truncate">
  {item.isNextAvailable ? `${item.instrumentName} ` : item.instrumentName}
</p>
        <p className="m-0 mt-0.5 font-mono text-[11px] text-[#6A9090] truncate">
          {item.RTUserialNumber}
        </p>

        {item.instrumentCode && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-[rgba(24,61,61,0.07)] rounded text-[10px] font-bold text-[#7A9E9E] uppercase">
            {item.instrumentCode}
          </span>
        )}
      </div>

    </div>

    <button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#183D3D] hover:bg-[#0f2a2a] text-white text-[12px] font-semibold rounded-lg"
     onClick={async () => {

  try {

    await api.post("/instrument/connect", {
      RTUserialNumber: item.RTUserialNumber,
      instrumentCode: item.instrumentCode
    })

    localStorage.setItem("RTUserialNumber", item.RTUserialNumber)

    nav("/dashboard")

  } catch (err) {
    console.log("connect error", err)
  }

}}
    >
      <span>Connect</span>
      <ChevronRight size={11} />
    </button>

  </div>
)
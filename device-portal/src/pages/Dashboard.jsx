import DeviceRegistration from "../components/DeviceRegistration"
import { useNavigate } from "react-router-dom"
import { PlusCircle, LogOut, Activity, Server, ChevronRight, ArrowLeft, X, Loader2, ChevronLeft } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import api from "../api/axios"

const PAGE_SIZE = 10

export default function Dashboard() {
  const nav = useNavigate()

  const [showDevices, setShowDevices] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deviceStatus, setDeviceStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)


  const totalPages = Math.max(1, Math.ceil(devices.length / PAGE_SIZE))
  const pagedDevices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return devices.slice(start, start + PAGE_SIZE)
  }, [devices, currentPage])

  const logout = () => {
    localStorage.clear()
    nav("/")
  }

  const newInstrument = () => {
    localStorage.removeItem("RTUserialNumber")
    nav("/instrument")
  }

  const openDevices = async () => {
    setShowDevices(true)
    setLoading(true)
    setCurrentPage(1)
    try {
      const res = await api.get("/devices")
      const reversedDevices = [...res.data].reverse()

      setDevices(reversedDevices)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceStatus = async (serial) => {
    try {
      setStatusLoading(true)
      const res = await api.get(`/device-status/${serial}`)
      setDeviceStatus(res.data)
    } catch (err) {
      console.error(err)
      setDeviceStatus(null)
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    if (selectedDevice) {
      const serial = selectedDevice.RTUSerialno || selectedDevice.RTUserialNumber
      getDeviceStatus(serial)
    }
  }, [selectedDevice])


  const closeModal = () => {
    setShowDevices(false)
    setSelectedDevice(null)
    setCurrentPage(1)
  }

  const FlagBlock = ({ title, color, children }) => (
    <div style={{
      marginTop: 12,
      padding: "12px 14px",
      borderRadius: 10,
      border: `1px solid ${color}30`,
      background: `${color}10`
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        color: color,
        marginBottom: 8,
        textTransform: "uppercase"
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  const ParamItem = ({ p }) => (
    <div style={{
      padding: "6px 10px",
      borderRadius: 6,
      background: "#fff",
      marginBottom: 4,
      fontSize: 12,
      color: "#000"
    }}>
      {p.name} ({p.unit})
    </div>
  );

  const KeyValue = ({ label, value }) => (
    <div style={{
      fontSize: 12,
      marginBottom: 4,
      color: "#000"
    }}>
      <b>{label}:</b> {value || "—"}
    </div>
  );

  // Page number buttons to show (max 5 slots)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, 5]
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
  }, [totalPages, currentPage])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F4F0E4", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Background glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-10%", right: "-5%",
          width: "600px", height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(24,61,61,0.06) 0%, transparent 65%)",
        }}
      />

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(24,61,61,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(24,61,61,0.045) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Layout */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <header className="flex items-center justify-between py-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(234,84,85,0.08)", border: "1px solid rgba(234,84,85,0.18)" }}
            >
              <Activity size={15} color="#EA5455" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight" style={{ color: "#183D3D" }}>DeviceHub</span>
              <span className="hidden sm:inline text-sm" style={{ color: "rgba(24,61,61,0.25)" }}>/</span>
              <span className="hidden sm:inline text-sm font-medium" style={{ color: "#7A9E9E" }}>Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={newInstrument} className="dh-btn-outline flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
              style={{ backgroundColor: "transparent", border: "1px solid rgba(24,61,61,0.22)", color: "#183D3D" }}>
              <PlusCircle size={13} />
              <span className="hidden sm:inline">New Instrument</span>
              <span className="sm:hidden">New</span>
            </button>
            <button
              onClick={() => nav("/binary")}
              className="dh-btn-outline flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ border: "1px solid rgba(24,61,61,0.22)", color: "#183D3D" }}
            >
              Upload Binary
            </button>
            <button onClick={openDevices} className="dh-btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
              style={{ backgroundColor: "rgba(24,61,61,0.05)", border: "1px solid rgba(24,61,61,0.18)", color: "#183D3D" }}>
              <Server size={13} />
              <span className="hidden sm:inline">All Devices</span>
              <span className="sm:hidden">Devices</span>
            </button>

            <button onClick={logout} className="dh-btn-danger flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
              style={{ backgroundColor: "rgba(234,84,85,0.07)", border: "1px solid rgba(234,84,85,0.18)", color: "#EA5455" }}>
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="h-px mb-8" style={{ backgroundColor: "rgba(24,61,61,0.1)" }} />

        <div className="mb-7">
          <h1 className="m-0 text-2xl font-bold tracking-tight" style={{ color: "#183D3D" }}>Device Management</h1>
          <p className="mt-1 text-sm m-0" style={{ color: "#7A9E9E" }}>Register new devices or look up existing records</p>
        </div>


        <main className="pb-12">
          <DeviceRegistration />
        </main>
      </div>

      {/* Modal */}
      {showDevices && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full sm:max-w-2xl lg:max-w-3xl rounded-t-2xl sm:rounded-2xl flex flex-col"
            style={{
              background: "#dae2e4",
              maxHeight: "90vh",
              width: "100%",
              margin: "0 auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
              animation: "slideUp 0.22s ease"
            }}
          >

            {/* Modal header - Responsive */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(24,61,61,0.08)" }}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {selectedDevice && (
                  <button onClick={() => setSelectedDevice(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-colors shrink-0"
                    style={{ background: "rgba(24,61,61,0.06)", color: "#183D3D" }}>
                    <ArrowLeft size={14} />
                  </button>
                )}
                <h2 className="text-sm sm:text-base font-bold m-0 truncate" style={{ color: "#183D3D" }}>
                  {selectedDevice ? selectedDevice.RTUSerialno : "All Devices"}
                </h2>
                {!selectedDevice && !loading && devices.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(3, 15, 15, 0.07)", color: "#020202" }}>
                    {devices.length}
                  </span>
                )}
              </div>
              <button onClick={closeModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-colors shrink-0"
                style={{ background: "rgba(24,61,61,0.06)", color: "#183D3D" }}>
                <X size={14} />
              </button>
            </div>

            {/* Modal body - Responsive with better scrolling */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 min-h-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: "#7A9E9E" }}>
                  <Loader2 size={24} className="dh-spin" />
                  <span className="text-sm font-medium">Loading devices…</span>
                </div>
              ) : !selectedDevice ? (
                <div className="flex flex-col gap-1.5">
                  {devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(24,61,61,0.05)" }}>
                        <Server size={20} color="rgba(24,61,61,0.25)" />
                      </div>
                      <p className="text-sm font-medium m-0" style={{ color: "#7A9E9E" }}>No devices found</p>
                    </div>
                  ) : (
                    pagedDevices.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDevice(d)}
                        className="dh-device-item w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl text-left cursor-pointer border-0 transition-all duration-150"
                        style={{ background: "#fafafa" }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: "#2a7a4e", boxShadow: "0 0 5px rgba(42,122,78,0.45)" }} />
                        <span className="flex-1 text-xs sm:text-sm font-semibold truncate" style={{ color: "#183D3D" }}>
                          {d.RTUSerialno}
                        </span>
                        <ChevronRight size={14} style={{ color: "#7A9E9E", flexShrink: 0 }} />
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div
                  className="result-animate"
                  style={{
                    padding: "12px 16px",
                    background: "#FFFFFF",
                    border: "1.5px solid rgba(24,61,61,0.10)",
                    borderRadius: 14
                  }}
                >

                  {/* DEVICE DETAILS HEADER - Fixed padding */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#2a7a4e"
                    }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "1px",
                      color: "#2a7a4e",
                      textTransform: "uppercase"
                    }}>
                      Device Details
                    </span>
                  </div>

                  {/* BASIC INFO - Responsive Grid with text wrapping */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1px",
                    background: "rgba(24,61,61,0.08)",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginBottom: 16
                  }}>
                    {[
                      ["RTU Serial", selectedDevice.RTUSerialno || selectedDevice.RTUserialNumber],
                      ["Company", selectedDevice.companyName],
                      ["Device ID", selectedDevice.deviceId],
                      ["Device Name", selectedDevice.deviceName],
                      ["Industry ID", selectedDevice.industryId],
                      ["Station ID", selectedDevice.stationId],
                      ["QES SNo", selectedDevice.qesSno],
                      ["Station Name", selectedDevice.stationName],
                      ["Token ID", selectedDevice.tokenId],
                      ["Latitude", selectedDevice.latitude],
                      ["Longitude", selectedDevice.longitude],
                    ]
                      .filter(([_, value]) => value !== null && value !== undefined && value !== "null" && value !== "NULL" && value !== "")
                      .map(([k, v]) => (
                        <div key={k} style={{ padding: "10px 12px", background: "#F9F9F9", minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#777", marginBottom: 4 }}>{k}</div>
                          <div style={{
                            fontSize: 12,
                            color: "#000",
                            fontWeight: 600,
                            wordWrap: "break-word",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            lineHeight: 1.4
                          }}>
                            {v}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* PUBLIC KEY - Responsive */}
                  {selectedDevice.publicKey && selectedDevice.publicKey !== "null" && selectedDevice.publicKey !== "NULL" && selectedDevice.publicKey !== "" && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6 }}>
                        Public Key
                      </div>
                      <textarea
                        value={selectedDevice.publicKey}
                        readOnly
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          background: "#f5f5f5",
                          fontSize: 11,
                          color: "#000",
                          resize: "vertical",
                          fontFamily: "monospace"
                        }}
                      />
                    </div>
                  )}

                  {/* MODBUS CONFIGURATION HEADER - Fixed padding */}
                  {selectedDevice.modbus && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6 }}>
                        Modbus Configuration
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "1px",
                        background: "rgba(24,61,61,0.08)",
                        borderRadius: 10,
                        overflow: "hidden"
                      }}>
                        {[
                          ["Slave ID", selectedDevice.modbus.slaveId],
                          ["Baudrate", selectedDevice.modbus.baudrate],
                          ["Start Address", selectedDevice.modbus.startAddress],
                          ["Address Length", selectedDevice.modbus.addressLength],
                        ].map(([k, v]) => (
                          <div key={k} style={{ padding: "10px 12px", background: "#F9F9F9", minWidth: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#777", marginBottom: 4 }}>{k}</div>
                            <div style={{ fontSize: 12, color: "#000", fontWeight: 600, wordBreak: "break-word" }}>
                              {v ?? "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LIVE STATUS HEADER - Fixed padding */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 6 }}>
                      Live Status
                    </div>

                    {statusLoading ? (
                      <div style={{ fontSize: 12, color: "#7A9E9E" }}>
                        Loading status...
                      </div>
                    ) : deviceStatus ? (
                      <div style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid rgba(24,61,61,0.1)"
                      }}>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: 8
                        }}>
                          <div style={{ fontSize: 12, wordBreak: "break-word" }}>
                            <b>Device:</b>{" "}
                            <span style={{
                              color: deviceStatus["device-status"] === "active" ? "#2a7a4e" : "#EA5455"
                            }}>
                              {deviceStatus["device-status"] || "—"}
                            </span>
                          </div>

                          <div style={{ fontSize: 12, wordBreak: "break-word" }}>
                            <b>Server:</b> {deviceStatus["server-status"] || "—"}
                          </div>

                          <div style={{ fontSize: 12, wordBreak: "break-word" }}>
                            <b>Code:</b> {deviceStatus["server-code"] || "—"}
                          </div>

                          <div style={{ fontSize: 12, wordBreak: "break-word" }}>
                            <b>Last Seen:</b> {deviceStatus["lastsendingtime"] || "—"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#EA5455" }}>
                        Failed to load status
                      </div>
                    )}
                  </div>

                  {/* FLAGS STATUS - Responsive wrap */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {[
                        ["CPCB", selectedDevice.flags?.cpcb?.enabled],
                        ["M2M", selectedDevice.flags?.m2m?.enabled],
                        ["Survekshan", selectedDevice.flags?.survekshan?.enabled],
                        ["QES", selectedDevice.flags?.qes?.enabled],
                        ["Custom", selectedDevice.flags?.customServer?.enabled],
                        ["Configured", selectedDevice.flags?.configured]
                      ].map(([label, value]) => (
                        <span
                          key={label}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            background: value
                              ? "rgba(42,122,78,0.10)"
                              : "rgba(234,84,85,0.08)",
                            color: value ? "#2a7a4e" : "#EA5455"
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* FLAGS DETAILS - All responsive */}
                  {selectedDevice.flags?.cpcb?.enabled && (
                    <FlagBlock title="CPCB" color="#2a7a4e">
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {selectedDevice.flags.cpcb.parameters?.map((p, i) => (
                          <ParamItem key={i} p={p} />
                        ))}
                      </div>
                    </FlagBlock>
                  )}

                  {selectedDevice.flags?.m2m?.enabled && (
                    <FlagBlock title="M2M" color="#1D6FAE">
                      <KeyValue label="Folder" value={selectedDevice.flags.m2m.extra?.folder} />
                      <KeyValue label="Interval" value={selectedDevice.flags.m2m.interval} />
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {selectedDevice.flags.m2m.parameters?.map((p, i) => (
                          <ParamItem key={i} p={p} />
                        ))}
                      </div>
                    </FlagBlock>
                  )}

                  {selectedDevice.flags?.survekshan?.enabled && (
                    <FlagBlock title="Survekshan" color="#7B5EA7">
                      <KeyValue label="Unique ID" value={selectedDevice.flags.survekshan.extra?.uniqueId} />
                      <KeyValue label="Interval" value={selectedDevice.flags.survekshan.interval} />
                      <KeyValue label="Quantity" value={selectedDevice.flags.survekshan.qty} />
                    </FlagBlock>
                  )}

                  {selectedDevice.flags?.qes?.enabled && (
                    <FlagBlock title="QES" color="#C07D28">
                      <KeyValue label="Server ID" value={selectedDevice.flags.qes.extra?.serverId} />
                      <KeyValue label="Code" value={selectedDevice.flags.qes.extra?.uniqueCode} />
                      <KeyValue label="Interval" value={selectedDevice.flags.qes.interval} />
                      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                        {selectedDevice.flags.qes.parameters?.map((p, i) => (
                          <ParamItem key={i} p={p} />
                        ))}
                      </div>
                    </FlagBlock>
                  )}

                  {selectedDevice.flags?.customServer?.enabled && (
                    <FlagBlock title="Custom Server" color="#EA5455">
                      <KeyValue label="URL" value={selectedDevice.flags.customServer.url} />
                      <KeyValue
                        label="Auth"
                        value={JSON.stringify(
                          selectedDevice.flags.customServer.extra?.auth || {},
                          null,
                          2
                        )}
                      />
                      <KeyValue
                        label="Headers"
                        value={JSON.stringify(
                          selectedDevice.flags.customServer.headers || {},
                          null,
                          2
                        )}
                      />
                    </FlagBlock>
                  )}
                </div>
              )}
            </div>

            {/* Pagination - Responsive */}
            {!selectedDevice && !loading && totalPages > 1 && (
              <div className="px-4 sm:px-5 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-center gap-3"
                style={{ borderTop: "1px solid rgba(24,61,61,0.06)", background: "rgba(24,61,61,0.015)" }}>

                {/* Controls - centered */}
                <div className="flex items-center gap-1 justify-center order-1 sm:order-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all shrink-0"
                    style={{
                      background: currentPage === 1 ? "transparent" : "rgba(24,61,61,0.06)",
                      color: currentPage === 1 ? "rgba(24,61,61,0.25)" : "#183D3D",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {pageNumbers.map(n => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer text-xs font-semibold transition-all shrink-0"
                      style={n === currentPage
                        ? { background: "#183D3D", color: "#fff" }
                        : { background: "rgba(24,61,61,0.06)", color: "#183D3D" }
                      }
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-all shrink-0"
                    style={{
                      background: currentPage === totalPages ? "transparent" : "rgba(24,61,61,0.06)",
                      color: currentPage === totalPages ? "rgba(24,61,61,0.25)" : "#183D3D",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Modal footer - Responsive */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0 gap-2"
              style={{ borderTop: "1px solid rgba(24,61,61,0.08)" }}>
              {selectedDevice ? (
                <button onClick={() => setSelectedDevice(null)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-colors shrink-0"
                  style={{ background: "#e2e8f0", color: "#1e293b" }}>
                  <ArrowLeft size={13} />
                  Back
                </button>
              ) : (
                <span className="text-xs" style={{ color: "#7A9E9E" }}>
                  {devices.length > 0 ? "Click a device to view details" : ""}
                </span>
              )}

              <button onClick={closeModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-colors shrink-0"
                style={{ background: "#EA5455", color: "#fff" }}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}


      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #F4F0E4; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dhSpin { to { transform: rotate(360deg); } }
        .dh-spin { animation: dhSpin 0.85s linear infinite; }

        .dh-btn-outline:hover { background-color: rgba(24,61,61,0.07) !important; border-color: rgba(24,61,61,0.4) !important; }
        .dh-btn-secondary:hover { background-color: rgba(24,61,61,0.1) !important; border-color: rgba(24,61,61,0.35) !important; }
        .dh-btn-danger:hover { background-color: rgba(234,84,85,0.13) !important; border-color: rgba(234,84,85,0.35) !important; }
        .dh-device-item:hover { background: #eef7f7 !important; transform: translateX(3px); }
      `}</style>
    </div>
  )
}
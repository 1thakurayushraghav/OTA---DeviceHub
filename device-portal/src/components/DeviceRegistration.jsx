// import { useState, useEffect } from "react";
// import { Send, Search, CheckCircle, Loader, ChevronDown, ChevronUp, Plus, X, Wifi, Radio, Globe, Shield } from "lucide-react";
// import api from "../api/axios";
// import { useLocation } from "react-router-dom";

// export default function DeviceRegistration() {
//   const getInitialForm = () => ({
//     RTUserialNumber: "",
//     companyName: "",
//     industryId: "",
//     deviceId: "",
//     deviceName: "",
//     stationId: "",
//     stationName: "",
//     tokenId: "",
//     publicKey: "",
//     latitude: "",
//     longitude: "",
//     cpcbFlag: false,
//     cpcbParameters: [{ name: "", unit: "" }],
//     m2mFlag: false,
//     m2mFolder: "/",
//     m2mInterval: "",
//     m2mParameters: [{ name: "", unit: "" }],
//     survekshanFlag: false,
//     survekshanId: "",
//     survekshanInterval: "",
//     survekshanParameters: [{ name: "", unit: "" }],
//     qesFlag: false,
//     qesServerId: "",
//     qesCode: "",
//     qesInterval: "",
//     qesParameters: [{ name: "", unit: "" }],
//     Configured: false,
//   });

//   const [form, setForm] = useState(getInitialForm());

//   const location = useLocation();

//   // submission
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // search
//   const [search, setSearch] = useState("");
//   const [result, setResult] = useState(null);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchError, setSearchError] = useState("");

//   // instrument modal
//   const [showInstrumentModal, setShowInstrumentModal] = useState(false);
//   const [instrumentSearch, setInstrumentSearch] = useState("");
//   const [instrumentList, setInstrumentList] = useState([]);
//   const [listLoading, setListLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError("");
//     setSuccess(false);
//   };

//   const handleCheckbox = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
//   };

//   useEffect(() => {
//     if (location.state?.RTUserialNumber) {
//       setForm(prev => ({
//         ...prev,
//         RTUserialNumber: location.state.RTUserialNumber
//       }));

//       setSearch(location.state.RTUserialNumber);

//       // optional: auto fetch device data
//       setTimeout(() => {
//         getData();
//       }, 100);
//     }
//   }, [location.state]);

//   useEffect(() => {
//     if (showInstrumentModal) {
//       fetchAvailableInstruments();
//     }
//   }, [showInstrumentModal]);

//   const fetchAvailableInstruments = async () => {
//     setListLoading(true);
//     try {
//       const res = await api.get("/available-instruments"); // backend route
//       setInstrumentList(res.data || []);
//     } catch (err) {
//       setInstrumentList([]);
//       console.error("Instrument fetch error:", err);
//     } finally {
//       setListLoading(false);
//     }
//   };

//   const submit = async () => {
//     const requiredFields = [
//       "RTUserialNumber", "companyName", "industryId", "deviceId",
//       "stationId", "tokenId", "publicKey", "latitude", "longitude",
//     ];
//     const missing = requiredFields.find((f) => !form[f]);
//     if (missing) return setError(`${missing} is required`);
//     if (form.m2mFlag && !form.m2mFolder.startsWith("/"))
//       return setError("M2M folder must start with /");
//     if (form.qesFlag && (!form.qesServerId || !form.qesCode))
//       return setError("QES Server ID and Code are required");

//     const payload = {
//       RTUserialNumber: form.RTUserialNumber,
//       companyName: form.companyName,
//       industryId: form.industryId,
//       deviceId: form.deviceId,
//       deviceName: form.deviceName || undefined,
//       stationId: form.stationId,
//       stationName: form.stationName || undefined,
//       tokenId: form.tokenId,
//       publicKey: form.publicKey,
//       latitude: form.latitude,
//       longitude: form.longitude,
//       cpcbFlag: form.cpcbFlag,
//       cpcbParameters: form.cpcbFlag ? form.cpcbParameters : [],
//       m2mFlag: form.m2mFlag,
//       m2mFolder: form.m2mFlag ? form.m2mFolder : undefined,
//       m2mInterval: form.m2mFlag ? form.m2mInterval : undefined,
//       m2mParameters: form.m2mFlag ? form.m2mParameters : [],
//       survekshanFlag: form.survekshanFlag,
//       survekshanId: form.survekshanFlag ? form.survekshanId : undefined,
//       survekshanInterval: form.survekshanFlag ? form.survekshanInterval : undefined,
//       survekshanParameters: form.survekshanFlag ? form.survekshanParameters : [],
//       qesFlag: form.qesFlag,
//       qesServerId: form.qesFlag ? form.qesServerId : undefined,
//       qesCode: form.qesFlag ? form.qesCode : undefined,
//       qesInterval: form.qesFlag ? form.qesInterval : undefined,
//       qesParameters: form.qesFlag ? form.qesParameters : [],
//     };

//     setLoading(true);
//     try {
//       await api.post("/register", payload);
//       setSuccess(true);
//       setForm(getInitialForm());
//     } catch (err) {
//       setError(err.response?.data?.error || "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getData = async () => {
//     if (!search.trim()) { setSearchError("Please enter a Serial ID"); return; }
//     setSearchLoading(true);
//     setSearchError("");
//     try {
//       const res = await api.get(`/device?serialId=${encodeURIComponent(search)}`);
//       setResult(res.data);
//     } catch (err) {
//       setSearchError(err.response?.data?.error || "Device not found. Please check the Serial ID.");
//       setResult(null);
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const addRow = (key) =>
//     setForm((prev) => ({ ...prev, [key]: [...prev[key], { name: "", unit: "" }] }));

//   const removeRow = (key, i) =>
//     setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== i) }));

//   const handleParamChange = (key, i, field, value) =>
//     setForm((prev) => {
//       const updated = [...prev[key]];
//       updated[i] = { ...updated[i], [field]: value };
//       return { ...prev, [key]: updated };
//     });

//   const formFields = [
//     { name: "RTUserialNumber", placeholder: "RTU Serial Number", required: true },
//     { name: "companyName", placeholder: "Company Name", required: true },
//     { name: "industryId", placeholder: "Industry ID", required: true },
//     { name: "deviceId", placeholder: "Device ID", required: true },
//     { name: "deviceName", placeholder: "Device Name", required: false },
//     { name: "stationId", placeholder: "Station ID", required: true },
//     { name: "stationName", placeholder: "Station Name", required: false },
//     { name: "tokenId", placeholder: "Token ID", required: true },
//     { name: "publicKey", placeholder: "Public Key", required: true },
//     { name: "latitude", placeholder: "Latitude", required: true },
//     { name: "longitude", placeholder: "Longitude", required: true },
//   ];

//   // Pair fields into two columns except publicKey (full-width)
//   const pairedFields = [];
//   let i = 0;
//   while (i < formFields.length) {
//     const f = formFields[i];
//     if (f.name === "publicKey") {
//       pairedFields.push({ type: "full", field: f });
//       i++;
//     } else if (i + 1 < formFields.length && formFields[i + 1].name !== "publicKey") {
//       pairedFields.push({ type: "pair", left: f, right: formFields[i + 1] });
//       i += 2;
//     } else {
//       pairedFields.push({ type: "full", field: f });
//       i++;
//     }
//   }

//   const inputBase =
//     "w-full px-3.5 py-2.5 bg-[#F4F0E4] border border-[#C8BFA0] rounded-lg " +
//     "text-[#183D3D] text-[13.5px] font-[inherit] outline-none transition-all duration-150 " +
//     "placeholder:text-[#A89F88] focus:border-[#EA5455] focus:bg-[#FFF8F8] focus:shadow-[0_0_0_3px_rgba(234,84,85,0.10)]";

//   const flagInputBase =
//     "w-full px-3.5 py-2.5 bg-[#F4F0E4] border border-[#C8BFA0] rounded-lg " +
//     "text-[#183D3D] text-[13px] font-[inherit] outline-none transition-all duration-150 " +
//     "placeholder:text-[#A89F88] focus:border-[#EA5455] focus:bg-[#FFF8F8] focus:shadow-[0_0_0_3px_rgba(234,84,85,0.10)]";

//   const labelBase = "block text-[11px] font-bold text-[#8A7A60] tracking-[0.6px] uppercase mb-1.5";

//   return (
//     <div className="pb-12 font-['DM_Sans',_'Segoe_UI',_sans-serif]">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

//         .panel {
//           background: #FDFAF2;
//           border: 1.5px solid rgba(24,61,61,0.10);
//           border-radius: 16px;
//           overflow: hidden;
//           box-shadow: 0 2px 8px rgba(24,61,61,0.06), 0 8px 32px rgba(24,61,61,0.05);
//         }

//         .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
//         @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

//         .toggle-switch {
//           position: relative; display: inline-flex; align-items: center;
//           width: 38px; height: 22px; flex-shrink: 0;
//         }
//         .toggle-switch input { opacity: 0; width: 0; height: 0; }
//         .toggle-track {
//           position: absolute; inset: 0; border-radius: 11px;
//           background: #D6CEBC; transition: background 0.2s;
//           cursor: pointer;
//         }
//         .toggle-track::after {
//           content: ''; position: absolute; top: 3px; left: 3px;
//           width: 16px; height: 16px; border-radius: 50%;
//           background: white; transition: transform 0.2s;
//           box-shadow: 0 1px 3px rgba(0,0,0,0.2);
//         }
//         input:checked + .toggle-track { background: #EA5455; }
//         input:checked + .toggle-track::after { transform: translateX(16px); }

//         .param-row {
//           background: rgba(24,61,61,0.025);
//           border: 1px solid rgba(24,61,61,0.08);
//           border-radius: 10px;
//           padding: 12px 14px;
//         }

//         .badge-on  { background: rgba(42,122,78,0.10);  color: #2a7a4e; border: 1px solid rgba(42,122,78,0.20); }
//         .badge-off { background: rgba(234,84,85,0.08); color: #EA5455; border: 1px solid rgba(234,84,85,0.18); }

//         .result-row:last-child { border-bottom: none; }
//         .section-divider {
//           height: 1px; background: rgba(24,61,61,0.08); margin: 16px 0;
//         }
//         .flag-section {
//           background: rgba(24,61,61,0.02);
//           border: 1.5px solid rgba(24,61,61,0.08);
//           border-radius: 12px;
//           overflow: hidden;
//         }
//         .flag-header {
//           padding: 14px 16px;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           cursor: pointer;
//           user-select: none;
//         }
//         .flag-body {
//           padding: 0 16px 16px;
//         }
//         .add-param-btn {
//           display: flex; align-items: center; gap: 6px;
//           width: 100%; padding: 9px 14px;
//           background: transparent;
//           border: 1.5px dashed rgba(24,61,61,0.20);
//           border-radius: 8px;
//           color: #5A7A7A; font-size: 12.5px; font-weight: 600;
//           cursor: pointer; transition: all 0.15s;
//           font-family: inherit;
//         }
//         .add-param-btn:hover { border-color: #EA5455; color: #EA5455; background: rgba(234,84,85,0.04); }

//         .submit-btn {
//           width: 100%; padding: 13px;
//           background: #EA5455;
//           border: none; border-radius: 10px;
//           color: white; font-size: 14px; font-weight: 700;
//           letter-spacing: 0.2px;
//           cursor: pointer; transition: all 0.15s;
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           font-family: inherit;
//           box-shadow: 0 2px 8px rgba(234,84,85,0.25), 0 1px 2px rgba(234,84,85,0.15);
//         }
//         .submit-btn:hover:not(:disabled) { background: #d43f40; box-shadow: 0 4px 14px rgba(234,84,85,0.35); transform: translateY(-1px); }
//         .submit-btn:active:not(:disabled) { transform: translateY(0); }
//         .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

//         .search-btn {
//           padding: 0 16px; min-height: 44px;
//           background: #183D3D;
//           border: none; border-radius: 10px;
//           color: white; cursor: pointer;
//           display: flex; align-items: center; justify-content: center;
//           transition: all 0.15s; flex-shrink: 0;
//           box-shadow: 0 2px 8px rgba(24,61,61,0.20);
//         }
//         .search-btn:hover { background: #0f2828; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(24,61,61,0.25); }

//         .chip {
//           display: inline-flex; align-items: center; gap: 5px;
//           padding: 5px 11px; border-radius: 20px;
//           font-size: 11.5px; font-weight: 600;
//         }
//         .chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
//       `}</style>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
//           gap: "20px",
//           maxWidth: "1140px",
//           margin: "0 auto",
//         }}
//       >

//         {/* ══════════════════════ REGISTER PANEL ══════════════════════ */}
//         <div className="panel">
//           {/* Top accent bar */}
//           <div style={{ height: 3, background: "linear-gradient(90deg, #EA5455 0%, rgba(234,84,85,0.3) 60%, transparent 100%)" }} />

//           <div style={{ padding: "28px 28px 24px" }}>

//             {/* Panel header */}
//             <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
//               <div style={{
//                 width: 42, height: 42, borderRadius: 11,
//                 background: "rgba(234,84,85,0.09)", border: "1.5px solid rgba(234,84,85,0.20)",
//                 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//               }}>
//                 <Send size={16} color="#EA5455" />
//               </div>
//               <div>
//                 <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#183D3D", letterSpacing: "-0.3px" }}>
//                   Register Device
//                 </h2>
//                 <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#8A9E9E" }}>
//                   Complete all required fields to register
//                 </p>
//               </div>
//             </div>

//             {/* ── Core Fields ── */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
//               {pairedFields.map((item, idx) => {
//                 if (item.type === "pair") {
//                   return (
//                     <div key={idx} className="field-row">
//                       {[item.left, item.right].map((field) => (
//                         <div key={field.name}>
//                           <label className={labelBase}>
//                             {field.placeholder}
//                             {field.required && <span style={{ color: "#EA5455" }}> *</span>}
//                           </label>
//                           <input
//                             name={field.name}
//                             placeholder={field.placeholder}
//                             value={form[field.name]}
//                             onChange={handleChange}
//                             onKeyDown={(e) => e.key === "Enter" && submit()}
//                             className={inputBase}
//                             style={field.name === "RTUserialNumber" ? { fontFamily: "'DM Mono', monospace", fontSize: 13 } : {}}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   );
//                 }
//                 // full width
//                 const field = item.field;
//                 return (
//                   <div key={field.name}>
//                     <label className={labelBase}>
//                       {field.placeholder}
//                       {field.required && <span style={{ color: "#EA5455" }}> *</span>}
//                     </label>
//                     {field.name === "publicKey" ? (
//                       <textarea
//                         rows={3}
//                         name={field.name}
//                         placeholder={field.placeholder}
//                         value={form[field.name]}
//                         onChange={handleChange}
//                         className={inputBase}
//                         style={{ resize: "vertical", lineHeight: 1.6, fontFamily: "'DM Mono', monospace", fontSize: 12.5 }}
//                       />
//                     ) : (
//                       <input
//                         name={field.name}
//                         placeholder={field.placeholder}
//                         value={form[field.name]}
//                         onChange={handleChange}
//                         onKeyPress={(e) => e.key === "Enter" && submit()}
//                         className={inputBase}
//                       />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* ── Flags Section ── */}
//             <div style={{ marginBottom: 20 }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
//                 <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
//                 <span style={{ fontSize: 11, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
//                   Integration Flags
//                 </span>
//                 <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
//               </div>

//               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

//                 {/* CPCB */}
//                 <FlagSection
//                   icon={<Radio size={14} />}
//                   name="cpcbFlag"
//                   checked={form.cpcbFlag}
//                   onChange={handleCheckbox}
//                   label="CPCB Monitoring"
//                   desc="Pollution parameters for CPCB compliance"
//                   color="#2a7a4e"
//                 >
//                   {form.cpcbFlag && (
//                     <ParamList
//                       params={form.cpcbParameters}
//                       paramKey="cpcbParameters"
//                       flagInputBase={flagInputBase}
//                       onAdd={addRow}
//                       onRemove={removeRow}
//                       onChange={handleParamChange}
//                     />
//                   )}
//                 </FlagSection>

//                 {/* M2M */}
//                 <FlagSection
//                   icon={<Wifi size={14} />}
//                   name="m2mFlag"
//                   checked={form.m2mFlag}
//                   onChange={handleCheckbox}
//                   label="M2M Data Transfer"
//                   desc="Send device data to external systems"
//                   color="#1D6FAE"
//                 >
//                   {form.m2mFlag && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                       <div className="field-row">
//                         <div>
//                           <label className={labelBase}>Folder Path</label>
//                           <input
//                             className={flagInputBase}
//                             placeholder="/plant_01/device_12"
//                             name="m2mFolder"
//                             value={form.m2mFolder}
//                             onChange={(e) => {
//                               let value = e.target.value;
//                               if (!value.startsWith("/")) value = "/" + value;
//                               setForm((prev) => ({ ...prev, m2mFolder: value }));
//                             }}
//                             style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5 }}
//                           />
//                         </div>
//                         <div>
//                           <label className={labelBase}>Interval (seconds)</label>
//                           <input
//                             type="number"
//                             className={flagInputBase}
//                             placeholder="e.g. 60"
//                             name="m2mInterval"
//                             value={form.m2mInterval}
//                             onChange={handleChange}
//                             min="1"
//                           />
//                         </div>
//                       </div>
//                       <ParamList
//                         params={form.m2mParameters}
//                         paramKey="m2mParameters"
//                         flagInputBase={flagInputBase}
//                         onAdd={addRow}
//                         onRemove={removeRow}
//                         onChange={handleParamChange}
//                       />
//                     </div>
//                   )}
//                 </FlagSection>

//                 {/* Survekshan */}
//                 <FlagSection
//                   icon={<Globe size={14} />}
//                   name="survekshanFlag"
//                   checked={form.survekshanFlag}
//                   onChange={handleCheckbox}
//                   label="Survekshan (E2I)"
//                   desc="Government monitoring integration"
//                   color="#7B5EA7"
//                 >
//                   {form.survekshanFlag && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                       <div className="field-row">
//                         <div>
//                           <label className={labelBase}>Auto ID</label>
//                           <input className={flagInputBase} placeholder="Auto ID" name="survekshanId" value={form.survekshanId} onChange={handleChange} />
//                         </div>
//                         <div>
//                           <label className={labelBase}>Interval (seconds)</label>
//                           <input className={flagInputBase} placeholder="e.g. 300" name="survekshanInterval" value={form.survekshanInterval} onChange={handleChange} />
//                         </div>
//                       </div>
//                       <ParamList
//                         params={form.survekshanParameters}
//                         paramKey="survekshanParameters"
//                         flagInputBase={flagInputBase}
//                         onAdd={addRow}
//                         onRemove={removeRow}
//                         onChange={handleParamChange}
//                       />
//                     </div>
//                   )}
//                 </FlagSection>

//                 {/* QES */}
//                 <FlagSection
//                   icon={<Shield size={14} />}
//                   name="qesFlag"
//                   checked={form.qesFlag}
//                   onChange={handleCheckbox}
//                   label="QES Server Integration"
//                   desc="Secure data sync via QES"
//                   color="#C07D28"
//                 >
//                   {form.qesFlag && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
//                         <div>
//                           <label className={labelBase}>Server ID</label>
//                           <input className={flagInputBase} placeholder="Server ID" name="qesServerId" value={form.qesServerId} onChange={handleChange} />
//                         </div>
//                         <div>
//                           <label className={labelBase}>Device Code</label>
//                           <input className={flagInputBase} placeholder="Device Code" name="qesCode" value={form.qesCode} onChange={handleChange} />
//                         </div>
//                         <div>
//                           <label className={labelBase}>Interval (s)</label>
//                           <input className={flagInputBase} placeholder="e.g. 60" name="qesInterval" value={form.qesInterval} onChange={handleChange} />
//                         </div>
//                       </div>
//                       <ParamList
//                         params={form.qesParameters}
//                         paramKey="qesParameters"
//                         flagInputBase={flagInputBase}
//                         onAdd={addRow}
//                         onRemove={removeRow}
//                         onChange={handleParamChange}
//                       />
//                     </div>
//                   )}
//                 </FlagSection>

//               </div>
//             </div>

//             {/* Error */}
//             {error && (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "10px 14px",
//                 background: "rgba(234,84,85,0.07)", border: "1.5px solid rgba(234,84,85,0.20)",
//                 borderRadius: 9, marginBottom: 14,
//               }}>
//                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EA5455", flexShrink: 0 }} />
//                 <p style={{ margin: 0, fontSize: 13, color: "#EA5455", fontWeight: 500 }}>{error}</p>
//               </div>
//             )}

//             {/* Submit */}
//             <button onClick={submit} disabled={loading} className="submit-btn">
//               {loading
//                 ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /><span>Registering…</span></>
//                 : <><Send size={15} /><span>Register Device</span></>}
//             </button>

//             {/* Success */}
//             {success && (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "12px 16px",
//                 background: "rgba(42,122,78,0.07)", border: "1.5px solid rgba(42,122,78,0.20)",
//                 borderRadius: 10, marginTop: 14,
//               }}>
//                 <CheckCircle size={16} color="#2a7a4e" />
//                 <p style={{ margin: 0, fontSize: 13, color: "#2a7a4e", fontWeight: 600 }}>
//                   Device registered successfully.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ══════════════════════ SEARCH PANEL ══════════════════════ */}
//         <div className="panel">
//           <div style={{ height: 3, background: "linear-gradient(90deg, #183D3D 0%, rgba(24,61,61,0.3) 60%, transparent 100%)" }} />

//           <div style={{ padding: "28px 28px 24px" }}>

//             {/* Panel header */}
//             <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
//               <div style={{
//                 width: 42, height: 42, borderRadius: 11,
//                 background: "rgba(24,61,61,0.08)", border: "1.5px solid rgba(24,61,61,0.18)",
//                 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//               }}>
//                 <Search size={16} color="#183D3D" />
//               </div>
//               <div>
//                 <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#183D3D", letterSpacing: "-0.3px" }}>
//                   Search Device
//                 </h2>
//                 <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#8A9E9E" }}>
//                   Look up a registered device by serial ID
//                 </p>
//               </div>
//             </div>

//             {/* Search input row */}
//             <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
//               <input
//                 placeholder="Select / Search RTU Serial Number…"
//                 value={search}
//                 readOnly
//                 onClick={() => setShowInstrumentModal(true)}
//                 style={{
//                   flex: 1,
//                   padding: "11px 16px",
//                   background: "#F4F0E4",
//                   border: "1.5px solid #C8BFA0",
//                   borderRadius: 10,
//                   fontSize: 13.5,
//                   color: "#183D3D",
//                   outline: "none",
//                   fontFamily: "inherit",
//                   fontWeight: 500,
//                   cursor: "pointer"
//                 }}
//               />

//               <button
//                 onClick={() => setShowInstrumentModal(true)}
//                 className="search-btn"
//               >
//                 <Search size={16} color="white" />
//               </button>
//             </div>

//             {/* Search error */}
//             {searchError && (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "10px 14px",
//                 background: "rgba(234,84,85,0.07)", border: "1.5px solid rgba(234,84,85,0.20)",
//                 borderRadius: 9, marginBottom: 16,
//               }}>
//                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EA5455", flexShrink: 0 }} />
//                 <p style={{ margin: 0, fontSize: 13, color: "#EA5455", fontWeight: 500 }}>{searchError}</p>
//               </div>
//             )}

//             {/* Result */}
//             {result && (
//               <div style={{
//                 padding: 20,
//                 background: "rgba(24,61,61,0.03)",
//                 border: "1.5px solid rgba(24,61,61,0.10)",
//                 borderRadius: 13,
//               }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
//                   <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a7a4e" }} />
//                   <span style={{ fontSize: 11, fontWeight: 800, color: "#2a7a4e", letterSpacing: "0.9px", textTransform: "uppercase" }}>
//                     Device Found
//                   </span>
//                 </div>

//                 {/* Core info grid */}
//                 <div style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "1px",
//                   background: "rgba(24,61,61,0.08)",
//                   border: "1.5px solid rgba(24,61,61,0.10)",
//                   borderRadius: 10,
//                   overflow: "hidden",
//                   marginBottom: 14,
//                 }}>
//                   {[
//                     ["Company", result.companyName],
//                     ["Device ID", result.deviceId],
//                     ["Industry ID", result.industryId],
//                     ["Station ID", result.stationId],
//                     ["Token ID", result.tokenId],
//                     ["Latitude", result.latitude],
//                     ["Longitude", result.longitude],
//                   ].map(([k, v], idx) => (
//                     <div key={k} style={{
//                       padding: "10px 14px",
//                       background: "#FDFAF2",
//                       gridColumn: idx === 6 ? "span 2" : "auto",
//                     }}>
//                       <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
//                       <div style={{ fontSize: 13, color: "#183D3D", fontWeight: 600, wordBreak: "break-all" }}>{v || "—"}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Public Key */}
//                 <div style={{ marginBottom: 16 }}>
//                   <label className={labelBase}>Public Key</label>
//                   <textarea
//                     value={result.publicKey}
//                     readOnly
//                     rows={3}
//                     style={{
//                       width: "100%", padding: "10px 14px",
//                       background: "#F4F0E4", border: "1.5px solid #C8BFA0",
//                       borderRadius: 9, fontSize: 12, color: "#2a5050",
//                       fontFamily: "'DM Mono', monospace", outline: "none",
//                       resize: "none", cursor: "default", lineHeight: 1.6,
//                       boxSizing: "border-box",
//                     }}
//                   />
//                 </div>

//                 {/* Flags */}
//                 <div>
//                   <label className={labelBase} style={{ marginBottom: 10 }}>Integration Status</label>
//                   <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
//                     {[
//                       ["CPCB", result.flags?.cpcb?.enabled],
//                       ["M2M", result.flags?.m2m?.enabled],
//                       ["Survekshan", result.flags?.survekshan?.enabled],
//                       ["QES", result.flags?.qes?.enabled],
//                       ["Configured", result.flags?.configured],
//                     ].map(([label, value]) => (
//                       <span key={label} className={`chip ${value ? "badge-on" : "badge-off"}`}>
//                         <span className="chip-dot" style={{ background: value ? "#2a7a4e" : "#EA5455" }} />
//                         {label}
//                       </span>
//                     ))}
//                   </div>

//                   {/* CPCB params */}
//                   {result.flags?.cpcb?.enabled && result.flags.cpcb.parameters?.length > 0 && (
//                     <ResultFlagDetail label="CPCB Parameters" color="#2a7a4e">
//                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//                         {result.flags.cpcb.parameters.map((p, i) => (
//                           <div key={i} style={{
//                             padding: "7px 10px",
//                             background: "rgba(42,122,78,0.06)", borderRadius: 7,
//                             display: "flex", flexDirection: "column", gap: 1,
//                           }}>
//                             <span style={{ fontSize: 12, fontWeight: 600, color: "#183D3D" }}>{p.name}</span>
//                             <span style={{ fontSize: 11, color: "#7A9E9E" }}>{p.unit}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </ResultFlagDetail>
//                   )}

//                   {result.flags?.m2m?.enabled && (
//                     <ResultFlagDetail label="M2M" color="#1D6FAE">
//                       <ResultKV rows={[
//                         ["Folder", result.flags.m2m.folder],
//                         ["Interval", result.flags.m2m.interval ? `${result.flags.m2m.interval}s` : "—"],
//                       ]} />
//                     </ResultFlagDetail>
//                   )}

//                   {result.flags?.survekshan?.enabled && (
//                     <ResultFlagDetail label="Survekshan" color="#7B5EA7">
//                       <ResultKV rows={[
//                         ["Unique ID", result.flags.survekshan.uniqueId],
//                         ["Interval", result.flags.survekshan.interval ? `${result.flags.survekshan.interval}s` : "—"],
//                       ]} />
//                     </ResultFlagDetail>
//                   )}

//                   {result.flags?.qes?.enabled && (
//                     <ResultFlagDetail label="QES" color="#C07D28">
//                       <ResultKV rows={[
//                         ["Server ID", result.flags.qes.serverId],
//                         ["Device Code", result.flags.qes.uniqueCode],
//                         ["Interval", result.flags.qes.interval ? `${result.flags.qes.interval}s` : "—"],
//                       ]} />
//                     </ResultFlagDetail>
//                   )}
//                 </div>
//               </div>
//             )}

//             {!result && !searchError && (
//               <div style={{
//                 display: "flex", flexDirection: "column", alignItems: "center",
//                 justifyContent: "center", padding: "56px 24px", gap: 12,
//               }}>
//                 <div style={{
//                   width: 56, height: 56, borderRadius: "50%",
//                   background: "rgba(24,61,61,0.06)", border: "1.5px solid rgba(24,61,61,0.10)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <Search size={22} color="rgba(24,61,61,0.25)" />
//                 </div>
//                 <p style={{ margin: 0, fontSize: 13.5, color: "#A0B2B2", textAlign: "center", lineHeight: 1.6, fontWeight: 500 }}>
//                   Enter a Serial ID above to<br />look up device details
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//       </div>
//       {showInstrumentModal && (
//         <div style={{
//           position: "fixed",
//           inset: 0,
//           background: "rgba(0,0,0,0.4)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 999
//         }}>
//           <div style={{
//             width: "500px",
//             maxHeight: "70vh",
//             background: "#fff",
//             borderRadius: "12px",
//             padding: "16px",
//             display: "flex",
//             flexDirection: "column"
//           }}>

//             {/* Header */}
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
//               <h3>Available Instruments</h3>
//               <button onClick={() => setShowInstrumentModal(false)}>
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Search */}
//             <input
//               placeholder="Search serial..."
//               value={instrumentSearch}
//               onChange={(e) => setInstrumentSearch(e.target.value)}
//               style={{
//                 padding: "8px",
//                 border: "1px solid #ccc",
//                 borderRadius: "6px",
//                 marginBottom: "10px"
//               }}
//             />

//             {/* List */}
//             <div style={{ overflowY: "auto", maxHeight: "50vh" }}>
//               {listLoading ? (
//                 <p style={{ textAlign: "center", padding: "10px" }}>Loading...</p>
//               ) : (
//                 (() => {
//                   const filteredList = instrumentList.filter(i =>
//                     (i.RTUserialNumber || "")
//                       .toLowerCase()
//                       .includes(instrumentSearch.toLowerCase())
//                   );

//                   if (filteredList.length === 0) {
//                     return (
//                       <p style={{ textAlign: "center", color: "#999", padding: "10px" }}>
//                         No instruments found
//                       </p>
//                     );
//                   }

//                   return filteredList.map((item, i) => (
//                     <div
//                       key={i}
//                       onClick={() => {
//                         const serial = item.RTUserialNumber;

//                         setSearch(serial);

//                         setForm(prev => ({
//                           ...prev,
//                           RTUserialNumber: serial
//                         }));

//                         setShowInstrumentModal(false);

//                         // 👉 auto trigger search after select
//                         setTimeout(() => {
//                           getData();
//                         }, 100);
//                       }}
//                       style={{
//                         padding: "10px",
//                         borderBottom: "1px solid #eee",
//                         cursor: "pointer",
//                         transition: "background 0.15s"
//                       }}
//                       onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
//                       onMouseLeave={e => e.currentTarget.style.background = "transparent"}
//                     >
//                       {item.RTUserialNumber}
//                     </div>
//                   ));
//                 })()
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//       <style>{`
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//       `}</style>
//     </div>

//   );
// }

// /* ─── Flag Section ─────────────────────────────────────────── */
// function FlagSection({ icon, name, checked, onChange, label, desc, color, children }) {
//   return (
//     <div className="flag-section">
//       <div className="flag-header">
//         <label className="toggle-switch">
//           <input type="checkbox" name={name} checked={checked} onChange={onChange} />
//           <span className="toggle-track" />
//         </label>
//         <div style={{
//           width: 30, height: 30, borderRadius: 8,
//           background: checked ? `${color}18` : "rgba(24,61,61,0.05)",
//           border: `1.5px solid ${checked ? color + "30" : "rgba(24,61,61,0.10)"}`,
//           display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//           color: checked ? color : "#8A9E9E",
//           transition: "all 0.2s",
//         }}>
//           {icon}
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 13.5, fontWeight: 700, color: checked ? "#183D3D" : "#5A7070", transition: "color 0.2s" }}>
//             {label}
//           </div>
//           <div style={{ fontSize: 11.5, color: "#9AB0B0", marginTop: 1 }}>{desc}</div>
//         </div>
//         {checked
//           ? <ChevronUp size={15} color="#8A9E9E" />
//           : <ChevronDown size={15} color="#C0CCCC" />}
//       </div>

//       {checked && (
//         <div className="flag-body">
//           <div style={{ height: 1, background: "rgba(24,61,61,0.08)", marginBottom: 14 }} />
//           {children}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── Parameter List ───────────────────────────────────────── */
// function ParamList({ params, paramKey, flagInputBase, onAdd, onRemove, onChange }) {
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//       {params.map((row, i) => (
//         <div key={i} className="param-row">
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//             <span style={{ fontSize: 12, fontWeight: 700, color: "#5A7070", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//               Parameter {i + 1}
//             </span>
//             {params.length > 1 && (
//               <button
//                 onClick={() => onRemove(paramKey, i)}
//                 style={{
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   width: 24, height: 24, borderRadius: 6,
//                   background: "rgba(234,84,85,0.08)", border: "1px solid rgba(234,84,85,0.18)",
//                   color: "#EA5455", cursor: "pointer", flexShrink: 0,
//                 }}
//               >
//                 <X size={12} />
//               </button>
//             )}
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//             <div>
//               <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 5 }}>
//                 Parameter Name
//               </label>
//               <input className={flagInputBase} value={row.name} onChange={(e) => onChange(paramKey, i, "name", e.target.value)} placeholder="e.g. pH" />
//             </div>
//             <div>
//               <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 5 }}>
//                 Unit
//               </label>
//               <input className={flagInputBase} value={row.unit} onChange={(e) => onChange(paramKey, i, "unit", e.target.value)} placeholder="e.g. mg/L" />
//             </div>
//           </div>
//         </div>
//       ))}

//       <button onClick={() => onAdd(paramKey)} className="add-param-btn">
//         <Plus size={13} />
//         Add Parameter
//       </button>
//     </div>

//   );
// }

// /* ─── Result Flag Detail ───────────────────────────────────── */
// function ResultFlagDetail({ label, color, children }) {
//   return (
//     <div style={{
//       marginTop: 10, padding: "12px 14px",
//       background: `${color}08`,
//       border: `1.5px solid ${color}20`,
//       borderRadius: 10,
//     }}>
//       <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: color, letterSpacing: "0.7px", textTransform: "uppercase" }}>
//         {label}
//       </p>
//       {children}
//     </div>
//   );
// }

// function ResultKV({ rows }) {
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
//       {rows.map(([k, v]) => (
//         <div key={k} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
//           <span style={{ fontSize: 11.5, color: "#8A9E9E", width: 90, flexShrink: 0, fontWeight: 600 }}>{k}</span>
//           <span style={{ fontSize: 13, color: "#183D3D", fontWeight: 600, wordBreak: "break-all" }}>{v ?? "—"}</span>
//         </div>
//       ))}
//     </div>

//   );
// }



import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MqttViewer from '../pages/MqttViewer';
import { Send, Search, CheckCircle, Loader, ChevronDown, ChevronUp, Plus, X, Wifi, Radio, Globe, Shield, ChevronRight, Cpu, SlidersHorizontal, Zap, Layers, Download, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useLocation } from "react-router-dom";

const INSTRUMENT_CONFIG = {
  "OCEMS": {
    parameters: [
      { name: "cod", unit: "mg/L" },
      { name: "bod", unit: "mg/L" },
      { name: "tss", unit: "mg/L" },
      { name: "ph", unit: "pH" },
      { name: "flow", unit: "m³/hr" }
    ]
  },
  "SPM": {
    parameters: [
      { name: "pm", unit: "mg/Nm³" }
    ]
  },
  "FLOW": {
    parameters: [
      { name: "flow", unit: "m³/hr" }
    ]
  },
  "CEMS": {
    parameters: [
      { name: "sox", unit: "ppm" },
      { name: "nox", unit: "ppm" }
    ]
  }
};

const INSTRUMENT_OPTIONS = ["OCEMS", "SPM", "FLOW", "CEMS"];

export default function DeviceRegistration() {
  const getInitialForm = () => ({
    RTUserialNumber: "",
    instrumentName: "",
    companyName: "",
    industryId: "",
    code_version: "",
    deviceId: "",
    deviceName: "",
    stationId: "",
    stationName: "",
    tokenId: "",
    publicKey: "",
    latitude: "",
    longitude: "",
    qes_Sno: "",
    cpcbFlag: false,
    cpcbParameters: [{ name: "", unit: "" }],
    m2mFlag: false,
    m2mFolder: "/",
    m2mInterval: "",
    m2mParameters: [{ name: "", unit: "" }],
    survekshanFlag: false,
    survekshanId: "",
    survekshanInterval: "",
    survekshanQty: "",
    qesFlag: false,
    qesServerId: "",
    qesCode: "",
    qesInterval: "",
    qesParameters: [{ name: "", unit: "" }],
    Configured: false,
    customServerFlag: false,
    customServerUrl: "",
    customServerAuth: "",
    customServerHeaders: "",
    modbus: {
      slaveId: "",
      baudrate: "",
      startAddress: "",
      addressLength: ""
    }
  });

  const PARAMETER_OPTIONS = [
    { name: "cod", unit: "mg/L" },
    { name: "bod", unit: "mg/L" },
    { name: "tss", unit: "mg/L" },
    { name: "ph", unit: "pH" },
    { name: "flow", unit: "m³/hr" },
    { name: "pm", unit: "mg/Nm³" },
  ];

  const [form, setForm] = useState(getInitialForm());
  const location = useLocation();

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [instrumentSearch, setInstrumentSearch] = useState("");
  const [instrumentList, setInstrumentList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [deviceList, setDeviceList] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // MQTT Response states
  const [mqttResponse, setMqttResponse] = useState(null);
  const [mqttLoading, setMqttLoading] = useState(false);
  const [mqttError, setMqttError] = useState("");

  const [operationType, setOperationType] = useState("register");
  const [searchType, setSearchType] = useState("general");
  // Batch registration states
  const [batchMode, setBatchMode] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(2);
  const [batchResults, setBatchResults] = useState(null);
  const [showBatchResults, setShowBatchResults] = useState(false);

  // CPCB section open state (initially open)
  const [isCpcbOpen, setIsCpcbOpen] = useState(true);

  const handleInstrumentNameChange = (value) => {
    setForm(prev => ({ ...prev, instrumentName: value }));

    const config = INSTRUMENT_CONFIG[value];

    if (config && config.parameters && config.parameters.length > 0) {
      // Auto-fill CPCB parameters 
      setForm(prev => ({
        ...prev,
        cpcbParameters: JSON.parse(JSON.stringify(config.parameters))
      }));

      // If M2M flag is enabled, also update M2M parameters
      if (form.m2mFlag) {
        setForm(prev => ({
          ...prev,
          m2mParameters: JSON.parse(JSON.stringify(config.parameters))
        }));
      }

      // If QES flag is enabled, also update QES parameters
      if (form.qesFlag) {
        setForm(prev => ({
          ...prev,
          qesParameters: JSON.parse(JSON.stringify(config.parameters))
        }));
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
    setBatchResults(null);
    setShowBatchResults(false);
  };

  const handleModbusChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      modbus: {
        ...prev.modbus,
        [name]: value
      }
    }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;

    setForm((prev) => {
      let newState = { ...prev, [name]: checked };

      const config = INSTRUMENT_CONFIG[prev.instrumentName];
      const defaultParams = config && config.parameters ? JSON.parse(JSON.stringify(config.parameters)) : [{ name: "", unit: "" }];

      if (checked) {
        if (name === "m2mFlag") {
          if (config && config.parameters) {
            newState.m2mParameters = JSON.parse(JSON.stringify(config.parameters));
          } else {
            newState.m2mParameters = [...prev.cpcbParameters];
          }
        }

        if (name === "qesFlag") {
          if (config && config.parameters) {
            newState.qesParameters = JSON.parse(JSON.stringify(config.parameters));
          } else {
            newState.qesParameters = [...prev.cpcbParameters];
          }
        }
      }

      return newState;
    });
  };

  useEffect(() => {
    const serial =
      location.state?.RTUserialNumber ||
      localStorage.getItem("RTUserialNumber");

    if (serial) {
      setForm(prev => ({
        ...prev,
        RTUserialNumber: serial,
        instrumentName: "",
        deviceId: `device_`,
        stationId: `station_`,
        industryId: `industry_`,
        companyName: "null",
        deviceName: "null",
        stationName: "null",
        code_version: "",
        tokenId: "null",
        publicKey: "null",
        latitude: "null",
        longitude: "null",
        qes_Sno: "null",
        modbus: {
          slaveId: "1",
          baudrate: "9600",
          startAddress: "0",
          addressLength: "10"
        },
        cpcbFlag: prev.cpcbFlag,
        m2mFlag: prev.m2mFlag,
        survekshanFlag: prev.survekshanFlag,
        qesFlag: prev.qesFlag,
        customServerFlag: prev.customServerFlag
      }));

      setSearch(serial);
      setTimeout(() => {
        getData();
      }, 100);
    }
  }, [location.state]);

  useEffect(() => {
    if (showInstrumentModal) { fetchAvailableInstruments(); }
  }, [showInstrumentModal]);

  const fetchAvailableInstruments = async () => {
    setListLoading(true);
    try {
      const res = await api.get("/instrument/available");
      setInstrumentList(res.data || []);
    } catch (err) {
      setInstrumentList([]);
      console.error("Instrument fetch error:", err);
    } finally {
      setListLoading(false);
    }
  };

  // Batch registration function
  const submitBatch = async () => {
    const requiredFields = [
      "RTUserialNumber",
      "companyName",
      "industryId",
      "deviceId",
      "stationId",
      "tokenId",
      "publicKey",
      "latitude",
      "longitude"
    ];

    const missing = requiredFields.find((f) => !form[f]);
    if (missing) return setError(`${missing} is required`);

    if (form.m2mFlag && !form.m2mFolder.startsWith("/"))
      return setError("M2M folder must start with /");

    if (form.qesFlag && (!form.qesServerId || !form.qesCode))
      return setError("QES Server ID and Code are required");

    let parsedAuth = {};
    let parsedHeaders = {};

    try {
      parsedAuth = form.customServerAuth ? JSON.parse(form.customServerAuth) : {};
      parsedHeaders = form.customServerHeaders ? JSON.parse(form.customServerHeaders) : {};
    } catch (e) {
      return setError("Invalid JSON in Custom Server Auth/Headers");
    }

    const basePayload = {
      RTUserialNumber: form.RTUserialNumber,
      instrumentName: form.instrumentName || undefined,
      code_version: form.code_version,
      companyName: form.companyName,
      industryId: form.industryId,
      deviceId: form.deviceId,
      deviceName: form.deviceName || undefined,
      stationId: form.stationId,
      stationName: form.stationName || undefined,
      tokenId: form.tokenId,
      publicKey: form.publicKey,
      latitude: form.latitude,
      longitude: form.longitude,
      qes_Sno: form.qes_Sno,
      duplicateCount: duplicateCount,
      flags: {
        cpcb: form.cpcbFlag
          ? {
            enabled: true,
            parameters: form.cpcbParameters
          }
          : { enabled: false },
        m2m: form.m2mFlag
          ? {
            enabled: true,
            interval: form.m2mInterval ? Number(form.m2mInterval) : undefined,
            extra: { folder: form.m2mFolder },
            parameters: form.m2mParameters
          }
          : { enabled: false },
        survekshan: form.survekshanFlag
          ? {
            enabled: true,
            interval: form.survekshanInterval ? Number(form.survekshanInterval) : undefined,
            extra: { uniqueId: form.survekshanId },
            qty: form.survekshanQty ? Number(form.survekshanQty) : undefined
          }
          : { enabled: false },
        qes: form.qesFlag
          ? {
            enabled: true,
            interval: form.qesInterval ? Number(form.qesInterval) : undefined,
            extra: {
              serverId: form.qesServerId,
              uniqueCode: form.qesCode
            },
            parameters: form.qesParameters
          }
          : { enabled: false },
        customServer: form.customServerFlag
          ? {
            enabled: true,
            url: form.customServerUrl,
            extra: {
              auth: parsedAuth
            },
            headers: parsedHeaders
          }
          : { enabled: false },
      },
      modbus: {
        slaveId: form.modbus.slaveId !== "" ? Number(form.modbus.slaveId) : null,
        baudrate: form.modbus.baudrate !== "" ? Number(form.modbus.baudrate) : null,
        startAddress: form.modbus.startAddress !== "" ? Number(form.modbus.startAddress) : null,
        addressLength: form.modbus.addressLength !== "" ? Number(form.modbus.addressLength) : null
      }
    };

    setLoading(true);
    setBatchResults(null);
    setShowBatchResults(false);

    try {
      const res = await api.post("/register/batch", basePayload);

      if (res?.status === 200 || res?.status === 201) {
        setBatchResults(res.data);
        setSuccess(true);
        setError("");

        if (res.data.registered_count > 0) {
          setShowBatchResults(true);
        }

        setForm(getInitialForm());
        setBatchMode(false);
        setDuplicateCount(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Batch registration failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (batchMode) {
      await submitBatch();
      return;
    }

    const requiredFields = [
      "RTUserialNumber",
      "companyName",
      "industryId",
      "deviceId",
      "stationId",
      "tokenId",
      "publicKey",
      "latitude",
      "longitude"
    ];

    const missing = requiredFields.find((f) => !form[f]);
    if (missing) return setError(`${missing} is required`);

    if (form.m2mFlag && !form.m2mFolder.startsWith("/"))
      return setError("M2M folder must start with /");

    if (form.qesFlag && (!form.qesServerId || !form.qesCode))
      return setError("QES Server ID and Code are required");

    let parsedAuth = {};
    let parsedHeaders = {};

    try {
      parsedAuth = form.customServerAuth ? JSON.parse(form.customServerAuth) : {};
      parsedHeaders = form.customServerHeaders ? JSON.parse(form.customServerHeaders) : {};
    } catch (e) {
      return setError("Invalid JSON in Custom Server Auth/Headers");
    }

    const payload = {
      RTUserialNumber: form.RTUserialNumber,
      instrumentName: form.instrumentName || undefined,
      code_version: form.code_version || undefined,
      companyName: form.companyName,
      industryId: form.industryId,
      deviceId: form.deviceId,
      deviceName: form.deviceName || undefined,
      stationId: form.stationId,
      stationName: form.stationName || undefined,
      tokenId: form.tokenId,
      publicKey: form.publicKey,
      latitude: form.latitude,
      longitude: form.longitude,
      qes_Sno: form.qes_Sno,
      flags: {
        cpcb: form.cpcbFlag
          ? {
            enabled: true,
            parameters: form.cpcbParameters
          }
          : { enabled: false },
        m2m: form.m2mFlag
          ? {
            enabled: true,
            interval: form.m2mInterval ? Number(form.m2mInterval) : undefined,
            extra: { folder: form.m2mFolder },
            parameters: form.m2mParameters
          }
          : { enabled: false },
        survekshan: form.survekshanFlag
          ? {
            enabled: true,
            interval: form.survekshanInterval ? Number(form.survekshanInterval) : undefined,
            extra: { uniqueId: form.survekshanId },
            qty: form.survekshanQty ? Number(form.survekshanQty) : undefined
          }
          : { enabled: false },
        qes: form.qesFlag
          ? {
            enabled: true,
            interval: form.qesInterval ? Number(form.qesInterval) : undefined,
            extra: {
              serverId: form.qesServerId,
              uniqueCode: form.qesCode
            },
            parameters: form.qesParameters
          }
          : { enabled: false },
        customServer: form.customServerFlag
          ? {
            enabled: true,
            url: form.customServerUrl,
            extra: {
              auth: parsedAuth
            },
            headers: parsedHeaders
          }
          : { enabled: false },
      },
      modbus: {
        slaveId: form.modbus.slaveId !== "" ? Number(form.modbus.slaveId) : null,
        baudrate: form.modbus.baudrate !== "" ? Number(form.modbus.baudrate) : null,
        startAddress: form.modbus.startAddress !== "" ? Number(form.modbus.startAddress) : null,
        addressLength: form.modbus.addressLength !== "" ? Number(form.modbus.addressLength) : null
      }
    };

    setLoading(true);
    try {
      let res;

      if (result) {
        setOperationType("update");
        res = await api.put(`/device/${form.RTUserialNumber}`, payload);
      } else {
        setOperationType("register");
        res = await api.post("/register", payload);
      }

      if (res?.status === 200 || res?.status === 201) {
        await api.post("/device/configure", {
          RTUserialNumber: form.RTUserialNumber,
          url: location.pathname
        });

        setSuccess(true);
        setError("");
      }

      if (result) {
        await getData();
      } else {
        setForm(getInitialForm());
      }
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const getData = async () => {
    if (!search.trim()) {
      setSearchError("Please enter something to search");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setDeviceList(null);
    setSelectedDevice(null);

    try {
      let url = "";

      // Build URL based on search type
      switch (searchType) {
        case "m2m":
          url = `/device?m2mFolder=${encodeURIComponent(search)}&list=true`;
          break;
        case "survekshan":
          url = `/device?survekshanId=${encodeURIComponent(search)}&list=true`;
          break;
        case "qes":
          url = `/device?qesServerId=${encodeURIComponent(search)}&list=true`;
          break;
        case "serial":
          url = `/device?serialId=${encodeURIComponent(search)}&list=true`;
          break;
        case "company":
          url = `/device?companyName=${encodeURIComponent(search)}&list=true`;
          break;
        case "device":
          url = `/device?deviceId=${encodeURIComponent(search)}&list=true`;
          break;
        case "station":
          url = `/device?stationId=${encodeURIComponent(search)}&list=true`;
          break;
        default:
          url = `/device?search=${encodeURIComponent(search)}&list=true`;
      }

      console.log("Searching with URL:", url);

      const res = await api.get(url);

      if (res.data.devices && res.data.devices.length > 0) {
        if (res.data.devices.length === 1) {
          setResult(res.data.devices[0]);
          setDeviceList(null);
          populateForm(res.data.devices[0]);
        } else {
          setDeviceList(res.data.devices);
          setResult(null);
          setSearchError("");
        }
      } else {
        setSearchError("No devices found");
        setResult(null);
        setDeviceList(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      if (err.response?.status === 404) {
        setSearchError(err.response?.data?.error || "No devices found");
      } else {
        setSearchError(err.response?.data?.error || "Search failed");
      }
      setResult(null);
      setDeviceList(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const getDeviceResponse = async () => {
    if (!result && !selectedDevice) {
      setMqttError("No device selected");
      return;
    }

    const serial = result?.RTUserialNumber || selectedDevice?.RTUserialNumber;
    if (!serial) {
      setMqttError("No serial number found");
      return;
    }

    setMqttLoading(true);
    setMqttError("");
    setMqttResponse(null);

    try {
      // Call backend MQTT endpoint
      const response = await api.get(`/device/response/${encodeURIComponent(serial)}`, {
        params: { command: "STATUS", timeout: 10 }
      });

      if (response.data.success) {
        setMqttResponse(response.data);
      } else {
        setMqttError(response.data.error || "No response from device");
      }
    } catch (err) {
      if (err.response?.status === 504) {
        setMqttError("Device not responding (timeout). Please check device connection.");
      } else {
        setMqttError(err.response?.data?.error || "Failed to get device response");
      }
      setMqttResponse(null);
    } finally {
      setMqttLoading(false);
    }
  };

  const populateForm = (d) => {
    const modbusData = d.modbus || {};
    const custom = d.flags?.customServer || d.customServer || {};

    const loadedInstrumentName = d.instrumentName || "";
    const config = INSTRUMENT_CONFIG[loadedInstrumentName];

    setForm({
      RTUserialNumber: d.RTUserialNumber || d.RTUSerialno || "",
      instrumentName: loadedInstrumentName,
      companyName: d.companyName || "",
      code_version: d.code_version || "",
      industryId: d.industryId || "",
      deviceId: d.deviceId || "",
      deviceName: d.deviceName || "",
      stationId: d.stationId || "",
      stationName: d.stationName || "",
      tokenId: d.tokenId || "",
      publicKey: d.publicKey || "",
      latitude: d.latitude || "",
      longitude: d.longitude || "",
      qes_Sno: d.qes_Sno || d.qesSno || "",
      modbus: {
        slaveId: d.modbus?.slaveId ?? "",
        baudrate: d.modbus?.baudrate ?? "",
        startAddress: d.modbus?.startAddress ?? "",
        addressLength: d.modbus?.addressLength ?? ""
      },
      cpcbFlag: d.flags?.cpcb?.enabled || false,
      cpcbParameters: (config && config.parameters) || d.flags?.cpcb?.parameters || [{ name: "", unit: "" }],
      m2mFlag: d.flags?.m2m?.enabled || false,
      m2mFolder: d.flags?.m2m?.extra?.folder || "/",
      m2mInterval: d.flags?.m2m?.interval ?? "",
      m2mParameters: (config && config.parameters && d.flags?.m2m?.enabled)
        ? JSON.parse(JSON.stringify(config.parameters))
        : d.flags?.m2m?.parameters || [{ name: "", unit: "" }],
      survekshanFlag: d.flags?.survekshan?.enabled || false,
      survekshanId: d.flags?.survekshan?.extra?.uniqueId || "",
      survekshanInterval: d.flags?.survekshan?.interval ?? "",
      survekshanQty: d.flags?.survekshan?.qty ?? "",
      qesFlag: d.flags?.qes?.enabled || false,
      qesServerId: d.flags?.qes?.extra?.serverId || "",
      qesCode: d.flags?.qes?.extra?.uniqueCode || "",
      qesInterval: d.flags?.qes?.interval ?? "",
      qesParameters: (config && config.parameters && d.flags?.qes?.enabled)
        ? JSON.parse(JSON.stringify(config.parameters))
        : d.flags?.qes?.parameters || [{ name: "", unit: "" }],
      customServerFlag: custom?.enabled || false,
      customServerUrl: custom?.url || custom?.extra?.url || "",
      customServerAuth: custom?.extra?.auth ? JSON.stringify(custom.extra.auth, null, 2) : "",
      customServerHeaders: custom?.headers ? JSON.stringify(custom.headers, null, 2) : "",
      Configured: d.Configured || false
    });

    setResult(d);
  };

  const addRow = (key) =>
    setForm((prev) => {
      const newRow = { name: "", unit: "" };
      let newState = {
        ...prev,
        [key]: [...prev[key], newRow]
      };

      if (key === "cpcbParameters") {
        if (prev.m2mFlag) {
          newState.m2mParameters = [...prev.m2mParameters, newRow];
        }
        if (prev.qesFlag) {
          newState.qesParameters = [...prev.qesParameters, newRow];
        }
      }
      return newState;
    });

  const removeRow = (key, i) =>
    setForm((prev) => {
      const updated = prev[key].filter((_, idx) => idx !== i);
      let newState = { ...prev, [key]: updated };

      if (key === "cpcbParameters") {
        if (prev.m2mFlag) {
          newState.m2mParameters = prev.m2mParameters.filter((_, idx) => idx !== i);
        }
        if (prev.qesFlag) {
          newState.qesParameters = prev.qesParameters.filter((_, idx) => idx !== i);
        }
      }
      return newState;
    });

  const handleParamChange = (key, i, field, value) =>
    setForm((prev) => {
      const updated = [...prev[key]];
      if (field === "bulk") {
        updated[i] = value;
      } else {
        updated[i] = { ...updated[i], [field]: value };
      }
      let newState = { ...prev, [key]: updated };

      if (key === "cpcbParameters") {
        if (prev.m2mFlag) newState.m2mParameters = updated;
        if (prev.qesFlag) newState.qesParameters = updated;
      }
      return newState;
    });

  // Basic fields to show inside CPCB section
  const basicFields = [
    { name: "instrumentName", placeholder: "Instrument Name", required: false, isSelect: true },
    { name: "RTUserialNumber", placeholder: "RTU Serial Number", required: true },
    { name: "companyName", placeholder: "Company Name", required: true },
    { name: "industryId", placeholder: "Industry ID", required: true },
    { name: "deviceId", placeholder: "Device ID", required: true },
    { name: "deviceName", placeholder: "Device Name", required: false },
    { name: "stationId", placeholder: "Station ID", required: true },
    { name: "qes_Sno", placeholder: "QES Serial No", required: false },
    { name: "stationName", placeholder: "Station Name", required: false },
    { name: "tokenId", placeholder: "Token ID", required: true },
    { name: "publicKey", placeholder: "Public Key", required: true },
    { name: "latitude", placeholder: "Latitude", required: true },
    { name: "longitude", placeholder: "Longitude", required: true },
  ];

  const inputBase =
    "w-full px-3.5 py-2.5 bg-[#F4F0E4] border border-[#C8BFA0] rounded-lg " +
    "text-[#183D3D] text-[13.5px] font-[inherit] outline-none transition-all duration-150 " +
    "placeholder:text-[#A89F88] focus:border-[#EA5455] focus:bg-[#FFF8F8] focus:shadow-[0_0_0_3px_rgba(234,84,85,0.10)]";

  const flagInputBase =
    "w-full px-3.5 py-2.5 bg-[#F4F0E4] border border-[#C8BFA0] rounded-lg " +
    "text-[#183D3D] text-[13px] font-[inherit] outline-none transition-all duration-150 " +
    "placeholder:text-[#A89F88] focus:border-[#EA5455] focus:bg-[#FFF8F8] focus:shadow-[0_0_0_3px_rgba(234,84,85,0.10)]";

  const labelBase = "block text-[11px] font-bold text-[#8A7A60] tracking-[0.6px] uppercase mb-1.5";

  const filteredInstruments = instrumentList.filter(item =>
    (item.RTUserialNumber || "").toLowerCase().includes(instrumentSearch.toLowerCase()) ||
    (item.instrumentName || "").toLowerCase().includes(instrumentSearch.toLowerCase())
  );

  return (
    <div className="pb-12 font-['DM_Sans',_'Segoe_UI',_sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .panel {
          background: #FDFAF2;
          border: 1.5px solid rgba(24,61,61,0.10);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(24,61,61,0.06), 0 8px 32px rgba(24,61,61,0.05);
        }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
        .toggle-switch { position: relative; display: inline-flex; align-items: center; width: 38px; height: 22px; flex-shrink: 0; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-track { position: absolute; inset: 0; border-radius: 11px; background: #D6CEBC; transition: background 0.2s; cursor: pointer; }
        .toggle-track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        input:checked + .toggle-track { background: #EA5455; }
        input:checked + .toggle-track::after { transform: translateX(16px); }
        .param-row { background: rgba(24,61,61,0.025); border: 1px solid rgba(24,61,61,0.08); border-radius: 10px; padding: 12px 14px; }
        .badge-on  { background: rgba(42,122,78,0.10);  color: #2a7a4e; border: 1px solid rgba(42,122,78,0.20); }
        .badge-off { background: rgba(234,84,85,0.08); color: #EA5455; border: 1px solid rgba(234,84,85,0.18); }
        .flag-section { background: rgba(24,61,61,0.02); border: 1.5px solid rgba(24,61,61,0.08); border-radius: 12px; overflow: hidden; }
        .flag-header { padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
        .flag-body { padding: 0 16px 16px; }
        .add-param-btn { display: flex; align-items: center; gap: 6px; width: 100%; padding: 9px 14px; background: transparent; border: 1.5px dashed rgba(24,61,61,0.20); border-radius: 8px; color: #5A7A7A; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .add-param-btn:hover { border-color: #EA5455; color: #EA5455; background: rgba(234,84,85,0.04); }
        .submit-btn { width: 100%; padding: 13px; background: #EA5455; border: none; border-radius: 10px; color: white; font-size: 14px; font-weight: 700; letter-spacing: 0.2px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; box-shadow: 0 2px 8px rgba(234,84,85,0.25), 0 1px 2px rgba(234,84,85,0.15); }
        .submit-btn:hover:not(:disabled) { background: #d43f40; box-shadow: 0 4px 14px rgba(234,84,85,0.35); transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
        .chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .result-animate { animation: fadeIn 0.25s ease forwards; }
        .instrument-row { transition: background 0.12s; }
        .instrument-row:hover { background: rgba(24,61,61,0.04); }
        .batch-badge { background: linear-gradient(135deg, #EA5455 0%, #c0392b 100%); }
        .cpcb-inner-section { background: rgba(24,61,61,0.02); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", maxWidth: "1140px", margin: "0 auto" }}>

        {/* ══════════════════════ REGISTER PANEL ══════════════════════ */}
        <div className="panel">
          <div style={{ height: 3, background: batchMode ? "linear-gradient(90deg, #EA5455 0%, #c0392b 60%, transparent 100%)" : "linear-gradient(90deg, #EA5455 0%, rgba(234,84,85,0.3) 60%, transparent 100%)" }} />
          <div style={{ padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: batchMode ? "rgba(234,84,85,0.15)" : "rgba(234,84,85,0.09)", border: batchMode ? "1.5px solid rgba(234,84,85,0.40)" : "1.5px solid rgba(234,84,85,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {batchMode ? <Layers size={16} color="#EA5455" /> : <Send size={16} color="#EA5455" />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#183D3D", letterSpacing: "-0.3px" }}>
                  {batchMode ? "Batch Register Devices" : "Register Device"}
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#8A9E9E" }}>
                  {batchMode ? `Register ${duplicateCount} devices at once` : "Complete all required fields to register"}
                </p>
              </div>
            </div>

            {/* Batch Mode Toggle */}
            <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(234,84,85,0.04)", borderRadius: 12, border: "1.5px solid rgba(234,84,85,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={(e) => {
                      setBatchMode(e.target.checked);
                      if (!e.target.checked) {
                        setDuplicateCount(2);
                        setBatchResults(null);
                        setShowBatchResults(false);
                      }
                    }}
                  />
                  <span className="toggle-track" />
                </label>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#183D3D" }}>
                    Batch Registration Mode
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#8A9E9E" }}>
                    Register multiple devices with automatic sequence generation
                  </p>
                </div>
                {batchMode && (
                  <span className="batch-badge" style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: "white" }}>
                    ACTIVE
                  </span>
                )}
              </div>

              {batchMode && (
                <div style={{ marginTop: 14 }}>
                  <label className={labelBase} style={{ marginBottom: 6 }}>Number of devices to register (2-5)</label>
                  <select
                    value={duplicateCount}
                    onChange={(e) => setDuplicateCount(parseInt(e.target.value))}
                    className={inputBase}
                    style={{ cursor: "pointer", background: "#FDFAF2" }}
                  >
                    <option value={2}>2 Devices (2x registration)</option>
                    <option value={3}>3 Devices (3x registration)</option>
                    <option value={4}>4 Devices (4x registration)</option>
                    <option value={5}>5 Devices (5x registration)</option>
                  </select>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={11} color="#EA5455" />
                    <span style={{ fontSize: 10.5, color: "#EA5455", fontWeight: 500 }}>
                      Will generate {duplicateCount} new serial numbers automatically
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Device Information */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8A9E9E",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase"
                }}>
                  Basic Device Information
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
              </div>

              {/* ───── ROW 1 : COMPANY NAME FULL WIDTH ───── */}
              <div style={{ marginBottom: 12 }}>
                <label className={labelBase}>
                  Company Name <span style={{ color: "#EA5455" }}>*</span>
                </label>

                <input
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>

              {/* ───── ROW 2 : 2 COLUMNS ───── */}
              <div
                className="field-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 12
                }}
              >
                <div>
                  <label className={labelBase}>Instrument Name</label>

                  <input
                    list="instrument-options"
                    name="instrumentName"
                    placeholder="Select or type"
                    value={form.instrumentName}
                    onChange={(e) => handleInstrumentNameChange(e.target.value)}
                    className={inputBase}
                  />

                  <datalist id="instrument-options">
                    {INSTRUMENT_OPTIONS.map((opt, idx) => (
                      <option key={idx} value={opt} />
                    ))}
                  </datalist>

                  {form.instrumentName && INSTRUMENT_CONFIG[form.instrumentName] && (
                    <div style={{
                      fontSize: 10.5,
                      color: "#2a7a4e",
                      marginTop: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                      <CheckCircle size={10} />
                      <span>✓ Parameters auto-configured for {form.instrumentName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelBase}>
                    RTU Serial Number <span style={{ color: "#EA5455" }}>*</span>
                  </label>

                  <input
                    name="RTUserialNumber"
                    placeholder="RTU Serial Number"
                    value={form.RTUserialNumber}
                    onChange={handleChange}
                    className={inputBase}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              {/* ───── ROW 3 : 2 COLUMNS ───── */}
              <div
                className="field-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12
                }}
              >
                <div>
                  <label className={labelBase}>QES Serial No</label>

                  <input
                    name="qes_Sno"
                    placeholder="QES Serial No"
                    value={form.qes_Sno}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>Code Version</label>

                  <input
                    name="code_version"
                    placeholder="v1.0.0"
                    value={form.code_version}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Modbus Configuration Section */}
            <div style={{ marginBottom: 20, marginTop: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#8A9E9E",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase"
                }}>
                  Modbus Configuration
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
              </div>

              <div className="field-row">
                <div>
                  <label className={labelBase}>Slave ID</label>
                  <input
                    type="number"
                    name="slaveId"
                    placeholder="SlaveId"
                    value={form.modbus.slaveId}
                    onChange={handleModbusChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Baudrate</label>
                  <input
                    type="number"
                    name="baudrate"
                    placeholder="Baudrate"
                    value={form.modbus.baudrate}
                    onChange={handleModbusChange}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="field-row">
                <div>
                  <label className={labelBase}>Start Address</label>
                  <input
                    type="number"
                    name="startAddress"
                    placeholder="Start Address"
                    value={form.modbus.startAddress}
                    onChange={handleModbusChange}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelBase}>Address Length</label>
                  <input
                    type="number"
                    name="addressLength"
                    placeholder="Address Length"
                    value={form.modbus.addressLength}
                    onChange={handleModbusChange}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>



            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Integration Flags</span>
                <div style={{ flex: 1, height: 1, background: "rgba(24,61,61,0.10)" }} />
              </div>

              {/* CPCB Monitoring Section - Contains all basic fields + parameters */}
              <FlagSection
                icon={<Radio size={14} />}
                name="cpcbFlag"
                checked={form.cpcbFlag}
                onChange={handleCheckbox}
                label="CPCB Monitoring"
                desc="Pollution parameters for CPCB compliance"
                color="#2a7a4e"
                isOpen={isCpcbOpen}
                onToggle={() => setIsCpcbOpen(!isCpcbOpen)}
              >
                {/* Basic fields inside CPCB section */}
                <div className="cpcb-inner-section">

                  {/* Pair fields */}
                  <div style={{ marginBottom: 16 }}>

                    <div className="field-row" style={{ marginBottom: 12 }}>
                      <div>
                        <label className={labelBase}>Industry ID <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="industryId" placeholder="Industry ID" value={form.industryId} onChange={handleChange} className={inputBase} />
                      </div>
                      <div>
                        <label className={labelBase}>Device ID <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="deviceId" placeholder="Device ID" value={form.deviceId} onChange={handleChange} className={inputBase} />
                      </div>
                    </div>

                    <div className="field-row" style={{ marginBottom: 12 }}>
                      <div>
                        <label className={labelBase}>Device Name</label>
                        <input name="deviceName" placeholder="Device Name" value={form.deviceName} onChange={handleChange} className={inputBase} />
                      </div>
                      <div>
                        <label className={labelBase}>Station ID <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="stationId" placeholder="Station ID" value={form.stationId} onChange={handleChange} className={inputBase} />
                      </div>
                    </div>

                    <div className="field-row" style={{ marginBottom: 12 }}>
                      <div>
                        <label className={labelBase}>Station Name</label>
                        <input name="stationName" placeholder="Station Name" value={form.stationName} onChange={handleChange} className={inputBase} />
                      </div>
                      <div>
                        <label className={labelBase}>Token ID <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="tokenId" placeholder="Token ID" value={form.tokenId} onChange={handleChange} className={inputBase} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label className={labelBase}>
                        Public Key <span style={{ color: "#EA5455" }}>*</span>
                      </label>

                      <textarea
                        rows={1}
                        name="publicKey"
                        placeholder="Public Key"
                        value={form.publicKey}
                        onChange={handleChange}
                        className={inputBase}
                        style={{
                          width: "100%",
                          resize: "vertical",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 12.5
                        }}
                      />
                    </div>

                    <div className="field-row" style={{ marginBottom: 12 }}>
                      <div>
                        <label className={labelBase}>Latitude <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} className={inputBase} />
                      </div>
                      <div>
                        <label className={labelBase}>Longitude <span style={{ color: "#EA5455" }}>*</span></label>
                        <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} className={inputBase} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parameters section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(42,122,78,0.20)" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#2a7a4e", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                      Parameters
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(42,122,78,0.20)" }} />
                  </div>
                  <ParamList
                    params={form.cpcbParameters}
                    paramKey="cpcbParameters"
                    options={PARAMETER_OPTIONS}
                    flagInputBase={flagInputBase}
                    onAdd={addRow}
                    onRemove={removeRow}
                    onChange={handleParamChange}
                  />
                </div>
              </FlagSection>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <FlagSection icon={<Wifi size={14} />} name="m2mFlag" checked={form.m2mFlag} onChange={handleCheckbox} label="M2M Data Transfer" desc="Send device data to external systems" color="#1D6FAE">
                  {form.m2mFlag && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="field-row">
                        <div>
                          <label className={labelBase}>Folder Path</label>
                          <input className={flagInputBase} placeholder="/plant_01/device_12" name="m2mFolder" value={form.m2mFolder} onChange={(e) => { let value = e.target.value; if (!value.startsWith("/")) value = "/" + value; setForm((prev) => ({ ...prev, m2mFolder: value })); }} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5 }} />
                        </div>
                        <div>
                          <label className={labelBase}>Interval (seconds)</label>
                          <input type="number" className={flagInputBase} placeholder="e.g. 60" name="m2mInterval" value={form.m2mInterval} onChange={handleChange} min="1" />
                        </div>
                      </div>
                      <ParamList params={form.m2mParameters} paramKey="m2mParameters" options={PARAMETER_OPTIONS} flagInputBase={flagInputBase} onAdd={addRow} onRemove={removeRow} onChange={handleParamChange} />
                    </div>
                  )}
                </FlagSection>
                <FlagSection
                  icon={<Globe size={14} />}
                  name="survekshanFlag"
                  checked={form.survekshanFlag}
                  onChange={handleCheckbox}
                  label="Survekshan (E2I)"
                  desc="Government monitoring integration"
                  color="#7B5EA7"
                >
                  {form.survekshanFlag && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="field-row">
                        <div>
                          <label className={labelBase}>Auto ID</label>
                          <input
                            className={flagInputBase}
                            placeholder="Auto ID"
                            name="survekshanId"
                            value={form.survekshanId}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className={labelBase}>Interval (seconds)</label>
                          <input
                            type="number"
                            className={flagInputBase}
                            placeholder="e.g. 300"
                            name="survekshanInterval"
                            value={form.survekshanInterval}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelBase}>Quantity</label>
                        <input
                          type="number"
                          className={flagInputBase}
                          placeholder="Enter quantity"
                          name="survekshanQty"
                          value={form.survekshanQty}
                          onChange={handleChange}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </FlagSection>
                <FlagSection icon={<Shield size={14} />} name="qesFlag" checked={form.qesFlag} onChange={handleCheckbox} label="QES Server Integration" desc="Secure data sync via QES" color="#C07D28">
                  {form.qesFlag && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                        <div><label className={labelBase}>Server ID</label><input className={flagInputBase} placeholder="Server ID" name="qesServerId" value={form.qesServerId} onChange={handleChange} /></div>
                        <div><label className={labelBase}>Unique Code</label><input className={flagInputBase} placeholder="Unique Code" name="qesCode" value={form.qesCode} onChange={handleChange} /></div>
                        <div><label className={labelBase}>Interval (s)</label><input className={flagInputBase} placeholder="e.g. 60" name="qesInterval" value={form.qesInterval} onChange={handleChange} /></div>
                      </div>
                      <ParamList params={form.qesParameters} paramKey="qesParameters" options={PARAMETER_OPTIONS} flagInputBase={flagInputBase} onAdd={addRow} onRemove={removeRow} onChange={handleParamChange} />
                    </div>
                  )}
                </FlagSection>
              </div>
            </div>

            <FlagSection
              icon={<Globe size={14} />}
              name="customServerFlag"
              checked={form.customServerFlag}
              onChange={handleCheckbox}
              label="Custom Server"
              desc="Send data to your own server"
              color="#EA5455"
            >
              {form.customServerFlag && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className={labelBase}>Server URL</label>
                    <input
                      className={flagInputBase}
                      name="customServerUrl"
                      placeholder="https://api.server.com/data"
                      value={form.customServerUrl}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Auth JSON</label>
                    <textarea
                      rows={3}
                      className={flagInputBase}
                      name="customServerAuth"
                      value={form.customServerAuth}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Headers JSON</label>
                    <textarea
                      rows={3}
                      className={flagInputBase}
                      name="customServerHeaders"
                      value={form.customServerHeaders}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </FlagSection>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(234,84,85,0.07)", border: "1.5px solid rgba(234,84,85,0.20)", borderRadius: 9, marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EA5455", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#EA5455", fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button onClick={submit} disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <Loader size={15} style={{ animation: "spin 1s linear infinite" }} />
                  <span>{batchMode ? `Registering ${duplicateCount} Devices…` : (result ? "Updating…" : "Registering…")}</span>
                </>
              ) : (
                <>
                  {batchMode ? <Layers size={15} /> : <Send size={15} />}
                  <span>
                    {batchMode
                      ? `Register ${duplicateCount} Devices`
                      : (result ? "Update Device" : "Register Device")
                    }
                  </span>
                </>
              )}
            </button>

            {/* Batch Results Display */}
            {showBatchResults && batchResults && batchResults.registered_count > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{
                  padding: 16,
                  background: "rgba(42,122,78,0.08)",
                  border: "1.5px solid rgba(42,122,78,0.20)",
                  borderRadius: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <CheckCircle size={16} color="#2a7a4e" />
                    <span style={{ fontWeight: 700, color: "#2a7a4e", fontSize: 13 }}>
                      Successfully Registered: {batchResults.registered_count} / {duplicateCount} Devices
                    </span>
                  </div>

                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {batchResults.next_serials && batchResults.next_serials.map((serial, idx) => (
                      <div key={idx} style={{
                        padding: "10px 12px",
                        background: "white",
                        borderRadius: 8,
                        marginBottom: 8,
                        border: "1px solid rgba(42,122,78,0.15)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600 }}>
                            {serial}
                          </span>
                          <span style={{ fontSize: 11, color: "#2a7a4e" }}>
                            Device {idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {batchResults.errors && batchResults.errors.length > 0 && (
                    <div style={{ marginTop: 12, padding: 10, background: "rgba(234,84,85,0.08)", borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: "#EA5455", margin: 0 }}>
                        ⚠️ {batchResults.errors.length} device(s) had registration errors
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!batchMode && success && !showBatchResults && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", background: "rgba(42,122,78,0.07)",
                border: "1.5px solid rgba(42,122,78,0.20)", borderRadius: 10,
                marginTop: 14
              }}>
                <CheckCircle size={16} color="#2a7a4e" />
                <p style={{ margin: 0, fontSize: 13, color: "#2a7a4e", fontWeight: 600 }}>
                  {operationType === "register" ? "Device registered successfully." : "Device updated successfully."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════ SEARCH PANEL ══════════════════════ */}
        <div className="panel">
          <div style={{ height: 3, background: "linear-gradient(90deg, #183D3D 0%, rgba(24,61,61,0.3) 60%, transparent 100%)" }} />

          <div style={{ padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(24,61,61,0.08)", border: "1.5px solid rgba(24,61,61,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Search size={16} color="#183D3D" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#183D3D", letterSpacing: "-0.3px" }}>
                  Search Device
                </h2>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#8A9E9E" }}>
                  Look up a registered device by serial ID
                </p>
              </div>
              {result && (
                <Link
                  to={`/mqtt-viewer?deviceId=${result.deviceId || ""}&serial=${result.RTUSerialno || ""}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      background: "#EA5455",
                      borderRadius: 10,
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    <span>MQTT Viewer</span>
                  </div>
                </Link>
              )}
            </div>

            <div className="mb-4">
              {/* Search Type Dropdown */}
              <label className={labelBase}>Search By</label>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearch("");
                  setResult(null);
                  setSearchError("");
                }}
                className={inputBase}
                style={{ marginBottom: 12, cursor: "pointer" }}
              >
                <option value="general">🔍 General (All Fields)</option>
                <option value="serial">📟 Serial Number</option>
                <option value="company">🏢 Company Name</option>
                <option value="device">💻 Device ID</option>
                <option value="station">📍 Station ID</option>
                <option value="m2m">📁 M2M Folder Path</option>
                <option value="survekshan">🔑 Survekshan Auto ID</option>
                <option value="qes">🖥️ QES Server ID</option>
              </select>

              {/* Search Input */}
              <label className={labelBase}>
                Search Value
                {searchType === 'm2m' && <span style={{ fontSize: 10, color: '#1D6FAE', marginLeft: 8 }}>📁 Enter folder path (e.g., /plant_01)</span>}
                {searchType === 'survekshan' && <span style={{ fontSize: 10, color: '#7B5EA7', marginLeft: 8 }}>🔑 Enter Survekshan Auto ID</span>}
                {searchType === 'qes' && <span style={{ fontSize: 10, color: '#C07D28', marginLeft: 8 }}>🖥️ Enter QES Server ID</span>}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") getData()
                  }}
                  placeholder={
                    searchType === 'm2m' ? "Enter M2M folder path..." :
                      searchType === 'survekshan' ? "Enter Survekshan Auto ID..." :
                        searchType === 'qes' ? "Enter QES Server ID..." :
                          "Enter Serial / Company / Device ID / Station ID..."
                  }
                  className="w-full px-4 py-3 bg-[#F4F0E4] border-[1.5px] border-[#C8BFA0] rounded-xl text-[13.5px] text-[#183D3D] font-mono outline-none focus:border-[#183D3D]"
                />
                {search && (
                  <span
                    className="absolute right-3 top-3 cursor-pointer"
                    onClick={() => {
                      setSearch("")
                      setResult(null)
                      setSearchError("")
                    }}
                  >
                    <X size={14} color="#EA5455" />
                  </span>
                )}
              </div>

              <button
                onClick={getData}
                disabled={!search || searchLoading}
                className="mt-2.5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white text-[13.5px] font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "#183D3D",
                  border: "none",
                  fontFamily: "inherit",
                  cursor: search && !searchLoading ? "pointer" : "not-allowed",
                  boxShadow: "0 2px 8px rgba(24,61,61,0.20)"
                }}
                onMouseEnter={e => {
                  if (search && !searchLoading) e.currentTarget.style.background = "#0f2828";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#183D3D";
                }}
              >
                {searchLoading
                  ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /><span>Searching…</span></>
                  : <><Search size={14} /><span>Search Device</span></>
                }
              </button>
            </div>

            {searchError && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-4 rounded-xl"
                style={{ background: "rgba(234,84,85,0.07)", border: "1.5px solid rgba(234,84,85,0.20)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455] shrink-0" />
                <p className="m-0 text-[13px] text-[#EA5455] font-medium">{searchError}</p>
              </div>
            )}

            {deviceList && deviceList.length > 0 && (
              <div className="result-animate" style={{ marginTop: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deviceList.map((device, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        populateForm(device);
                        setDeviceList(null);
                        setSelectedDevice(device);
                      }}
                      style={{
                        padding: "14px 16px",
                        background: "rgba(24,61,61,0.03)",
                        border: "1.5px solid rgba(24,61,61,0.08)",
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#183D3D"
                          }}>
                            {device.RTUserialNumber || device.RTUSerialno}
                          </span>
                          {device.instrumentName && (
                            <span className="chip" style={{
                              background: "rgba(42,122,78,0.10)",
                              fontSize: 10,
                              padding: "3px 8px",
                              color: "#2a7a4e",
                            }}>
                              {device.instrumentName}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "#8A9E9E" }}>
                            <strong>Company:</strong> {device.companyName || "—"}
                          </span>
                          <span style={{ fontSize: 12, color: "#8A9E9E" }}>
                            <strong>Station:</strong> {device.stationId || "—"}
                          </span>
                          <span style={{ fontSize: 12, color: "#8A9E9E" }}>
                            <strong>Industry:</strong> {device.industryId || "—"}
                          </span>
                        </div>
                        {/* Show matching search criteria info */}
                        {searchType === 'm2m' && device.flags?.m2m?.extra?.folder && (
                          <div style={{ fontSize: 11, color: "#1D6FAE", marginTop: 4 }}>
                            📁 M2M Folder: {device.flags.m2m.extra.folder}
                          </div>
                        )}
                        {searchType === 'survekshan' && device.flags?.survekshan?.extra?.uniqueId && (
                          <div style={{ fontSize: 11, color: "#7B5EA7", marginTop: 4 }}>
                            🔑 Survekshan ID: {device.flags.survekshan.extra.uniqueId}
                          </div>
                        )}
                        {searchType === 'qes' && device.flags?.qes?.extra?.serverId && (
                          <div style={{ fontSize: 11, color: "#C07D28", marginTop: 4 }}>
                            🖥️ QES Server ID: {device.flags.qes.extra.serverId}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} color="#C0CCCC" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API URL Display - Shows actual serial when device found */}
            {result && !deviceList && (
              <div className="mb-4 p-3 rounded-xl" style={{
                background: "rgba(24,61,61,0.04)",
                border: "1.5px solid rgba(24,61,61,0.10)",
                fontFamily: "'DM Mono', monospace"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className={labelBase} style={{ marginBottom: 4 }}>API URL</label>
                    <code style={{
                      fontSize: 11.5,
                      color: "#101010",
                      wordBreak: "break-all",
                      display: "block",
                      lineHeight: 1.5
                    }}>
                      {`${api.defaults.baseURL}/device?serialId=${encodeURIComponent(result.RTUserialNumber || result.RTUSerialno)}`}
                    </code>
                    {search && search !== (result.RTUserialNumber || result.RTUSerialno) && (
                      <div style={{ fontSize: 10, color: "#19391c", marginTop: 4 }}>
                        🔍 Searched for: "{search}" → Found: {result.RTUserialNumber || result.RTUSerialno}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const url = `${api.defaults.baseURL}/device?serialId=${encodeURIComponent(result.RTUserialNumber || result.RTUSerialno)}`;
                      navigator.clipboard.writeText(url);
                      const btn = document.getElementById('copy-url-btn');
                      if (btn) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '✓';
                        setTimeout(() => {
                          btn.innerHTML = originalText;
                        }, 1500);
                      }
                    }}
                    id="copy-url-btn"
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: "rgba(24,61,61,0.08)",
                      border: "1px solid rgba(24,61,61,0.15)",
                      cursor: "pointer",
                      color: "#183D3D"
                    }}
                    title="Copy URL"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#183D3D" }}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {result && !deviceList && (
              <div className="result-animate"
                style={{ padding: 20, background: "rgba(24,61,61,0.03)", border: "1.5px solid rgba(24,61,61,0.10)", borderRadius: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a7a4e" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#2a7a4e", letterSpacing: "0.9px", textTransform: "uppercase" }}>
                    Device Found
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(24,61,61,0.08)", border: "1.5px solid rgba(24,61,61,0.10)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                  {[
                    ["Instrument Name", result.instrumentName],
                    ["Company", result.companyName],
                    ["Device ID", result.deviceId],
                    ["Industry ID", result.industryId],
                    ["Station ID", result.stationId],
                    ["QES SNo", result.qes_Sno],
                    ["Token ID", result.tokenId],
                    ["Code Version", result.code_version],
                    ["Latitude", result.latitude],
                    ["Longitude", result.longitude],
                  ].map(([k, v], idx) => (
                    <div key={k} style={{ padding: "10px 14px", background: "#FDFAF2", gridColumn: idx === 10 ? "span 2" : "auto" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9E9E", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 13, color: "#183D3D", fontWeight: 600, wordBreak: "break-all" }}>{v || "—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className={labelBase}>Public Key</label>
                  <textarea value={result.publicKey} readOnly rows={3} style={{ width: "100%", padding: "10px 14px", background: "#F4F0E4", border: "1.5px solid #C8BFA0", borderRadius: 9, fontSize: 12, color: "#2a5050", fontFamily: "'DM Mono', monospace", outline: "none", resize: "none", cursor: "default", lineHeight: 1.6, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label className={labelBase} style={{ marginBottom: 10 }}>Integration Status</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                    {[["CPCB", result.flags?.cpcb?.enabled], ["M2M", result.flags?.m2m?.enabled], ["Survekshan", result.flags?.survekshan?.enabled], ["QES", result.flags?.qes?.enabled], ["Custom Server", result.flags?.customServer?.enabled], ["Configured", result.flags?.configured]].map(([label, value]) => (
                      <span key={label} className={`chip ${value ? "badge-on" : "badge-off"}`}>
                        <span className="chip-dot" style={{ background: value ? "#2a7a4e" : "#EA5455" }} />
                        {label}
                      </span>
                    ))}
                  </div>
                  {result.flags?.cpcb?.enabled && result.flags.cpcb.parameters?.length > 0 && (
                    <ResultFlagDetail label="CPCB Parameters" color="#2a7a4e">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {result.flags.cpcb.parameters.map((p, i) => (
                          <div key={i} style={{ padding: "7px 10px", background: "rgba(42,122,78,0.06)", borderRadius: 7, display: "flex", flexDirection: "column", gap: 1 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#183D3D" }}>{p.name}</span>
                            <span style={{ fontSize: 11, color: "#444" }}>{p.unit}</span>
                          </div>
                        ))}
                      </div>
                    </ResultFlagDetail>
                  )}
                  {result.flags?.m2m?.enabled && (
                    <ResultFlagDetail label="M2M" color="#1D6FAE">
                      <ResultKV rows={[
                        ["Folder", result.flags?.m2m?.extra?.folder || "—"],
                        ["Interval", result.flags.m2m.interval ? `${result.flags.m2m.interval}s` : "—"]
                      ]} />
                      {result.flags.m2m.parameters?.length > 0 && (
                        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {result.flags.m2m.parameters.map((p, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "rgba(29,111,174,0.06)", borderRadius: 7 }}>
                              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>{p.name}</span><br />
                              <span style={{ fontSize: 11, color: "#444" }}>{p.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ResultFlagDetail>
                  )}
                  {result.flags?.survekshan?.enabled && (
                    <ResultFlagDetail label="Survekshan" color="#7B5EA7">
                      <ResultKV rows={[
                        ["Unique ID", result.flags?.survekshan?.extra?.uniqueId || "—"],
                        ["Interval", result.flags.survekshan.interval ? `${result.flags.survekshan.interval}s` : "—"],
                        ["Quantity", result.flags?.survekshan?.qty ?? "—"]
                      ]} />
                    </ResultFlagDetail>
                  )}
                  {result.flags?.qes?.enabled && (
                    <ResultFlagDetail label="QES" color="#C07D28">
                      <ResultKV rows={[
                        ["Server ID", result.flags?.qes?.extra?.serverId || "—"],
                        ["Device Code", result.flags?.qes?.extra?.uniqueCode || "—"],
                        ["Interval", result.flags.qes.interval ? `${result.flags.qes.interval}s` : "—"]
                      ]} />
                      {result.flags.qes.parameters?.length > 0 && (
                        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {result.flags.qes.parameters.map((p, i) => (
                            <div key={i}>
                              <span style={{ fontSize: 12, color: "#000", fontWeight: 600 }}>{p.name}</span><br />
                              <span style={{ fontSize: 11, color: "#444" }}>{p.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ResultFlagDetail>
                  )}
                  {result.flags?.customServer?.enabled && (
                    <ResultFlagDetail label="Custom Server" color="#EA5455">
                      <ResultKV
                        rows={[
                          ["URL", result.flags?.customServer?.url || result.flags?.customServer?.extra?.url || "—"],
                          [
                            "Auth",
                            result.flags?.customServer?.extra?.auth
                              ? JSON.stringify(result.flags.customServer.extra.auth, null, 2)
                              : "—"
                          ],
                          [
                            "Headers",
                            result.flags?.customServer?.headers
                              ? JSON.stringify(result.flags.customServer.headers, null, 2)
                              : "—"
                          ]
                        ]}
                      />
                    </ResultFlagDetail>
                  )}
                  {result.modbus && (
                    <ResultFlagDetail label="Modbus Config" color="#183D3D">
                      <ResultKV
                        rows={[
                          ["Slave ID", result.modbus?.slaveId ?? "—"],
                          ["Baudrate", result.modbus?.baudrate ?? "—"],
                          ["Start Address", result.modbus?.startAddress ?? "—"],
                          ["Address Length", result.modbus?.addressLength ?? "—"]
                        ]}
                      />
                    </ResultFlagDetail>
                  )}

                </div>
              </div>
            )}

            {!result && !searchError && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(24,61,61,0.06)", border: "1.5px solid rgba(24,61,61,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Search size={22} color="rgba(24,61,61,0.25)" />
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: "#A0B2B2", textAlign: "center", lineHeight: 1.6, fontWeight: 500 }}>
                  Enter a serial number above to<br />look up device details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════ INSTRUMENT MODAL ══════════════════════ */}
      {showInstrumentModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[999] p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowInstrumentModal(false)}
        >
          <div
            className="w-full max-w-[500px] flex flex-col overflow-hidden"
            style={{ background: "#FDFAF2", borderRadius: 18, border: "1.5px solid rgba(24,61,61,0.12)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "75vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ height: 3, background: "linear-gradient(90deg, #183D3D 0%, rgba(24,61,61,0.3) 60%, transparent 100%)", flexShrink: 0 }} />
            <div className="px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid rgba(24,61,61,0.09)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(24,61,61,0.08)", border: "1.5px solid rgba(24,61,61,0.15)" }}>
                    <SlidersHorizontal size={15} color="#183D3D" />
                  </div>
                  <div>
                    <h3 className="m-0 text-[15px] font-bold text-[#183D3D]">Available Instruments</h3>
                    <p className="m-0 mt-0.5 text-[11px] text-[#7A9E9E]">
                      {listLoading ? "Loading…" : `${filteredInstruments.length} instrument${filteredInstruments.length !== 1 ? "s" : ""} found`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstrumentModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(24,61,61,0.06)", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(24,61,61,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(24,61,61,0.06)"}
                >
                  <X size={14} color="#183D3D" />
                </button>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9BB5B5" }} />
                <input
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-[13px] text-[#183D3D] outline-none transition-all duration-150"
                  style={{ background: "#F4F0E4", border: "1.5px solid #C8BFA0", fontFamily: "inherit", boxSizing: "border-box" }}
                  placeholder="Search by name or serial ID…"
                  value={instrumentSearch}
                  autoFocus
                  onChange={e => setInstrumentSearch(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = "rgba(24,61,61,0.45)"; e.target.style.background = "#EDE9DC"; }}
                  onBlur={e => { e.target.style.borderColor = "#C8BFA0"; e.target.style.background = "#F4F0E4"; }}
                />
                {instrumentSearch && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center transition-colors"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => setInstrumentSearch("")}
                  >
                    <X size={11} color="#7A9E9E" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader size={20} color="#183D3D" style={{ animation: "spin 1s linear infinite" }} />
                  <p className="m-0 text-[13px] text-[#7A9E9E]">Fetching instruments…</p>
                </div>
              ) : filteredInstruments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(24,61,61,0.06)" }}>
                    <Cpu size={20} color="#9BB5B5" />
                  </div>
                  <div className="text-center">
                    <p className="m-0 text-[13px] font-semibold text-[#183D3D]">No instruments found</p>
                    <p className="mt-1 m-0 text-[12px] text-[#9BB5B5]">{instrumentSearch ? "Try a different search term" : "No instruments registered"}</p>
                  </div>
                </div>
              ) : (
                <div>
                  {filteredInstruments.map((item, idx) => (
                    <div
                      key={idx}
                      className="instrument-row flex items-center gap-3 px-5 py-3.5 cursor-pointer"
                      style={{ borderBottom: "1px solid rgba(24,61,61,0.07)" }}
                      onClick={() => {
                        const serial = item.RTUserialNumber;
                        const instrumentName = item.instrumentName || "";
                        setSearch(serial);
                        setForm(prev => ({
                          ...prev,
                          RTUserialNumber: serial,
                          instrumentName: instrumentName
                        }));
                        const config = INSTRUMENT_CONFIG[instrumentName];
                        if (config && config.parameters) {
                          setForm(prev => ({
                            ...prev,
                            cpcbParameters: JSON.parse(JSON.stringify(config.parameters)),
                            RTUserialNumber: serial,
                            instrumentName: instrumentName
                          }));
                        }
                        setShowInstrumentModal(false);
                        setTimeout(() => { getData(); }, 100);
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold text-[#183D3D]" style={{ background: "rgba(24,61,61,0.07)" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-semibold text-[#183D3D] truncate">
                          {item.instrumentName || "Unnamed Instrument"}
                        </p>
                        <p className="m-0 mt-0.5 text-[12px] truncate" style={{ fontFamily: "'DM Mono', monospace", color: "#6A9090" }}>
                          {item.RTUserialNumber}
                        </p>
                        {item.instrumentCode && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase" style={{ background: "rgba(24,61,61,0.07)", color: "#7A9E9E" }}>
                            {item.instrumentCode}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={14} color="#C0CCCC" className="shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!listLoading && filteredInstruments.length > 0 && (
              <div className="px-5 py-3 shrink-0" style={{ borderTop: "1px solid rgba(24,61,61,0.08)", background: "rgba(24,61,61,0.02)" }}>
                <p className="m-0 text-[11px]" style={{ color: "#9BB5B5" }}>
                  Showing {filteredInstruments.length} of {instrumentList.length} instruments · Click to select
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Flag Section ─────────────────────────────────────────── */
function FlagSection({ icon, name, checked, onChange, label, desc, color, children, isOpen: controlledIsOpen, onToggle }) {
  const [internalIsOpen, setInternalIsOpen] = useState(checked);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  useEffect(() => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(checked);
    }
  }, [checked, controlledIsOpen]);

  return (
    <div className="flag-section">
      <div className="flag-header" onClick={() => setIsOpen(!isOpen)}>
        <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" name={name} checked={checked} onChange={onChange} />
          <span className="toggle-track" />
        </label>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: checked ? `${color}18` : "rgba(24,61,61,0.05)", border: `1.5px solid ${checked ? color + "30" : "rgba(24,61,61,0.10)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: checked ? color : "#8A9E9E", transition: "all 0.2s" }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: checked ? "#183D3D" : "#5A7070", transition: "color 0.2s" }}>{label}</div>
          <div style={{ fontSize: 11.5, color: "#9AB0B0", marginTop: 1 }}>{desc}</div>
        </div>
        {isOpen ? <ChevronUp size={15} color="#8A9E9E" /> : <ChevronDown size={15} color="#C0CCCC" />}
      </div>
      {isOpen && checked && (
        <div className="flag-body">
          <div style={{ height: 1, background: "rgba(24,61,61,0.08)", marginBottom: 14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Parameter List ───────────────────────────────────────── */
function ParamList({
  params,
  paramKey,
  options = [],
  flagInputBase,
  onAdd,
  onRemove,
  onChange
}) {
  const handleSelect = (i, value) => {
    const selected = options.find(opt => opt.name === value);
    onChange(paramKey, i, "bulk", {
      name: value,
      unit: selected ? selected.unit : ""
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {params.map((row, i) => (
        <div key={i} className="param-row">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#5A7070",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Parameter {i + 1}
            </span>
            {params.length > 1 && (
              <button
                onClick={() => onRemove(paramKey, i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "rgba(234,84,85,0.08)",
                  border: "1px solid rgba(234,84,85,0.18)",
                  color: "#EA5455",
                  cursor: "pointer"
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10
          }}>
            <div>
              <label style={{
                display: "block",
                fontSize: 10.5,
                fontWeight: 700,
                color: "#8A9E9E",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                marginBottom: 5
              }}>
                Parameter Name
              </label>
              <input
                list={`param-options-${i}`}
                className={flagInputBase}
                value={row.name}
                placeholder="Select or type"
                onChange={(e) => handleSelect(i, e.target.value)}
              />
              <datalist id={`param-options-${i}`}>
                {options.map((opt, idx) => (
                  <option key={idx} value={opt.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={{
                display: "block",
                fontSize: 10.5,
                fontWeight: 700,
                color: "#8A9E9E",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                marginBottom: 5
              }}>
                Unit
              </label>
              <input
                className={flagInputBase}
                value={row.unit}
                onChange={(e) =>
                  onChange(paramKey, i, "unit", e.target.value)
                }
                placeholder="Auto / Editable"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => onAdd(paramKey)}
        className="add-param-btn"
      >
        <Plus size={13} />
        Add Parameter
      </button>
    </div>
  );
}

/* ─── Result Flag Detail ───────────────────────────────────── */
function ResultFlagDetail({ label, color, children }) {
  return (
    <div style={{ marginTop: 10, padding: "12px 14px", background: `${color}08`, border: `1.5px solid ${color}20`, borderRadius: 10 }}>
      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: color, letterSpacing: "0.7px", textTransform: "uppercase" }}>{label}</p>
      {children}
    </div>
  );
}

function ResultKV({ rows }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <span style={{ fontSize: 11.5, color: "#8A9E9E", width: 90, flexShrink: 0, fontWeight: 600 }}>{k}</span>
          <span style={{ fontSize: 13, color: "#183D3D", fontWeight: 600, wordBreak: "break-all" }}>{v ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}
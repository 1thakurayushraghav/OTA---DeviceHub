import { useState, useEffect } from "react"
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom"
import { LogIn } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const nav = useNavigate()

  // 🔥 AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        // Verify token with backend
        await api.get("/auth/verify");

        // Token is valid
        nav("/dashboard", { replace: true });

      } catch (err) {
        console.error("Stored token is invalid:", err);

        // Remove expired/invalid token
        localStorage.removeItem("token");
      }
    };

    checkLogin();
  }, [nav]);

  const login = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);

        nav("/dashboard", { replace: true });
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow} />
      <div style={styles.bgGrid} />

      <div style={styles.card}>
        <div style={styles.accentBar} />
        <div style={styles.inner}>

          <div style={styles.header}>
            <div style={styles.iconWrap}>
              <LogIn size={20} color="#EA5455" />
            </div>
            <div>
              <h1 style={styles.title}>Welcome back</h1>
              <p style={styles.subtitle}>Sign in to your account</p>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
              />
            </div>

            <button
              onClick={login}
              style={styles.btn}
              onMouseEnter={e => Object.assign(e.currentTarget.style, styles.btnHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, styles.btnBase)}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          </div>

          <p style={styles.footer}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>Register</Link>
          </p>

        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#F4F0E4",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "560px",
    height: "560px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(24,61,61,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(24,61,61,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(24,61,61,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#FDFAF2",
    border: "1px solid rgba(24,61,61,0.13)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(24,61,61,0.09), 0 2px 6px rgba(24,61,61,0.05)",
  },
  accentBar: {
    height: "3px",
    background: "linear-gradient(90deg, #EA5455, #183D3D, transparent)",
  },
  inner: { padding: "36px" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
  },
  iconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "rgba(234,84,85,0.08)",
    border: "1px solid rgba(234,84,85,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#183D3D",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: "13px",
    color: "#6A9090",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(24,61,61,0.09)",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginBottom: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#7A9E9E",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  input: {
    padding: "11px 14px",
    backgroundColor: "#F4F0E4",
    border: "1px solid rgba(24,61,61,0.16)",
    borderRadius: "8px",
    color: "#183D3D",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, background-color 0.2s",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "rgba(234,84,85,0.45)",
    backgroundColor: "#FFF6F6",
  },
  inputBlur: {
    borderColor: "rgba(24,61,61,0.16)",
    backgroundColor: "#F4F0E4",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#EA5455",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontFamily: "inherit",
    marginTop: "4px",
  },
  btnBase: { backgroundColor: "#EA5455" },
  btnHover: { backgroundColor: "#d43f40" },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#7A9E9E",
    margin: 0,
  },
  link: {
    color: "#EA5455",
    textDecoration: "none",
    fontWeight: "700",
  },
}
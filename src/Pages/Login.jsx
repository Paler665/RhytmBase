import { useState, useContext } from "react"
import "./Login.css"
import { AuthContext } from "../context/AuthContext"
import { supabase } from "../lib/supabaseClient"

export default function Login() {
  const { setLoginStatus } = useContext(AuthContext)

  const [mode, setMode] = useState("login")       // login / register
  const [username, setUsername] = useState("")    // untuk register
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // ============================= LOGIN =============================
  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return alert("Email atau password salah")
    alert("Berhasil login!")
  }

  // ============================ REGISTER ============================
  async function handleRegister() {
    if (!username.trim()) return alert("Username wajib diisi!")

    // 1. Buat user Auth
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) return alert(error.message)

    const user = data.user
    if (!user) return alert("Register gagal, user tidak ditemukan")

    // 2. Profile default
    const defaultPic =
      "https://maquqwrakaevtsxclnzz.supabase.co/storage/v1/object/public/Image/Profile/PlaceholderProfile.png"

    // 3. Insert ke user_profiles
    const { error: profileErr } = await supabase.from("user_profiles").insert({
      id: user.id,                // FK → auth.users.id
      username: username,         // pakai input user
      profile_pic: defaultPic
    })

    if (profileErr) return alert("Gagal simpan profil: " + profileErr.message)

    alert("Akun berhasil dibuat! Cek email untuk verifikasi sebelum login.")
    setMode("login")
  }

  return (
    <div className="LoginContainer">
      <div className="LoginWrapper">

        {/* KIRI */}
        <div className="LoginKiri">
          <img src="/Logo Rhytm base.svg" alt="RhytmBase" className="splash-logo" />
        </div>

        {/* KANAN */}
        <div className="LoginKanan">
          <h1>{mode === "login" ? "Login" : "Register"}</h1>

          {/* tampil hanya saat REGISTER */}
          {mode === "register" && (
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "login"
            ? <button className="loginBtn" onClick={handleLogin}>Masuk</button>
            : <button className="loginBtn" onClick={handleRegister}>Daftar</button>
          }

          <p className="toggle">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <span className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Daftar di sini" : "Login di sini"}
            </span>
          </p>
        </div>

      </div>
    </div>
  )
}

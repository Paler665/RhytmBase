import { useContext, useState, useEffect } from "react"
import Login from "./Login"
import { AuthContext } from "../Context/AuthContext"
import "./Profile.css"
import { supabase } from "../lib/supabaseClient"

export default function Profil() {
  const { user, loginStatus } = useContext(AuthContext)

  const [profilePicUrl, setProfilePicUrl] = useState("")
  const [profileData, setProfileData] = useState(null)

  // LOADING FOTO (seperti sebelumnya)
  useEffect(() => {
    async function loadPlaceholder() {
      const { data } = supabase
        .storage
        .from("Image")
        .getPublicUrl("Profile/PlaceholderProfile.png")

      setProfilePicUrl(data.publicUrl)
    }
    loadPlaceholder()
  }, [])

  // ambil username
  useEffect(() => {
    async function loadProfile() {

      if (!user) return

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.log("Gagal ambil profile:", error)
        return
      }

      setProfileData(data)   // simpan username, profile_pic dsb
    }

    loadProfile()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!loginStatus) return <Login />

  return (
    <div className="profilePage">
      <div className="ProfileContainer">
        <div className="detailWrapper">
          <div className="ProfilePicContainer">
            <img
              src={profileData?.profile_pic || profilePicUrl}
              alt="Profile"
              className="ProfilePic"
            />
          </div>
          <div className="ProfileDetail">
            <h1 className="ProfileName">
              {profileData?.username || "Memuat username..."}
            </h1>
            <h3 className="ProfileEmail">{user.email}</h3>
            <button className="EditBtn">
              Edit Profil
            </button>
            <button className="LogoutBtn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="addedSongContainer">
        <h1>Lirik yang ditambahkan</h1>
      </div>

    </div>
  )
}

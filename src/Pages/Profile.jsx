import { useContext, useState, useEffect } from "react"
import Login from "./Login"
import { AuthContext } from "../Context/AuthContext"
import "./Profile.css"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Profil() {
  const { user, loginStatus } = useContext(AuthContext)
  const navigate = useNavigate()

  const [profilePicUrl, setProfilePicUrl] = useState("")
  const [profileData, setProfileData] = useState(null)

  // === LOAD FOTO DEFAULT ===
  useEffect(() => {
    async function loadProfilePic() {
      if (!user) return

      // ambil data user
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("profile_pic")
        .eq("id", user.id)
        .single()

      if (error) {
        console.log("Gagal ambil foto profil:", error)
        return
      }

      // kalau ada foto profil → pakai foto itu
      if (profile?.profile_pic) {
        setProfilePicUrl(profile.profile_pic)
        return
      }

      // fallback kalau belum ada foto profil
      const { data } = supabase
        .storage
        .from("Image")
        .getPublicUrl("Profile/PlaceholderProfile.png")

      setProfilePicUrl(data.publicUrl)
    }

    loadProfilePic()
  }, [user])

  // === LOAD USER PROFILE ===
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

      setProfileData(data)
    }

    loadProfile()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!loginStatus) return <Login />

  // === AMBIL LAGU YANG DIUPLOAD USER ===
  const [addedSongs, setAddedSongs] = useState([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadAddedSongs() {
      if (!user) return

      try {
        setIsLoadingSongs(true)
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .eq("uploader_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (isMounted) {
          setAddedSongs(data)
        }
      } catch (error) {
        console.error("Error fetching songs:", error)
      } finally {
        if (isMounted) setIsLoadingSongs(false)
      }
    }

    loadAddedSongs()

    return () => {
      isMounted = false
    }
  }, [user])

  // === PAGINATION ===
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const perPage = 3

  const filteredSongs = addedSongs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSongs.length / perPage)
  const startIndex = (page - 1) * perPage
  const visible = filteredSongs.slice(startIndex, startIndex + perPage)

  return (
    <div className="profilePage">
      <div className="ProfileContainer">
        <div className="detailWrapper">
          <div className="ProfilePicContainer">
            <img
              // FIX: Jangan biarkan src kosong string. Gunakan null atau placeholder jika loading.
              src={profileData?.profile_pic || profilePicUrl || null}
              alt="Profile"
              className="ProfilePic"
              onError={(e) => {
                // Fallback jika URL gambar error/broken
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="ProfileDetail">
            <h1 className="ProfileName">
              {profileData?.username || "..."}
            </h1>
            <h3 className="ProfileEmail">{user.email}</h3>

            <button className="EditBtn" onClick={() => navigate("/editProfile")}>
              Edit Profil
            </button>

            <button className="LogoutBtn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* === LIST LAGU YANG DIUPLOAD === */}
      <div className="addedSongContainer">
        <h1>Lagu yang Kamu Upload</h1>
        <div className="searchBarWrapper">
          <input
            type="text"
            placeholder="Cari lagu..."
            className="searchBar"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        <div className="uploadedSong">
          {isLoadingSongs ? (
            <p style={{ color: "white", textAlign: "center" }}>Memuat lagu...</p>
          ) : visible.length > 0 ? (
            visible.map((item) => (
              <div
                key={item.id}
                className="songCardUp"
                onClick={() => navigate(`/songs/${item.id}`)}
              >
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="songImageUp"
                />

                <div className="songDesc">
                  <strong>{item.title}</strong>
                  <br />
                  {item.description?.length > 100
                    ? item.description.slice(0, 100) + "..."
                    : item.description}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", width: "100%", padding: "20px" }}>
              <p style={{ color: "gray" }}>Belum ada lagu yang diupload.</p>
              {
                /* Button refresh manual kalau user merasa ada lagu tp blm muncul
                   berguna kalo delay network/consistency lama */
              }
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: '10px', fontSize: '12px', background: 'transparent', border: '1px solid gray', color: 'gray', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>

        {/* === PAGINATION === */}
        <div className="paginationWrapper">
          <button
            className={`pageBtn ${page > 1 ? "active" : ""}`}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ❮
          </button>

          <div className="pageIndicator">
            {page} of {totalPages}
          </div>

          <button
            className={`pageBtn ${page < totalPages ? "active" : ""}`}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            ❯
          </button>
        </div>
      </div>

    </div>
  )
}

import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import "./SongDetail.css"

export default function SongDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [song, setSong] = useState(null)
  const [lyrics, setLyrics] = useState([])
  const [favorite, setFavorite] = useState(false)
  const [selectedLang, setSelectedLang] = useState(null)
  const [fade, setFade] = useState(true)

  const [authReady, setAuthReady] = useState(false)

  // wait for session
  useEffect(() => {
    async function waitSession() {
      await supabase.auth.getSession()
      setAuthReady(true)
    }
    waitSession()
  }, [])

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("Harus login dulu")

    if (favorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("song_id", id)
        .eq("user_id", user.id)

      setFavorite(false)
    } else {
      await supabase
        .from("favorites")
        .insert({
          song_id: id,
          user_id: user.id
        })

      setFavorite(true)
    }
  }

  // LOAD DATA DENGAN JOIN PAKSA user_profiles!uploader_id
  useEffect(() => {
    if (!authReady) return

    async function loadData() {
      // ambil data song + paksa join ke user_profiles berdasarkan uploader_id FK
      const { data: songData, error } = await supabase
        .from("songs")
        .select(`
          *,
          user_profiles!uploader_id (
            username,
            profile_pic
          )
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching song:", error)
        return
      }

      // set data awal (segera tampilkan)
      setSong(songData)

      // ambil lyrics
      const { data: lyricData } = await supabase
        .from("song_lyrics")
        .select("*")
        .eq("song_id", id)

      setLyrics(lyricData || [])
      setSelectedLang((lyricData && lyricData[0]) || null)

      // cek favorite untuk user login saat ini
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("*")
          .eq("song_id", id)
          .eq("user_id", user.id)
          .maybeSingle()

        setFavorite(!!fav)
      }

      // increment visits sederhana (tanpa logic per-hari)
      try {
        const newVisits = (songData?.visits || 0) + 1
        const { data: updatedSong, error: updErr } = await supabase
          .from("songs")
          .update({ visits: newVisits })
          .eq("id", id)
          .select()
          .single()

        if (!updErr && updatedSong) {
          setSong(prev => ({ ...prev, visits: updatedSong.visits }))
        }
      } catch (err) {
        console.error("Error incrementing visits:", err)
        // jangan ganggu UX kalo error, tetap tampilkan data awal
      }
    }

    loadData()
  }, [id, authReady])

  function changeLyric(item) {
    setFade(false)
    setTimeout(() => {
      setSelectedLang(item)
      setFade(true)
    }, 120)
  }

  if (!song) return <div>Loading...</div>

  return (
    <div className="songDetailPage">

      <button className="backButton" onClick={() => navigate("/songs")}>
        ← Kembali
      </button>

      <div className="upperSongInfobox">
        <img src={song.cover_url} alt="Cover" className="musicCover" />

        <div className="descBoxLeft">
          <h1>{song.title}</h1>
          <h3>{song.artist}</h3>
          <h3>ID Lagu: {song.id}</h3>
        </div>

        <div className="descBoxRight">
          <button
            className={`favoriteBtn ${favorite ? "favActive" : ""}`}
            onClick={toggleFavorite}
          >
            {favorite ? "Favorit ❤️" : "Favorit 🤍"}
          </button>

          <h2>Genre: {song.genre}</h2>
          <h2>Tahun Rilis: {song.release_date}</h2>

          {/* Username diambil dari user_profiles hasil join */}
          <h2>
            Uploader: {song.user_profiles?.username || "Unknown"}
          </h2>

          <h2>Dilihat: {song.visits ?? 0} kali</h2>
        </div>
      </div>

      <div className="downBox">
        <div className="detailText">
          <h1>Deskripsi</h1>
          {song.description}
        </div>

        <div className="lyricsButton">
          {lyrics.map(item => (
            <button
              key={item.id}
              className={`lyricBtn ${selectedLang?.lang === item.lang ? "activeLang" : ""}`}
              onClick={() => changeLyric(item)}
            >
              {item.lang}
            </button>
          ))}
        </div>

        <div className="lyricDisplayBox">
          <p className={`lyricText ${fade ? "fadeIn" : "fadeOut"}`}>
            {selectedLang?.lyric}
          </p>
        </div>
      </div>

    </div>
  )
}

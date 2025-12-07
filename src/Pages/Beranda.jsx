import { useNavigate } from "react-router-dom";
import "./Beranda.css";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

import { supabase } from "../lib/supabaseClient";
import { useState, useEffect } from "react";

export default function Beranda() {
  const { user, loginStatus } = useContext(AuthContext);
  const navigate = useNavigate();

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newSongs, setNewSongs] = useState([]);

  useEffect(() => {
    fetchTrendingSongs();
    fetchNewSongs();
  }, []);

  // ==========================
  // TRENDING SONGS
  // ==========================
  async function fetchTrendingSongs() {
    const { data, error } = await supabase.from("songs").select("*");

    if (error) {
      console.error("Trending songs error:", error);
      return;
    }

    // Ubah visits null jadi 0
    const formatted = data.map((song) => ({
      ...song,
      visits: song.visits ?? 0,
    }));

    // Sort manual descending
    const sorted = formatted.sort((a, b) => b.visits - a.visits);

    // Ambil 4 teratas
    setTrendingSongs(sorted.slice(0, 4));
  }

  // ==========================
  // NEW SONGS
  // ==========================
  async function fetchNewSongs() {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false }) // kalau ada created_at
      .order("id", { ascending: false }) // fallback: id terbaru di atas
      .limit(4);

    if (error) console.error("New songs error:", error);
    else setNewSongs(data);
  }

  return (
    <div className="BerandaContainer">
      <div className="HeroWrapperAtas">
        <div className="HeroAtasKanan">
          <img src="/Logo Rhytm base.svg" alt="RhytmBase" className="logo" />
          <h3>
            Selamat datang di Rhytm Base! tempat terbaik buat lihat berbagai
            lirik lagu dalam satu situs
          </h3>
        </div>

        <div className="HeroAtasKiri">
          <img src="/miguBassTrio.svg" alt="RhytmBase" className="logo" />
        </div>
      </div>

      {/* TRENDING */}
      <div className="InformationHolder">
        <div className="trendingTextBox">
          <h1>Lagu Trending</h1>
        </div>

        <div className="trendingGrid">
          {trendingSongs.map((song) => (
            <div
              key={song.id}
              className="trendingCard"
              onClick={() => navigate(`/songs/${song.id}`)}
            >
              <img
                src={song.cover_url || "/placeholdertrending.png"}
                alt={song.title}
                className="trendingImage"
              />
              <div className="trendingCaption">{song.title}</div>
            </div>
          ))}
        </div>

        <div className="latestTextBox">
          <h1>Lirik yang baru ditambahkan</h1>
        </div>

        <div className="trendingGrid">
          {newSongs.map((song) => (
            <div
              key={song.id}
              className="trendingCard"
              onClick={() => navigate(`/songs/${song.id}`)}
            >
              <img
                src={song.cover_url || "/placeholderbaru.png"}
                alt={song.title}
                className="trendingImage"
              />
              <div className="trendingCaption">{song.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SHORTCUT BOX */}
      <div className="boxHolder">
        <div className="boxTambahLirik">
          <h1>Tambah</h1>
          <h1>Lirik Lagu</h1>
          <img
            src="/Tambah.svg"
            alt="Tambah Lirik"
            className="boxIcon"
            onClick={() => {
              if (!loginStatus) {
                alert("Login terlebih dahulu agar bisa akses halaman favorit.");
                return;
              }
              navigate("/add-song");
            }}
          />
        </div>

        <div className="boxJelajahi" onClick={() => navigate("/songs")}>
          <h1>Jelajahi</h1>
          <h1>Lirik Lagu</h1>
          <img src="/Cari.svg" alt="Jelajahi Lirik" className="boxIcon" />
        </div>

        <div
          className="boxFaforit"
          onClick={() => {
            if (!loginStatus) {
              alert("Login terlebih dahulu agar bisa akses halaman favorit.");
              return;
            }
            navigate("/favorites");
          }}
        >
          <h1>Lagu</h1>
          <h1>Favorit</h1>
          <img src="/favorite.svg" alt="Lirik disukai" className="boxIcon" />
        </div>
      </div>
    </div>
  );
}

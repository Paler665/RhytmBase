import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./FavoritePage.css";

export default function FavoritePage() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const perPage = 12;

  // AMBIL FAVORITES DARI SUPABASE
  useEffect(() => {
    async function loadFavorites() {
      // Ambil user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil daftar song_id yang difavoritkan
      const { data: favRows } = await supabase
        .from("favorites")
        .select("song_id")
        .eq("user_id", user.id);

      if (!favRows || favRows.length === 0) {
        setSongs([]);
        return;
      }

      const songIds = favRows.map((f) => f.song_id);

      // Ambil data detail lagu
      const { data: favSongs } = await supabase
        .from("songs")
        .select("*")
        .in("id", songIds);

      setSongs(favSongs || []);
    }

    loadFavorites();
  }, []);

  // =====================================
  // FILTER SEARCH
  // =====================================
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase()),
  );

  // PAGINATION
  const totalPages = Math.ceil(filteredSongs.length / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const visible = filteredSongs.slice(startIndex, startIndex + perPage);

  return (
    <div className="favoritePage">
      <div className="SongTextBoxFavorite">
        <h1>Lagu Faforit</h1>
      </div>

      <div className="searchBarWrapper">
        <input
          type="text"
          placeholder="Cari lagu..."
          className="searchBarFavorit"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="containerLaguFavorite">
        {visible.length > 0 ? (
          visible.map((item) => (
            <div
              key={item.id}
              className="songCard"
              onClick={() => navigate(`/songs/${item.id}`)}
            >
              <img
                src={item.cover_url}
                alt={item.title}
                className="songImage"
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
          <div className="favoriteEmpty">Belum ada lagu yang disukai</div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="paginationWrapperFavorite">
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
  );
}

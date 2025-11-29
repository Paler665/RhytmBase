import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Lagu.css";

export default function Lagu() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const perPage = 12;

  useEffect(() => {
    async function loadSongs() {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("id", { ascending: true });

      if (error) console.log(error);
      else setSongs(data);
    }

    loadSongs();
  }, []);

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSongs.length / perPage);
  const startIndex = (page - 1) * perPage;
  const visible = filteredSongs.slice(startIndex, startIndex + perPage);

  return (
    <div className="songPage">
      <div className="SongTextBox">
        <h1>Lagu</h1>
      </div>

      <div className="searchBarWrapper">
        <input
          type="text"
          placeholder="Cari lagu..."
          className="searchBar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="containerLagu">
        {visible.map((item) => (
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
              {/* 🔥 LIMIT 100 CHAR */}
              {item.description?.length > 100
                ? item.description.slice(0, 100) + "..."
                : item.description}
            </div>
          </div>
        ))}
      </div>

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
  );
}

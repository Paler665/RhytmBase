import { useNavigate } from "react-router-dom"
import "./Beranda.css";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

export default function Beranda() {
  const { user, loginStatus } = useContext(AuthContext);
  const navigate = useNavigate()

  const trendingImgs = [
    { src: "/placeholdertrending.png", alt: "Trending 1", title: "Trending 1" },
    { src: "/placeholdertrending2.png", alt: "Trending 2", title: "Trending 2" },
    { src: "/placeholdertrending3.png", alt: "Trending 3", title: "Trending 3" },
    { src: "/placeholdertrending4.png", alt: "Trending 4", title: "Trending 4" },
  ];

  const newImgs = [
    { src: "/placeholderbaru.png", alt: "Baru 1", title: "Baru 1" },
    { src: "/placeholderbaru1.png", alt: "Baru 2", title: "Baru 2" },
    { src: "/placeholderbaru2.png", alt: "Baru 3", title: "Baru 3" },
    { src: "/placeholderbaru3.png", alt: "Baru 4", title: "Baru 4" },
  ];

  return (
    <div className="BerandaContainer">

      <div className="HeroWrapperAtas">
        <div className="HeroAtasKanan">
          <img src="/Logo Rhytm base.svg" alt="RhytmBase" className="logo" />
          <h3>
            Selamat datang di Rhytm Base!
            tempat terbaik buat lihat berbagai lirik lagu dalam satu situs
          </h3>
        </div>

        <div className="HeroAtasKiri">
          <h1>gambar migu bass trio</h1>
        </div>
      </div>

      {/* TRENDING */}
      <div className="InformationHolder">
        <div className="trendingTextBox">
          <h1>Lagu Trending</h1>
        </div>

        <div className="trendingGrid">
          {trendingImgs.map((item, idx) => (
            <div key={idx} className="trendingCard">
              <img src={item.src} alt={item.alt} className="trendingImage" />
              <div className="trendingCaption">{item.title}</div>
            </div>
          ))}
        </div>

        <div className="latestTextBox">
          <h1>Lirik yang baru ditambahkan</h1>
        </div>

        <div className="trendingGrid">
          {newImgs.map((item, idx) => (
            <div key={idx} className="trendingCard">
              <img src={item.src} alt={item.alt} className="trendingImage" />
              <div className="trendingCaption">{item.title}</div>
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

import "./AboutPage.css";

export default function About() {
  return (
    <div className="aboutContainer">
      <div className="aboutWrapper">
        <h1 className="aboutTitle">Tentang</h1>
        <img src="/Logo Rhytm base.svg" alt="RhytmBase" className="logo"></img>

        <div className="aboutCard">
          <p>
            RhytmBase adalah platform penyimpanan lirik lagu yang akan disajikan
            secara indah untuk orang-orang yang ingin mengeksplorasi lirik-lirik
            lagu faforit mereka
          </p>
        </div>

        <p className="aboutFooter">
          Dibuat oleh Farrel R.
          <br />
          2025 RhytmBase Project
        </p>
      </div>
    </div>
  );
}

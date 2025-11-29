import { useEffect } from "react";
import "./Splash.css";

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2 detik

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
        <img src="/Logo Rhytm base.svg" alt="RhytmBase" className="splash-logo"></img>
    </div>
  );
}

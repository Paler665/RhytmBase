import { useState } from "react"
import SplashScreen from "./Components/SplashScreen"
import "./App.css"
import Home from "./Pages/Beranda.jsx"
import Songs from "./Pages/Lagu.jsx"
import Profile from "./Pages/Profile.jsx"
import SongDetail from "./Pages/SongDetail.jsx"
import About from "./Pages/AboutPage.jsx"
import Favorite from "./Pages/FavoritePage.jsx"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx";
import AddSong from "./Pages/AddSong.jsx"

// motion import
import { AnimatePresence, motion } from "framer-motion"


// ================= PAGE WRAPPER ANIMATION =================
function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  )
}


// ================= MAIN CONTENT =================
function AppContent() {
  const [showSplash, setShowSplash] = useState(true)

  const navigate = useNavigate()
  const location = useLocation() // <--- wajib untuk animasi

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  return (
    <div className="app">

      <div className="pageWrapper">

        {/* ROUTING + ANIMATION */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrap><Home /></PageWrap>} />
            <Route path="/songs" element={<PageWrap><Songs /></PageWrap>} />
            <Route path="/songs/:id" element={<PageWrap><SongDetail /></PageWrap>} />
            <Route path="/profile" element={<PageWrap><Profile /></PageWrap>} />
            <Route path="/about" element={<PageWrap><About /></PageWrap>} />
            <Route path="/favorites" element={<PageWrap><Favorite /></PageWrap>} />
            <Route path="/add-song" element={<PageWrap><AddSong /></PageWrap>} />
          </Routes>
        </AnimatePresence>

      </div>


      {/* BOTTOM NAV */}
      <nav className="bottomNavBar">
        <img src="/home.svg" className="navBarButton" alt="Beranda" onClick={() => navigate("/")} />
        <img src="/music.svg" className="navBarButton" alt="Lagu" onClick={() => navigate("/songs")} />
        <img src="/profile.svg" className="navBarButton" alt="Profile" onClick={() => navigate("/profile")} />
        <img src="/about.svg" className="navBarButton" alt="Tentang" onClick={() => navigate("/about")} />
      </nav>

    </div>
  )
}


// ================= ROOT =================
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddSong() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState([]);
    const [newSong, setNewSong] = useState({
        title: "",
        artist: "",
        description: "",
        genre: "",
        release_date: "",
        cover_url: "",
        uploader_id: "",
    });
    return (
        <div>
            <h1>Add Song</h1>
        </div>
    )
}
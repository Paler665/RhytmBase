import { useState, useContext, useRef } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./AddSong.css";

export default function AddSong() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const coverRef = useRef(null);

    const [newSong, setNewSong] = useState({
        title: "",
        artist: "",
        description: "",
        genre: "",
        release_date: "",
        cover_url: "",
        uploader_id: "",
        lyrics: [
            { lang: "", text: "" }
        ]
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar");
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSong(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLyricsChange = (index, field, value) => {
        const updated = [...newSong.lyrics];
        updated[index][field] = value;
        setNewSong(prev => ({ ...prev, lyrics: updated }));
    };

    const addLang = () => {
        if (newSong.lyrics.length >= 5) return;
        setNewSong(prev => ({
            ...prev,
            lyrics: [...prev.lyrics, { lang: "", text: "" }]
        }));
    };

    const removeLang = (index) => {
        const updated = newSong.lyrics.filter((_, i) => i !== index);
        setNewSong(prev => ({ ...prev, lyrics: updated }));
    };

    async function uploadCover() {
        if (!selectedFile) return null;

        const fileExt = selectedFile.name.split(".").pop();
        const baseName = selectedFile.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_");

        const scrambledName = `${baseName}-${user.id}.${fileExt}`;
        const filePath = `song-covers/${scrambledName}`;

        const { error: uploadError } = await supabase.storage
            .from("Image")
            .upload(filePath, selectedFile);

        if (uploadError) {
            console.error(uploadError);
            alert(uploadError.message);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from("Image")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!user) {
            alert("Anda belum login");
            return;
        }

        if (!selectedFile) {
            alert("Cover belum dipilih");
            return;
        }

        const coverUrl = await uploadCover();
        if (!coverUrl) return;

        // STEP 1: Insert ke tabel songs
        const { data: songData, error: songError } = await supabase
            .from("songs")
            .insert([
                {
                    title: newSong.title,
                    artist: newSong.artist,
                    description: newSong.description,
                    genre: newSong.genre,
                    release_date: newSong.release_date,
                    cover_url: coverUrl,
                    uploader_id: user.id
                }
            ])
            .select()
            .single();

        if (songError) {
            console.error(songError);
            alert(songError.message);
            return;
        }

        // STEP 2: Insert lyrics ke tabel song_lyrics
        const lyricsPayload = newSong.lyrics.map(l => ({
            song_id: songData.id,
            lang: l.lang,
            lyric: l.text
        }));

        const { error: lyricsError } = await supabase
            .from("song_lyrics")
            .insert(lyricsPayload);

        if (lyricsError) {
            console.error(lyricsError);
            alert(lyricsError.message);
            return;
        }

        alert("Lagu berhasil ditambahkan");
        navigate("/");
    }

    return (
        <div className="addSongPage">
            <div className="songFormContainer">

                <div className="coverURLContainer">
                    <input
                        type="file"
                        ref={coverRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />
                    <h1>Cover</h1>
                    <img src={preview || "/addImage.svg"} alt="Preview" className="coverURL" />
                    <button className="coverBtn" onClick={() => coverRef.current.click()}>
                        Pilih Gambar
                    </button>
                </div>

                <div className="songInfoContainer">
                    <h1>Informasi Lagu</h1>

                    <form className="songForm" onSubmit={handleSubmit}>
                        <input className="formInput" type="text" name="title" placeholder="Judul Lagu" onChange={handleChange} />
                        <input className="formInput" type="text" name="artist" placeholder="Artis" onChange={handleChange} />
                        <input className="formInput" type="text" name="description" placeholder="Deskripsi" onChange={handleChange} />
                        <input className="formInput" type="text" name="genre" placeholder="Genre" onChange={handleChange} />
                        <input className="formInput" type="date" name="release_date" onChange={handleChange} />

                        <div>
                            {newSong.lyrics.map((item, index) => (
                                <div key={index} className="langInput">

                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            placeholder="Lang (ID EN JP)"
                                            value={item.lang}
                                            onChange={(e) => handleLyricsChange(index, "lang", e.target.value)}
                                            className="formInput"
                                        />

                                        {newSong.lyrics.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLang(index)}
                                                className="deleteBtn"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>

                                    <textarea
                                        placeholder="Lyrics"
                                        value={item.text}
                                        onChange={(e) => handleLyricsChange(index, "text", e.target.value)}
                                        className="formInput"
                                        rows={4}
                                    />
                                </div>
                            ))}

                            {newSong.lyrics.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addLang}
                                    className="addBtn"
                                >
                                    Tambah Bahasa
                                </button>
                            )}
                        </div>

                        <button type="submit" className="submitBtn">Tambahkan Lagu</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

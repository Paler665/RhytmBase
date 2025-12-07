import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import "./EditProfile.css"

export default function EditProfile() {
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [preview, setPreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [currentProfilePic, setCurrentProfilePic] = useState("")

    // === LOAD CURRENT PROFILE DATA ===
    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("user_profiles")
                .select("profile_pic, username")
                .eq("id", user.id)
                .single()

            if (error) {
                console.log("Error load profile:", error)
                return
            }

            setCurrentProfilePic(data.profile_pic)
            setUsername(data.username)
        }

        loadProfile()
    }, [])

    // === HANDLE SELECT FILE ===
    function handleFileChange(e) {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar")
            return
        }

        setSelectedFile(file)
        setPreview(URL.createObjectURL(file))
    }

    // === UPLOAD FOTO PROFIL DENGAN AUTO DELETE FILE LAMA ===
    async function uploadProfilePic(userId) {
        if (!selectedFile) return null

        // 1. AMBIL DATA LAMA DARI DB (Bukan dari state/props biar akurat)
        const { data: oldProfile, error: fetchError } = await supabase
            .from("user_profiles")
            .select("profile_pic")
            .eq("id", userId)
            .single()

        if (!fetchError && oldProfile?.profile_pic) {
            const oldPicUrl = oldProfile.profile_pic

            // Cek apakah ini file di storage kita (bukan placeholder/external)
            // Kita cari "/Image/" di URL untuk menentukan start path
            // URL biasanya: .../storage/v1/object/public/Image/Profile/filename.jpg
            if (oldPicUrl.includes("/Image/")) {
                try {
                    const parts = oldPicUrl.split("/Image/")
                    if (parts.length >= 2) {
                        // Ambil bagian setelah /Image/
                        let relativePath = parts[1].split("?")[0]

                        // Decode URI component (misal spasi jadi %20)
                        const pathToDelete = decodeURIComponent(relativePath)

                        console.log("URL Lama:", oldPicUrl)
                        console.log("Mencoba delete path:", pathToDelete)

                        // Langsung coba delete tanpa cek list (karena list bisa kena RLS)
                        const { error: deleteError } = await supabase.storage
                            .from("Image")
                            .remove([pathToDelete])

                        if (deleteError) {
                            console.error("Gagal delete di Supabase:", deleteError)
                            // Optional: alert user, atau silent fail
                        } else {
                            console.log("Perintah delete terkirim ke Supabase")
                        }
                    }
                } catch (err) {
                    console.warn("Exception saat delete file:", err)
                }
            }
        }

        // 2. UPLOAD FILE BARU
        const fileExt = selectedFile.name.split(".").pop()
        const baseName = selectedFile.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9-_]/g, "_")

        const scrambledName = `${baseName}-${userId}.${fileExt}`
        const filePath = `Profile/${scrambledName}`

        // upload file baru tanpa upsert
        const { error: uploadError } = await supabase.storage
            .from("Image")
            .upload(filePath, selectedFile)

        if (uploadError) {
            console.error("UPLOAD ERROR:", uploadError)
            alert("Gagal upload foto profil")
            return null
        }

        const { data: urlData } = supabase.storage
            .from("Image")
            .getPublicUrl(filePath)

        return urlData.publicUrl
    }

    // === SAVE CHANGES ===
    async function handleSave() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return alert("Belum login")

        let finalProfilePic = currentProfilePic

        if (selectedFile) {
            const uploadedUrl = await uploadProfilePic(user.id)
            if (uploadedUrl) finalProfilePic = uploadedUrl
        }

        const { error } = await supabase
            .from("user_profiles")
            .update({
                username: username,
                profile_pic: finalProfilePic
            })
            .eq("id", user.id)

        if (error) {
            console.log(error)
            alert("Gagal update profil")
            return
        }

        alert("Perubahan disimpan")
        navigate("/profile", { state: { refresh: true } })
    }

    return (
        <div className="editProfilePage">
            <div className="editProfileContainer">
                <h1>Edit Profil</h1>

                <div className="imageSection">
                    <img
                        src={preview || currentProfilePic || "/addImage.svg"}
                        alt="Preview"
                        className="profilePreview"
                    />

                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: "none" }}
                    />

                    <button
                        className="chooseBtn"
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        Pilih Foto
                    </button>
                </div>

                <div className="formSection">
                    <input
                        type="text"
                        placeholder="Username Baru"
                        className="inputBox"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <div className="buttonContainer">
                        <button className="cancelBtn" onClick={() => navigate("/profile")}>
                            Batal
                        </button>
                        <button className="saveBtn" onClick={handleSave}>
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

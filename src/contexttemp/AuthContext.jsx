import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session saat start
  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    }

    loadSession();

    // Listen perubahan login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginStatus = !!user;

  // =========================
  //  FUNGSI LOGOUT RESMI
  // =========================
  const logout = async () => {
    await supabase.auth.signOut(); // logout supabase
    setUser(null); // clear FE
  };

  return (
    <AuthContext.Provider value={{ user, loginStatus, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

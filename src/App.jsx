import { useState, useEffect } from "react";
import { supabase, run } from "./lib/supabase.js";
import { SESSION_KEY } from "./lib/utils.js";
import { Layout } from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import Petugas from "./pages/Petugas.jsx";
import Warga from "./pages/Warga.jsx";

const pages = { admin: Admin, petugas: Petugas, warga: Warga };

export default function App() {
  // Sesi login disimpan di localStorage -> buka ulang langsung masuk, tanpa query
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY)));
  const [db, setDb] = useState({ users: [], quests: [], reports: [], rewards: [] });

  // ambil ulang semua data dari Supabase (dipanggil setelah setiap perubahan)
  const reload = async () => {
    const [users, quests, reports, rewards] = await Promise.all([
      run(supabase.from("users").select("id,name,username,role,xp")), // tanpa password
      run(supabase.from("quests").select("*").order("title")),
      run(supabase.from("reports").select("*").order("date", { ascending: false })),
      run(supabase.from("rewards").select("*").order("cost")),
    ]);
    setDb({ users, quests, reports, rewards });
  };

  useEffect(() => {
    if (session) reload();
  }, [session]);

  const login = async (username, password) => {
    const { data } = await supabase
      .from("users")
      .select("id,name,username,role,xp")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();
    if (!data) return false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (!session) return <Login onLogin={login} />;

  // data user terbaru dari db (XP berubah), fallback ke sesi tersimpan
  const user = db.users.find((u) => u.id === session.id) ?? session;
  const Page = pages[user.role];

  return (
    <Layout user={user} onLogout={logout}>
      <Page db={db} user={user} reload={reload} />
    </Layout>
  );
}

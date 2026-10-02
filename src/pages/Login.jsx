import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onLogin(username.trim(), password);
    if (!ok) setError("Username atau kata sandi salah.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">🏡 DesaQuest</h1>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <input className="input" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Kata sandi" value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full">Masuk</button>
        <p className="text-xs text-slate-400 mt-4">
          Demo: admin/admin123 · rudi/petugas123 · budi/warga123
        </p>
      </form>
    </div>
  );
}

import { useState } from "react";
import { Tabs } from "../components/Layout.jsx";
import { supabase, run } from "../lib/supabase.js";

export default function Admin({ db, reload }) {
  const [tab, setTab] = useState("ringkasan");
  const [form, setForm] = useState({ name: "", cost: "", stock: "" });

  const warga = db.users.filter((u) => u.role === "warga");
  const stats = [
    ["Quest", db.quests.length],
    ["Warga", warga.length],
    ["Laporan", db.reports.length],
    ["Menunggu", db.reports.filter((r) => r.status === "pending").length],
  ];

  const addReward = async () => {
    if (!form.name || !form.cost) return;
    await run(
      supabase.from("rewards").insert({
        name: form.name,
        cost: Number(form.cost),
        stock: Number(form.stock) || 0,
      })
    );
    setForm({ name: "", cost: "", stock: "" });
    reload();
  };

  const deleteReward = async (id) => {
    await run(supabase.from("rewards").delete().eq("id", id));
    reload();
  };

  return (
    <>
      <Tabs tabs={[["ringkasan", "Ringkasan"], ["reward", "Kelola Reward"]]} active={tab} onChange={setTab} />

      {tab === "ringkasan" && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {stats.map(([label, value]) => (
              <div key={label} className="card text-center mb-0">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Peringkat Warga</h3>
            {[...warga].sort((a, b) => b.xp - a.xp).map((u, i) => (
              <div key={u.id} className="td flex justify-between">
                <span>{i + 1}. {u.name}</span>
                <b>{u.xp} XP</b>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "reward" && (
        <>
          <div className="card">
            <h3 className="font-bold mb-3">Tambah Reward</h3>
            <input className="input" placeholder="Nama reward" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" type="number" placeholder="Biaya XP" value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              <input className="input" type="number" placeholder="Stok" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <button className="btn" onClick={addReward}>Simpan</button>
          </div>
          <div className="card">
            {db.rewards.map((r) => (
              <div key={r.id} className="td flex justify-between items-center">
                <span>{r.name} · {r.cost} XP · stok {r.stock}</span>
                <button className="btn-red" onClick={() => deleteReward(r.id)}>Hapus</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

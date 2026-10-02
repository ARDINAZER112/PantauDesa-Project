import { useState } from "react";
import { Tabs } from "../components/Layout.jsx";
import { supabase, run } from "../lib/supabase.js";

const emptyForm = { title: "", description: "", lat: "", lng: "", radius: 100, xp: 100 };

export default function Petugas({ db, reload }) {
  const [tab, setTab] = useState("quest");
  const [form, setForm] = useState(emptyForm);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const addQuest = async () => {
    if (!form.title || !form.lat || !form.lng) return alert("Judul & koordinat wajib diisi");
    await run(
      supabase.from("quests").insert({
        title: form.title,
        description: form.description,
        lat: Number(form.lat),
        lng: Number(form.lng),
        radius: Number(form.radius),
        xp: Number(form.xp),
      })
    );
    setForm(emptyForm);
    reload();
  };

  // laporan ikut terhapus otomatis (on delete cascade)
  const deleteQuest = async (id) => {
    if (!confirm("Hapus quest beserta laporannya?")) return;
    await run(supabase.from("quests").delete().eq("id", id));
    reload();
  };

  const verify = async (report, approve) => {
    await run(
      supabase.from("reports").update({ status: approve ? "approved" : "rejected" }).eq("id", report.id)
    );
    if (approve) {
      const quest = db.quests.find((q) => q.id === report.quest_id);
      const warga = db.users.find((u) => u.id === report.user_id);
      await run(supabase.from("users").update({ xp: warga.xp + quest.xp }).eq("id", warga.id));
    }
    reload();
  };

  const pending = db.reports.filter((r) => r.status === "pending");

  return (
    <>
      <Tabs
        tabs={[["quest", "Quest"], ["verifikasi", `Verifikasi (${pending.length})`]]}
        active={tab}
        onChange={setTab}
      />

      {tab === "quest" && (
        <>
          <div className="card">
            <h3 className="font-bold mb-3">Buat Quest Baru</h3>
            <input className="input" placeholder="Judul" value={form.title}
              onChange={(e) => set("title", e.target.value)} />
            <textarea className="input" placeholder="Deskripsi" value={form.description}
              onChange={(e) => set("description", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Latitude" value={form.lat}
                onChange={(e) => set("lat", e.target.value)} />
              <input className="input" placeholder="Longitude" value={form.lng}
                onChange={(e) => set("lng", e.target.value)} />
              <input className="input" type="number" placeholder="Radius (m)" value={form.radius}
                onChange={(e) => set("radius", e.target.value)} />
              <input className="input" type="number" placeholder="XP" value={form.xp}
                onChange={(e) => set("xp", e.target.value)} />
            </div>
            <button className="btn" onClick={addQuest}>Simpan Quest</button>
          </div>

          <div className="card">
            <h3 className="font-bold mb-2">Daftar Quest</h3>
            <table className="w-full">
              <thead>
                <tr><th className="th">Judul</th><th className="th">Radius</th><th className="th">XP</th><th className="th"></th></tr>
              </thead>
              <tbody>
                {db.quests.map((q) => (
                  <tr key={q.id}>
                    <td className="td">{q.title}</td>
                    <td className="td">{q.radius} m</td>
                    <td className="td">{q.xp}</td>
                    <td className="td">
                      <button className="btn-red" onClick={() => deleteQuest(q.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "verifikasi" && (
        <div className="card">
          <h3 className="font-bold mb-2">Laporan Menunggu</h3>
          {pending.length === 0 && <p className="text-sm text-slate-400">Tidak ada laporan.</p>}
          {pending.map((r) => {
            const quest = db.quests.find((q) => q.id === r.quest_id);
            const warga = db.users.find((u) => u.id === r.user_id);
            return (
              <div key={r.id} className="flex gap-3 py-3 border-t border-slate-100">
                <img src={r.photo} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 text-sm">
                  <b>{warga?.name}</b> → {quest?.title}
                  <div className="text-slate-400">{r.date} · {r.distance} m dari lokasi</div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn" onClick={() => verify(r, true)}>Setujui (+{quest?.xp} XP)</button>
                    <button className="btn-red" onClick={() => verify(r, false)}>Tolak</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

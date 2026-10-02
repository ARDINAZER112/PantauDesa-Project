import { useState } from "react";
import { Tabs } from "../components/Layout.jsx";
import { supabase, run } from "../lib/supabase.js";
import { haversine, today } from "../lib/utils.js";

// Perkecil foto jadi base64 agar muat di localStorage
function compress(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 480 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Warga({ db, user, reload }) {
  const [tab, setTab] = useState("misi");
  const [quest, setQuest] = useState(null); // quest yang sedang dilaporkan
  const [photo, setPhoto] = useState(null);
  const [distance, setDistance] = useState(null);

  const reportedToday = (questId) =>
    db.reports.some((r) => r.quest_id === questId && r.user_id === user.id && r.date === today());

  const openQuest = (q) => {
    setQuest(q);
    setPhoto(null);
    setDistance(null);
  };

  const checkGPS = () =>
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setDistance(
          Math.round(haversine(pos.coords.latitude, pos.coords.longitude, quest.lat, quest.lng))
        ),
      () => alert("GPS gagal / ditolak")
    );

  const submit = async () => {
    await run(
      supabase.from("reports").insert({
        quest_id: quest.id,
        user_id: user.id,
        photo,
        date: today(),
        distance,
      })
    );
    setQuest(null);
    reload();
    alert("Laporan terkirim, menunggu verifikasi petugas.");
  };

  const redeem = async (reward) => {
    if (user.xp < reward.cost) return alert("XP belum cukup");
    await run(supabase.from("users").update({ xp: user.xp - reward.cost }).eq("id", user.id));
    await run(supabase.from("rewards").update({ stock: reward.stock - 1 }).eq("id", reward.id));
    reload();
  };

  const valid = distance !== null && distance <= quest?.radius;
  const myReports = db.reports.filter((r) => r.user_id === user.id);

  return (
    <>
      <Tabs tabs={[["misi", "Misi"], ["reward", "Reward"]]} active={tab} onChange={setTab} />

      {tab === "misi" && !quest && (
        <>
          {db.quests.map((q) => (
            <div key={q.id} className="card flex items-center justify-between">
              <div>
                <b>{q.title}</b>
                <div className="text-sm text-slate-400">
                  {q.description} · radius {q.radius} m · +{q.xp} XP
                </div>
              </div>
              {reportedToday(q.id) ? (
                <span className="text-sm text-green-700">✅ Sudah lapor</span>
              ) : (
                <button className="btn" onClick={() => openQuest(q)}>Lapor</button>
              )}
            </div>
          ))}

          <div className="card">
            <h3 className="font-bold mb-2">Riwayat Laporanku</h3>
            {myReports.length === 0 && <p className="text-sm text-slate-400">Belum ada laporan.</p>}
            {myReports.map((r) => (
              <div key={r.id} className="td flex justify-between">
                <span>{db.quests.find((q) => q.id === r.quest_id)?.title} · {r.date}</span>
                <span>{r.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "misi" && quest && (
        <div className="card">
          <button className="text-sm text-green-700 mb-3" onClick={() => setQuest(null)}>← Kembali</button>
          <h3 className="font-bold mb-3">{quest.title}</h3>

          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={async (e) => e.target.files[0] && setPhoto(await compress(e.target.files[0]))}
          />
          {photo && <img src={photo} className="max-h-40 rounded-lg mb-3" />}

          <div className="flex gap-2 mb-3">
            <button className="btn-outline" onClick={checkGPS}>📍 Cek Lokasi</button>
            <button className="btn-outline" onClick={() => setDistance(10)}>(Dev) Simulasi di lokasi</button>
          </div>
          {distance !== null && (
            <p className={`text-sm mb-3 ${valid ? "text-green-700" : "text-red-600"}`}>
              Jarak {distance} m — {valid ? "dalam radius ✅" : `di luar radius (${quest.radius} m) ❌`}
            </p>
          )}

          <button className="btn" disabled={!photo || !valid} onClick={submit}>Kirim Laporan</button>
        </div>
      )}

      {tab === "reward" &&
        db.rewards.map((r) => (
          <div key={r.id} className="card flex items-center justify-between">
            <div>
              <b>{r.name}</b>
              <div className="text-sm text-slate-400">{r.cost} XP · stok {r.stock}</div>
            </div>
            <button className="btn" disabled={r.stock <= 0 || user.xp < r.cost} onClick={() => redeem(r)}>
              Tukar
            </button>
          </div>
        ))}
    </>
  );
}

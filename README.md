# DesaQuest Simple + Supabase — latihan live coding

React + Vite + Tailwind + Supabase (database). Login: cek tabel `users`, lalu sesi disimpan di localStorage.

## Setup
1. Buat project di supabase.com → **SQL Editor** → tempel & jalankan `schema.sql`
2. `cp .env.example .env` lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (Project Settings → API)
3. `npm install && npm run dev`

Akun demo: `admin/admin123` · `rudi/petugas123` · `budi/warga123`

## Alur data
- `App.jsx` → `reload()` mengambil 4 tabel sekaligus → state `db` → dikirim ke halaman sesuai role
- Setiap aksi: `await run(supabase.from("tabel").insert/update/delete(...))` lalu `reload()`
- `run()` (lib/supabase.js) = bungkus query: error → alert, sukses → kembalikan data

## Pola kunci yang perlu dihafal
```js
await run(supabase.from("quests").insert({ title, lat, lng }));
await run(supabase.from("users").update({ xp: xp + 100 }).eq("id", id));
await run(supabase.from("quests").delete().eq("id", id));
const { data } = await supabase.from("users").select("*").eq("username", u).eq("password", p).maybeSingle();
```

## Catatan
- Password polos & RLS nonaktif = hanya untuk latihan, jangan dipakai produksi.
- Tambah XP memakai baca-lalu-tulis (bisa race condition); produksi sebaiknya pakai fungsi RPC.

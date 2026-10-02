-- Jalankan di Supabase > SQL Editor.
-- Catatan: tabel buatan SQL Editor default-nya RLS nonaktif -> anon key bisa baca/tulis.
-- Ini hanya untuk latihan. Password disimpan polos (sengaja, biar sederhana).

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text unique not null,
  password text not null,
  role text not null check (role in ('admin','petugas','warga')),
  xp int not null default 0
);

create table quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  radius int not null default 100,
  xp int not null default 100
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references quests(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  photo text,                       -- base64
  date date not null default current_date,
  distance int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);

create table rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost int not null,
  stock int not null default 0
);

-- seed
insert into users (name, username, password, role, xp) values
  ('Admin Desa',    'admin', 'admin123',   'admin',   0),
  ('Rudi Petugas',  'rudi',  'petugas123', 'petugas', 0),
  ('Budi Santoso',  'budi',  'warga123',   'warga',   300),
  ('Siti Aminah',   'siti',  'warga123',   'warga',   100);

insert into quests (title, description, lat, lng, radius, xp) values
  ('Pembangunan Jalan RT 03', 'Foto kondisi jalan terkini.', -6.8974, 112.0649, 100, 100),
  ('Renovasi Balai Desa',     'Foto progres renovasi.',      -6.8944, 112.0629,  80,  80);

insert into rewards (name, cost, stock) values
  ('Minyak Goreng 1L', 200, 10),
  ('Beras 5 Kg',       500,  5);

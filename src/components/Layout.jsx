export function Layout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen">
      <header className="bg-green-700 text-white px-5 py-3 flex items-center justify-between">
        <b>🏡 DesaQuest</b>
        <div className="text-sm flex items-center gap-3">
          <span>
            {user.name} ({user.role}){user.role === "warga" && ` · ${user.xp} XP`}
          </span>
          <button className="underline" onClick={onLogout}>Keluar</button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-5">{children}</main>
    </div>
  );
}

// tabs: [["key", "Label"], ...]
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={active === key ? "btn" : "btn-outline"}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

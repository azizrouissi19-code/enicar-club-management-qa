import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const statusConfig = {
  APPROVED: { label: "Approuvé", class: "bg-[#0a1a0f] text-[#60a870] border border-[#1a4a28]" },
  PENDING:  { label: "En attente", class: "bg-[#1a1400] text-[#c8a030] border border-[#4a3800]" },
  DRAFT:    { label: "Brouillon", class: "bg-[#161924] text-[#5a6080] border border-[#1e2540]" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  // ANO-08 : statistiques calculées à partir des données réelles de l'API (plus de données fictives)
  const [data, setData] = useState({ clubs: [], events: [], rooms: [] });

  useEffect(() => {
    Promise.all([api.get("/clubs"), api.get("/events"), api.get("/rooms")])
      .then(([clubs, events, rooms]) => setData({ clubs: clubs.data, events: events.data, rooms: rooms.data }))
      .catch((error) => console.error("Failed to load dashboard", error));
  }, []);

  const { clubs, events, rooms } = data;
  const pending = events.filter((e) => e.status === "PENDING").length;
  const members = new Set(clubs.flatMap((c) => c.members ?? [])).size;
  const capacity = rooms.reduce((sum, r) => sum + (r.capacity ?? 0), 0);
  const recentEvents = [...events].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);

  const stats = [
    { value: clubs.length, label: "Clubs actifs", change: `${members} membres au total` },
    { value: events.length, label: "Événements", change: `${pending} en attente` },
    { value: rooms.length, label: "Salles", change: `${capacity} places au total` },
    { value: members, label: "Membres", change: "inscrits dans un club" },
  ];

  return (
    <Layout title="Dashboard" subtitle={`Bienvenue, ${user?.fullName}`}>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#161924] border border-[#1e2540] rounded-xl p-4">
            <div className="text-white text-2xl font-black" style={{ fontFamily: "Syne, sans-serif" }}>{s.value}</div>
            <div className="text-[#5a6080] text-xs mt-1">{s.label}</div>
            <div className="text-[#4f7fff] text-xs mt-1">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Événements récents */}
        <div className="bg-[#161924] border border-[#1e2540] rounded-xl p-4">
          <h2 className="text-white text-xs font-bold tracking-widest uppercase mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
            Événements récents
          </h2>
          <div className="flex flex-col gap-0">
            {recentEvents.length === 0 && <div className="text-[#5a6080] text-xs py-2">Aucun événement</div>}
            {recentEvents.map((event) => {
              const s = statusConfig[event.status] || statusConfig.DRAFT;
              return (
                <div key={event.id} className="flex items-center gap-3 py-2.5 border-b border-[#1e2130] last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.status === "APPROVED" ? "bg-[#60a870]" :
                    event.status === "PENDING" ? "bg-[#c8a030]" : "bg-[#5a6080]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{event.title}</div>
                    <div className="text-[#5a6080] text-[11px]">{event.date} · {event.room}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${s.class}`} style={{ fontFamily: "Syne, sans-serif" }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clubs */}
        <div className="bg-[#161924] border border-[#1e2540] rounded-xl p-4">
          <h2 className="text-white text-xs font-bold tracking-widest uppercase mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
            Clubs actifs
          </h2>
          <div className="flex flex-col gap-0">
            {clubs.map((club) => (
              <div key={club.id} className="flex items-center gap-3 py-2.5 border-b border-[#1e2130] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-[#1a2040] border border-[#2a3060] flex items-center justify-center text-[#4f7fff] text-xs font-bold flex-shrink-0" style={{ fontFamily: "Syne, sans-serif" }}>
                  {club.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{club.name}</div>
                  <div className="text-[#5a6080] text-[11px]">{club.members?.length ?? 0} membres</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
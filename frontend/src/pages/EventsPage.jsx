import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { apiMessage } from "../api/errors";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../context/useAuth";

function NewEventModal({ clubs, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [room, setRoom] = useState("");
  const [attendees, setAttendees] = useState("");
  const [date, setDate] = useState("");
  // ANO-10 : l'événement est rattaché au club du président (plus de clubId: 1 codé en dur)
  const [clubId, setClubId] = useState(clubs[0]?.id ?? "");

  const handleSave = () => {
    if (!title.trim() || !room.trim() || !date.trim() || !clubId) return;
    onSave({
      title,
      room,
      attendees: parseInt(attendees) || 0,
      date,
      status: "PENDING",
      clubId: Number(clubId),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161924] border border-[#1e2540] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-black text-base mb-5" style={{ fontFamily: "Syne, sans-serif" }}>
          Créer un événement
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Salle *</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Participants</label>
            <input type="number" value={attendees} onChange={(e) => setAttendees(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Club *</label>
            <select aria-label="Club" value={clubId} onChange={(e) => setClubId(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors">
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-transparent border border-[#1e2540] rounded-lg py-2.5 text-[#5a6080] text-sm hover:border-[#4f7fff] transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={!title.trim() || !room.trim() || !date.trim() || !clubId} className="flex-1 bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 rounded-lg py-2.5 text-white text-xs font-bold uppercase transition-colors">Créer</button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onDelete, canManage, clubName }) {
  const date = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const statusColors = {
    APPROVED: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    DRAFT: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  return (
    <div className="bg-[#161924] border border-[#1e2540] hover:border-[#4f7fff] rounded-xl p-5 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[event.status] || statusColors.DRAFT}`} style={{ fontFamily: "Syne, sans-serif" }}>
            {event.status}
          </span>
        </div>
        {canManage && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
            className="text-[#2e3455] hover:text-red-400 transition-colors font-bold"
          >
            ✕
          </button>
        )}
      </div>
      
      <h3 className="text-white text-lg font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
        {event.title}
      </h3>
      
      <div className="text-[#5a6080] text-sm mb-4">
        Par <span className="text-[#4f7fff]">{clubName || `Club ${event.clubId}`}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-[#5a6080] border-t border-[#1e2130] pt-4">
        <div className="flex items-center gap-2">
          <span>📅</span> {date}
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span> {event.room}
        </div>
        <div className="flex items-center gap-2">
          <span>👥</span> {event.attendees} participants
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  // ANO-10 : seuls l'administrateur et les présidents gèrent les événements
  const isAdmin = user?.role === "ADMINISTRATOR";
  const canManage = isAdmin || user?.role === "CLUB_PRESIDENT";
  const myClubs = isAdmin ? clubs : clubs.filter((c) => c.presidentId === user?.id);

  useEffect(() => {
    api.get("/events").then((r) => setEvents(r.data)).catch(() => setError("Impossible de charger les événements"));
    // ANO-18 : le bouton de création reste désactivé tant que les clubs ne sont pas chargés
    api.get("/clubs").then((r) => setClubs(r.data)).catch(() => {}).finally(() => setClubsLoaded(true));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter((e) => e.id !== id));
    } catch (e) {
      setError(apiMessage(e, "Suppression impossible"));
    }
  };

  const handleAdd = async (eventData) => {
    setError("");
    try {
      const response = await api.post("/events", eventData);
      setEvents([...events, response.data]);
    } catch (e) {
      setError(apiMessage(e, "Création de l'événement impossible"));
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Événements</h1>
            <p className="text-[#5a6080] text-sm">Gérez et planifiez les événements des clubs</p>
          </div>
          {canManage && (
            <button
              onClick={() => (myClubs.length ? setShowModal(true) : setError("Aucun club associé à votre compte"))}
              disabled={!clubsLoaded}
              className="bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#4f7fff]/20"
            >
              + Nouvel Événement
            </button>
          )}
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDelete}
              canManage={isAdmin || myClubs.some((c) => c.id === event.clubId)}
              clubName={clubs.find((c) => c.id === event.clubId)?.name}
            />
          ))}
        </div>

        {showModal && (
          <NewEventModal
            clubs={myClubs}
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
      </div>
    </Layout>
  );
}

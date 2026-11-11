import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { apiMessage } from "../api/errors";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../context/useAuth";

function NewReservationModal({ clubId, onClose, onSave }) {
  const [resourceType, setResourceType] = useState("ROOM");
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState("");

  const handleSave = () => {
    if (!resourceId.trim() || !date.trim()) return;
    onSave({
      resourceType,
      resourceId: parseInt(resourceId) || 0,
      clubId, // ANO-10 : club de l'utilisateur connecté (plus de valeur codée en dur)
      date,
      status: "PENDING"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161924] border border-[#1e2540] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-black text-base mb-5" style={{ fontFamily: "Syne, sans-serif" }}>Nouvelle Réservation</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Type de ressource *</label>
            <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors">
              <option value="ROOM">Salle</option>
              <option value="EQUIPMENT">Équipement</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">ID de la ressource *</label>
            <input type="number" value={resourceId} onChange={(e) => setResourceId(e.target.value)} placeholder="Ex: 1" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-transparent border border-[#1e2540] rounded-lg py-2.5 text-[#5a6080] text-sm hover:border-[#4f7fff] transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={!resourceId.trim() || !date.trim()} className="flex-1 bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 rounded-lg py-2.5 text-white text-xs font-bold uppercase transition-colors">Réserver</button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRATOR";
  const myClub = clubs.find((c) => c.presidentId === user?.id || c.members?.includes(user?.id));
  const clubName = (id) => clubs.find((c) => c.id === id)?.name ?? (id ? `Club ${id}` : "—");

  useEffect(() => {
    api.get("/reservations").then((r) => setReservations(r.data)).catch(() => setError("Impossible de charger les réservations"));
    api.get("/clubs").then((r) => setClubs(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (reservationData) => {
    setError("");
    try {
      const response = await api.post("/reservations", reservationData);
      setReservations([...reservations, response.data]);
    } catch (e) {
      setError(apiMessage(e, "Réservation impossible"));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/reservations/${id}/status`, { status });
      setReservations(reservations.map(res => res.id === id ? response.data : res));
    } catch (e) {
      setError(apiMessage(e, "Mise à jour du statut impossible"));
    }
  };

  const statusColors = {
    APPROVED: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Réservations</h1>
            <p className="text-[#5a6080] text-sm">Gérez les réservations de salles et équipements</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowModal(true)} className="bg-[#4f7fff] hover:bg-[#3a62e8] text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#4f7fff]/20">
              + Nouvelle Réservation
            </button>
          )}
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <div className="bg-[#161924] border border-[#1e2540] rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a2040] border-b border-[#1e2540]">
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider">ID</th>
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider">Ressource</th>
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider">Club</th>
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider">Statut</th>
                <th className="p-4 text-[#5a6080] text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id} className="border-b border-[#1e2540] hover:bg-[#1a2040] transition-colors">
                  <td className="p-4 text-white text-sm">#{res.id}</td>
                  <td className="p-4">
                    <div className="text-white text-sm font-semibold">{res.resourceType}</div>
                    <div className="text-[#5a6080] text-xs">ID: {res.resourceId}</div>
                  </td>
                  <td className="p-4 text-[#4f7fff] text-sm font-semibold">{clubName(res.clubId)}</td>
                  <td className="p-4 text-[#5a6080] text-sm">{res.date}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[res.status] || statusColors.PENDING}`} style={{ fontFamily: "Syne, sans-serif" }}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {isAdmin && res.status === "PENDING" ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleStatusChange(res.id, "APPROVED")} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30 transition-colors font-bold">Approuver</button>
                        <button onClick={() => handleStatusChange(res.id, "REJECTED")} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors font-bold">Rejeter</button>
                      </div>
                    ) : (
                      <button className="text-[#5a6080] hover:text-white transition-colors">...</button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#5a6080] text-sm">
                    Aucune réservation trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <NewReservationModal
            clubId={myClub?.id ?? null}
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
      </div>
    </Layout>
  );
}

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function NewRoomModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("SALLE");

  const handleSave = () => {
    if (!name.trim() || !capacity.trim()) return;
    onSave({ 
      name, 
      capacity: parseInt(capacity) || 0,
      type
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161924] border border-[#1e2540] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-black text-base mb-5" style={{ fontFamily: "Syne, sans-serif" }}>Ajouter une Salle</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Nom *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Amphi B" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Capacité *</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Ex: 50" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors">
              <option value="SALLE">SALLE</option>
              <option value="AMPHI">AMPHI</option>
              <option value="LABO">LABO</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-transparent border border-[#1e2540] rounded-lg py-2.5 text-[#5a6080] text-sm hover:border-[#4f7fff] transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={!name.trim() || !capacity.trim()} className="flex-1 bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 rounded-lg py-2.5 text-white text-xs font-bold uppercase transition-colors">Ajouter</button>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRATOR";

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
  };

  const handleAdd = async (roomData) => {
    try {
      const response = await api.post("/rooms", roomData);
      setRooms([...rooms, response.data]);
    } catch (error) {
      console.error("Failed to create room", error);
    }
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case "AMPHI": return "🎓";
      case "LABO": return "💻";
      case "SALLE": return "🏫";
      default: return "🏢";
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Salles</h1>
            <p className="text-[#5a6080] text-sm">Consultez les espaces disponibles</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="bg-[#4f7fff] hover:bg-[#3a62e8] text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#4f7fff]/20">
              + Nouvelle Salle
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rooms.map((room) => (
            <div key={room.id} className="bg-[#161924] border border-[#1e2540] hover:border-[#4f7fff] rounded-xl p-5 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1a2040] border border-[#2a3060] flex items-center justify-center text-2xl">
                  {getRoomIcon(room.type)}
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                    {room.name}
                  </h3>
                  <span className="text-[10px] font-bold text-[#4f7fff] uppercase tracking-wider">
                    {room.type}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-[#1e2130] pt-4 mt-2">
                <div className="flex items-center justify-between text-sm text-[#5a6080]">
                  <span>Capacité</span>
                  <span className="text-white font-semibold bg-[#1a2040] px-2 py-0.5 rounded">
                    {room.capacity} places
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <NewRoomModal
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
      </div>
    </Layout>
  );
}

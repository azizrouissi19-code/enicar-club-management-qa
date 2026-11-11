import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

function NewEquipmentModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("VISUEL");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, type, status: "AVAILABLE" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161924] border border-[#1e2540] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-black text-base mb-5" style={{ fontFamily: "Syne, sans-serif" }}>Créer un équipement</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Nom *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm focus:border-[#4f7fff] transition-colors">
              <option value="VISUEL">VISUEL</option>
              <option value="AUDIO">AUDIO</option>
              <option value="AUTRE">AUTRE</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 bg-transparent border border-[#1e2540] rounded-lg py-2.5 text-[#5a6080] text-sm hover:border-[#4f7fff] transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={!name.trim()} className="flex-1 bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 rounded-lg py-2.5 text-white text-xs font-bold uppercase transition-colors">Créer</button>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRATOR";

  useEffect(() => {
    api.get("/equipment").then((r) => setEquipment(r.data)).catch((e) => console.error("Failed to fetch equipment", e));
  }, []);

  const handleAdd = async (equipmentData) => {
    try {
      const response = await api.post("/equipment", equipmentData);
      setEquipment([...equipment, response.data]);
    } catch (error) {
      console.error("Failed to create equipment", error);
    }
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case "VISUEL": return "📽️";
      case "AUDIO": return "🎤";
      default: return "📦";
    }
  };

  const statusColors = {
    AVAILABLE: "text-green-400 bg-green-400/10 border-green-400/20",
    IN_USE: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    MAINTENANCE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Équipements</h1>
            <p className="text-[#5a6080] text-sm">Gérez le matériel disponible pour les clubs</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="bg-[#4f7fff] hover:bg-[#3a62e8] text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#4f7fff]/20">
              + Nouvel Équipement
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {equipment.map((item) => (
            <div key={item.id} className="bg-[#161924] border border-[#1e2540] hover:border-[#4f7fff] rounded-xl p-5 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1a2040] border border-[#2a3060] flex items-center justify-center text-2xl">
                  {getEquipmentIcon(item.type)}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[item.status] || statusColors.MAINTENANCE}`} style={{ fontFamily: "Syne, sans-serif" }}>
                  {item.status}
                </span>
              </div>
              
              <div>
                <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  {item.name}
                </h3>
                <span className="text-[10px] font-bold text-[#4f7fff] uppercase tracking-wider">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <NewEquipmentModal
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
      </div>
    </Layout>
  );
}

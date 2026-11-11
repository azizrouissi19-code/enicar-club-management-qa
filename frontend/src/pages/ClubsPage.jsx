import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ClubCard({ club, onDelete, isAdmin }) {
  const presidentName = "President"; // We would fetch this properly in a real app or include it in club DTO
  const initials = club.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#161924] border border-[#1e2540] hover:border-[#4f7fff] rounded-xl p-4 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-[#1a2040] border border-[#2a3060] flex items-center justify-center text-[#4f7fff] text-sm font-black mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
        {initials}
      </div>
      <div className="text-white text-sm font-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        {club.name}
      </div>
      <div className="text-[#5a6080] text-xs mb-4 leading-relaxed">{club.description}</div>
      <div className="flex items-center justify-between border-t border-[#1e2130] pt-3">
        <div className="text-xs text-[#5a6080]">
          <span className="text-[#4f7fff] font-semibold">{club.members?.length || 0}</span> membres
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a2040] text-[#4f7fff] border border-[#2a3060]" style={{ fontFamily: "Syne, sans-serif" }}>
            {presidentName}
          </span>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(club.id); }}
              className="text-[10px] text-[#2e3455] hover:text-red-400 transition-colors font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewClubModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [presidentName, setPresidentName] = useState("");
  const [presidentEmail, setPresidentEmail] = useState("");
  const [presidentPassword, setPresidentPassword] = useState("");

  const handleSave = () => {
    if (!name.trim() || !presidentName.trim() || !presidentEmail.trim() || !presidentPassword.trim()) return;
    onSave({ 
      name, 
      description,
      presidentName,
      presidentEmail,
      presidentPassword
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#161924] border border-[#1e2540] rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-white font-black text-base mb-5" style={{ fontFamily: "Syne, sans-serif" }}>
          Créer un nouveau club
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Nom du club *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Club Robotique"
              className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du club..."
              rows={2}
              className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors resize-none"
            />
          </div>
          <div className="border-t border-[#1e2130] my-1"></div>
          <h3 className="text-white text-sm font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Détails du Président</h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Nom Complet *</label>
            <input type="text" value={presidentName} onChange={(e) => setPresidentName(e.target.value)} placeholder="Ex: Sami Ben Ali" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Email *</label>
            <input type="email" value={presidentEmail} onChange={(e) => setPresidentEmail(e.target.value)} placeholder="Ex: sami@enicar.tn" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#5a6080] text-xs uppercase tracking-wider">Mot de passe *</label>
            <input type="password" value={presidentPassword} onChange={(e) => setPresidentPassword(e.target.value)} placeholder="••••••••" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-[#1e2540] rounded-lg py-2.5 text-[#5a6080] text-sm hover:border-[#4f7fff] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !presidentName.trim() || !presidentEmail.trim() || !presidentPassword.trim()}
            className="flex-1 bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-40 rounded-lg py-2.5 text-white text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMINISTRATOR";

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await api.get("/clubs");
      setClubs(response.data);
    } catch (error) {
      console.error("Failed to fetch clubs", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clubs/${id}`);
      setClubs(clubs.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete club", error);
    }
  };

  const handleAdd = async (clubData) => {
    try {
      const response = await api.post("/clubs", clubData);
      setClubs([...clubs, response.data]);
    } catch (error) {
      console.error("Failed to create club", error);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Clubs</h1>
            <p className="text-[#5a6080] text-sm">Gérez les clubs et leurs membres</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#4f7fff] hover:bg-[#3a62e8] text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#4f7fff]/20"
            >
              + Nouveau Club
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} onDelete={handleDelete} isAdmin={isAdmin} />
          ))}
        </div>

        {showModal && (
          <NewClubModal
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
      </div>
    </Layout>
  );
}
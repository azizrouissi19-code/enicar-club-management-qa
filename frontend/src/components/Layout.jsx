import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/useAuth";

export default function Layout({ children, title, subtitle }) {
  const [showProperties, setShowProperties] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* ANO-11 : sur smartphone, la barre latérale devient un tiroir ouvert par le bouton « menu » */}
      <div className={`${menuOpen ? "fixed inset-0 z-40 flex" : "hidden"} md:static md:flex`}>
        <Sidebar />
        {menuOpen && <div className="flex-1 bg-black/60 md:hidden" onClick={() => setMenuOpen(false)} />}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="px-4 md:px-6 py-4 border-b border-[#1e2130] flex items-center justify-between gap-3 flex-shrink-0 relative z-10">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="md:hidden w-8 h-8 flex-shrink-0 border border-[#1e2540] rounded-lg text-[#5a6080] hover:text-white"
          >
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-black text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
              {title}
            </h1>
            {subtitle && <p className="text-[#5a6080] text-xs mt-0.5">{subtitle}</p>}
          </div>
          
          <div className="relative">
            <div 
              onClick={() => setShowProperties(!showProperties)}
              className="w-8 h-8 bg-[#161924] hover:border-[#4f7fff] transition-colors border border-[#1e2540] rounded-lg flex items-center justify-center relative cursor-pointer"
            >
              <div className="w-3 h-0.5 bg-[#5a6080] rounded" style={{ boxShadow: "0 4px 0 #5a6080, 0 -4px 0 #5a6080" }} />
              <div className="w-1.5 h-1.5 bg-[#4f7fff] rounded-full absolute top-1.5 right-1.5" />
            </div>

            {showProperties && (
              <div className="absolute right-0 mt-2 w-48 bg-[#161924] border border-[#1e2540] rounded-xl shadow-xl overflow-hidden py-1 z-50">
                <div className="px-4 py-2 border-b border-[#1e2540]">
                  <p className="text-white text-sm font-bold truncate">{user?.fullName}</p>
                  <p className="text-[#5a6080] text-[10px] uppercase tracking-wider">{user?.role}</p>
                </div>
                <button onClick={() => { navigate('/profile'); setShowProperties(false); }} className="w-full text-left px-4 py-2 text-sm text-[#5a6080] hover:text-white hover:bg-[#1a2040] transition-colors">
                  Mon Profil
                </button>
                <button onClick={() => { navigate('/settings'); setShowProperties(false); }} className="w-full text-left px-4 py-2 text-sm text-[#5a6080] hover:text-white hover:bg-[#1a2040] transition-colors">
                  Paramètres
                </button>
                <button onClick={() => { navigate('/notifications'); setShowProperties(false); }} className="w-full text-left px-4 py-2 text-sm text-[#5a6080] hover:text-[#4f7fff] hover:bg-[#1a2040] transition-colors">
                  Notifications
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
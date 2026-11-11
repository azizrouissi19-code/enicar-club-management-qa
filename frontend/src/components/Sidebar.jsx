import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", section: "Principal" },
  { label: "Clubs", path: "/clubs", section: null, badge: 3 },
  { label: "Événements", path: "/events", section: null, badge: 5 },
  { label: "Salles", path: "/rooms", section: "Ressources" },
  { label: "Équipements", path: "/equipment", section: null },
  { label: "Réservations", path: "/reservations", section: "Admin" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-56 bg-[#0b0e16] border-r border-[#1e2130] flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e2130]">
        <div className="font-black text-white text-sm tracking-wide" style={{ fontFamily: "Syne, sans-serif" }}>
          ENICarthage
        </div>
        <div className="text-[#4f7fff] text-[10px] tracking-widest uppercase mt-1">
          Club Platform
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map((item, i) => (
          <div key={item.path}>
            {item.section && (
              <div className="text-[#2e3455] text-[10px] tracking-widest uppercase px-2 pt-4 pb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                {item.section}
              </div>
            )}
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                  isActive
                    ? "bg-[#1a2040] border border-[#2a3060] text-white"
                    : "text-[#5a6080] hover:bg-[#161924]"
                }`
              }
            >
              <div className="w-4 h-4 rounded-sm bg-[#161924] border border-[#1e2540] flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-[#4f7fff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ fontFamily: "Syne, sans-serif" }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#1e2130]">
        <div className="bg-[#161924] border border-[#1e2540] rounded-lg p-2.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a2040] border border-[#4f7fff] flex items-center justify-center text-[#4f7fff] text-xs font-bold flex-shrink-0" style={{ fontFamily: "Syne, sans-serif" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user?.fullName}</div>
            <div className="text-[#4f7fff] text-[10px]">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-[#2e3455] hover:text-red-400 text-xs transition-colors">
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
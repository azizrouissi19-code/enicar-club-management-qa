import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <Layout title="Mon Profil" subtitle="Gérez vos informations personnelles">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-[#161924] border border-[#1e2540] rounded-xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-[#1a2040] border-2 border-[#4f7fff] flex items-center justify-center text-[#4f7fff] text-4xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
              {user?.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>{user?.fullName}</h2>
              <p className="text-[#4f7fff] text-sm uppercase tracking-wider font-semibold mt-1">{user?.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#5a6080] text-xs uppercase tracking-wider">Email</label>
              <input type="text" readOnly value={user?.email || ""} className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-4 py-3 text-white text-sm opacity-70 cursor-not-allowed" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#5a6080] text-xs uppercase tracking-wider">Département</label>
              <input type="text" readOnly value="Génie Informatique" className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-4 py-3 text-white text-sm opacity-70 cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

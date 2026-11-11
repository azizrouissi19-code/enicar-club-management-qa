import Layout from "../components/Layout";

export default function SettingsPage() {
  return (
    <Layout title="Paramètres" subtitle="Configuration de votre compte">
      <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
        <div className="bg-[#161924] border border-[#1e2540] rounded-xl p-6">
          <h3 className="text-white font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Préférences d'interface</h3>
          <div className="flex items-center justify-between py-3 border-b border-[#1e2130]">
            <div>
              <div className="text-sm text-white">Mode Sombre</div>
              <div className="text-xs text-[#5a6080]">Activer ou désactiver le thème sombre</div>
            </div>
            <div className="w-10 h-5 bg-[#4f7fff] rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm text-white">Langue</div>
              <div className="text-xs text-[#5a6080]">Choisissez la langue de l'interface</div>
            </div>
            <select className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-3 py-1.5 text-white text-sm">
              <option>Français</option>
              <option>English</option>
            </select>
          </div>
        </div>

        <div className="bg-[#161924] border border-[#1e2540] rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 text-red-400" style={{ fontFamily: "Syne, sans-serif" }}>Zone Dangereuse</h3>
          <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm transition-colors font-bold">
            Désactiver mon compte
          </button>
        </div>
      </div>
    </Layout>
  );
}

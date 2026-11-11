import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[#4f7fff] text-xs font-bold tracking-widest uppercase mb-2">ENICarthage</p>
          <h1 className="text-3xl font-black text-white">Connexion</h1>
          <p className="text-[#5a6080] text-sm mt-1">Accède à ta plateforme clubs</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161924] border border-[#1e2540] rounded-2xl p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-[#1a0f0f] border border-[#4a1818] rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#5a6080] uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@enicar.tn"
              required
              className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-4 py-3 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#5a6080] uppercase tracking-wider">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="bg-[#0f1117] border border-[#1e2540] rounded-lg px-4 py-3 text-white text-sm placeholder-[#2e3455] focus:outline-none focus:border-[#4f7fff] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#4f7fff] hover:bg-[#3a62e8] disabled:opacity-50 text-white font-bold text-sm tracking-widest uppercase rounded-lg py-3 transition-colors mt-2"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="text-center text-sm text-[#5a6080]">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-[#4f7fff] hover:underline font-medium">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
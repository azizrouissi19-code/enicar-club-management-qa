// ANO-06 : les erreurs de l'API sont affichées à l'utilisateur (au lieu d'un simple console.error)
export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-6 flex items-start justify-between gap-4 bg-[#1a0f0f] border border-[#4a1818] rounded-lg px-4 py-3 text-sm text-red-400">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Fermer le message" className="text-red-400/70 hover:text-red-300">
          ×
        </button>
      )}
    </div>
  );
}

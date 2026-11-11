import Layout from "../components/Layout";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, title: "Nouvelle réservation", message: "Une demande de salle a été soumise par Club Robotique.", time: "Il y a 2h", unread: true },
    { id: 2, title: "Mise à jour système", message: "La plateforme sera en maintenance ce soir à 23h00.", time: "Hier", unread: false },
    { id: 3, title: "Événement approuvé", message: "Votre événement 'Hackathon 2026' a été approuvé par l'administration.", time: "Il y a 2 jours", unread: false }
  ];

  return (
    <Layout title="Notifications" subtitle="Restez à jour sur vos activités">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div key={notif.id} className={`bg-[#161924] border ${notif.unread ? 'border-[#4f7fff]' : 'border-[#1e2540]'} rounded-xl p-5 flex gap-4 transition-colors`}>
              <div className="w-2 h-2 mt-1.5 rounded-full bg-[#4f7fff] flex-shrink-0" style={{ opacity: notif.unread ? 1 : 0 }} />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white text-sm font-bold">{notif.title}</h4>
                  <span className="text-[#5a6080] text-xs">{notif.time}</span>
                </div>
                <p className="text-[#5a6080] text-sm">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

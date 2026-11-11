export const mockUsers = [
  {
    id: 1,
    fullName: "Ahmed Ben Ali",
    email: "ahmed@enicar.tn",
    password: "123456",
    role: "CLUB_PRESIDENT",
  },
  {
    id: 2,
    fullName: "Sarra Mansour",
    email: "sarra@enicar.tn",
    password: "123456",
    role: "CLUB_MEMBER",
  },
  {
    id: 3,
    fullName: "Admin ENICarthage",
    email: "admin@enicar.tn",
    password: "admin123",
    role: "ADMINISTRATOR",
  },
];

export const mockClubs = [
  { id: 1, name: "Club IEEE", description: "Électronique & informatique", presidentId: 1, members: [1, 2] },
  { id: 2, name: "Club Microsoft", description: "Développement & cloud", presidentId: 2, members: [2] },
  { id: 3, name: "Junior Entreprise", description: "Entrepreneuriat étudiant", presidentId: 1, members: [1] },
];

export const mockEvents = [
  { id: 1, title: "Hackathon IEEE 2025", clubId: 1, date: "2025-05-10", status: "APPROVED", room: "Amphi A", attendees: 80 },
  { id: 2, title: "Workshop Azure", clubId: 2, date: "2025-05-18", status: "PENDING", room: "Salle 3", attendees: 30 },
  { id: 3, title: "Pitch Day JE", clubId: 3, date: "2025-06-01", status: "DRAFT", room: "Amphi B", attendees: 50 },
];

export const mockRooms = [
  { id: 1, name: "Amphi A", capacity: 200, type: "AMPHI" },
  { id: 2, name: "Amphi B", capacity: 150, type: "AMPHI" },
  { id: 3, name: "Salle 3", capacity: 40, type: "SALLE" },
  { id: 4, name: "Labo Info", capacity: 25, type: "LABO" },
];
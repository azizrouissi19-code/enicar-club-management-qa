import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClubsPage from "./pages/ClubsPage";
import EventsPage from "./pages/EventsPage";
import RoomsPage from "./pages/RoomsPage";
import EquipmentPage from "./pages/EquipmentPage";
import ReservationsPage from "./pages/ReservationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/clubs" element={
            <ProtectedRoute><ClubsPage /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><EventsPage /></ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute><RoomsPage /></ProtectedRoute>
          } />
          <Route path="/equipment" element={
            <ProtectedRoute><EquipmentPage /></ProtectedRoute>
          } />
          <Route path="/reservations" element={
            <ProtectedRoute><ReservationsPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><NotificationsPage /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
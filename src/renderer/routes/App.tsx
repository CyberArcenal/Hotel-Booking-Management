// src/routes/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import PageNotFound from "../components/Shared/PageNotFound";
import Layout from "../layouts/Layout";
import Dashboard from "../pages/dashboard";
import BookingPage from "../pages/Booking/BookingTable";
import GuestPage from "../pages/Guest";
import OccupancyPage from "../pages/Analytics/Occupancy";
import FinancialPage from "../pages/Analytics/Financial";
import ExportPage from "../pages/Analytics/Export";
import AuditPage from "../pages/Audit";
import SettingsPage from "../pages/Settings";
import RoomPage from "../pages/Room/RoomTable";
import NotificationLogPage from "../pages/NotificationLog";
import updaterAPI from "../api/updater";

function App() {
  // Optional: trigger update check when app mounts
  useEffect(() => {
    updaterAPI.checkForUpdates().catch(console.error);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<RoomPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="guests" element={<GuestPage />} />
        <Route path="reports/occupancy" element={<OccupancyPage />} />
        <Route path="reports/financial" element={<FinancialPage />} />
        <Route path="reports/export" element={<ExportPage />} />
        <Route path="settings/audit" element={<AuditPage />} />
        <Route path="/settings/notifications" element={<NotificationLogPage />} />
        <Route path="settings/preferences" element={<SettingsPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
import { Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "../components/Shared/PageNotFound";
import { useEffect, useState } from "react";
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

// 🔹 Placeholder components para hindi mag red mark
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: "2rem" }}>
    <h1>{title}</h1>
    <p>Placeholder page for {title}</p>
  </div>
);

function App() {
  return (
    <Routes>
      <>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Rooms */}
          <Route path="rooms" element={<RoomPage />} />

          {/* Bookings */}
          <Route path="bookings" element={<BookingPage />} />

          {/* Guests */}
          <Route path="guests" element={<GuestPage />} />

          {/* Reports */}
          <Route path="reports/occupancy" element={<OccupancyPage />} />
          <Route path="reports/financial" element={<FinancialPage />} />
          <Route path="reports/export" element={<ExportPage />} />

          {/* Settings */}
          <Route path="settings/audit" element={<AuditPage />} />
          <Route path="settings/preferences" element={<SettingsPage />} />

          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </>
    </Routes>
  );
}

export default App;

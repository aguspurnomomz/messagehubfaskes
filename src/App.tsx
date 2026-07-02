import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { LoginPage } from "@/pages/LoginPage";
import { BroadcastPage } from "@/pages/BroadcastPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { ScheduleBroadcastPage } from "@/pages/ScheduleBroadcastPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/schedule" element={<ScheduleBroadcastPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



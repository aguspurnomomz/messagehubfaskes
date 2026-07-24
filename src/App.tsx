import { useEffect } from "react"; // <-- TAMBAHKAN INI
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"; // <-- TAMBAHKAN useLocation
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { LoginPage } from "@/pages/LoginPage";
import { BroadcastPage } from "@/pages/BroadcastPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { ScheduleBroadcastPage } from "@/pages/ScheduleBroadcastPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LandingPage } from "@/pages/LandingPage";
import { TermsPage } from "@/pages/TermsPage";
import { InboxPage } from "@/pages/InboxPage";

// ========================================================
// KOMPONEN PEMBANTU: Mengembalikan Posisi Scroll ke Atas
// ========================================================
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Selipkan komponen ini agar posisi scroll reset setiap pindah halaman */}
      <ScrollToTop /> 
      
      <Routes>
        {/* ========================================================
            1. HALAMAN PUBLIK (Bisa diakses tanpa login)
           ======================================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* ========================================================
            2. HALAMAN PROTEKSI (Harus lewat AuthGuard / Login)
           ======================================================== */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/inbox" element={<InboxPage />} /> 
            <Route path="/schedule" element={<ScheduleBroadcastPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ========================================================
            3. FALLBACK RUTE GLOBAL
           ======================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
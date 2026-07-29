import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { SuperAdminRoute } from "@/components/SuperAdminRoute"; 
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
import { DocumentManagerPage } from "@/pages/DocumentManagerPage";
import { TermsPageDash } from "@/pages/TermsPageDash";
import { DocsPage } from "@/pages/DocsPage";
import { SuperAdminPage } from "@/pages/SuperAdminPage";

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
      <ScrollToTop /> 
      
      <Routes>
        {/* ========================================================
            1. HALAMAN PUBLIK
           ======================================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* ========================================================
            2. HALAMAN KLINIK (Hanya untuk Admin/Staff Klinik)
           ======================================================== */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/inbox" element={<InboxPage />} /> 
            <Route path="/schedule" element={<ScheduleBroadcastPage />} />
            <Route path="/document" element={<DocumentManagerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/termsinfo" element={<TermsPageDash />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>
        </Route>

        {/* ========================================================
            3. HALAMAN SUPERADMIN (Eksklusif Superadmin Saja)
           ======================================================== */}
        <Route element={<AuthGuard />}>
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<SuperAdminPage />} />
          </Route>
        </Route>

        {/* ========================================================
            4. FALLBACK RUTE GLOBAL
           ======================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
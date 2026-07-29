import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom"; // Tambahkan Navigate
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { AppFooter } from "@/components/layout/AppFooter"; 
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react"; // Tambahkan Loader2

interface UserData {
  name: string;
  email: string;
  role: string;
}

interface ClinicInfo {
  name: string;
  logo: string | null;
}

export function MainLayout() {
  const [user, setUser] = useState<UserData>({
    name: "Loading...",
    email: "",
    role: "Medical Staff",
  });
  
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    name: "Memuat data klinik...",
    logo: null,
  });

  const [isCheckingRole, setIsCheckingRole] = useState(true); // State pengecekan role
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);   // Flag superadmin
  
  const [, setIsLoadingClinic] = useState(true);

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        // Ambil role langsung dari tabel profiles agar valid
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", supabaseUser.id)
          .maybeSingle();

        const role = profile?.role || supabaseUser.user_metadata?.role || "Medical Staff";

        if (role === "superadmin") {
          setIsSuperAdmin(true);
        }

        setUser({
          name: profile?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || "User",
          email: supabaseUser.email || "",
          role: role,
        });
      }
      setIsCheckingRole(false);
    };

    getUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .maybeSingle();

          const role = profile?.role || session.user.user_metadata?.role || "Medical Staff";

          if (role === "superadmin") {
            setIsSuperAdmin(true);
          }

          setUser({
            name: profile?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            email: session.user.email || "",
            role: role,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClinicSettings = async () => {
      setIsLoadingClinic(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          setIsLoadingClinic(false);
          return;
        }

        const { data } = await supabase
          .from('clinic_settings')
          .select('clinic_name, clinic_logo')
          .eq('user_id', userId)
          .maybeSingle(); 

        if (data) {
          setClinicInfo({
            name: data.clinic_name || "Klinik Saya",
            logo: data.clinic_logo || null,
          });
        }
      } catch (error) {
        console.error("Error in fetchClinicSettings:", error);
      } finally {
        setIsLoadingClinic(false);
      }
    };

    fetchClinicSettings();
  }, []);

  // Tampilkan loading sebentar saat mendeteksi role
  if (isCheckingRole) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // JIKA AKUN YANG LOGIN ADALAH SUPERADMIN, TOLAK DAN LEMPAR KE /superadmin
  if (isSuperAdmin) {
    return <Navigate to="/superadmin" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MobileSidebar />
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0">
        <AppHeader
          clinicName={clinicInfo.name}
          userName={user.name}
          userRole={user.role}
          userEmail={user.email}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <AppFooter clinicName={clinicInfo.name} />
      </div>
    </div>
  );
}
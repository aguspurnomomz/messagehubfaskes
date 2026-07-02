import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { AppFooter } from "@/components/layout/AppFooter"; // Tambahkan import
import { supabase } from "@/lib/supabaseClient";

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
  
  const [, setIsLoadingClinic] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        setUser({
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || "User",
          email: supabaseUser.email || "",
          role: supabaseUser.user_metadata?.role || "Medical Staff",
        });
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || "User",
            email: session.user.email || "",
            role: session.user.user_metadata?.role || "Medical Staff",
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
          console.error("User not authenticated");
          setClinicInfo({
            name: "Klinik Saya",
            logo: null,
          });
          setIsLoadingClinic(false);
          return;
        }

        const { data, error } = await supabase
          .from('clinic_settings')
          .select('clinic_name, clinic_logo')
          .eq('user_id', userId)
          .maybeSingle(); 

        if (error) {
          console.error("Error fetching clinic settings:", error);
          setClinicInfo({
            name: "ambil data...",
            logo: null,
          });
        } else if (data) {
          setClinicInfo({
            name: data.clinic_name || "ambil data...",
            logo: data.clinic_logo || null,
          });
        } else {
          setClinicInfo({
            name: "ambil data...",
            logo: null,
          });
        }
      } catch (error) {
        console.error("Error in fetchClinicSettings:", error);
        setClinicInfo({
          name: "ambil data...",
          logo: null,
        });
      } finally {
        setIsLoadingClinic(false);
      }
    };

    fetchClinicSettings();

    const channel = supabase
      .channel('clinic_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinic_settings',
        },
        (payload) => {
          console.log('Clinic settings changed:', payload);
          fetchClinicSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
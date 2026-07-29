import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export function SuperAdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (profile && profile.role === "superadmin") {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } catch (err) {
        console.error("Error checking superadmin status:", err);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isSuperAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
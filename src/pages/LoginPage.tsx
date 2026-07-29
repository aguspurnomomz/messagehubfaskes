import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

import logo from "@/assets/logo_healtech_message.png";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        const userId = data.user.id;

        // Ambil role langsung dari tabel profiles agar akurat
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", userId)
          .maybeSingle();

        const userRole = profile?.role || "clinic_admin";

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: profile?.full_name || data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email,
            role: userRole,
          })
        );
        
        setIsLoading(false);

        // PENGARAHAN BERDASARKAN ROLE
        if (userRole === "superadmin") {
          navigate("/superadmin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4">
            <img 
              src={logo} 
              alt="HealthTech Message Hub Logo" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">HealthTech Message Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform Komunikasi dan Pengiriman Pesan Siaran Untuk Klinik Atau Fasilitas Kesehatan 
          </p>
        </div>

        <Card className="border-border/80 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Selamat Datang</CardTitle>
            <CardDescription className="text-center">
              Masuk menggunakan akun anda
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="user@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Mohon tunggu...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MediflowHub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
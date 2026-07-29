import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Shield, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ClinicItem {
  id: string;
  name: string;
  package_plan: string;
  status: string;
  created_at: string;
}

export function SuperAdminPage() {
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State Tambah Klinik Baru
  const [clinicName, setClinicName] = useState("");
  const [packagePlan, setPackagePlan] = useState("Freemium");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminFullName, setAdminFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data klinik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateClinicAndAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName || !adminEmail || !adminPassword) {
      alert("Harap isi semua field wajib!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Buat data Induk Klinik
      const { data: clinicData, error: clinicErr } = await supabase
        .from("clinics")
        .insert({
          name: clinicName,
          package_plan: packagePlan,
          status: "active",
        })
        .select()
        .single();

      if (clinicErr) throw clinicErr;

      // 2. Buat User Admin Klinik via Auth SignUp
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: adminFullName || clinicName,
            role: "clinic_admin",
          },
        },
      });

      if (authErr) throw authErr;

      const newUserId = authData.user?.id;

      if (newUserId) {
        // 3. Update Profiles agar terhubung ke clinic_id baru
        const { error: profileErr } = await supabase
          .from("profiles")
          .upsert({
            id: newUserId,
            clinic_id: clinicData.id,
            role: "clinic_admin",
            full_name: adminFullName || clinicName,
          });

        if (profileErr) throw profileErr;

        // 4. Inisialisasi default clinic_settings untuk klinik baru ini
        await supabase.from("clinic_settings").insert({
          user_id: newUserId,
          clinic_id: clinicData.id,
          clinic_name: clinicName,
        });
      }

      showToast("success", `Klinik "${clinicName}" & Akun Admin berhasil dibuat!`);
      setIsDialogOpen(false);
      
      // Reset Form
      setClinicName("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminFullName("");
      setPackagePlan("Freemium");

      fetchClinics();
    } catch (err: any) {
      console.error("Gagal membuat klinik:", err);
      showToast("error", err.message || "Gagal membuat klinik baru");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Panel Superadmin MediflowHub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pendaftaran faskes/klinik dan hak akses admin klinik
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Klinik Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrasi Klinik & Admin Baru</DialogTitle>
              <DialogDescription>
                Sistem akan membuat entitas klinik baru dan akun admin login untuk klinik tersebut.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateClinicAndAdmin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Nama Klinik / Faskes *</label>
                <Input
                  placeholder="Contoh: Klinik Sehat Bersama"
                  value={clinicName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClinicName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Paket Langganan *</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={packagePlan}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPackagePlan(e.target.value)}
                >
                  <option value="Freemium">Freemium</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Super">Super</option>
                  <option value="Ultra">Ultra</option>
                </select>
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-bold text-foreground">Kredensial Login Admin Klinik:</p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nama Pengelola / Dokter</label>
                  <Input
                    placeholder="Contoh: dr. Ahmad Pratama"
                    value={adminFullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Email Login *</label>
                  <Input
                    type="email"
                    placeholder="admin@kliniksehat.com"
                    value={adminEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Password Temporary *</label>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={adminPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan & Daftarkan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Daftar Klinik Terdaftar
          </CardTitle>
          <CardDescription>Total {clinics.length} faskes yang aktif di sistem SaaS</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada data klinik</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Klinik</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Mendaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-semibold text-foreground">{clinic.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {clinic.package_plan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          {clinic.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(clinic.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`rounded-lg shadow-lg px-4 py-3 text-white flex items-center gap-2 text-xs font-semibold ${
              toastMsg.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {toastMsg.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {toastMsg.text}
          </div>
        </div>
      )}
    </div>
  );
}
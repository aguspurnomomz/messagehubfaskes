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
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Plus, Shield, Loader2, CheckCircle, XCircle, Pencil, UserCheck, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ClinicItem {
  id: string;
  name: string;
  package_plan: string;
  status: string;
  created_at: string;
  admin_name?: string;
  admin_email?: string;
  admin_user_id?: string;
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

  // Form State Edit Klinik & Admin
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<ClinicItem | null>(null);
  const [editClinicName, setEditClinicName] = useState("");
  const [editPackagePlan, setEditPackagePlan] = useState("Freemium");
  const [editStatus, setEditStatus] = useState("active");
  const [editAdminFullName, setEditAdminFullName] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil data semua klinik
      const { data: clinicsData, error: clinicsErr } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      if (clinicsErr) throw clinicsErr;

      // 2. Ambil data profile admin untuk setiap klinik
      const clinicsWithAdmin = await Promise.all(
        (clinicsData || []).map(async (clinic) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("clinic_id", clinic.id)
            .eq("role", "clinic_admin")
            .maybeSingle();

          return {
            ...clinic,
            admin_name: profile?.full_name || "-",
            admin_email: profile?.email || "-",
            admin_user_id: profile?.id || null,
          };
        })
      );

      setClinics(clinicsWithAdmin);
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
        // 3. Upsert ke Profiles (Termasuk Menyimpan Email)
        const { error: profileErr } = await supabase
          .from("profiles")
          .upsert({
            id: newUserId,
            clinic_id: clinicData.id,
            role: "clinic_admin",
            full_name: adminFullName || clinicName,
            email: adminEmail, // Menyimpan email ke profiles
          });

        if (profileErr) throw profileErr;

        // 4. Inisialisasi default clinic_settings
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

  // Handler Buka Modal Edit
  const handleOpenEdit = (clinic: ClinicItem) => {
    setEditingClinic(clinic);
    setEditClinicName(clinic.name);
    setEditPackagePlan(clinic.package_plan);
    setEditStatus(clinic.status);
    setEditAdminFullName(clinic.admin_name !== "-" ? clinic.admin_name || "" : "");
    setEditAdminEmail(clinic.admin_email !== "-" ? clinic.admin_email || "" : "");
    setIsEditDialogOpen(true);
  };

  // Handler Simpan Perubahan Edit
  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic || !editClinicName.trim()) return;

    setIsUpdating(true);
    try {
      // 1. Update tabel clinics
      const { error: clinicErr } = await supabase
        .from("clinics")
        .update({
          name: editClinicName.trim(),
          package_plan: editPackagePlan,
          status: editStatus,
        })
        .eq("id", editingClinic.id);

      if (clinicErr) throw clinicErr;

      // 2. Update clinic_name di tabel clinic_settings
      await supabase
        .from("clinic_settings")
        .update({ clinic_name: editClinicName.trim() })
        .eq("clinic_id", editingClinic.id);

      // 3. Update profil admin klinik jika ada
      if (editingClinic.admin_user_id) {
        await supabase
          .from("profiles")
          .update({
            full_name: editAdminFullName.trim(),
            email: editAdminEmail.trim(),
          })
          .eq("id", editingClinic.admin_user_id);
      }

      showToast("success", `Data klinik & admin "${editClinicName}" berhasil diperbarui!`);
      setIsEditDialogOpen(false);
      setEditingClinic(null);
      fetchClinics();
    } catch (err: any) {
      console.error("Gagal memperbarui:", err);
      showToast("error", err.message || "Gagal memperbarui data");
    } finally {
      setIsUpdating(false);
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
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
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" /> Kredensial Login Admin Klinik:
                </p>

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
                    <TableHead>Admin Pengelola</TableHead>
                    <TableHead>Email Login</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Mendaftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-semibold text-foreground">{clinic.name}</TableCell>
                      <TableCell className="text-sm">{clinic.admin_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{clinic.admin_email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {clinic.package_plan}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            clinic.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(clinic)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Edit Klinik & Admin"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG EDIT KLINIK & ADMIN */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Informasi Klinik & Admin</DialogTitle>
            <DialogDescription>
              Ubah rincian data faskes, paket langganan, dan akun pengelola.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateClinic} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Nama Klinik / Faskes *</label>
              <Input
                value={editClinicName}
                onChange={(e) => setEditClinicName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Paket Langganan *</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                value={editPackagePlan}
                onChange={(e) => setEditPackagePlan(e.target.value)}
              >
                <option value="Freemium">Freemium</option>
                <option value="Advanced">Advanced</option>
                <option value="Super">Super</option>
                <option value="Ultra">Ultra</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Status Faskes *</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="border-t pt-3 space-y-3">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-primary" /> Pengaturan Admin Klinik:
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Nama Pengelola / Dokter</label>
                <Input
                  placeholder="Nama pengelola..."
                  value={editAdminFullName}
                  onChange={(e) => setEditAdminFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Login Admin</label>
                <Input
                  type="email"
                  placeholder="admin@klinik.com"
                  value={editAdminEmail}
                  onChange={(e) => setEditAdminEmail(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
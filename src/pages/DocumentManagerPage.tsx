import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  File,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadAndSaveDocument, type UserDocument } from "@/lib/documentService";

export function DocumentManagerPage() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("General");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil daftar dokumen:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      await uploadAndSaveDocument(selectedFile, null, docType);
      
      setStatusMessage({ type: "success", text: `Berkas "${selectedFile.name}" berhasil diunggah!` });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      await fetchDocuments();
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatusMessage({ type: "error", text: err.message || "Gagal mengunggah berkas." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: UserDocument) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${doc.document_name}"?`)) return;

    try {
      // 1. Hapus file dari Storage Supabase
      if (doc.file_path) {
        await supabase.storage.from("clinic-attachments").remove([doc.file_path]);
      }

      // 2. Hapus baris metadata dari tabel DB
      const { error } = await supabase.from("user_documents").delete().eq("id", doc.id);
      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setStatusMessage({ type: "success", text: "Dokumen berhasil dihapus." });
    } catch (err: any) {
      console.error("Delete error:", err);
      setStatusMessage({ type: "error", text: err.message || "Gagal menghapus dokumen." });
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Manajemen Lampiran & Dokumen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola pustaka berkas yang tersimpan di Storage
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM UPLOAD FILE DOKUMEN */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Unggah Berkas Baru
            </CardTitle>
            <CardDescription>
              Simpan file PDF, Gambar, atau Dokumen langsung ke Supabase Storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe / Kategori Dokumen</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="General">Umum / General</option>
                <option value="Hasil Lab">Hasil Lab</option>
                <option value="Invoice">Invoice / Tagihan</option>
                <option value="Resep Obat">Resep Obat</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Berkas</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx"
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center cursor-pointer transition-colors bg-muted/20"
              >
                <File className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-foreground">Klik untuk pilih berkas</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, Gambar, Docx (Maks. 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full gap-2 mt-2"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isUploading ? "Mengunggah..." : "Unggah ke Storage"}
            </Button>
          </CardContent>
        </Card>

        {/* TABEL DAFTAR DOKUMEN TERSIMPAN */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" /> Berkas Tersimpan
                </CardTitle>
                <CardDescription>
                  Total {documents.length} dokumen ada di database
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama berkas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Tidak ada dokumen ditemukan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{doc.document_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-medium border border-border">
                            {doc.document_type}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(doc.file_size || 0)}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka / Pratinjau Link"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      <a
                        href={doc.file_url}
                        download
                        title="Unduh Berkas"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
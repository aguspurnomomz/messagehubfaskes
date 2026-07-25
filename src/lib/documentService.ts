import { supabase } from "@/lib/supabaseClient";

export interface UserDocument {
  id: string;
  patient_id: string | null;
  document_name: string;
  document_type: string;
  file_url: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

/**
 * Upload file ke Supabase Storage 'clinic-attachments'
 * dan menyimpan metadatanya ke tabel 'user_documents'
 */
export const uploadAndSaveDocument = async (
  file: File,
  patientId?: string | null,
  documentType: string = "General"
): Promise<{ publicUrl: string; filePath: string }> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // 1. Upload File ke Storage Bucket 'clinic-attachments'
    const { error: uploadError } = await supabase.storage
      .from("clinic-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error Upload Supabase Storage:", uploadError);
      throw new Error(`Storage Error: ${uploadError.message}`);
    }

    // 2. Ambil Public URL
    const { data: publicUrlData } = supabase.storage
      .from("clinic-attachments")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl) {
      throw new Error("Gagal membuat Public URL untuk file lampiran.");
    }

    // 3. Simpan Metadata ke Tabel 'user_documents' jika ada patientId
    if (patientId) {
      const { error: dbError } = await supabase.from("user_documents").insert({
        patient_id: patientId,
        document_name: file.name,
        document_type: documentType,
        file_url: publicUrl,
        file_path: filePath,
        file_size: file.size,
      });

      if (dbError) {
        console.error("Gagal menyimpan metadata dokumen ke DB:", dbError);
        // Lempar error agar ditangkap catch dan membatalkan proses kirim Fonnte jika DB gagal
        throw new Error(`Database Error: ${dbError.message}`);
      }
    }

    return { publicUrl, filePath };
  } catch (error: any) {
    console.error("Fatal Upload Error:", error);
    // Lempar ulang error dengan pesan yang jelas
    throw new Error(error.message || "Gagal mengunggah file lampiran");
  }
};
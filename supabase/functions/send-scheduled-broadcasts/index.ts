import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Header CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper format nomor telepon ke format internasional (62xxx)
function formatPhoneToInternational(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

Deno.serve(async (req) => {
  // Handle Preflight Request CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Inisialisasi Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // 2. Cari broadcast yang statusnya 'pending' dan waktunya sudah lewat/saat ini
    const { data: pendingBroadcasts, error: broadcastError } = await supabase
      .from("scheduled_broadcasts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_time", now);

    if (broadcastError) throw broadcastError;

    if (!pendingBroadcasts || pendingBroadcasts.length === 0) {
      return new Response(
        JSON.stringify({ message: "Tidak ada jadwal pesan yang perlu dikirim." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let totalProcessedTasks = 0;

    // 3. Looping setiap broadcast yang siap dikirim
    for (const broadcast of pendingBroadcasts) {
      // Ubah status broadcast menjadi 'processing'
      await supabase
        .from("scheduled_broadcasts")
        .update({ status: "processing" })
        .eq("id", broadcast.id);

      // Ambil API Key Fonnte & Signature Klinik milik User pemilik broadcast
      const { data: clinicSettings } = await supabase
        .from("clinic_settings")
        .select("fonte_api_key, signature, clinic_name")
        .eq("user_id", broadcast.user_id)
        .maybeSingle();

      const fonteApiKey = clinicSettings?.fonte_api_key;

      if (!fonteApiKey) {
        console.error(`User ${broadcast.user_id} belum mengonfigurasi Fonnte API Key.`);
        await supabase
          .from("scheduled_broadcasts")
          .update({ status: "failed" })
          .eq("id", broadcast.id);
        continue;
      }

      // Ambil daftar tugas pesan (scheduled_tasks)
      const { data: tasks, error: tasksError } = await supabase
        .from("scheduled_tasks")
        .select("*")
        .eq("broadcast_id", broadcast.id)
        .eq("status", "pending");

      if (tasksError || !tasks || tasks.length === 0) {
        await supabase
          .from("scheduled_broadcasts")
          .update({ status: "completed" })
          .eq("id", broadcast.id);
        continue;
      }

      let successCount = 0;
      let failedCount = 0;

      // 4. Eksekusi pengiriman tiap tugas (task)
      for (const task of tasks) {
        try {
          // Siapkan isi pesan + Signature jika ada
          let messageText = task.message_content;
          if (clinicSettings?.signature) {
            let sig = clinicSettings.signature.replace(
              /{clinic_name}/g,
              clinicSettings.clinicName || "Klinik"
            );
            messageText += "\n\n" + sig;
          }

          const targetPhone = formatPhoneToInternational(task.phone_number);

          // Kirim via API Fonnte
          const formData = new FormData();
          formData.append("target", targetPhone);
          formData.append("message", messageText);

          const fonnteRes = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: { Authorization: fonteApiKey },
            body: formData,
          });

          const fonnteData = await fonnteRes.json();

          if (!fonnteRes.ok || fonnteData.status === false) {
            throw new Error(fonnteData.message || "Gagal mengirim via Fonnte");
          }

          // Update task menjadi 'completed'
          await supabase
            .from("scheduled_tasks")
            .update({ status: "completed" })
            .eq("id", task.id);

          // Catat ke log pesan utama (message_logs)
          await supabase.from("message_logs").insert({
            patient_id: task.patient_id,
            message_type: "Scheduled Broadcast",
            message_content: messageText,
            status: "sent",
            delivery_time: new Date().toISOString(),
            fonte_response_id: fonnteData.id || null,
          });

          successCount++;
        } catch (err: any) {
          console.error(`Gagal mengirim task ID ${task.id}:`, err.message);

          // Update task menjadi 'failed'
          await supabase
            .from("scheduled_tasks")
            .update({
              status: "failed",
              error_message: err.message || "Gagal terkirim",
            })
            .eq("id", task.id);

          // Catat kegagalan ke message_logs
          await supabase.from("message_logs").insert({
            patient_id: task.patient_id,
            message_type: "Scheduled Broadcast",
            message_content: task.message_content,
            status: "failed",
            delivery_time: new Date().toISOString(),
          });

          failedCount++;
        }

        // Delay kecil 300ms antar pesan agar tidak memicu rate-limit
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      totalProcessedTasks += tasks.length;

      // 5. Update status broadcast akhir
      const finalStatus = failedCount === tasks.length ? "failed" : "completed";
      await supabase
        .from("scheduled_broadcasts")
        .update({ status: finalStatus })
        .eq("id", broadcast.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Selesai memproses jadwal. Total ${totalProcessedTasks} pesan diproses.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error pada Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
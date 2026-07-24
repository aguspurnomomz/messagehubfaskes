import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // 1. Hanya izinkan HTTP POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 })
  }

  try {
    // 2. Parse Body dari Fonnte (bisa berupa JSON atau Form-Data)
    const contentType = req.headers.get('content-type') || ''
    let body: Record<string, any> = {}

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      formData.forEach((value, key) => { body[key] = value })
    } else {
      body = await req.json()
    }

    // Ambil variabel penting dari Fonnte
    const { device, sender, message, name } = body

    if (!sender || !message) {
      return new Response(JSON.stringify({ status: false, message: 'Invalid payload' }), { status: 400 })
    }

    // 3. Inisialisasi Supabase Client dengan Service Role Key (untuk bypass RLS saat write)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Normalisasi nomor telepon & Lookup patient_id dari tabel 'patients'
    // Mengubah nomor misal "+62812345" atau "0812345" agar cocok dengan format di DB
    const cleanSender = sender.replace(/[^0-9]/g, '')
    
    // Cari pasien berdasarkan phone_number
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('id')
      .or(`phone_number.eq.${cleanSender},phone_number.eq.+${cleanSender}`)
      .maybeSingle()

    // 5. Simpan pesan masuk ke tabel incoming_message_logs
    const { error: insertError } = await supabaseAdmin
      .from('incoming_message_logs')
      .insert({
        patient_id: patient?.id || null,
        sender_number: sender,
        sender_name: name || null,
        message_content: message,
        fonnte_device: device,
        raw_payload: body // Menyimpan backup JSON lengkap dari Fonnte
      })

    if (insertError) {
      console.error('Insert Error:', insertError)
      return new Response(JSON.stringify({ status: false, error: insertError.message }), { status: 500 })
    }

    // 6. Return response 200 OK ke Fonnte
    return new Response(JSON.stringify({ status: true, message: 'Message logged successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return new Response(JSON.stringify({ status: false, error: err.message }), { status: 400 })
  }
})
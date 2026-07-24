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

    // 3. Inisialisasi Supabase Client dengan Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Normalisasi nomor telepon & Lookup patient_id dari tabel 'patients'
    const cleanSender = sender.replace(/[^0-9]/g, '') // Menghasilkan "6281324439591"

    // Buat variasi format lokal (08xxx) dan internasional (628xxx)
    let localPhone = cleanSender
    let intlPhone = cleanSender

    if (cleanSender.startsWith('62')) {
      localPhone = '0' + cleanSender.slice(2) // Mengubah "6281324439591" -> "081324439591"
    } else if (cleanSender.startsWith('0')) {
      intlPhone = '62' + cleanSender.slice(1)  // Mengubah "081324439591" -> "6281324439591"
    }

    // Cari di tabel patients dengan mencocokkan seluruh kemungkinan format
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('id')
      .or(`phone_number.eq.${cleanSender},phone_number.eq.${localPhone},phone_number.eq.${intlPhone},phone_number.eq.+${intlPhone}`)
      .maybeSingle()

    // 5. Simpan pesan masuk ke tabel incoming_message_logs
    const { error: insertError } = await supabaseAdmin
      .from('incoming_message_logs')
      .insert({
        patient_id: patient?.id || null, // Sekarang otomatis terisi ID Agus Purnomo
        sender_number: sender,
        sender_name: name || null,
        message_content: message,
        fonnte_device: device,
        raw_payload: body
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
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Mini Navbar */}
      <nav className="border-b bg-white sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali
          </Link>
          <div className="flex items-center gap-2">
            {/* <MessageSquare className="h-5 w-5 text-indigo-600" /> */}
            <span className="font-bold text-slate-900 text-sm">MediflowHub</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 shadow-sm">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Terakhir Diperbarui: Juli 2026
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Syarat dan Ketentuan Penggunaan
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Harap baca Syarat dan Ketentuan ini secara saksama sebelum menggunakan layanan HealthTech Message Hub.
            </p>
          </div>

          {/* Isi Dokumen */}
          <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan mengakses, mendaftar, atau menggunakan platform <strong>MediflowHub</strong> serta produk <strong>HealthTech Message Hub</strong> (selanjutnya disebut "Layanan"), Anda (selanjutnya disebut "Pengguna" atau "Klinik/Faskes") menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat dan Ketentuan ini.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Deskripsi Layanan</h2>
              <p>
                MediflowHub menyediakan perangkat lunak berbasis web (SaaS) berupa pusat manajemen pesan siaran (Message Hub) yang membantu fasilitas kesehatan mengelola dan mengirimkan pesan komunikasi, pengingat kontrol, serta edukasi kesehatan kepada pasien melalui integrasi pihak ketiga (WhatsApp).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                3. Batasan Tanggung Jawab & Penyediaan Nomor WhatsApp
              </h2>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-slate-700 space-y-3 text-sm">
                <p className="font-semibold text-amber-900">PENTING UNTUK DIKETAHUI:</p>
                <p>
                  Layanan MediflowHub memanfaatkan infrastruktur jaringan pihak ketiga, yaitu platform WhatsApp (Meta Platforms, Inc.) dan penyedia gateway perpesanan. Dengan menggunakan layanan ini, Pengguna/Klinik memahami dan menyetujui ketentuan berikut:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-xs leading-relaxed text-slate-700">
                  <li>
                    <strong>Sistem Nomor Pengirim Terpusat:</strong> MediflowHub menyediakan dan mengelola nomor WhatsApp pengirim untuk kebutuhan operasional komunikasi Klinik. Pengguna/Klinik tidak diwajibkan menyediakan nomor pengirim sendiri.
                  </li>
                  <li>
                    <strong>Jaminan Penggantian Nomor:</strong> Apabila nomor pengirim mengalami penangguhan atau pemblokiran (<em>banned</em>) oleh pihak WhatsApp, MediflowHub bertanggung jawab penuh untuk melakukan proses penggantian nomor pengirim agar layanan komunikasi Klinik dapat berjalan kembali.
                  </li>
                  <li>
                    <strong>Tanggung Jawab Isi Pesan & Kepatuhan:</strong> MediflowHub <strong>TIDAK BERTANGGUNG JAWAB</strong> atas isi materi pesan, kerugian bisnis, maupun dampak hukum yang timbul akibat:
                    <ul className="list-[circle] pl-5 mt-1 space-y-1">
                      <li>Pengiriman pesan masal (<em>spam</em>), promosi berlebihan, atau pesan tanpa persetujuan penerima (<em>opt-in</em>) yang memicu laporan dari pasien.</li>
                      <li>Pelanggaran terhadap <em>Commerce Policy</em>, <em>Business Policy</em>, atau ketentuan resmi WhatsApp lainnya melalui instruksi pengiriman pesan dari pihak Klinik.</li>
                      <li>Kegagalan atau penundaan pengiriman pesan yang disebabkan oleh gangguan teknis internal pada server infrastruktur WhatsApp (Meta) maupun jaringan telekomunikasi terkait.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Hak Pembatasan Akses:</strong> MediflowHub berhak menangguhkan sementara akun Klinik jika ditemukan pola pengiriman pesan yang secara sengaja dan berulang kali melanggar aturan anti-spam WhatsApp sehingga membahayakan reputasi infrastruktur nomor pengirim MediflowHub.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Perlindungan Data dan Privasi (UU PDP)</h2>
              <p>
                MediflowHub berkomitmen penuh untuk melindungi data pribadi dan medis pasien yang diunggah ke dalam sistem sesuai dengan regulasi hukum Perlindungan Data Pribadi (UU PDP) di Indonesia. 
              </p>
              <p>
                Pengguna (Klinik) memegang kendali dan tanggung jawab penuh sebagai Pengendali Data atas keabsahan nomor kontak dan persetujuan (*consent*) pasien untuk menerima pesan. MediflowHub bertindak sebagai Prosesor Data dan menjamin tidak akan menyalahgunakan, menyebarkan, atau menjual database pasien kepada pihak ketiga mana pun.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Keamanan Akun</h2>
              <p>
                Pengguna bertanggung jawab penuh atas keamanan kredensial akun (email dan password) staf medis atau admin yang terdaftar di platform kami. Segala aktivitas dan pengiriman pesan siaran yang dilakukan melalui akun Pengguna dianggap sebagai tanggung jawab penuh dari pihak Pengguna/Klinik.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">6. Batasan Ganti Rugi Medis</h2>
              <p>
                MediflowHub adalah penyedia platform teknologi manajemen komunikasi operasional faskes, bukan penyedia layanan kesehatan medis. Kami tidak bertanggung jawab atas segala bentuk kerugian materiil maupun imateriil, keluhan pasien, atau dampak klinis yang timbul akibat kesalahan konfigurasi pengiriman pesan pengingat jadwal, malfungsi penulisan konten pesan oleh admin faskes, ataupun keterlambatan info kontrol medis.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">7. Perubahan Ketentuan</h2>
              <p>
                Kami berhak untuk mengubah atau memperbarui Syarat dan Ketentuan ini sewaktu-waktu sesuai dengan perkembangan hukum dan penambahan fitur aplikasi. Perubahan akan diinformasikan melalui pembaruan tanggal di halaman ini.
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
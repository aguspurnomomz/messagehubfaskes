import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, AlertTriangle, FileText, RefreshCw, HelpCircle } from "lucide-react";

export function TermsPage() {
  const lastUpdated = "28 Juli 2026";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Mini Navbar */}
      <nav className="border-b bg-white sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors text-sm font-medium group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">MediflowHub</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Terakhir Diperbarui: {lastUpdated}, oleh MediflowHub
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Syarat dan Ketentuan Penggunaan
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Harap baca Syarat dan Ketentuan ini secara saksama sebelum menggunakan layanan HealthTech Message Hub.
            </p>
          </div>

          {/* Isi Dokumen - Disamakan Persis dengan TermsPageDash */}
          <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
            
            {/* Seksi 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                1. Penerimaan Ketentuan
              </h2>
              <p>
                Dengan mendaftar, mengakses, atau menggunakan platform <strong>HealthTech Message Hub</strong>, Anda telah menyatakan bahwa Anda telah membaca, memahami dan menyetujui seluruh Syarat dan Ketentuan layanan kami.
              </p>
              <p>
                Layanan ini diperuntukkan bagi fasilitas kesehatan, klinik, serta tenaga medis yang berwenang untuk mengelola kebutuhan komunikasi dan pengingat informasi kesehatan kepada pasien.
              </p>
            </section>

            {/* Seksi 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                2. Privasi Data Pasien & Kerahasian Rekam Medis
              </h2>
              <p>
                <strong>HealthTech Message Hub</strong> berkomitmen tinggi terhadap perlindungan data pribadi dan data medis pasien sesuai dengan regulasi perlindungan data kesehatan yang berlaku saat ini.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                <li>
                  <strong>Persetujuan Pasien (Consent):</strong> Fasilitas kesehatan pengguna wajib memastikan bahwa setiap pasien telah memberikan persetujuan resmi untuk menerima pesan informasi medis melalui nomor WhatsApp yang terdaftar pada layanan kami.
                </li>
                <li>
                  <strong>Penggunaan Data Kontak:</strong> Nomor telepon dan data medis pasien yang diunggah ke platform kami, hanya digunakan untuk kepentingan operasional klinik seperti <strong>informasi nomor antrian, pengingat jadwal kontrol, pesan pengambilan resep/obat dan kebutuhan yang berkaitan dengan layanan fasilitas kesehatan atau klinik</strong> dan tidak akan diperjualbelikan kepada pihak ketiga mana pun.
                </li>
                <li>
                  <strong>Pustaka Lampiran Dokumen:</strong> Berkas dokumen, hasil laboratorium, resep pengambilan obat yang diunggah ke <em>database kami</em> dilindungi dengan enkripsi akses yang ketat dan hanya dapat diakses oleh pihak yang berwenang.
                </li>
              </ul>
            </section>

            {/* Seksi 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-indigo-600" />
                3. Pengiriman Pesan & Batasan Tanggung Jawab WhatsApp API
              </h2>
              <p>
                Pengiriman pesan WhatsApp otomatis pada platform ini dihubungkan melalui integrasi layanan integrasi pihak ketiga (bukan API resmi dari WhatsApp).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                <li>
                  <strong>Pengiriman Lampiran File:</strong> Fitur pengiriman berkas/dokumen langsung ke pesan WhatsApp memerlukan paket berlangganan tertentu (Advanced, Super, atau Ultra). Pengguna paket Freemium tetap dapat mengunggah file ke penyimpanan kami, tetapi berkas tidak akan terkirim secara langsung di aplikasi WhatsApp pasien.
                </li>
                <li>
                  <strong>Risiko Pemblokiran Nomor:</strong> Pengguna dilarang keras melakukan pengiriman pesan spam, promosi agresif tak terdeteksi, atau konten yang melanggar kebijakan Komunitas WhatsApp (Meta). Pihak kami tidak bertanggung jawab atas pemblokiran nomor WhatsApp yang disebabkan oleh aktivitas spamming pengirim.
                </li>
                <li>
                  <strong>Keterlambatan Pengiriman:</strong> Pengiriman pesan terjadwal dipengaruhi oleh kestabilan jaringan internet, status perangkat yang terhubung, serta antrean server API pihak ketiga.
                </li>
              </ul>
            </section>

            {/* Seksi 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                4. Larangan Penggunaan (Prohibited Conduct)
              </h2>
              <p>Saat menggunakan platform ini, Anda dilarang untuk:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>Mengirimkan informasi medis palsu, menyesatkan, atau berpotensi membahayakan keselamatan jiwa pasien.</li>
                <li>Menggunakan platform untuk aktivitas terorisme, penipuan, judi online, atau ujaran kebencian.</li>
                <li>Mencoba meretas, membobol <em>security layer</em>, atau mengganggu integritas server dan database platform kami.</li>
              </ul>
            </section>

            {/* Seksi 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
                5. Perubahan Syarat dan Ketentuan
              </h2>
              <p>
                Kami berhak untuk memperbarui atau mengubah Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan baru akan berlaku efektif setelah kebijakan terbaru diunggah pada halaman ini. Penggunaan berlanjut atas layanan kami dianggap sebagai persetujuan terhadap perubahan tersebut.
              </p>
            </section>

            {/* Seksi 6 */}
            <section className="space-y-3 pt-2 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                6. Kontak & Dukungan
              </h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini atau membutuhkan bantuan teknis terkait integrasi sistem, silakan hubungi tim dukungan kami melalui:
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono text-slate-800">
                <p><strong>Email Support:</strong> support@mediflowhub.com</p>
                <p><strong>Helpdesk WhatsApp:</strong> +62 813-2443-9591</p>
                <p><strong>Jam Operasional:</strong> Senin - Jumat (08.00 - 17.00 WIB)</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
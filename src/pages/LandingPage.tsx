import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, CheckCircle, Send, Layers, ShieldCheck, Info } from "lucide-react";

import imgDashboard from "@/assets/preview_dashboard.png";
import imgPatients from "@/assets/preview_patients.png";
import imgBroadcast from "@/assets/preview_broadcast.png";
import logoHealthtech from "@/assets/logo_healtech_message.png";

export function LandingPage() {
  const whatsappMessage = encodeURIComponent("saya tertarik dengan produk HealthTech Message");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img 
              src={logoHealthtech} 
              alt="HealthTech Message Hub Logo" 
              className="h-10 w-10 object-contain rounded-xl"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent leading-none">
                MediflowHub
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
                HealthTech Message Hub
              </span>
            </div>
          </div>

          {/* Menu Navigasi Tengah */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => scrollToSection("about-section")} 
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => scrollToSection("fitur-section")} 
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
            >
              Fitur
            </button>
            <button 
              onClick={() => scrollToSection("cta-section")} 
              className="hover:text-indigo-600 transition-colors cursor-pointer font-medium"
            >
              Kontak
            </button>
          </div>

          {/* Tombol Aksi Kanan */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center lg:pt-24">
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6"
          data-aos="fade-down"
        >
          <Layers className="h-4 w-4" /> Memperkenalkan Produk Unggulan Kami
        </div>
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Kelola Komunikasi Faskes dengan <p></p><span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">HealthTech Message Hub</span>
        </h1>
        <p 
          className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Produk solusi komunikasi dari MediflowHub yang mengintegrasikan data faskes Anda langsung ke WhatsApp pasien untuk pengiriman notifikasi, pengingat dan siaran pesan massal yang efisien.
        </p>
        <div 
          className="mt-10 flex flex-wrap justify-center gap-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 group"
          >
            Mulai Sekarang 
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Hero Dashboard Preview */}
        <div 
          className="mt-16 relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl max-w-5xl mx-auto overflow-hidden group"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="absolute top-0 inset-x-0 h-12 bg-slate-100/80 border-b border-slate-200/60 flex items-center px-4 gap-2">
            <div className="w-3 w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 w-3 h-3 rounded-full bg-green-400" />
            <div className="bg-white px-24 py-1 text-xs text-slate-400 rounded-md mx-auto border truncate max-w-md">
              mediflowhub.com/dashboard
            </div>
          </div>
          <img 
            src={imgDashboard} 
            alt="MediflowHub Main Dashboard Preview" 
            className="w-full h-auto rounded-xl pt-10 object-cover shadow-inner transform group-hover:scale-[1.005] transition-transform duration-500"
          />
        </div>
      </header>

      {/* Tentang Kami Section */}
      <section id="about-section" className="bg-slate-100/80 border-t border-b border-slate-200/60 py-24 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-4" data-aos="fade-right">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Info className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Tentang MediflowHub
            </h2>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
              Ekosistem Digital Kesehatan
            </p>
          </div>
          <div className="lg:col-span-2 space-y-6 text-slate-600 leading-relaxed text-base" data-aos="fade-up" data-aos-delay="150">
            <p>
              <strong>MediflowHub</strong> hadir sebagai platform ekosistem digital terpadu yang didedikasikan untuk menyederhanakan alur kerja administrasi dan operasional fasilitas kesehatan di Indonesia. Kami menjembatani kesenjangan teknologi pada klinik dan puskesmas melalui solusi inovatif.
            </p>
            <p>
              Melalui produk utama kami yaitu "HealthTech Message Hub", kami fokus menyelesaikan hambatan komunikasi antara faskes dan pasien. Dengan integrasi pengiriman siaran pesan via WhatsApp, kami membantu meningkatkan retensi kunjungan pasien, menghemat waktu staf medis dan menekan angka ketidakhadiran jadwal kontrol kesehatan secara signifikan.
            </p>
          </div>
        </div>
      </section>

      {/* Detail Fitur Interaktif */}
      <section id="fitur-section" className="bg-white py-24 px-6 space-y-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20" data-aos="fade-up">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eksplorasi Fitur HealthTech Message Hub
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Dirancang khusus dengan antarmuka yang bersih untuk mengoptimalkan efisiensi kerja staf medis Anda.
            </p>
          </div>

          {/* Fitur 1: Manajemen Kontak Pasien */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6" data-aos="fade-right">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Manajemen Database & Kontak Pasien</h3>
              <p className="text-slate-600 leading-relaxed">
                Kelola semua data pasien, nomor WhatsApp, hingga kategori peran medis dalam satu panel terpusat. Anda bisa langsung memfilter penerima pesan berdasarkan daftar kunjungan tanpa perlu mencatat manual di handphone operasional klinik.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-500" /> Sinkronisasi data instan via Supabase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-500" /> Pencarian pasien cepat & responsif
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-xl" data-aos="fade-left">
              <img 
                src={imgPatients} 
                alt="Patients Contact Management Preview" 
                className="w-full h-auto rounded-lg object-cover shadow-sm"
              />
            </div>
          </div>

          {/* Fitur 2: Broadcast Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12">
            <div className="lg:order-2 space-y-6" data-aos="fade-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Pusat Siaran & Pembuat Pesan Massal</h3>
              <p className="text-slate-600 leading-relaxed">
                Buat pesan pengumuman, promosi faskes, atau info edukasi medis berkala dengan mudah. Template pesan yang fleksibel membantu staf admin mengirimkan pesan siaran langsung ke ratusan nomor pasien tujuan dalam sekali eksekusi.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-500" /> Ringkasan kuota alokasi pesan real-time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-500" /> Form pembuatan pesan yang simpel & intuitif
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-xl lg:order-1" data-aos="fade-right">
              <img 
                src={imgBroadcast} 
                alt="Create Broadcast Message Panel Preview" 
                className="w-full h-auto rounded-lg object-cover shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CTA */}
      <section id="cta-section" className="bg-slate-900 text-white py-20 px-6 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8" data-aos="zoom-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-sm font-medium border border-slate-700">
            <ShieldCheck className="h-4 w-4" /> Siap Membantu Operasional Faskes Anda
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ingin Mengintegrasikan Sistem Klinik Anda?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Punya pertanyaan mengenai implementasi gateway, integrasi database, atau ingin mencoba sistem menggunakan akun demo? Hubungi tim kami sekarang.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/6285864443850?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-white font-semibold text-slate-900 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-emerald-900/20 group"
            >
              <MessageCircle className="h-5 w-5 fill-slate-900" />
              Hubungi CS Kami
            </a>
            
            <a
              href={`https://wa.me/6285864443850?text=${encodeURIComponent("Halo Admin, saya ingin mengajukan akun demo")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 shadow-md"
            >
              Dapatkan Akun Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <p>&copy; {new Date().getFullYear()} MediflowHub. All rights reserved.</p>
            <Link to="/terms" className="hover:text-indigo-600 transition-colors underline underline-offset-4">
              Syarat & Ketentuan
            </Link>
          </div>
          <p className="mt-2 sm:mt-0">HealthTech Message Hub — Layanan Hub Pesan untuk Faskes dan Klinik.</p>
        </div>
      </footer>
    </div>
  );
}
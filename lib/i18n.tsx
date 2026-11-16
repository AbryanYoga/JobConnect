"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export type Language = "id" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (idText: string, enText?: string) => string;
}

/**
 * Kamus Terjemahan Global (Indonesian -> English).
 * Digunakan secara otomatis oleh fungsi t() jika parameter enText tidak diberikan secara eksplisit.
 */
export const TRANSLATIONS: Record<string, string> = {
  // --- Navigasi Utama & Peran ---
  "Beranda": "Home",
  "Lowongan": "Jobs",
  "Wilayah": "Regions",
  "Tentang Kami": "About Us",
  "Panduan & FAQ": "Guides & FAQ",
  "Lamaran Saya": "My Applications",
  "Tersimpan": "Saved",
  "Dashboard": "Dashboard",
  "Dashboard Mitra": "Partner Dashboard",
  "Dashboard Admin": "Admin Dashboard",
  "Pasang Lowongan": "Post a Job",
  "Masuk": "Sign In",
  "Daftar": "Sign Up",
  "Daftar Akun": "Register",
  "Profil": "Profile",
  "Profil Saya": "My Profile",
  "Profil Akun": "Account Profile",
  "Keluar": "Log Out",
  "Keluar...": "Logging out...",
  "Keluar dari akun": "Log out from account",
  "Keluar dari Akun": "Sign Out",
  "Buka Profil Saya": "Open My Profile",
  "Menu Akun": "Account Menu",
  "Cari lowongan cepat": "Quick search jobs",
  "Cari lowongan...": "Search jobs...",
  "Cari Lowongan": "Search Jobs",
  "Pencari Kerja": "Job Seeker",
  "Perusahaan Mitra": "Partner Company",
  "Admin": "Admin",
  "Tamu": "Guest",
  "Lewati ke konten": "Skip to content",
  "Navigasi Utama": "Main Navigation",
  "Navigasi Ponsel": "Mobile Navigation",
  "Tutup menu navigasi": "Close navigation menu",
  "Buka menu navigasi": "Open navigation menu",
  "Mode Administrator": "Administrator Mode",
  "Mode Mitra Perusahaan": "Partner Company Mode",

  // --- Menu Navigasi Peran & Sidebar ---
  "Ringkasan": "Overview",
  "Antrean Review": "Review Queue",
  "Kelola Kategori": "Manage Categories",
  "Rekapitulasi Platform": "Platform Summary",
  "Kunjungi Situs Publik": "Visit Public Site",
  "Moderator": "Moderator",
  "Admin Moderator": "Admin Moderator",
  "Kelola Lowongan": "Manage Jobs",
  "Profil Perusahaan": "Company Profile",
  "Laporan Rekap": "Summary Report",
  "Notifikasi": "Notifications",
  "Lowongan Tersimpan": "Saved Jobs",
  "Buka Antrean Review": "Open Review Queue",
  "Tinjau Sekarang": "Review Now",

  // --- Manajemen Perusahaan Mitra ---
  "Manajemen Mitra Perusahaan": "Partner Companies Management",
  "Perusahaan Mitra Terdaftar": "Registered Partner Companies",
  "Moderasi Entitas": "Entity Moderation",
  "Total Mitra": "Total Partners",
  "Mitra Aktif": "Active Partners",
  "Ada Antrean Review": "Pending Review",
  "Tanpa Lowongan": "No Vacancies",
  "Semua Mitra": "All Partners",
  "Lowongan Aktif": "Active Vacancies",
  "Ada Antrean": "Pending Queue",
  "Cari perusahaan, HR, kota...": "Search company, HR, city...",
  "Kontak Penanggung Jawab:": "Contact Person:",
  "Nama Belum Diatur": "Name Not Set",
  "Lihat Profil Publik": "View Public Profile",
  "Lihat Riwayat Lowongan": "View Job History",
  "Bekukan Lowongan": "Freeze Vacancies",
  "Bekukan Seluruh Lowongan Mitra": "Freeze All Partner Vacancies",
  "Buka Antrean Review Lowongan": "Open Job Review Queue",

  // --- Moderasi Lowongan ---
  "Setujui Lowongan": "Approve Vacancy",
  "Tolak / Minta Perbaikan": "Reject / Request Revision",
  "Takedown": "Takedown",
  "Menunggu Review": "Pending Review",
  "Aktif Tayang": "Active",
  "Ditakedown": "Taken Down",
  "Lihat Tampilan Publik": "View Public Page",
  "Lihat Detail Lamaran": "View Application Details",
  "Lowongan Dibuka": "Vacancies Open",
  "Batas Waktu Berakhir": "Application Deadline Passed",


  // --- Footer ---
  "Portal lowongan kerja terpercaya yang mempertemukan talenta dengan perusahaan mitra di 38 provinsi di Indonesia.":
    "Trusted job portal connecting talent with partner companies across 38 provinces in Indonesia.",
  "Panduan": "Guides",
  "Perusahaan": "Companies",
  "Semua Lowongan": "All Jobs",
  "Jelajah Wilayah": "Explore Regions",
  "Kerja Remote": "Remote Work",
  "Lowongan Terbaru": "Latest Jobs",
  "Alur Melamar": "Application Process",
  "Screening CV": "CV Screening",
  "Verifikasi Mitra": "Partner Verification",
  "Keamanan Akun": "Account Security",
  "Pusat Bantuan": "Help Center",
  "Hak cipta dilindungi.": "All rights reserved.",
  "Pusat Legal": "Legal Center",
  "Ketentuan Pengguna": "Terms of Use",

  // --- Hero & Beranda ---
  "100% Terverifikasi Admin • Bebas Calo & Pungli":
    "100% Admin Verified • Zero Scams & Brokers",
  "Mulai langkah karier impianmu tanpa rasa cemas.":
    "Take the next step in your dream career with confidence.",
  "Portal resmi penghubung pencari kerja dan perusahaan mitra di seluruh Indonesia. Transparan gaji, syarat kerja terstruktur, dan dipantau langsung oleh admin moderator.":
    "The official portal connecting job seekers and partner companies across Indonesia. Transparent salaries, structured requirements, and monitored directly by admin moderators.",
  "Mulai Cari Lowongan": "Start Searching Jobs",
  "Posisi, keahlian, atau profesi...": "Position, skills, or profession...",
  "Semua Wilayah": "All Regions",
  "Cari provinsi...": "Search province...",
  "Gratis untuk pencari kerja": "Free for job seekers",
  "lowongan aktif siap dilamar": "active vacancies ready to apply",
  "Jangkauan 38 provinsi": "Coverage across 38 provinces",

  // Kartu Bergerak Hero
  "PT Telkom Nusantara membuka 12 posisi Frontend & Backend":
    "PT Telkom Nusantara opens 12 Frontend & Backend positions",
  "9.138 pelamar": "9,138 applicants",
  "Bank Mandiri merekrut Officer Development Program nasional":
    "Bank Mandiri recruits national Officer Development Program",
  "8.450 pelamar": "8,450 applicants",
  "PT Bank Rakyat Indonesia merekrut Management Trainee & IT":
    "PT Bank Rakyat Indonesia recruits Management Trainee & IT",
  "12.840 pelamar": "12,840 applicants",
  "BCA Finance Mitra membuka Staff Operasional wilayah Surabaya":
    "BCA Finance Partner opens Operations Staff in Surabaya",
  "146 lowongan baru": "146 new vacancies",
  "Gojek Mitra Logistik membuka 24 posisi Product & Operations Remote":
    "Gojek Logistics Partner opens 24 Remote Product & Operations positions",
  "2.095 pelamar": "2,095 applicants",
  "Solusi Pintar Teknologi merekrut Fresh Graduate SMK & Diploma":
    "Solusi Pintar Teknologi recruits Vocational & Diploma Fresh Graduates",
  "1.420 pelamar": "1,420 applicants",

  // Section 1: Pencari Kerja
  "Untuk Pencari Kerja": "For Job Seekers",
  "Lamar pekerjaan resmi dengan mudah dalam hitungan menit.":
    "Apply for official jobs easily within minutes.",
  "JobConnect membuat proses melamar kerja transparan dan bebas ribet. Unggah CV sekali, pilih lowongan yang cocok, dan pantau status lamaran langsung dari dashboard Anda.":
    "JobConnect makes job applications transparent and hassle-free. Upload your CV once, select matching vacancies, and track application status directly from your dashboard.",
  "Lamar ke PT Inovasi Solusi": "Apply to PT Inovasi Solusi",
  "Resmi": "Official",
  "Posisi Lowongan": "Job Opening",
  "Penuh Waktu": "Full Time",
  "Hybrid • Jakarta": "Hybrid • Jakarta",
  "Rp 14 - 20 Juta": "Rp 14 - 20 Million",
  "Siap dikirim": "Ready to send",
  "Terverifikasi": "Verified",
  "Kirim Lamaran Sekarang": "Submit Application Now",

  // Section 2: Transparansi Kriteria
  "Transparansi Karier": "Career Transparency",
  "Kriteria jelas sejak awal. Tanpa gaji misterius.":
    "Clear criteria from day one. No mystery salaries.",
  "Kami mewajibkan setiap lowongan mitra mencantumkan rentang gaji, kualifikasi pendidikan minimal, mode kerja, serta benefit secara terstruktur. Tidak ada lagi jebakan informasi yang disembunyikan.":
    "We require every partner vacancy to state salary ranges, minimum education qualifications, work modes, and benefits in a structured way. No more hidden information.",
  "Kerja di Kantor (Onsite)": "Office Work (Onsite)",
  "Kolaborasi tatap muka dengan fasilitas kerja lengkap di kantor mitra.":
    "In-person collaboration with full facilities at the partner office.",
  "BPJS Kesehatan & Ketenagakerjaan": "Health & Employment Social Security",
  "Makan siang / tunjangan makan": "Lunch / meal allowance",
  "Lingkungan tim profesional": "Professional team environment",
  "Lihat Lowongan Onsite": "View Onsite Jobs",
  "Paling Diminati": "Most Popular",
  "Model Kerja Hybrid": "Hybrid Work Model",
  "Fleksibilitas seimbang antara kerja di rumah dan kantor.":
    "Balanced flexibility between working from home and the office.",
  "2-3 hari kerja dari rumah": "2-3 days work from home",
  "Tunjangan internet bulanan": "Monthly internet allowance",
  "Laptop / perangkat difasilitasi": "Laptop / work device provided",
  "Lihat Lowongan Hybrid": "View Hybrid Jobs",
  "Remote (Jarak Jauh)": "Remote Work",
  "Bebas bekerja dari mana saja di seluruh 38 provinsi di Indonesia.":
    "Freedom to work from anywhere across all 38 provinces in Indonesia.",
  "Bekerja dari domisili sendiri": "Work from your own residence",
  "Gaji standar nasional": "National standard salary",
  "Jam kerja fleksibel": "Flexible working hours",
  "Lihat Lowongan Remote": "View Remote Jobs",

  // Section 3: Perusahaan Mitra
  "Untuk Perusahaan & HRD": "For Companies & HR",
  "Pasang lowongan dan temukan talenta terbaik tanpa calo.":
    "Post vacancies and find top talent with zero intermediaries.",
  "Kelola kebutuhan rekrutmen perusahaan Anda dengan platform terpercaya. Dapatkan pelamar berkualitas, sistem filter terintegrasi, dan kemudahan jadwal seleksi langsung dari Dashboard Mitra.":
    "Manage your company's recruitment needs with a trusted platform. Get qualified applicants, integrated filter systems, and easy selection scheduling right from the Partner Dashboard.",
  "Daftar Sebagai Mitra Perusahaan": "Register as Partner Company",
  "Pelajari Alur Moderasi": "Learn Moderation Flow",
  "Pelamar Masuk": "Incoming Applicants",
  "28 Pelamar": "28 Applicants",
  "Wawancara": "Interview",
  "Diterima": "Accepted",

  // Section 4: Wilayah
  "Jangkauan 38 Provinsi di Indonesia": "Coverage across 38 Provinces in Indonesia",
  "Jelajahi Lowongan Berdasarkan Wilayah": "Explore Jobs by Region",
  "Temukan lowongan kerja resmi di provinsi domisilimu atau pilih kesempatan berkarier jarak jauh (remote).":
    "Find official job openings in your home province or choose remote career opportunities.",
  "Lihat Semua 38 Provinsi": "View All 38 Provinces",
  "Nasional": "National",
  "Lihat": "View",

  // Section 5: Lowongan Terbaru
  "Peluang Kerja Terbaru": "Latest Job Opportunities",
  "Lowongan Resmi Terverifikasi": "Official Verified Vacancies",
  "Lihat Seluruh Lowongan": "View All Vacancies",
  "Detail Lowongan": "Job Details",

  // Section 6: Bottom CTA
  "Siap melangkah ke karier impianmu berikutnya?":
    "Ready to take the next step in your dream career?",
  "Bergabunglah dengan ribuan pencari kerja lainnya di JobConnect. Temukan pekerjaan resmi, aman, dan tanpa biaya perantara.":
    "Join thousands of other job seekers on JobConnect. Find official, secure jobs with zero broker fees.",
  "Eksplorasi Lowongan Sekarang": "Explore Vacancies Now",
  "Daftar Akun Gratis": "Register Free Account",

  // --- Filter & Search ---
  "Cari posisi kerja, profesi, atau keahlian...":
    "Search job title, profession, or skills...",
  "Cari posisi kerja, keahlian, atau profesi...":
    "Search job title, skills, or profession...",
  "Cari lowongan pekerjaan": "Search job vacancies",
  "Hapus kata kunci pencarian": "Clear search query",
  "Filter Lowongan": "Filter Jobs",
  "Filter": "Filters",
  "Reset Filter": "Reset Filters",
  "Terapkan": "Apply",
  "Kategori Pekerjaan": "Job Category",
  "Semua Kategori": "All Categories",
  "Tipe Pekerjaan": "Job Type",
  "Semua Tipe": "All Types",
  "Mode Kerja": "Work Mode",
  "Semua Mode": "All Modes",
  "Provinsi": "Province",
  "Semua Provinsi": "All Provinces",
  "Kota / Kabupaten": "City / Regency",
  "Semua Kota": "All Cities",
  "Pilih kota setelah memilih provinsi": "Select city after choosing province",

  // --- Kartu Lowongan & Kriteria ---
  "Kisaran Gaji": "Salary Range",
  "Gaji dapat dinegosiasikan": "Salary negotiable",
  "Mulai": "From",
  "Hingga": "Up to",
  "Lowongan Demo": "Demo Vacancy",
  "Remote (Bekerja dari mana saja)": "Remote (Work from anywhere)",
  "Lokasi tidak disebutkan": "Location not specified",
  "thn exp": "yrs exp",
  "lainnya": "more",
  "Min.": "Min.",

  // --- Kriteria & Label Tipe / Mode / Edukasi ---
  "Full time": "Full time",
  "Part time": "Part time",
  "Magang": "Internship",
  "Kontrak": "Contract",
  "Freelance": "Freelance",
  "Onsite": "Onsite",
  "Hybrid": "Hybrid",
  "Remote": "Remote",
  "Tanpa syarat": "No requirement",
  "SMA/SMK": "High School / Vocational",
  "D3": "Diploma (D3)",
  "S1": "Bachelor's Degree (S1)",
  "S2": "Master's Degree (S2)",
  "1 sampai 10 karyawan": "1 to 10 employees",
  "11 sampai 50 karyawan": "11 to 50 employees",
  "51 sampai 200 karyawan": "51 to 200 employees",
  "201 sampai 500 karyawan": "201 to 500 employees",
  "Lebih dari 500 karyawan": "More than 500 employees",

  // --- Status Lamaran ---
  "Dikirim": "Submitted",
  "Ditinjau": "Under Review",
  "Shortlist": "Shortlisted",
  "Ditawari": "Offered",
  "Ditolak": "Rejected",
  "Ditarik": "Withdrawn",
  "Draf": "Draft",
  "Menunggu Moderasi": "Pending Moderation",
  "Tayang": "Active",
  "Ditutup": "Closed",
  "Diturunkan": "Taken Down",

  // --- Halaman Wilayah ---
  "Jelajah 38 Wilayah Provinsi & Remote": "Explore 38 Provinces & Remote Work",
  "Temukan Lowongan Kerja di 38 Provinsi": "Find Jobs in 38 Provinces",
  "Pilih wilayah domisilimu untuk melihat peluang karier resmi dari mitra perusahaan terverifikasi, atau pilih opsi kerja remote.":
    "Select your residence region to view official career opportunities from verified partner companies, or choose remote work.",
  "Ada Lowongan Aktif": "Has Active Jobs",
  "Cari nama provinsi...": "Search province name...",
  "Tersedia": "Available",
  "lowongan": "vacancies",
  "Belum ada lowongan": "No vacancies yet",
  "Tidak ada provinsi yang cocok dengan pencarian":
    "No provinces match your search",
  "Coba periksa ejaan atau reset kata kunci pencarian Anda.":
    "Please check spelling or reset your search keywords.",

  // --- Form & Detail Lowongan ---
  "Kriteria Lowongan": "Job Criteria",
  "Pendidikan Min.": "Min. Education",
  "Pengalaman": "Experience",
  "Batas Lamaran": "Application Deadline",
  "Lokasi": "Location",
  "Keahlian": "Skills",
  "Bagikan Lowongan": "Share Job",
  "Tautan tersalin!": "Link copied!",
  "Lowongan Masih Dibuka": "Vacancy Still Open",
  "Lowongan Telah Ditutup": "Vacancy Closed",
  "Kirim Lamaran Pekerjaan": "Submit Job Application",
  "Surat Lamaran (Cover Letter)": "Cover Letter",
  "Unggah Dokumen CV (PDF)": "Upload CV Document (PDF)",
  "Kirim Lamaran": "Submit Application",
  "Mengirim Lamaran...": "Submitting Application...",
  "Lamaran Terkirim": "Application Submitted",
  "Status Lamaran Anda": "Your Application Status",

  // --- Auth & Akun ---
  "Masuk ke Akun Anda": "Sign in to Your Account",
  "Email": "Email",
  "Kata Sandi": "Password",
  "Ingat saya": "Remember me",
  "Lupa kata sandi?": "Forgot password?",
  "Belum punya akun?": "Don't have an account?",
  "Sudah punya akun?": "Already have an account?",
  "Daftar Akun Baru": "Create New Account",
  "Nama Lengkap": "Full Name",
  "Nama Perusahaan": "Company Name",
  "Nomor Telepon": "Phone Number",
  "Konfirmasi Kata Sandi": "Confirm Password",
  "Ulangi kata sandi": "Repeat password",
  "Ulangi kata sandi yang sama": "Repeat the same password",
  "Minimal 8 karakter": "Minimum 8 characters",
  "Gunakan minimal 8 karakter gabungan huruf dan angka.":
    "Use at least 8 characters combining letters and numbers.",
  "Mendaftar...": "Registering...",
  "Daftar Sebagai": "Register As",
  "Pelamar": "Job Seeker",
  "Cari dan lamar lowongan kerja": "Search and apply for jobs",
  "Pasang lowongan dan rekrut tim": "Post jobs and recruit team",
  "Daftar sebagai Perusahaan": "Register as Company",
  "Daftar sebagai Pelamar": "Register as Job Seeker",
  "Daftar sebagai Pencari Kerja": "Sign Up as Job Seeker",
  "Daftar Cepat dengan Google": "Quick Sign Up with Google",
  "Daftar Cepat dengan Google (Akun Kantor)": "Quick Sign Up with Google (Work Account)",
  "Masuk dengan Google": "Sign In with Google",
  "Menghubungkan ke Google...": "Connecting to Google...",
  "atau": "or",
  "atau daftar dengan email": "or sign up with email",
  "atau daftar resmi dengan email kantor (direkomendasikan)": "or register officially with work email (recommended)",
  "Khusus akun Google kantor atau email baru yang belum terdaftar sebagai pelamar.": "Specifically for work Google accounts or new emails not registered as a job seeker.",
  "Pencari Kerja Terverifikasi": "Verified Job Seeker",
  "Portal Perusahaan Mitra": "Partner Employer Portal",
  "Daftarkan Perusahaan": "Register Company",
  "Daftarkan Akun Perusahaan": "Register Company Account",
  "Mendaftarkan Perusahaan...": "Registering Company...",
  "Publikasikan lowongan kerja resmi dan rekrut talenta terverifikasi tanpa calo.": "Publish verified job listings and recruit top talent without third-party brokers.",
  "Nama Perusahaan / Instansi": "Company / Organization Name",
  "Alamat Email Kantor / HR": "Work / HR Email Address",
  "Memproses pendaftaran...": "Processing registration...",
  "Memproses Pendaftaran...": "Processing Registration...",
  "Sudah memiliki akun JobConnect?": "Already have a JobConnect account?",
  "Sudah memiliki akun mitra?": "Already have an employer account?",
  "Masuk di sini": "Sign in here",
  "Masuk ke Portal Mitra": "Sign in to Employer Portal",
  "Pendaftaran Berhasil!": "Registration Successful!",
  "Pendaftaran Mitra Berhasil!": "Company Registration Successful!",
  "Menuju Halaman Masuk": "Proceed to Sign In",
  "Menuju Portal Masuk Mitra": "Go to Employer Login",
  "Pendaftaran Akun Terverifikasi": "Verified Account Registration",
  "Pilih peran Anda dan mulai temukan lowongan atau pasang lowongan kerja.":
    "Choose your role and start finding jobs or posting vacancies.",
  "Portal Masuk Akun": "Sign In Portal",
  "Selamat Datang Kembali": "Welcome Back",
  "Masuk untuk melanjutkan lamaran atau mengelola lowongan kerja Anda.":
    "Sign in to continue your applications or manage your jobs.",
  "Alamat Email": "Email Address",
  "Masukkan kata sandi akun Anda": "Enter your account password",
  "Masuk ke Akun": "Sign In to Account",
  "Memproses masuk...": "Signing in...",
  "Belum memiliki akun JobConnect?": "Don't have a JobConnect account?",
  "Daftar sekarang": "Register now",
  "Bukan perusahaan? Daftar sebagai Pencari Kerja →": "Not a company? Register as Job Seeker →",
  "Ingin pasang lowongan? Daftar Akun Perusahaan Mitra →": "Looking to hire? Register Company Account →",
  "Ingin pasang lowongan? Buka Portal Perusahaan →": "Looking to post jobs? Open Employer Portal →",
  "Ingin melamar kerja? Masuk sebagai Pencari Kerja →": "Looking for jobs? Sign in as Job Seeker →",
  "Pendaftaran Memerlukan Formulir Resmi Perusahaan": "Official Company Form Required",
  "Akun Google Anda Belum Terdaftar": "Google Account Not Registered",

  // --- Jenjang Pendidikan ---
  "SMA / SMK Sederajat": "High School / Vocational",
  "Diploma (D3 / D4)": "Diploma (D3 / D4)",
  "Sarjana (S1)": "Bachelor's Degree (S1)",
  "Magister (S2)": "Master's Degree (S2)",
  "Doktor (S3)": "Doctorate (S3)",
  "Pendidikan Non-formal / Lainnya": "Non-formal / Other Education",

  // --- Profil Pelamar & Biodata Onboarding ---
  "Profil & Biodata Saya": "My Profile & Biodata",
  "Akun Pelamar": "Job Seeker Account",
  "Bergabung": "Joined",
  "Ringkasan Profil Pelamar": "Job Seeker Profile Summary",
  "Identitas Diri & Kontak": "Personal Identity & Contact",
  "Pendidikan Terakhir": "Latest Education",
  "Jenjang Pendidikan": "Education Level",
  "Nama Sekolah / Kampus / Institusi": "School / University / Institution",
  "Tanggal Lahir (Umur)": "Date of Birth (Age)",
  "Domisili Penempatan Kerja": "Placement Domicile",
  "Tentang Saya": "About Me",
  "Tautan Profil Profesional": "Professional Links",
  "Website / Portofolio Utama": "Website / Main Portfolio",
  "Karya Nyata & Portofolio Proyek": "Real Works & Project Portfolio",
  "Lihat Karya / Demo": "View Work / Demo",
  "Edit Biodata & Profil Akun": "Edit Profile & Biodata",
  "Batal & Kembali ke Profil": "Cancel & Return to Profile",
  "Mode Pengeditan Profil": "Profile Editing Mode",
  "Belum ditambahkan": "Not added yet",
  "Belum ditentukan": "Not specified",
  "Belum memilih provinsi / kota": "Province or city not selected",
  "Ubah": "Edit",
  "tahun": "years old",
  "Belum menambahkan bio ringkasan diri. Ceritakan keahlian, pengalaman, atau minat karier Anda agar perusahaan mitra lebih mengenal Anda.":
    "No bio summary added yet. Describe your skills, experience, or career aspirations so partner companies can know you better.",
  "Data di bawah ini ditampilkan kepada perusahaan mitra saat Anda melamar pekerjaan.":
    "This information is presented to employer partners when you apply for jobs.",

  // --- Portofolio & Proyek ---
  "Galeri Portofolio Proyek": "Project Portfolio Gallery",
  "Tambah Proyek Baru": "Add New Project",
  "Tambah Proyek": "Add Project",
  "Edit Proyek": "Edit Project",
  "Judul Proyek / Karya": "Project / Work Title",
  "Deskripsi Singkat Proyek": "Brief Project Description",
  "Tautan Proyek / Demo (Opsional)": "Project URL / Demo (Optional)",
  "Tautan Gambar Pratinjau / Screenshot (Opsional)": "Preview Image / Screenshot URL (Optional)",
  "Tautan Live Demo / Repositori (Opsional)": "Live Demo / Repository URL (Optional)",
  "Tahun Pembuatan (Opsional)": "Year Completed (Optional)",
  "Keahlian / Teknologi yang Dipakai (Pisahkan dengan koma)": "Skills / Tech Used (Comma separated)",
  "Keahlian / Teknologi yang Digunakan": "Skills / Technologies Used",
  "Tahun Pengerjaan": "Year Completed",
  "Batal": "Cancel",
  "Simpan Proyek": "Save Project",
  "Lihat Proyek": "View Project",
  "Tanpa tautan demo": "No demo link",
  "Ubah Karya Portofolio": "Edit Portfolio Project",
  "Tambah Karya / Proyek Portofolio": "Add Portfolio Project",
  "Belum ada karya atau proyek portofolio yang ditambahkan": "No portfolio projects added yet",
  "Belum ada karya atau proyek portofolio yang ditambahkan.": "No portfolio projects added yet.",
  "Belum ada proyek portofolio yang ditambahkan.": "No portfolio projects added yet.",
  "Tampilkan karya terbaik, aplikasi, desain, atau tautan GitHub Anda untuk memikat perusahaan mitra.":
    "Showcase your best work, apps, designs, or GitHub links to impress partner companies.",
  "Kunjungi Demo Proyek": "Visit Project Demo",

  // --- Lamaran Saya & Riwayat ---
  "Menunggu Konfirmasi": "Awaiting Confirmation",
  "Tahap Seleksi": "Selection Stage",
  "Selesai": "Completed",
  "Cari lowongan atau perusahaan...": "Search jobs or companies...",
  "Jadwal Wawancara": "Interview Schedule",
  "Lokasi / Tautan Wawancara:": "Interview Location / Link:",
  "Catatan dari Tim HR Rekruter:": "Notes from HR Recruiter:",
  "Lihat Detail Lowongan": "View Job Details",
  "Lihat Linimasa Lengkap": "View Full Timeline",
  "Belum Ada Lamaran": "No Applications Yet",
  "Belum ada berkas lamaran yang diajukan": "No applications submitted yet",
  "Cari Lowongan Sekarang": "Search Jobs Now",
  "Tarik Lamaran": "Withdraw Application",
  "Menarik Lamaran...": "Withdrawing Application...",

  // --- Sidebar & Dashboard Mitra ---
  "Mitra Resmi": "Official Partner",
  "Katalog Publik Lowongan": "Public Job Catalog",
  "Ingin melihat tampilan lowongan dari sudut pandang pencari kerja?":
    "Want to see how jobs look from a job seeker's perspective?",
  "Seluruh Indonesia": "All Indonesia",

  // --- Filter & Wilayah ---
  "Reset": "Reset",
  "Buka": "Open",
  "Memperbarui data lowongan...": "Updating job listings...",
  "Kategori Bidang": "Job Category",
  "Tipe Kontrak": "Contract Type",
  "Semua": "All",
  "Lokasi Penempatan": "Job Location",
  "Kota atau Kabupaten": "City or Regency",
  "Pilih provinsi terlebih dahulu": "Select province first",
  "Semua Kota di Provinsi Ini": "All Cities in this Province",
  "Cari kategori...": "Search category...",
  "Cari nama kota...": "Search city...",
  "Filter Terpasang": "Active Filters",
  "Hapus filter kategori": "Remove category filter",
  "Hapus filter tipe kerja": "Remove job type filter",
  "Hapus filter mode kerja": "Remove work mode filter",
  "Hapus filter provinsi": "Remove province filter",
  "Hapus filter kota": "Remove city filter",
  "Jelajah 38 Provinsi Nusantara": "Explore 38 Provinces of Indonesia",
  "Kerja Remote (Bebas Lokasi)": "Remote Work (Location Free)",
  "lowongan aktif": "active vacancies",
  "Peluang karier yang dapat dikerjakan dari mana saja tanpa batasan domisili atau kewajiban hadir di kantor fisik.":
    "Career opportunities that can be done from anywhere without domicile restrictions or physical office requirements.",
  "Cari nama provinsi (misal: Jawa, Bali, Papua)...":
    "Search province name (e.g. Jawa, Bali, Papua)...",
  "Cari nama provinsi": "Search province name",
  "Ada Lowongan": "Has Vacancies",
  "Provinsi tidak ditemukan": "Province not found",
  "Reset Pencarian": "Reset Search",

  // --- Kriteria & Detail Lowongan ---
  "Kriteria Utama": "Main Criteria",
  "Perkiraan kompensasi bulanan": "Estimated monthly compensation",
  "Pendidikan Minimal": "Min. Education",
  "Pengalaman Kerja": "Work Experience",
  "Terbuka bagi lulusan baru (Fresh Graduate)": "Open for Fresh Graduates",
  "Mode Bekerja": "Work Mode",
  "Batas Waktu Lamaran": "Application Deadline",
  "Keahlian yang Dibutuhkan": "Required Skills",
  "Lamar Posisi Ini": "Apply for this Position",
  "Penerimaan Lamaran Ditutup": "Applications Closed",
  "Tautan Disalin": "Link Copied",
  "Menunggu ACC": "Pending Approval",

  // --- Formulir Lamaran ---
  "Batas Waktu Lamaran Telah Berakhir": "Application Deadline Passed",
  "Status Lowongan Ditutup": "Vacancy Closed Status",
  "Batas Waktu Lamaran Berakhir": "Application Deadline Passed",
  "Penerimaan Lamaran Telah Ditutup": "Applications Closed",
  "Lihat Lowongan Lain": "View Other Jobs",
  "Wajib Masuk Akun": "Sign In Required",
  "Tertarik Mengisi Posisi Ini?": "Interested in this Position?",
  "Masuk untuk Melamar": "Sign In to Apply",
  "Akses Khusus Akun Pencari Kerja": "Job Seeker Exclusive Access",
  "Lamaran Berhasil Dikirimkan": "Application Submitted Successfully",
  "Lamaran Anda Berhasil Terkirim": "Your Application Has Been Submitted",
  "Lihat Status Lamaran Saya": "View My Application Status",
  "Eksplorasi Lowongan Lain": "Explore Other Jobs",
  "Sudah Pernah Melamar": "Already Applied",
  "Anda Sudah Melamar Posisi Ini": "You Have Applied for this Position",
  "Cari Lowongan Lain": "Search Other Jobs",
  "Formulir Lamaran Resmi": "Official Application Form",
  "Berkas CV (Curriculum Vitae)": "CV (Curriculum Vitae) File",
  "PDF, Maksimal 2 MB": "PDF, Maximum 2 MB",
  "Pilih Berkas CV Anda": "Select Your CV File",
  "Format resmi wajib PDF dengan ukuran maksimal 2 MB":
    "Official format must be PDF up to 2 MB",
  "Berkas siap dikirim": "File ready to send",
  "Hapus berkas CV yang dipilih": "Remove selected CV file",
  "Surat Pengantar Singkat": "Cover Letter",
  "(Opsional)": "(Optional)",
  "Tuliskan perkenalan singkat, ketertarikan Anda pada posisi ini, atau catatan tambahan untuk HRD...":
    "Write a brief introduction, your interest in this position, or notes for HR...",
  "Izinkan analisis kecocokan berkas dengan bantuan AI (Opsional)":
    "Allow AI-assisted file matching analysis (Optional)",
  "Sistem akan membaca ringkasan kualifikasi CV Anda dan memberikan saran estimasi kecocokan kepada HRD perusahaan mitra.":
    "The system will parse your CV summary and provide match estimates to the partner company HR.",
  "Catatan: Analisis ini hanya berperan sebagai panduan awal bagi rekruter. Keputusan seleksi berkas, panggilan wawancara, dan penerimaan tetap 100% diputuskan oleh manusia.":
    "Note: This analysis serves only as an initial guide for recruiters. Screening, interview invites, and hiring decisions remain 100% decided by humans.",
  "Mengunggah Berkas CV...": "Uploading CV File...",

  // --- Katalog Lowongan & Navigasi ---
  "Eksplorasi Lowongan": "Explore Jobs",
  "Katalog Resmi": "Official Catalog",
  "Eksplorasi Lowongan Pekerjaan": "Explore Job Vacancies",
  "Temukan kesempatan berkarier dari perusahaan mitra yang telah diverifikasi oleh admin.":
    "Discover career opportunities from partner companies verified by administrators.",
  "Tidak ada lowongan yang cocok": "No matching jobs found",
  "Tidak ditemukan lowongan pekerjaan aktif dengan kriteria pencarian yang Anda masukkan.":
    "No active job listings found matching your search criteria.",
  "Hapus Semua Filter": "Clear All Filters",
  "Navigasi Halaman": "Page Navigation",
  "Sebelumnya": "Previous",
  "Selanjutnya": "Next",

  // --- Tentang Kami ---
  "Misi & Komitmen JobConnect": "JobConnect Mission & Commitment",
  "Menghubungkan Pencari Kerja dan Perusahaan Resmi Tanpa Rasa Cemas":
    "Connecting Job Seekers and Official Companies with Confidence",
  "JobConnect hadir untuk menyelesaikan keresahan pelamar kerja di Indonesia: maraknya lowongan penipuan, calo, pungutan liar, dan ketidakpastian informasi gaji.":
    "JobConnect is here to resolve concerns of job seekers in Indonesia: rampant fake jobs, brokers, illegal fees, and salary uncertainty.",
  "100% Verifikasi Admin": "100% Admin Verification",
  "Setiap lowongan yang diajukan oleh mitra wajib melalui peninjauan langsung oleh admin moderator sebelum tayang ke publik. Bebas lowongan bodong dan calo.":
    "Every job posted by partners must undergo direct review by admin moderators before going live. Free from fake listings and intermediaries.",
  "Transparansi Kriteria": "Criteria Transparency",
  "Wajib mencantumkan rentang kompensasi gaji, kualifikasi pendidikan minimal, mode kerja (WFO/Hybrid/Remote), serta tanggung jawab terstruktur.":
    "Mandatory disclosure of salary ranges, minimum education qualifications, work mode (WFO/Hybrid/Remote), and structured responsibilities.",
  "AI Sebagai Asisten, Bukan Penentu": "AI as an Assistant, Not the Decider",
  "Sistem kecerdasan buatan hanya membantu memberikan masukan kecocokan kualifikasi. Keputusan seleksi dan penerimaan 100% berada di tangan manusia.":
    "Artificial intelligence only assists with qualification matching insights. Selection and hiring decisions remain 100% in human hands.",
  "Jangkauan Seluruh Indonesia": "Nationwide Coverage",
  "Mencakup 38 Provinsi dan 514 Kota/Kabupaten":
    "Covering 38 Provinces and 514 Cities/Regencies",
  "Baik Anda mencari peluang kerja di kota metropolitan maupun kesempatan kerja remote dari pelosok daerah, JobConnect menyediakan wadah resmi bagi seluruh talenta bangsa.":
    "Whether you are seeking opportunities in metropolitan cities or remote work from regional areas, JobConnect provides an official platform for national talent.",
  "Jelajahi Lowongan": "Explore Jobs",
  "Pasang Lowongan Perusahaan": "Post Company Jobs",

  // --- State Umum ---
  "Tidak ada lowongan ditemukan": "No vacancies found",
  "Coba ubah kata kunci atau reset filter pencarian Anda.":
    "Try changing keywords or resetting your search filters.",
  "Gagal Memuat Data": "Failed to Load Data",
  "Coba Lagi": "Try Again",
  "Kembali": "Go Back",
  "Tutup": "Close",

  // --- Jelajah Wilayah & Remote ---
  "Jelajah Lowongan Berdasarkan Wilayah": "Explore Jobs by Region",
  "Peluang Jarak Jauh": "Remote Opportunities",
  "Pekerjaan resmi berstatus aktif yang dapat dikerjakan dari mana saja di seluruh Indonesia tanpa kewajiban hadir fisik di kantor.":
    "Official active vacancies that can be done from anywhere in Indonesia without physical office requirements.",
  "Filter Lowongan Remote": "Filter Remote Vacancies",
  "Hapus Filter": "Clear Filters",
  "Jelajah 38 Provinsi": "Explore 38 Provinces",
  "Pilih Provinsi Lain": "Choose Another Province",
  "Belum ada lowongan remote yang sesuai": "No matching remote vacancies yet",
  "Saat ini belum ada lowongan kerja jarak jauh yang cocok dengan kriteria pencarian Anda. Anda juga dapat menjelajahi lowongan berdasarkan wilayah provinsi.":
    "Currently there are no remote jobs matching your search criteria. You can also explore vacancies by province.",
  "Kembali ke Daftar 38 Provinsi": "Back to 38 Provinces List",
  "Lihat Seluruh Lowongan Indonesia": "View All Indonesia Vacancies",
  "Kota dan Kabupaten dengan Lowongan Tayang": "Cities and Regencies with Active Vacancies",

  // --- Lowongan Tersimpan ---
  "Bookmark Pelamar": "Applicant Bookmarks",
  "Belum ada lowongan tersimpan.": "No saved jobs yet.",
  "Belum ada lowongan tersimpan": "No saved jobs yet",
  "Simpan lowongan pekerjaan yang menarik minat Anda agar mudah ditemukan dan diajukan kapan saja.":
    "Save job vacancies that interest you so they are easy to find and apply for anytime.",
  "Koleksi peluang karir yang Anda tandai. Buka detail posisi dan ajukan berkas lamaran Anda sebelum batas waktu berakhir.":
    "Collection of career opportunities you bookmarked. Open position details and submit your application before the deadline passes.",

  // --- Riwayat & Detail Lamaran Pelamar ---
  "Portofolio Lamaran Kerja": "Job Application Portfolio",
  "Riwayat Lamaran Saya": "My Applications History",
  "Pantau progres peninjauan berkas, undangan wawancara, dan keputusan resmi dari perusahaan mitra.":
    "Track the progress of your application review, interview invitations, and official decisions from partner companies.",
  "Cari Lowongan Pekerjaan": "Search Job Vacancies",
  "Tidak ada lamaran yang menunggu konfirmasi.": "No applications awaiting confirmation.",
  "Belum ada lamaran dalam tahap seleksi atau wawancara.": "No applications in selection or interview stage.",
  "Belum ada riwayat lamaran yang selesai.": "No completed application history.",
  "Tidak ada lamaran yang cocok.": "No matching applications.",
  "Lamaran yang baru dikirim atau sedang ditinjau HRD akan muncul di tab ini.":
    "Applications recently submitted or under HR review will appear here.",
  "Undangan wawancara dan tahapan seleksi lanjutan dari perusahaan mitra akan tertera di sini.":
    "Interview invites and advanced selection stages will appear here.",
  "Semua lamaran yang diterima, ditolak, atau ditarik akan dicatat di bagian ini.":
    "All accepted, rejected, or withdrawn applications will be recorded here.",
  "Lihat Semua Lamaran": "View All Applications",
  "Dilamar": "Applied",
  "Terakhir diperbarui": "Last updated",
  "Lihat Detail & Timeline": "View Details & Timeline",
  "Kembali ke Riwayat Lamaran": "Back to Application History",
  "Posisi Pekerjaan": "Job Position",
  "Timeline Riwayat Proses": "Process Timeline History",
  "Catatan kronologis setiap tahapan seleksi yang diperbarui secara transparan.":
    "Chronological record of each selection stage updated transparently.",
  "Lamaran Berhasil Terkirim": "Application Successfully Submitted",
  "Garansi Anti-Ghosting JobConnect (SLA 14 Hari)": "JobConnect Anti-Ghosting SLA (14 Days)",
  "Undangan Wawancara Kerja": "Job Interview Invitation",
  "Selamat! Anda Diundang ke Tahap Wawancara": "Congratulations! You are Invited to an Interview",
  "Waktu Wawancara:": "Interview Time:",
  "Lokasi / Tautan Pertemuan:": "Location / Meeting Link:",
  "Keputusan Seleksi": "Selection Decision",
  "Lamaran Belum Dapat Dilanjutkan": "Application Not Moving Forward",
  "Resmi Diterima": "Officially Accepted",
  "Buka Halaman Lowongan": "Open Job Page",

  // --- Notifikasi ---
  "Pantau pemberitahuan terkini seputar lamaran, panggilan wawancara, dan pembaruan lowongan Anda.":
    "Track latest updates on applications, interview calls, and job alerts.",
  "Gagal Memuat Notifikasi": "Failed to Load Notifications",
  "Terjadi kendala saat mengambil data notifikasi Anda. Silakan coba muat ulang.":
    "An issue occurred while retrieving your notifications. Please reload.",
  "Semua Notifikasi Telah Dibaca": "All Notifications Read",
  "Tidak ada pemberitahuan baru yang belum dibaca saat ini.":
    "No new unread notifications at this time.",
  "Belum Ada Notifikasi": "No Notifications Yet",
  "Pemberitahuan aktivitas seputar status lamaran, panggilan wawancara, dan lowongan Anda akan tampil di sini.":
    "Activity updates regarding your applications, interview invites, and jobs will appear here.",
  "Lihat Semua Notifikasi": "View All Notifications",
  "Tandai Semua Dibaca": "Mark All as Read",
  "Belum Dibaca": "Unread",
  "Pembaruan realtime aktif": "Realtime updates active",
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
  initialLanguage = "id",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Baca pilihan bahasa yang tersimpan saat mount di client
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jobconnect_lang") as Language | null;
      if (stored === "id" || stored === "en") {
        document.documentElement.lang = stored;
        if (stored !== language) {
          queueMicrotask(() => {
            setLanguageState(stored);
          });
        }
        return;
      }

      // Fallback cek cookie jika localStorage kosong
      const match = document.cookie.match(/(^|;\s*)jobconnect_lang=([^;]+)/);
      if (match && (match[2] === "id" || match[2] === "en")) {
        const cookieLang = match[2] as Language;
        document.documentElement.lang = cookieLang;
        if (cookieLang !== language) {
          queueMicrotask(() => {
            setLanguageState(cookieLang);
          });
        }
      }
    } catch {
      // Abaikan jika storage dinonaktifkan
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("jobconnect_lang", newLang);
      document.cookie = `jobconnect_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLang;
    } catch {
      // Abaikan error pada browser khusus
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "id" ? "en" : "id");
  }, [language, setLanguage]);

  /**
   * Fungsi helper terjemahan:
   * - Jika bahasa aktif adalah 'id', kembalikan idText.
   * - Jika bahasa aktif adalah 'en':
   *     1. Gunakan enText jika disediakan secara inline.
   *     2. Cari di kamus TRANSLATIONS.
   *     3. Fallback ke idText jika tidak ditemukan.
   */
  const t = useCallback(
    (idText: string, enText?: string): string => {
      if (language === "id") {
        return idText;
      }

      if (enText !== undefined) {
        return enText;
      }

      const trimmed = idText.trim();
      if (TRANSLATIONS[trimmed]) {
        return TRANSLATIONS[trimmed];
      }

      return idText;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback aman jika komponen di luar provider
    return {
      language: "id",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (idText: string, enText?: string) =>
        enText !== undefined ? enText : idText,
    };
  }
  return context;
}

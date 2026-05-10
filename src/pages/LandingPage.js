import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const KAI_BLUE = '#003399';
const KAI_ORANGE = '#ff6600';
const KAI_BLUE_DARK = '#002277';

/* ── SVG icons untuk benefit cards (Lentera style) ── */
const IconThumbUp = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
);
const IconHandshake = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
        <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3.07 0L12 11l.06.5a2.13 2.13 0 0 0 3.07 0h0a2.13 2.13 0 0 0 0-3L12 5.36z"/>
    </svg>
);
const IconCertificate = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8h10M7 12h6"/>
    </svg>
);

/* ── Blob shape seperti Lentera ── */
const BlobIcon = ({ color, children }) => (
    <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 28px' }}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path fill={color}
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.6,-1.4C85.2,13.6,77.7,27.1,68.6,38.9C59.5,50.7,48.7,60.7,36.2,67.2C23.7,73.7,9.4,76.6,-4.5,75.7C-18.5,74.8,-32.1,70,-45.1,63C-58.2,56,-70.6,46.7,-77.4,34.3C-84.1,22,-85.2,6.5,-82.3,-7.8C-79.4,-22.1,-72.4,-35.1,-63,-46.2C-53.6,-57.3,-41.9,-66.5,-29.1,-74.7C-16.4,-83,-8.2,-90.4,3.8,-96.6C15.7,-102.8,30.5,-83.6,44.7,-76.4Z"
                transform="translate(100 100) scale(0.85)"
            />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
        </div>
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('beranda');
    const [scrolled, setScrolled] = useState(false);
    const [openCategory, setOpenCategory] = useState(null);
    const [openQuestion, setOpenQuestion] = useState(null);

    const berandaRef = useRef(null);
    const tentangRef = useRef(null);
    const caraDaftarRef = useRef(null);
    const faqRef = useRef(null);

    const scrollToSection = (ref, sectionName) => {
        setActiveSection(sectionName);
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCekKuota = () => {
        Swal.fire({
            title: 'Akses Terbatas',
            text: 'Silakan Masuk (Login) atau Daftar akun terlebih dahulu untuk melihat rincian ketersediaan kuota unit magang.',
            icon: 'info',
            confirmButtonColor: KAI_BLUE,
            confirmButtonText: 'Menuju Halaman Login'
        }).then(() => { navigate('/login'); });
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observerOptions = { root: null, rootMargin: '-80px 0px 0px 0px', threshold: 0.4 };
        const observerCallback = (entries) => {
            entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const sections = [berandaRef, tentangRef, caraDaftarRef, faqRef];
        sections.forEach((ref) => { if (ref.current) observer.observe(ref.current); });
        return () => { sections.forEach((ref) => { if (ref.current) observer.unobserve(ref.current); }); };
    }, []);

    const getLinkStyle = (sectionName) => ({
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: activeSection === sectionName ? '700' : '500',
        color: activeSection === sectionName ? KAI_ORANGE : '#374151',
        paddingBottom: '4px',
        borderBottom: activeSection === sectionName ? `2px solid ${KAI_ORANGE}` : '2px solid transparent',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    });

        /* ── Benefit cards — KAI palette ── */
    const benefits = [
        {
            accent: KAI_BLUE,
            accentDark: KAI_BLUE_DARK,
            icon: <IconThumbUp />,
            title: 'Pengembangan',
            desc: 'Tingkatkan hard skill & soft skill secara nyata untuk membentuk diri sebagai tenaga profesional yang siap bersaing di industri perkeretaapian.',
        },
        {
            accent: '#0055cc',
            accentDark: KAI_BLUE,
            icon: <IconHandshake />,
            title: 'Pengalaman',
            desc: 'Kenali budaya kerja dan nilai-nilai Perusahaan secara langsung serta bangun jaringan profesional bersama insan KAI Daop 6 Yogyakarta.',
        },
        {
            accent: KAI_ORANGE,
            accentDark: '#cc5200',
            icon: <IconCertificate />,
            title: 'Sertifikat',
            desc: 'Peroleh sertifikat kelulusan magang resmi dalam bentuk hardfile & softfile dengan format penilaian yang sesuai standar institusi pendidikan Anda.',
        },
    ];
    /* ── Timeline alur pendaftaran ── */
    const phases = [
        {
            phase: 'Tahap 1',
            title: 'Registrasi Akun',
            color: KAI_BLUE,
            steps: [
                { n: 1, text: 'Buka halaman web dan pilih menu "Daftar Akun".' },
                { n: 2, text: 'Isi form: Nama Lengkap, Email, Password, NIM/NIS, dan Asal Instansi.' },
                { n: 3, text: 'Akun berhasil dibuat dan siap digunakan.' },
            ]
        },
        {
            phase: 'Tahap 2',
            title: 'Pengajuan Magang / PKL',
            color: KAI_ORANGE,
            steps: [
                { n: 4, text: 'Login menggunakan Email dan Password yang sudah didaftarkan.' },
                { n: 5, text: 'Di dashboard, pilih menu untuk membuat pengajuan baru.' },
                { n: 6, text: 'Isi detail: jenis kegiatan, unit penempatan, judul project, kategori individu/kelompok, nama dosen/guru pembimbing, dan periode pelaksanaan.' },
                { n: 7, text: 'Unggah dokumen wajib: Surat Pengantar Kampus/Sekolah, Proposal, KTP, dll.' },
                { n: 8, text: 'Kirim pengajuan — status berubah menjadi "Menunggu Verifikasi".' },
            ]
        },
        {
            phase: 'Tahap 3',
            title: 'Pemantauan & Tindak Lanjut',
            color: KAI_BLUE,
            steps: [
                { n: 9, text: 'Login secara berkala untuk memantau perubahan status pengajuan Anda.' },
                { n: 10, text: 'Jika ada berkas kurang, admin akan memberi catatan dan Anda dapat mengunggah ulang dokumen.' },
            ]
        },
        {
            phase: 'Tahap 4',
            title: 'Finalisasi & Pelaksanaan',
            color: KAI_ORANGE,
            steps: [
                { n: 11, text: 'Jika diterima, status berubah "Selesai (Surat Dirilis)" — unduh Surat Balasan dari sistem.' },
                { n: 12, text: 'Pada tanggal mulai, status otomatis berubah menjadi "Dalam Masa Kegiatan".' },
                { n: 13, text: 'Setelah selesai, status berubah "Selesai Kegiatan" dan data masuk ke Arsip KAI Daop 6 Yogyakarta.' },
            ]
        },
    ];

    const faqData = [
        {
            category: 'Cara Mendaftar',
            questions: [
                {
                    q: 'Bagaimana cara saya mendaftarkan diri?',
                    a: (
                        <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.85' }}>
                            <li>Buka halaman ini dan klik tombol <strong>Daftar Sekarang</strong>.</li>
                            <li>Isi form pendaftaran dengan data diri yang benar dan lengkap.</li>
                            <li>Lengkapi berkas pengajuan (proposal, surat pengantar, KTP/KTM).</li>
                            <li>Pilih unit dan jenis pengajuan magang yang diinginkan.</li>
                            <li>Pantau status pengajuan melalui dashboard sistem.</li>
                        </ol>
                    )
                },
                {
                    q: 'Siapa saja yang dapat mendaftar program magang KAI Daop 6 Yogyakarta?',
                    a: 'Program magang terbuka untuk mahasiswa aktif D3/D4/S1, siswa SMK/sederajat, serta fresh graduate (maksimal 1 tahun setelah kelulusan) dari berbagai jurusan yang relevan.'
                },
            ]
        },
        {
            category: 'Syarat',
            questions: [
                {
                    q: 'Apa saja berkas yang perlu disiapkan?',
                    a: (
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.85' }}>
                            <li>Surat pengantar resmi dari kampus/sekolah</li>
                            <li>Proposal rencana magang</li>
                            <li>KTP / Kartu Tanda Mahasiswa (KTM)</li>
                            <li>CV / Daftar Riwayat Hidup</li>
                            <li>Transkrip nilai terakhir</li>
                        </ul>
                    )
                },
                {
                    q: 'Apakah ada batasan jurusan untuk mendaftar?',
                    a: 'Tidak ada batasan ketat, namun peserta diutamakan dari jurusan yang relevan dengan unit kerja yang dituju. Silakan cek ketersediaan kuota per unit melalui fitur Cek Kuota.'
                },
                {
                    q: 'Apakah pendaftaran dipungut biaya?',
                    a: 'Tidak. Seluruh proses pendaftaran dan pelaksanaan magang di KAI Daop 6 Yogyakarta 100% bebas dari pungutan biaya apapun.'
                },
            ]
        },
        {
            category: 'Kewajiban Peserta Magang',
            questions: [
                {
                    q: 'Apa saja kewajiban peserta selama magang?',
                    a: (
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.85' }}>
                            <li>Menaati tata tertib dan peraturan yang berlaku di lingkungan KAI Daop 6 Yogyakarta.</li>
                            <li>Hadir tepat waktu sesuai jadwal yang telah ditentukan.</li>
                            <li>Mengisi laporan kinerja harian melalui sistem secara rutin.</li>
                            <li>Berpakaian rapi dan sopan sesuai ketentuan instansi.</li>
                            <li>Menjaga kerahasiaan data dan informasi internal perusahaan.</li>
                        </ul>
                    )
                },
                {
                    q: 'Berapa lama durasi magang yang berlaku?',
                    a: 'Durasi magang bervariasi mulai dari 1 bulan hingga 3 bulan, tergantung kebutuhan dari pihak universitas/sekolah serta ketersediaan kuota unit kerja yang dipilih.'
                },
            ]
        },
    ];

    const toggleCategory = (i) => { setOpenCategory(openCategory === i ? null : i); setOpenQuestion(null); };
    const toggleQuestion = (key) => { setOpenQuestion(openQuestion === key ? null : key); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: '#f8fafd', color: '#111827' }}>

            {/* ─── NAVBAR ─── */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 48px', height: '68px', backgroundColor: '#ffffff',
                boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.10)' : '0 1px 0 #e5e7eb',
                position: 'sticky', top: 0, zIndex: 100, transition: 'box-shadow 0.3s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => scrollToSection(berandaRef, 'beranda')}>
                    <img src="/logo-kai.png" alt="KAI Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: KAI_BLUE, lineHeight: 1.2 }}>KAI Daop 6 Yogyakarta</div>
                        <div style={{ fontSize: '10px', color: KAI_ORANGE, lineHeight: 1.3, fontWeight: '600' }}>Portal Magang Resmi</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                    <span style={getLinkStyle('beranda')} onClick={() => scrollToSection(berandaRef, 'beranda')}>Beranda</span>
                    <span style={getLinkStyle('tentang')} onClick={() => scrollToSection(tentangRef, 'tentang')}>Tentang</span>
                    <span style={getLinkStyle('caradaftar')} onClick={() => scrollToSection(caraDaftarRef, 'caradaftar')}>Cara Mendaftar</span>
                    <span style={{ ...getLinkStyle(''), color: '#374151', fontWeight: '500' }} onClick={handleCekKuota}>Cek Kuota</span>
                    <span style={getLinkStyle('faq')} onClick={() => scrollToSection(faqRef, 'faq')}>FAQ</span>
                </div>

                <button onClick={() => navigate('/login')} style={{ backgroundColor: KAI_ORANGE, color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 3px 10px rgba(255,102,0,0.3)' }}>
                    Masuk
                </button>
            </nav>

            {/* ─── HERO ─── */}
            <section id="beranda" ref={berandaRef} style={{ minHeight: '90vh', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', scrollMarginTop: '68px', overflow: 'hidden', padding: '80px 48px 0' }}>
                <img src="/fotokai.jpeg" alt="Kantor KAI Daop 6 Yogyakarta" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(0,20,80,0.88) 0%, rgba(0,51,153,0.78) 55%, rgba(0,15,55,0.90) 100%)', zIndex: 1 }} />

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '820px', color: 'white' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,102,0,0.20)', border: '1px solid rgba(255,102,0,0.45)', borderRadius: '100px', padding: '6px 18px', fontSize: '12px', fontWeight: '600', marginBottom: '28px', letterSpacing: '0.5px', color: '#ffcc99' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: KAI_ORANGE, display: 'inline-block' }} />
                        PT Kereta Api Indonesia (Persero) — Daop 6 Yogyakarta
                    </div>
                    <h1 style={{ fontSize: '50px', fontWeight: '800', margin: '0 0 20px', lineHeight: '1.15', letterSpacing: '-1px' }}>
                        Sistem Manajemen Magang<br /><span style={{ color: '#ffaa55' }}>KAI Daop 6 Yogyakarta</span>
                    </h1>
                    <p style={{ fontSize: '17px', opacity: 0.88, maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.75' }}>
                        Portal resmi pendaftaran dan pengelolaan Program Magang, Praktik Kerja Lapangan (PKL), dan Riset bagi mahasiswa dan siswa SMK/sederajat.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '72px' }}>
                        <button onClick={() => navigate('/login')} style={{ backgroundColor: KAI_ORANGE, color: 'white', border: 'none', padding: '15px 36px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', boxShadow: '0 6px 20px rgba(255,102,0,0.45)' }}>Daftar Sekarang →</button>
                        <button onClick={handleCekKuota} style={{ backgroundColor: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.55)', padding: '13px 34px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>Cek Kuota Tersedia</button>
                    </div>
                </div>
            </section>

                        <section id="tentang" ref={tentangRef} style={{ padding: '80px 48px', backgroundColor: '#ffffff', scrollMarginTop: '68px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    {/* ✨ Header ala FAQ ✨ */}
                    <div style={{ marginBottom: '56px' }}>
                        <div style={{ width: '48px', height: '4px', background: KAI_ORANGE, borderRadius: '2px', marginBottom: '18px' }} />
                        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', margin: '0 0 14px', lineHeight: 1.25 }}>
                            <span style={{ fontWeight: '900' }}>Kenapa Magang</span> di KAI Daop 6<br />Yogyakarta?
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '640px', margin: 0, lineHeight: '1.7' }}>
                            Bergabunglah dan rasakan manfaat nyata yang akan membentuk Anda menjadi tenaga profesional di industri perkeretaapian Indonesia.
                        </p>
                    </div>

                    {/* ✨ BENEFIT CARDS — modern design ✨ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {benefits.map((b, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    background: '#ffffff', 
                                    borderRadius: '20px', 
                                    padding: '40px 32px 36px', 
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
                                    border: '1px solid #f0f4ff', 
                                    transition: 'all 0.35s', 
                                    cursor: 'default',
                                    minHeight: '320px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(-8px)'; 
                                    e.currentTarget.style.boxShadow = `0 18px 36px ${b.accent}25`;
                                    e.currentTarget.style.borderColor = b.accent + '50';
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; 
                                    e.currentTarget.style.borderColor = '#f0f4ff';
                                }}
                            >
                                {/* Giant decorative number di pojok kanan atas */}
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '-30px', 
                                    right: '-12px',
                                    fontSize: '180px', 
                                    fontWeight: '900', 
                                    color: b.accent,
                                    opacity: 0.07, 
                                    lineHeight: 1,
                                    pointerEvents: 'none',
                                    letterSpacing: '-5px'
                                }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                {/* Icon container dengan gradient */}
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: '16px', 
                                    background: `linear-gradient(135deg, ${b.accent} 0%, ${b.accentDark} 100%)`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '24px', 
                                    boxShadow: `0 10px 24px ${b.accent}40`,
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {b.icon}
                                </div>

                                {/* Label kecil */}
                                <div style={{ fontSize: '11px', color: b.accent, fontWeight: '700', letterSpacing: '2px', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                                    BENEFIT · {String(i + 1).padStart(2, '0')}
                                </div>

                                {/* Title */}
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 14px', position: 'relative', zIndex: 1 }}>
                                    {b.title}
                                </h3>

                                {/* Description */}
                                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.75', margin: 0, position: 'relative', zIndex: 1, flex: 1 }}>
                                    {b.desc}
                                </p>

                                {/* Bottom accent bar */}
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    left: 0, 
                                    height: '4px', 
                                    width: '100%',
                                    background: `linear-gradient(90deg, ${b.accent} 0%, ${b.accentDark} 100%)`,
                                    opacity: 0.8
                                }} />
                            </div>
                        ))}
                    </div>

                    {/* ✨ MISSION BANNER ✨ */}
                    <div style={{ marginTop: '40px', background: KAI_BLUE, borderRadius: '16px', padding: '36px 40px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                            <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 10px' }}>Melayani Dengan Sepenuh Hati</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0, lineHeight: '1.7' }}>
                                Kami berkomitmen membentuk generasi penerus yang kompeten, disiplin, dan memiliki integritas tinggi di industri perkeretaapian Indonesia.
                            </p>
                        </div>
                        <button onClick={() => navigate('/login')} style={{ backgroundColor: KAI_ORANGE, color: 'white', border: 'none', padding: '13px 30px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(255,102,0,0.35)' }}>
                            Mulai Daftar →
                        </button>
                    </div>
                </div>
            </section>
            
                        {/* ─── CARA MENDAFTAR — 2x2 Grid Cards ─── */}
            <section id="caradaftar" ref={caraDaftarRef} style={{ padding: '80px 48px', backgroundColor: '#ffffff', scrollMarginTop: '68px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    {/* ✨ Header ala FAQ ✨ */}
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ width: '48px', height: '4px', background: KAI_ORANGE, borderRadius: '2px', marginBottom: '18px' }} />
                        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', margin: '0 0 14px', lineHeight: 1.25 }}>
                            <span style={{ fontWeight: '900' }}>Alur Pendaftaran</span> Magang
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '600px', margin: 0, lineHeight: '1.7' }}>
                            Empat fase mudah untuk memulai program magang di KAI Daop 6 Yogyakarta.
                        </p>
                    </div>

                    {/* ✨ 2x2 GRID CARDS ✨ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        {phases.map((ph, pi) => (
                            <div 
                                key={pi}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    border: '1px solid #f0f4f8',
                                    transition: 'all 0.3s',
                                    cursor: 'default',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(-6px)'; 
                                    e.currentTarget.style.boxShadow = `0 16px 36px ${ph.color}25`;
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                                }}
                            >
                                {/* Colored top band dengan giant number bg */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${ph.color} 0%, ${ph.color}d0 100%)`,
                                    padding: '28px 32px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative giant number */}
                                    <span style={{
                                        position: 'absolute',
                                        top: '-40px',
                                        right: '-15px',
                                        fontSize: '180px',
                                        fontWeight: '900',
                                        color: 'rgba(255,255,255,0.13)',
                                        lineHeight: 1,
                                        pointerEvents: 'none',
                                        letterSpacing: '-5px'
                                    }}>
                                        {pi + 1}
                                    </span>

                                    {/* Decorative circle */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-30px',
                                        left: '-30px',
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.08)',
                                        pointerEvents: 'none'
                                    }} />

                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        {/* Small number badge */}
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            fontWeight: '900',
                                            color: 'white',
                                            backdropFilter: 'blur(4px)',
                                            border: '1px solid rgba(255,255,255,0.3)'
                                        }}>
                                            {pi + 1}
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '4px' }}>
                                                {ph.phase.toUpperCase()}
                                            </div>
                                            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800', margin: 0, lineHeight: 1.25 }}>
                                                {ph.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Steps content - compact */}
                                <div style={{ padding: '20px 28px 24px', flex: 1 }}>
                                    {ph.steps.map((st, si) => (
                                        <div key={si} style={{
                                            display: 'flex',
                                            gap: '14px',
                                            alignItems: 'flex-start',
                                            padding: si === 0 ? '0 0 12px' : '12px 0',
                                            borderTop: si > 0 ? '1px dashed #f0f0f0' : 'none'
                                        }}>
                                            {/* Number badge kecil */}
                                            <span style={{
                                                background: ph.color + '15',
                                                color: ph.color,
                                                fontWeight: '800',
                                                fontSize: '11px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                flexShrink: 0,
                                                minWidth: '30px',
                                                textAlign: 'center',
                                                letterSpacing: '0.5px',
                                                marginTop: '1px'
                                            }}>
                                                {String(st.n).padStart(2, '0')}
                                            </span>
                                            <p style={{ margin: 0, color: '#4b5563', fontSize: '13.5px', lineHeight: '1.65', flex: 1 }}>
                                                {st.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ✨ CTA ✨ */}
                    <div style={{ textAlign: 'center', marginTop: '56px' }}>
                        <button onClick={() => navigate('/login')} style={{ backgroundColor: KAI_ORANGE, color: 'white', border: 'none', padding: '15px 40px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', boxShadow: '0 6px 18px rgba(255,102,0,0.35)' }}>
                            Mulai Pendaftaran Sekarang →
                        </button>
                    </div>
                </div>
            </section>
            {/* ─── FAQ ─── */}
            <section id="faq" ref={faqRef} style={{ padding: '80px 48px', backgroundColor: '#ffffff', scrollMarginTop: '68px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ width: '48px', height: '4px', background: KAI_ORANGE, borderRadius: '2px', marginBottom: '18px' }} />
                        <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1.25 }}>
                            <span style={{ fontWeight: '900' }}>Bingung?</span> Berikut Beberapa<br />Pertanyaan Yang Sering Ditanyakan
                        </h2>
                    </div>

                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        {faqData.map((cat, ci) => (
                            <div key={ci}>
                                <div onClick={() => toggleCategory(ci)} style={{ background: openCategory === ci ? KAI_BLUE : '#091d6d', color: openCategory === ci ? 'white' : '#f0f0f0', padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', userSelect: 'none', transition: 'background 0.2s' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{cat.category}</span>
                                    <span style={{ fontSize: '20px', fontWeight: '300', lineHeight: 1 }}>{openCategory === ci ? '−' : '+'}</span>
                                </div>

                                {openCategory === ci && (
                                    <div>
                                        {cat.questions.map((item, qi) => {
                                            const key = `${ci}-${qi}`;
                                            return (
                                                <div key={qi}>
                                                    <div onClick={() => toggleQuestion(key)} style={{ background: openQuestion === key ? '#d4900a' : '#f5a623', color: '#1a1200', padding: '14px 32px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)', userSelect: 'none', transition: 'background 0.15s' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '500', flex: 1, textAlign: 'center' }}>{item.q}</span>
                                                        <span style={{ fontSize: '14px', opacity: 0.6, flexShrink: 0 }}>{openQuestion === key ? '▲' : '▼'}</span>
                                                    </div>
                                                    {openQuestion === key && (
                                                        <div style={{ padding: '20px 32px 24px', background: '#fefefe', borderBottom: '1px solid #f0f0f0', borderLeft: `4px solid ${KAI_ORANGE}` }}>
                                                            {typeof item.a === 'string' ? <p style={{ margin: 0, color: '#374151', fontSize: '14px', lineHeight: '1.8' }}>{item.a}</p> : item.a}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

                        {/* ─── FOOTER (improved: logo asli + link clickable) ─── */}
            <footer style={{ backgroundColor: KAI_BLUE_DARK, color: 'white', padding: '40px 48px 28px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                {/* ✨ Logo asli (bukan kotak KAI lagi) ✨ */}
                                <img src="/logo-kai.png" alt="KAI Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '8px', padding: '4px' }} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700' }}>KAI Daop 6 Yogyakarta</div>
                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>Portal Magang Resmi</div>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', maxWidth: '280px', lineHeight: '1.6', margin: 0 }}>Sistem manajemen magang resmi PT Kereta Api Indonesia (Persero) Daop 6 Yogyakarta.</p>
                            <br />
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', maxWidth: '280px', lineHeight: '1.6', margin: 0 }}>Created by: Maura Anindita Kirana<br/>Universitas Muhammadiyyah Yogyakarta<br/>kiranamaura351@gmail.com</p>
                        </div>

                        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                            {/* ✨ Navigasi clickable ✨ */}
                            <div>
                                <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '12px', color: KAI_ORANGE }}>Navigasi</p>
                                {[
                                    { label: 'Beranda', action: () => scrollToSection(berandaRef, 'beranda') },
                                    { label: 'Tentang', action: () => scrollToSection(tentangRef, 'tentang') },
                                    { label: 'Cara Mendaftar', action: () => scrollToSection(caraDaftarRef, 'caradaftar') },
                                    { label: 'FAQ', action: () => scrollToSection(faqRef, 'faq') }
                                ].map(item => (
                                    <p 
                                        key={item.label} 
                                        onClick={item.action}
                                        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.color = KAI_ORANGE}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
                                    >
                                        {item.label}
                                    </p>
                                ))}
                            </div>

                            {/* ✨ Akun clickable ✨ */}
                            <div>
                                <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '12px', color: KAI_ORANGE }}>Akun</p>
                                {[
                                    { label: 'Masuk', action: () => navigate('/login') },
                                    { label: 'Daftar', action: () => navigate('/register') },
                                    { label: 'Cek Kuota', action: handleCekKuota }
                                ].map(item => (
                                    <p 
                                        key={item.label} 
                                        onClick={item.action}
                                        style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.color = KAI_ORANGE}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
                                    >
                                        {item.label}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,102,0,0.25)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: 0 }}>&copy; {new Date().getFullYear()} PT Kereta Api Indonesia (Persero) Daop 6 Yogyakarta. All Rights Reserved.</p>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>Sistem Manajemen Magang KAI Daop 6 Yogyakarta</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
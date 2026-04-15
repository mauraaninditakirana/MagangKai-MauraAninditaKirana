import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LandingPage = () => {
    const navigate = useNavigate();
    
    // State untuk melacak bagian mana yang sedang aktif (dilihat)
    const [activeSection, setActiveSection] = useState('beranda');

    // Referensi untuk masing-masing bagian halaman
    const berandaRef = useRef(null);
    const tentangRef = useRef(null);
    const caraDaftarRef = useRef(null);
    const faqRef = useRef(null);

    // Fungsi klik untuk menggulir halaman dengan mulus
    const scrollToSection = (ref, sectionName) => {
        setActiveSection(sectionName);
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Peringatan sebelum dilempar ke Login (Tetap dipertahankan)
    const handleCekKuota = () => {
        Swal.fire({
            title: 'Akses Terbatas',
            text: 'Silakan Masuk (Login) atau Daftar akun terlebih dahulu untuk melihat rincian ketersediaan kuota unit magang.',
            icon: 'info',
            confirmButtonColor: '#003399',
            confirmButtonText: 'Menuju Halaman Login'
        }).then(() => {
            navigate('/login');
        });
    };

    // CCTV untuk mendeteksi bagian halaman mana yang sedang di-scroll
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-80px 0px 0px 0px', // Kompensasi tinggi navbar
            threshold: 0.5, // Memicu perubahan jika 50% bagian sudah terlihat
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Pantau semua bagian halaman
        const sections = [berandaRef, tentangRef, caraDaftarRef, faqRef];
        sections.forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => {
            sections.forEach((ref) => {
                if (ref.current) observer.unobserve(ref.current);
            });
        };
    }, []);

    // Fungsi kecil untuk style menu aktif
    const getLinkStyle = (sectionName) => ({
        ...styles.link,
        color: activeSection === sectionName ? '#ff6600' : '#555',
        fontWeight: activeSection === sectionName ? 'bold' : '500',
        borderBottom: activeSection === sectionName ? '2px solid #ff6600' : '2px solid transparent'
    });

    return (
        <div style={styles.container}>
            {/* NAVBAR */}
            <nav style={styles.navbar}>
                <div style={styles.logoArea} onClick={() => scrollToSection(berandaRef, 'beranda')}>
                    <h2 style={{ margin: 0, color: '#003399', fontSize: '24px' }}>
                        KAI <span style={{ color: '#ff6600' }}>PUSAT</span>
                    </h2>
                </div>
                
                <div style={styles.navLinks}>
                    <span style={getLinkStyle('beranda')} onClick={() => scrollToSection(berandaRef, 'beranda')}>Beranda</span>
                    <span style={getLinkStyle('tentang')} onClick={() => scrollToSection(tentangRef, 'tentang')}>Tentang</span>
                    <span style={getLinkStyle('caradaftar')} onClick={() => scrollToSection(caraDaftarRef, 'caradaftar')}>Cara Mendaftar</span>
                    <span style={{...styles.link, color: '#555'}} onClick={handleCekKuota}>Cek Kuota</span>
                    <span style={getLinkStyle('faq')} onClick={() => scrollToSection(faqRef, 'faq')}>FAQ</span>
                </div>

                <div style={styles.navButtons}>
                    <button onClick={() => navigate('/login')} style={styles.btnLogin}>
                        Masuk
                    </button>
                </div>
            </nav>

            {/* SECTION: BERANDA */}
            <main id="beranda" ref={berandaRef} style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.title}>
                        Sistem Manajemen Magang<br />KAI Pusat
                    </h1>
                    <p style={styles.subtitle}>
                        Selamat Datang di Portal Resmi Pendaftaran dan Pengelolaan<br/>Program Magang, Praktik Kerja Lapangan (PKL), dan Riset.
                    </p>
                    <div style={{ marginTop: '35px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')} style={styles.btnDaftar}>
                            Daftar Sekarang!
                        </button>
                        <button onClick={handleCekKuota} style={styles.btnCekKuota}>
                            Cek Kuota Tersedia
                        </button>
                    </div>
                </div>
                
                <div style={styles.illustrationContainer}>
                    <div style={styles.decorativeCard}>
                        <h3 style={{color: '#003399', margin: 0}}>Melayani Dengan Sepenuh Hati</h3>
                        <p style={{color: '#666', fontSize: '14px', marginTop: '5px'}}>Wujudkan pengalaman dunia kerja profesional bersama kami.</p>
                    </div>
                </div>
            </main>

            {/* SECTION: TENTANG */}
            <section id="tentang" ref={tentangRef} style={{...styles.section, backgroundColor: '#ffffff'}}>
                <h2 style={styles.sectionTitle}>Tentang Program</h2>
                <div style={styles.sectionContent}>
                    <p style={{textAlign: 'center', maxWidth: '800px', lineHeight: '1.8', color: '#666'}}>
                        Program Magang KAI Pusat dirancang untuk memberikan kesempatan bagi mahasiswa dan siswa SMK/sederajat untuk menerapkan ilmu yang diperoleh di bangku sekolah/kuliah ke dalam dunia kerja nyata. 
                        Kami berkomitmen untuk membentuk generasi penerus yang kompeten, disiplin, dan memiliki integritas tinggi di industri perkeretaapian Indonesia.
                    </p>
                </div>
            </section>

            {/* SECTION: CARA MENDAFTAR */}
            <section id="caradaftar" ref={caraDaftarRef} style={{...styles.section, backgroundColor: '#f0f4f8'}}>
                <h2 style={styles.sectionTitle}>Cara Mendaftar</h2>
                <div style={{...styles.sectionContent, display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {/* Langkah 1 */}
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>1</div>
                        <h3 style={{color: '#003399'}}>Buat Akun</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>Klik tombol daftar dan isi data diri Anda dengan lengkap dan benar.</p>
                    </div>
                    {/* Langkah 2 */}
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>2</div>
                        <h3 style={{color: '#003399'}}>Lengkapi Berkas</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>Siapkan proposal, surat pengantar kampus, dan KTP Anda.</p>
                    </div>
                    {/* Langkah 3 */}
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>3</div>
                        <h3 style={{color: '#003399'}}>Pilih Unit</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>Tentukan jenis pengajuan dan unit tujuan magang Anda.</p>
                    </div>
                    {/* Langkah 4 */}
                    <div style={styles.stepCard}>
                        <div style={styles.stepNumber}>4</div>
                        <h3 style={{color: '#003399'}}>Tunggu Verifikasi</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>Pantau status pengajuan Anda melalui dashboard sistem.</p>
                    </div>
                </div>
            </section>

            {/* SECTION: FAQ */}
            <section id="faq" ref={faqRef} style={{...styles.section, backgroundColor: '#ffffff'}}>
                <h2 style={styles.sectionTitle}>Pertanyaan yang Sering Diajukan (FAQ)</h2>
                <div style={{...styles.sectionContent, flexDirection: 'column', maxWidth: '800px', width: '100%'}}>
                    <div style={styles.faqBox}>
                        <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Berapa lama durasi magang dilaksanakan?</h4>
                        <p style={{margin: 0, color: '#666', fontSize: '14px'}}>Durasi magang bervariasi mulai dari 1 bulan hingga 3 bulan, tergantung kebutuhan dari pihak universitas/sekolah dan ketersediaan kuota unit.</p>
                    </div>
                    <div style={styles.faqBox}>
                        <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Apakah pendaftaran magang dipungut biaya?</h4>
                        <p style={{margin: 0, color: '#666', fontSize: '14px'}}>Tidak. Seluruh proses pendaftaran dan pelaksanaan magang di lingkungan KAI Pusat 100% bebas dari pungutan biaya apapun.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{backgroundColor: '#003399', color: 'white', textAlign: 'center', padding: '20px', fontSize: '14px'}}>
                &copy; {new Date().getFullYear()} PT Kereta Api Indonesia (Persero) Pusat. All Rights Reserved.
            </footer>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8f9fa' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', backgroundColor: '#ffffff', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 },
    logoArea: { cursor: 'pointer' },
    navLinks: { display: 'flex', gap: '30px', fontSize: '15px', alignItems: 'center' },
    link: { cursor: 'pointer', transition: '0.2s', paddingBottom: '5px' },
    btnLogin: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: '0.3s', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)' },
    
    // Beranda Styles
    hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #003399 0%, #0055ff 100%)', color: 'white', textAlign: 'center', padding: '60px 20px', position: 'relative', overflow: 'hidden', scrollMarginTop: '70px' },
    heroContent: { zIndex: 2, maxWidth: '800px' },
    title: { fontSize: '48px', fontWeight: '800', margin: '0 0 20px 0', lineHeight: '1.2', letterSpacing: '-1px' },
    subtitle: { fontSize: '18px', lineHeight: '1.6', opacity: '0.9', margin: 0 },
    btnDaftar: { backgroundColor: '#ff6600', color: 'white', border: 'none', padding: '15px 35px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: '0.3s', boxShadow: '0 6px 15px rgba(255, 102, 0, 0.4)' },
    btnCekKuota: { backgroundColor: 'transparent', color: 'white', border: '2px solid white', padding: '13px 35px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: '0.3s', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' } },
    illustrationContainer: { marginTop: '60px', zIndex: 2 },
    decorativeCard: { backgroundColor: '#ffffff', padding: '20px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'inline-block' },

    // General Section Styles
    section: { minHeight: '70vh', padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', scrollMarginTop: '70px' },
    sectionTitle: { color: '#003399', fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' },
    sectionContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' },

    // Cara Daftar Cards
    stepCard: { backgroundColor: '#fff', padding: '30px 20px', borderRadius: '12px', width: '220px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' },
    stepNumber: { backgroundColor: '#ff6600', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 4px 10px rgba(255,102,0,0.3)' },

    // FAQ Box
    faqBox: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff6600', marginBottom: '20px' }
};

export default LandingPage;
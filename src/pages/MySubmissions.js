import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import TabelPengajuan from '../components/TabelPengajuan';
import NotificationBell from '../components/NotificationBell';
import { FilePlus, History, LogOut, User } from 'lucide-react';

const MySubmissions = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(() => {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (!userData) {
            navigate('/');
            return;
        }
        // Auto-enrich kalau sessionStorage lama (belum punya nama_lengkap) — backward compat
        if (!userData.nama_lengkap) {
            axios.get(`http://localhost:5000/api/users/${userData.id}`)
                .then(res => {
                    const fullData = { ...userData, ...res.data };
                    setUserData(fullData);
                    sessionStorage.setItem('user', JSON.stringify(fullData));
                })
                .catch(() => {});
        }
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAjukanJadwal = (submissionId) => {
        Swal.fire({
            title: 'Pilih Jadwal Wawancara',
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <label style="font-weight:bold">Pilih Tanggal & Jam:</label>
                    <input type="datetime-local" id="jadwal" class="swal2-input" style="width: 100%; box-sizing: border-box; margin-left:0">
                    <p style="margin-top: 10px; color: #666; font-size: 12px; line-height:1.4">
                        * Jadwal hanya tersedia pada hari kerja <b>(Senin - Jumat)</b><br/>
                        * Jam operasional: <b>08:00 - 16:00 WIB</b>
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Kirim Jadwal',
            confirmButtonColor: '#ff6600',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const jadwal = document.getElementById('jadwal').value;
                if (!jadwal) return Swal.showValidationMessage('Jadwal wajib diisi!');
                
                const selectedDate = new Date(jadwal);
                const day = selectedDate.getDay();
                const hour = selectedDate.getHours();

                if (day === 0 || day === 6) return Swal.showValidationMessage('Hanya bisa di hari kerja (Senin-Jumat)');
                if (hour < 8 || hour >= 16) return Swal.showValidationMessage('Pilih jam antara 08:00 sampai 16:00');

                return jadwal;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`http://localhost:5000/api/submissions/${submissionId}/ajukan-jadwal`, { 
                    jadwal: result.value 
                }).then(() => {
                    Swal.fire('Berhasil!', 'Jadwal telah dikirim ke Admin Unit.', 'success').then(() => {
                        window.location.reload(); 
                    });
                }).catch(() => {
                    Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim jadwal.', 'error');
                });
            }
        });
    };

    const handleKirimSDM = (submissionId) => {
        Swal.fire({
            title: 'Kirim ke SDM DAOP 6?',
            text: "Pastikan Anda sudah mendownload dan menyimpan Surat Unit. Data akan diteruskan ke SDM DAOP 6.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003399',
            confirmButtonText: 'Ya, Kirim Sekarang'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('status', 'Menunggu Verifikasi SDM');
                formData.append('catatan', 'Mahasiswa meneruskan berkas yang telah disetujui Unit ke SDM DAOP 6.');
                formData.append('admin_id', userData.id);

                axios.put(`http://localhost:5000/api/submissions/${submissionId}/status`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }).then(() => {
                    Swal.fire('Terkirim!', 'Pengajuan Anda sekarang berada di meja SDM DAOP 6.', 'success').then(() => window.location.reload());
                }).catch((err) => {
                    console.error("Error Kirim ke SDM:", err);
                    Swal.fire('Gagal', 'Terjadi kesalahan jaringan atau server.', 'error');
                });
            }
        });
    };

    if (!userData) return null;

    return (
        <div style={styles.container}>
            {/* SIDEBAR (selaras Dashboard) */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h2>
                    <p style={styles.brandSubtitle}>PORTAL MAHASISWA</p>
                </div>

                <div style={styles.sidebarNav}>
                    <div style={styles.navItem} onClick={() => navigate('/dashboard', { state: { activeTab: 'profile' } })}>
                        <div style={styles.navLinkContent}><User size={20}/> <span>Profil Saya</span></div>
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/dashboard', { state: { activeTab: 'pengajuan' } })}>
                        <div style={styles.navLinkContent}><FilePlus size={20}/> <span>Buat Pengajuan</span></div>
                    </div>
                    <div style={styles.navItemActive}>
                        <div style={styles.navLinkContent}><History size={20}/> <span>Riwayat Pengajuan</span></div>
                    </div>
                </div>

                <div style={styles.sidebarFooter} onClick={() => {sessionStorage.clear(); navigate('/');}}>
                    <div style={styles.logoutBtn}><LogOut size={20}/> <span>Keluar Akun</span></div>
                </div>
            </div>

            {/* MAIN */}
            <div style={styles.main}>
                {/* TOP HEADER (sticky) */}
                <div style={styles.topHeader}>
                    <div style={styles.topBarInfo}>
                        <small style={styles.topBarLabel}>LOGIN SEBAGAI</small>
                        <span style={styles.topBarName}>{userData.nama_lengkap} <span style={{color:'#ff6600'}}>• {userData.jenjang || 'Mahasiswa'}</span></span>
                    </div>
                    {userData.id && <NotificationBell userId={userData.id} iconColor="#ff6600" iconSize={22} />}
                </div>

                <div style={styles.contentScroll}>
                    {/* Section header (FAQ-style) */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={styles.accentBar} />
                        <h2 style={styles.sectionTitle}>Riwayat Pengajuan Saya</h2>
                        <p style={styles.sectionDesc}>
                            Halo <b>{userData.nama_lengkap}</b>, pantau status pengajuan & unduh surat balasan di sini.
                        </p>
                    </div>
                    <TabelPengajuan userId={userData.id} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },

    // SIDEBAR
    sidebar: { width: '280px', backgroundColor: '#052278', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    sidebarBrand: { padding: '30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' },
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold', letterSpacing: '1px' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'default', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },

    // MAIN & TOP HEADER
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    topBarInfo: { display: 'flex', flexDirection: 'column' },
    topBarLabel: { fontSize: '11px', color: '#888', fontWeight: 'bold', letterSpacing: '1px' },
    topBarName: { fontSize: '14px', color: '#003399', fontWeight: 'bold', marginTop: '2px' },
    contentScroll: { padding: '40px', flex: 1 },

    // SECTION HEADER
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' }
};

export default MySubmissions;
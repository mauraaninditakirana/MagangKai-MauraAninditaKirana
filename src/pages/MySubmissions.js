import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import TabelPengajuan from '../components/TabelPengajuan';
import { FilePlus, History, LogOut, User } from 'lucide-react';

const MySubmissions = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        setUserData(JSON.parse(storedUser));
        window.scrollTo(0, 0);
    }, [navigate]);

    // ✨ FUNGSI AJUKAN JADWAL WAWANCARA ✨
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
            title: 'Kirim ke SDM Pusat?',
            text: "Pastikan Anda sudah mendownload dan menyimpan Surat Unit. Data akan diteruskan ke KAI Pusat.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#003399',
            confirmButtonText: 'Ya, Kirim Sekarang'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('status', 'Menunggu Verifikasi SDM');
                formData.append('catatan', 'Mahasiswa meneruskan berkas yang telah disetujui Unit ke SDM Pusat.');
                formData.append('admin_id', userData.id);

                axios.put(`http://localhost:5000/api/submissions/${submissionId}/status`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }).then(() => {
                    Swal.fire('Terkirim!', 'Pengajuan Anda sekarang berada di meja SDM Pusat.', 'success').then(() => window.location.reload());
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
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h3>
                    <small style={{opacity:0.7}}>Portal Mahasiswa</small>
                </div>
                
                <div style={styles.menuItem} onClick={() => navigate('/dashboard', { state: { activeTab: 'profile' } })}>
                    <User size={18}/> Profil Saya
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/dashboard', { state: { activeTab: 'pengajuan' } })}>
                    <FilePlus size={18}/> Buat Pengajuan
                </div>

                <div style={styles.menuActive}>
                    <History size={18}/> Riwayat Pengajuan
                </div>

                <div style={styles.logout} onClick={() => {sessionStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            <div style={styles.main}>
                <div style={styles.headerArea}>
                    <h2 style={{color:'#003399', margin: 0}}>Riwayat Pengajuan Saya</h2>
                    <p style={{color:'#666', marginTop: '5px'}}>
                        Halo {userData.nama_lengkap}, pantau status dan unduh surat balasan di sini.
                    </p>
                </div>
                <TabelPengajuan userId={userData.id} onAjukanJadwal={handleAjukanJadwal} onKirimSDM={handleKirimSDM} />
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#083182', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', boxSizing: 'border-box', zIndex: 100 },
    main: { flex: 1, padding: '40px', overflowY: 'auto', marginLeft: '260px', minHeight: '100vh', boxSizing: 'border-box' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'default' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    headerArea: { marginBottom: '30px' }
};

export default MySubmissions;
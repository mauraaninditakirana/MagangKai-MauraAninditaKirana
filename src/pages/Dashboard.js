import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormPengajuan from '../components/FormPengajuan';
import { FilePlus, History, LogOut, AlertTriangle, CheckCircle, User } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [activeSubmission, setActiveSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        
        // Cek status pengajuan user
        checkUserStatus(parsedUser.id);
        
        window.scrollTo(0, 0);
    }, [navigate]);

    const checkUserStatus = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?user_id=${userId}`);
            const submissions = res.data || [];
            
            // Logika Pengecekan: Cari pengajuan yang masih aktif/berjalan
            const active = submissions.find(s => {
                // Kondisi 1: Masih dalam proses seleksi/verifikasi
                if (s.status === 'Menunggu Verifikasi' || s.status === 'Ditinjau Unit' || s.status === 'Disetujui Unit') {
                    return true;
                }
                
                // Kondisi 2: Sudah dirilis (sedang magang), TAPI tanggal selesai belum lewat
                if (s.status === 'Selesai (Surat Dirilis)') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset jam agar akurat bandingkan tanggal saja
                    const endDate = new Date(s.tanggal_selesai);
                    
                    if (endDate >= today) {
                        return true;
                    }
                }
                
                return false;
            });

            setActiveSubmission(active);
        } catch (error) {
            console.error("Gagal mengecek status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData || isLoading) return null; // Bisa diganti dengan spinner loading jika mau

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h3>
                    <small style={{opacity:0.7}}>Portal Mahasiswa</small>
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/profile')}>
                    <User size={18}/> Profil Saya
                </div>

                <div style={styles.menuActive}>
                    <FilePlus size={18}/> Buat Pengajuan
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/riwayat')}>
                    <History size={18}/> Riwayat Pengajuan
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                <div style={styles.headerArea}>
                    <h2 style={{color:'#003399', marginBottom: '5px'}}>Halo, {userData.nama_lengkap || userData.nama}! 👋</h2>
                    <p style={{color:'#666', margin: 0}}>Silakan isi form di bawah ini untuk mengajukan kegiatan.</p>
                </div>
                
                {/* SISTEM KUNCI FORM  */}
                {activeSubmission ? (
                    <div style={styles.alertCard}>
                        {activeSubmission.status === 'Selesai (Surat Dirilis)' ? (
                            <>
                                <CheckCircle size={40} color="#27ae60" style={{marginBottom: '15px'}} />
                                <h3 style={{color: '#27ae60', margin: '0 0 10px 0'}}>Anda Sedang Menjalani Kegiatan Magang</h3>
                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                    Sistem mendeteksi bahwa Anda sedang aktif melaksanakan <b>{activeSubmission.nama_jenis}</b> di <b>{activeSubmission.nama_unit}</b> hingga tanggal <b>{new Date(activeSubmission.tanggal_selesai).toLocaleDateString('id-ID')}</b>. 
                                    <br/><br/>Anda baru dapat mengajukan permohonan baru setelah periode kegiatan saat ini berakhir.
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={40} color="#f39c12" style={{marginBottom: '15px'}} />
                                <h3 style={{color: '#d35400', margin: '0 0 10px 0'}}>Pengajuan Anda Sedang Diproses</h3>
                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                    Anda sudah memiliki pengajuan <b>{activeSubmission.nama_jenis}</b> yang saat ini berstatus: <br/>
                                    <span style={styles.badgeWarning}>{activeSubmission.status}</span>
                                    <br/><br/>Mohon tunggu hingga proses ini selesai atau ditolak sebelum membuat pengajuan baru. Anda dapat mengecek status lengkapnya di menu Riwayat.
                                </p>
                            </>
                        )}
                        <button style={styles.btnRiwayat} onClick={() => navigate('/riwayat')}>
                            Cek Riwayat Pengajuan
                        </button>
                    </div>
                ) : (
                    // Jika tidak ada kegiatan aktif, tampilkan Form
                    <div style={styles.formContainer}>
                        <FormPengajuan 
                            userId={userData.id} 
                            onDocsUploaded={() => navigate('/riwayat')} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#083182', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    headerArea: { marginBottom: '30px' },
    formContainer: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    
    
    alertCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', borderTop: '5px solid #f39c12' },
    badgeWarning: { display: 'inline-block', backgroundColor: '#fff3cd', color: '#856404', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', marginTop: '10px' },
    btnRiwayat: { marginTop: '25px', backgroundColor: '#003399', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s' }
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabelPengajuan from '../components/TabelPengajuan';
import { FilePlus, History, LogOut, User } from 'lucide-react';

const MySubmissions = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        setUserData(JSON.parse(storedUser));
        
        // Memastikan scroll kembali ke atas saat navigasi
        window.scrollTo(0, 0);
    }, [navigate]);

    const handleDownloadSurat = (id) => {
        window.open(`http://localhost:5000/api/submissions/${id}/download-final`, '_blank');
    };
    if (!userData) return null;

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
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

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>
            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                <div style={styles.headerArea}>
                    <h2 style={{color:'#003399', margin: 0}}>Riwayat Pengajuan Saya 📂</h2>
                    <p style={{color:'#666', marginTop: '5px'}}>
                        Halo {userData.nama_lengkap || userData.nama}, pantau status dan unduh surat balasan di sini.
                    </p>
                </div>
                
                <TabelPengajuan userId={userData.id} />
            </div>
        </div>
    );
};


const styles = {
    // LAYOUT DASAR
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#083182', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', position: 'fixed', top: 0, left: 0, height: '100vh', boxSizing: 'border-box', zIndex: 100 },
    main: { flex: 1, padding: '40px', overflowY: 'auto', marginLeft: '260px', minHeight: '100vh', boxSizing: 'border-box' },
    
    // SIDEBAR & LAINNYA
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'default' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    headerArea: { marginBottom: '30px' }
};

export default MySubmissions;
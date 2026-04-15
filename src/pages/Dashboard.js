import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormPengajuan from '../components/FormPengajuan';
import { FilePlus, History, LogOut } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        setUserData(JSON.parse(storedUser));
        
        // Memastikan halaman mulai dari atas saat dibuka
        window.scrollTo(0, 0);
    }, [navigate]);

    if (!userData) return null;

    return (
        <div style={styles.container}>
            {/* SIDEBAR USER - SEKARANG STICKY & TIDAK IKUT SCROLL */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h3>
                    <small style={{opacity:0.7}}>Portal Mahasiswa</small>
                </div>
                
                {/* Menu Buat Pengajuan (Aktif) */}
                <div style={styles.menuActive}>
                    <FilePlus size={18}/> Buat Pengajuan
                </div>

                {/* Menu Riwayat (Tidak Aktif) */}
                <div style={styles.menuItem} onClick={() => navigate('/riwayat')}>
                    <History size={18}/> Riwayat Pengajuan
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            {/* KONTEN UTAMA - AREA INI YANG BISA DI-SCROLL */}
            <div style={styles.main}>
                <div style={styles.headerArea}>
                    <h2 style={{color:'#003399', marginBottom: '5px'}}>Halo, {userData.nama_lengkap || userData.nama}! 👋</h2>
                    <p style={{color:'#666', margin: 0}}>Silakan isi form di bawah ini untuk mengajukan kegiatan.</p>
                </div>
                
                <div style={styles.formContainer}>
                    <FormPengajuan 
                        userId={userData.id} 
                        onDocsUploaded={() => navigate('/riwayat')} 
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#f0f4f8',
        fontFamily: 'sans-serif'
    },
    sidebar: { 
        width: '260px', 
        backgroundColor: '#083182', 
        color: '#fff', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        // Sidebar
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box'
    },
    logoArea: { 
        marginBottom: '40px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        paddingBottom: '20px' 
    },
    menuActive: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '15px', 
        backgroundColor: '#ff6600', 
        borderRadius: '12px', 
        fontWeight: 'bold', 
        fontSize: '14px', 
        color: '#fff', 
        marginBottom: '10px' 
    },
    menuItem: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '15px', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontSize: '14px', 
        color: '#ccc', 
        marginBottom: '10px', 
        transition: '0.3s' 
    },
    logout: { 
        marginTop: 'auto', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '15px', 
        cursor: 'pointer', 
        color: '#ffaaaa', 
        fontSize: '14px',
        fontWeight: 'bold'
    },
    main: { 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto' // Menjadikan area utama bisa di-scroll
    },
    headerArea: {
        marginBottom: '30px'
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    }
};

export default Dashboard;
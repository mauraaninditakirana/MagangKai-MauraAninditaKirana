import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, RefreshCcw, UserCog, Building2, 
    LogOut, ChevronDown, User, Users, Archive
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ active: 0, admins: 0, archive: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'Super Admin' && parsedUser.role !== 'admin' && parsedUser.role !== 'super admin') { 
            navigate('/'); 
            return; 
        }

        fetchStats();
        window.scrollTo(0, 0);
    }, [navigate]); 

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin-stats');
            setStats(res.data);
        } catch (err) { console.error("Gagal ambil stats:", err); }
    };

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                <div style={styles.menuActive}>
                    <LayoutDashboard size={18}/> Dashboard Utama
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/monitoring')}>
                    <RefreshCcw size={18}/> Monitoring Pengajuan
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}>
                    <UserCog size={18}/> Manajemen Pengguna
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/units')}>
                    <Building2 size={18}/> Manajemen Unit
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/archive')}>    
                    <FileText size={18}/> Arsip Data Peserta
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar Sistem
                </div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                {/* HEADER ATAS */}
                <div style={styles.topHeader}>
                    <div style={styles.profileTrigger} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <div style={styles.avatar}>{user.nama_lengkap?.charAt(0)}</div>
                        <div style={styles.profileInfoText}>
                            <span style={styles.profileName}>{user.nama_lengkap}</span>
                            <small style={styles.profileRole}>{user.role}</small>
                        </div>
                        <ChevronDown size={16} color="#666" />
                        
                        {showProfileMenu && (
                            <div style={styles.dropdownBox}>
                                <div style={styles.dropdownItem} onClick={() => navigate('/profile')}>
                                    <User size={14} /> Lihat Profil
                                </div>
                                <div style={{...styles.dropdownItem, color: '#e74c3c'}} onClick={() => {localStorage.clear(); navigate('/');}}>
                                    <LogOut size={14} /> Keluar
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.contentScroll}>
                    <div style={styles.welcomeSection}>
                        <h2 style={{color: '#003399', margin: 0}}>Selamat Datang, {user.nama_lengkap}! 👋</h2>
                        <p style={{color: '#666', marginTop: '5px'}}>Berikut ringkasan statistik sistem hari ini.</p>
                    </div>

                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={{...styles.iconCircle, backgroundColor: '#fff4e5'}}><FileText color="#ff6600"/></div>
                            <div>
                                <h3 style={styles.statNum}>{stats.active}</h3>
                                <p style={styles.statLabel}>Pengajuan Aktif</p>
                            </div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{...styles.iconCircle, backgroundColor: '#e1f7e7'}}><Users color="#27ae60"/></div>
                            <div>
                                <h3 style={styles.statNum}>{stats.admins}</h3>
                                <p style={styles.statLabel}>Total Admin Unit</p>
                            </div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{...styles.iconCircle, backgroundColor: '#e0f0ff'}}><Archive color="#003399"/></div>
                            <div>
                                <h3 style={styles.statNum}>{stats.archive}</h3>
                                <p style={styles.statLabel}>Total Data Archive</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // KUNCI LAYOUT
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    main: { flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    
    // Header
    topHeader: { height: '70px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 5 },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' },
    avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' },
    profileInfoText: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
    profileName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    profileRole: { fontSize: '11px', color: '#888', textTransform: 'capitalize' },
    dropdownBox: { position: 'absolute', top: '50px', right: 0, width: '160px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee', overflow: 'hidden' },
    dropdownItem: { padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', transition: '0.2s', '&:hover': { backgroundColor: '#f8f9fa' } },

    contentScroll: { padding: '40px', flex: 1 },
    
    // Dashboard Styles
    welcomeSection: { marginBottom: '20px' },
    statsGrid: { display: 'flex', gap: '20px', marginTop: '30px' },
    statCard: { flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    iconCircle: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    statNum: { margin: 0, fontSize: '24px', color: '#333' },
    statLabel: { margin: 0, fontSize: '13px', color: '#888' },

    // Sidebar Menu Styles
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' }
};

export default SuperAdminDashboard;
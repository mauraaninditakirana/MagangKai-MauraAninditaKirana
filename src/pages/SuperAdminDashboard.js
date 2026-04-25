import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, RefreshCcw, UserCog, Building2, 
    LogOut, ChevronDown, User, Users, Archive, Edit3, Mail, IdCard, Building, Save, X
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    
    const user = JSON.parse(localStorage.getItem('user')) || {};

    
    const [stats, setStats] = useState({ active: 0, admins: 0, archive: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(user);
    const [formData, setFormData] = useState({
        nama_lengkap: user.nama_lengkap || '', 
        email: user.email || '', 
        nomor_induk: user.nomor_induk || '', 
        password_baru: ''
    });
    const fetchStats = async () => {
    try {
        // Panggil endpoint statistik yang sudah kita sesuaikan di Backend tadi
        const res = await axios.get('http://localhost:5000/api/admin-stats');
        
        // Data 'active' sekarang otomatis hanya menghitung status:
        // 'Disetujui Unit, Menunggu Verifikasi SDM'
        setStats(res.data);
    } catch (err) { 
        console.error("Gagal ambil stats:", err); 
    }};
    // FUNGSI PROFIL
    const fetchProfile = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            setUserData(res.data);
            setFormData({
                nama_lengkap: res.data.nama_lengkap || '',
                email: res.data.email || '',
                nomor_induk: res.data.nomor_induk || '',
                password_baru: ''
            });
        } catch (err) { console.error("Gagal ambil profil:", err); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${userData.id}/profile`, formData);
            Swal.fire('Berhasil!', 'Profil Super Admin diperbarui.', 'success');
            setIsEditing(false);
            
            const updated = { ...userData, ...formData };
            localStorage.setItem('user', JSON.stringify(updated));
            setUserData(updated);
        } catch (err) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
        }
    };

    // EFFECT UNTUK VALIDASI ROLE & STATS
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
        if (parsedUser.id) fetchProfile(parsedUser.id);
        window.scrollTo(0, 0);
    }, [navigate]);

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                <div 
                    style={activeTab === 'dashboard' ? styles.menuActive : styles.menuItem} 
                    onClick={() => setActiveTab('dashboard')}
                >
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
                        {/* ✨ AVATAR DENGAN INISIAL ✨ */}
                        <div style={styles.avatar}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                        <div style={styles.profileInfoText}>
                            <span style={styles.profileName}>{userData.nama_lengkap}</span>
                            <small style={styles.profileRole}>{userData.role}</small>
                        </div>
                        <ChevronDown size={16} color="#666" />
                        
                        {showProfileMenu && (
                            <div style={styles.dropdownBox}>
                                <div style={styles.dropdownItem} onClick={() => {
                                    setActiveTab('profile'); 
                                    setShowProfileMenu(false); 
                                }}>
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
                    {activeTab === 'dashboard' ? (
                        <div style={styles.dashboardView}>
                            <div style={styles.welcomeSection}>
                                <h2 style={{color: '#003399', margin: 0}}>Selamat Datang, {userData.nama_lengkap}! 👋</h2>
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
                    ) : (
                        <div style={styles.profileContainer}>
                            <div style={styles.profileHeader}>
                                <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                                <h2 style={{margin: '10px 0 5px 0', color: '#003399'}}>{userData.nama_lengkap}</h2>
                                <span style={styles.roleBadge}>Super Admin Pusat</span>
                                
                                {!isEditing && (
                                    <button style={styles.btnEditAvatar} onClick={() => setIsEditing(true)}>
                                        <Edit3 size={14} /> Edit Profil & Password
                                    </button>
                                )}
                            </div>

                            {!isEditing ? (
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <Mail size={18} color="#003399" />
                                        <div>
                                            <small style={styles.label}>Email Sistem</small>
                                            <p style={styles.val}>{userData.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <IdCard size={18} color="#003399" />
                                        <div>
                                            <small style={styles.label}>NIPP / Nomor Induk</small>
                                            <p style={styles.val}>{userData.nomor_induk || '-'}</p>
                                        </div>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <Building size={18} color="#003399" />
                                        <div>
                                            <small style={styles.label}>Lokasi Penempatan</small>
                                            <p style={styles.val}>Kantor Pusat (KAI PUSAT)</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Nama Lengkap</label>
                                        <input 
                                            style={styles.input} 
                                            required 
                                            value={formData.nama_lengkap} 
                                            onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} 
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email Sistem</label>
                                        <input 
                                            style={styles.input} 
                                            type="email" 
                                            required 
                                            value={formData.email} 
                                            onChange={e => setFormData({...formData, email: e.target.value})} 
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>NIPP / Nomor Induk</label>
                                        <input 
                                            style={styles.input} 
                                            value={formData.nomor_induk} 
                                            onChange={e => setFormData({...formData, nomor_induk: e.target.value})} 
                                        />
                                    </div>
                                    <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Password Baru</label>
                                        <input 
                                            type="password" 
                                            style={styles.input} 
                                            placeholder="Isi jika ingin ganti" 
                                            value={formData.password_baru}
                                            onChange={e => setFormData({...formData, password_baru: e.target.value})}
                                        />
                                    </div>
                                    <div style={styles.btnArea}>
                                        <button type="button" style={styles.btnCancel} onClick={() => setIsEditing(false)}>
                                            <X size={16}/> Batal
                                        </button>
                                        <button type="submit" style={styles.btnSave}>
                                            <Save size={16}/> Simpan Perubahan
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    main: { flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '70px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 5 },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' },
    avatar: { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px' },
    profileInfoText: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
    profileName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
    profileRole: { fontSize: '11px', color: '#888', textTransform: 'capitalize' },
    dropdownBox: { position: 'absolute', top: '50px', right: 0, width: '160px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee', overflow: 'hidden' },
    dropdownItem: { padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', transition: '0.2s', '&:hover': { backgroundColor: '#f8f9fa' } },
    contentScroll: { padding: '40px', flex: 1 },
    welcomeSection: { marginBottom: '20px' },
    statsGrid: { display: 'flex', gap: '20px', marginTop: '30px' },
    statCard: { flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    iconCircle: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    statNum: { margin: 0, fontSize: '24px', color: '#333' },
    statLabel: { margin: 0, fontSize: '13px', color: '#888' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
    roleBadge: { backgroundColor: '#e1f7e7', color: '#27ae60', padding: '4px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' },
    btnEditAvatar: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' },
    label: { color: '#888', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', backgroundColor: '#fcfcfc' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default SuperAdminDashboard;
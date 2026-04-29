import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, RefreshCcw, UserCog, Building2, 
    LogOut, ChevronDown, User, Users, Archive, Edit3, Mail, IdCard, 
    Building, Save, X, Bell, Search, Briefcase
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [stats, setStats] = useState({ active: 0, admins: 0, archive: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard'); 
    
    // State Dropdown Sidebar
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(true);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);

    const [pesertaAktif, setPesertaAktif] = useState([]);
    const [units, setUnits] = useState([]);
    const [types, setTypes] = useState([]); // State untuk Jenis Kegiatan

    // ✨ STATE UNTUK FILTER PESERTA AKTIF ✨
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterType, setFilterType] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : {};
    });

    const [formData, setFormData] = useState({
        nama_lengkap: userData.nama_lengkap || '', 
        email: userData.email || '', 
        nomor_induk: userData.nomor_induk || '', 
        password_baru: ''
    });

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin-stats?role=superadmin');
            setStats(res.data);
        } catch (err) { console.error("Gagal ambil stats:", err); }
    };

    const fetchPesertaAktif = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            const aktif = (res.data || []).filter(s => s.status === 'Dalam Masa Kegiatan');
            setPesertaAktif(aktif);
        } catch (err) { console.error("Gagal ambil peserta aktif", err); }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data || []);
        } catch (err) { console.error("Gagal ambil unit", err); }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submission-types');
            setTypes(res.data || []);
        } catch (err) { console.error("Gagal ambil jenis kegiatan", err); }
    };

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
        } catch (err) { Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error'); }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { navigate('/'); return; }
        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser.role || '').toLowerCase();
        
        if (role !== 'super admin' && role !== 'admin') { navigate('/'); return; }

        fetchStats();
        fetchPesertaAktif();
        fetchUnits();
        fetchTypes();
        if (parsedUser.id) fetchProfile(parsedUser.id);
        window.scrollTo(0, 0);
    }, [navigate]);

    // ✨ LOGIKA FILTER UNTUK TABEL PESERTA AKTIF ✨
    const filteredPesertaAktif = pesertaAktif.filter(p => {
        const matchName = (p.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchUnit = filterUnit === '' || String(p.unit_id) === String(filterUnit);
        const matchType = filterType === '' || String(p.submission_type_id) === String(filterType);
        return matchName && matchUnit && matchType;
    });

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>DAOP 6</span></h2>
                    <p style={styles.brandSubtitle}>SISTEM MANAJEMEN MAGANG</p>
                </div>

                <div style={styles.sidebarNav}>
                    {/* DROPDOWN 1: DASHBOARD UTAMA */}
                    <div style={styles.navGroup}>
                        <div 
                            style={activeTab === 'dashboard' || activeTab === 'peserta_aktif' ? styles.navItemActive : styles.navItem} 
                            onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                        >
                            <div style={styles.navLinkContent}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard Utama</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isDashboardMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                        </div>
                        
                        {isDashboardMenuOpen && (
                            <div style={styles.dropdownWrapper}>
                                <div 
                                    style={activeTab === 'dashboard' ? styles.dropdownItemActive : styles.dropdownItem} 
                                    onClick={() => setActiveTab('dashboard')}
                                >
                                    <div style={styles.dotIndicator} /> Ringkasan & Pantauan
                                </div>
                                <div 
                                    style={activeTab === 'peserta_aktif' ? styles.dropdownItemActive : styles.dropdownItem} 
                                    onClick={() => setActiveTab('peserta_aktif')}
                                >
                                    <div style={styles.dotIndicator} /> Monitoring Peserta
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DROPDOWN 2: MONITORING PENGAJUAN */}
                    <div style={styles.navGroup}>
                        <div style={styles.navItem} onClick={() => setIsMonitoringMenuOpen(!isMonitoringMenuOpen)}>
                            <div style={styles.navLinkContent}>
                                <RefreshCcw size={20} />
                                <span>Monitoring Pengajuan</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isMonitoringMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                        </div>
                        
                        {isMonitoringMenuOpen && (
                            <div style={styles.dropdownWrapper}>
                                <div style={styles.dropdownItem} onClick={() => navigate('/admin/monitoring', { state: { activeTab: 'monitoring' } })}>
                                    <div style={styles.dotIndicator} /> Monitoring Verifikasi
                                </div>
                                <div style={styles.dropdownItem} onClick={() => navigate('/admin/monitoring', { state: { activeTab: 'requirements' } })}>
                                    <div style={styles.dotIndicator} /> Syarat Dokumen
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/users')}>
                        <div style={styles.navLinkContent}><UserCog size={20} /> <span>Manajemen Pengguna</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/units')}>
                        <div style={styles.navLinkContent}><Building2 size={20} /> <span>Manajemen Unit</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/archive')}>
                        <div style={styles.navLinkContent}><Archive size={20} /> <span>Arsip Data Peserta</span></div>
                    </div>
                </div>

                <div style={styles.sidebarFooter} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <div style={styles.logoutBtn}><LogOut size={20} /> <span>Keluar Akun</span></div>
                </div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.topHeader}>
                    <div style={styles.profileTrigger} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <Bell size={22} color="#ff6600" style={{marginRight: '20px'}} />
                        <div style={styles.avatarSmall}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                        <div style={styles.profileInfoText}>
                            <span style={styles.profileNameSmall}>{userData.nama_lengkap}</span>
                            <small style={styles.profileRoleSmall}>{userData.role}</small>
                        </div>
                        <ChevronDown size={16} color="#666" />
                        
                        {showProfileMenu && (
                            <div style={styles.dropdownBox}>
                                <div style={styles.dropdownBoxItem} onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}>
                                    <User size={14} /> Lihat Profil
                                </div>
                                <div style={{...styles.dropdownBoxItem, color: '#e74c3c'}} onClick={() => {localStorage.clear(); navigate('/');}}>
                                    <LogOut size={14} /> Keluar
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.contentScroll}>
                    {/* TAB: DASHBOARD RINGKASAN */}
                    {activeTab === 'dashboard' && (
                        <div style={styles.dashboardView}>
                            <div style={styles.welcomeSection}>
                                <h2 style={{color: '#003399', margin: 0}}>Selamat Datang, {userData.nama_lengkap}! 👋</h2>
                                <p style={{color: '#666', marginTop: '5px'}}>Berikut ringkasan statistik yang masuk ke Pusat hari ini.</p>
                            </div>

                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={{...styles.iconCircle, backgroundColor: '#fff4e5'}}><FileText color="#ff6600"/></div>
                                    <div><h3 style={styles.statNum}>{stats.active}</h3><p style={styles.statLabel}>Pengajuan ke SDM</p></div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{...styles.iconCircle, backgroundColor: '#e1f7e7'}}><Users color="#27ae60"/></div>
                                    <div><h3 style={styles.statNum}>{stats.admins}</h3><p style={styles.statLabel}>Total Admin Unit</p></div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{...styles.iconCircle, backgroundColor: '#e0f0ff'}}><Archive color="#003399"/></div>
                                    <div><h3 style={styles.statNum}>{stats.archive}</h3><p style={styles.statLabel}>Total Data Archive</p></div>
                                </div>
                            </div>

                            <div style={{marginTop: '40px'}}>
                                <h3 style={{color: '#003399', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px'}}>
                                    Pantauan Unit (Peserta Aktif)
                                </h3>
                                <div style={styles.unitGrid}>
                                    {units.map(unit => {
                                        const activeInUnit = pesertaAktif.filter(p => String(p.unit_id) === String(unit.id)).length;
                                        return (
                                            <div key={unit.id} style={styles.unitCard}>
                                                <div style={styles.unitHeader}>
                                                    <Building size={20} color="#ff6600"/>
                                                    <h4 style={{margin: 0, color: '#333', fontSize: '15px'}}>{unit.nama_unit}</h4>
                                                </div>
                                                <div style={styles.unitBody}>
                                                    <span style={{fontSize: '32px', fontWeight: 'bold', color: activeInUnit > 0 ? '#27ae60' : '#ccc'}}>
                                                        {activeInUnit}
                                                    </span>
                                                    <span style={{color: '#888', fontSize: '13px'}}>Peserta Aktif</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✨ TAB: MONITORING PESERTA AKTIF (DENGAN FILTER) ✨ */}
                    {activeTab === 'peserta_aktif' && (
                        <div style={styles.dashboardView}>
                            <h2 style={{color: '#003399', margin: '0 0 20px 0'}}>Monitoring Peserta Aktif 📋</h2>
                            
                            {/* AREA FILTER */}
                            <div style={styles.filterBar}>
                                <div style={styles.searchBox}>
                                    <Search size={18} color="#003399" />
                                    <input 
                                        placeholder="Cari nama peserta..." 
                                        style={styles.input} 
                                        onChange={e => setSearchTerm(e.target.value)} 
                                        value={searchTerm}
                                    />
                                </div>
                                <div style={styles.selectWrapper}>
                                    <Building2 size={16} color="#003399" />
                                    <select style={styles.select} value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
                                        <option value="">Semua Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                                    </select>
                                </div>
                                <div style={styles.selectWrapper}>
                                    <Briefcase size={16} color="#003399" />
                                    <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                        <option value="">Semua Jenis</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f8f9fa'}}>
                                            <th style={styles.th}>Nama Peserta</th>
                                            <th style={styles.th}>Asal Instansi</th>
                                            <th style={styles.th}>Unit Penempatan</th>
                                            <th style={styles.th}>Jenis Kegiatan</th>
                                            <th style={styles.th}>Periode Kegiatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPesertaAktif.length > 0 ? filteredPesertaAktif.map(p => (
                                            <tr key={p.id}>
                                                <td style={styles.td}><b>{p.nama_lengkap}</b></td>
                                                <td style={styles.td}>{p.asal_instansi}</td>
                                                <td style={styles.td}>{p.nama_unit}</td>
                                                <td style={styles.td}>{p.nama_jenis}</td>
                                                <td style={styles.td}>
                                                    <span style={{color:'#ff6600', fontWeight:'bold'}}>
                                                        {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#888'}}>Belum ada peserta yang sesuai dengan pencarian.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div style={styles.profileContainer}>
                            <div style={styles.landscapeHeader}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
                                    <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h2 style={{margin: '0 0 5px 0', color: '#003399', fontSize: '24px'}}>{userData.nama_lengkap}</h2>
                                        <span style={styles.roleBadgeSDM}>Super Admin Pusat</span>
                                    </div>
                                </div>
                                <div style={styles.notifIconWrapper}>
                                    <Bell size={22} color="#ff6600" />
                                    <span style={styles.notifDot}></span>
                                </div>
                            </div>

                            <hr style={{border: '0.5px solid #eee', margin: '25px 0'}} />

                            {!isEditing ? (
                                <>
                                    <div style={styles.infoGridHorizontal}>
                                        <div style={styles.infoItemHorizontal}>
                                            <Mail size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>Email Sistem</small><p style={styles.valSmall}>{userData.email || '-'}</p></div>
                                        </div>
                                        <div style={styles.infoItemHorizontal}>
                                            <IdCard size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>NIPP / Nomor Induk</small><p style={styles.valSmall}>{userData.nomor_induk || '-'}</p></div>
                                        </div>
                                        <div style={styles.infoItemHorizontal}>
                                            <Building size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>Lokasi Penempatan</small><p style={styles.valSmall}>KAI DAOP 6 (PUSAT)</p></div>
                                        </div>
                                    </div>
                                    <div style={{marginTop: '30px'}}>
                                        <button style={styles.btnEditLandscape} onClick={() => setIsEditing(true)}>
                                            <Edit3 size={16} /> Edit Profil & Password
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleUpdateProfile} style={styles.formLandscape}>
                                    <div style={styles.inputGroupFull}>
                                        <label style={styles.labelForm}>Nama Lengkap</label>
                                        <input style={styles.inputForm} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                                    </div>
                                    <div style={styles.rowForm}>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>Email Sistem</label>
                                            <input style={styles.inputForm} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>NIPP / Nomor Induk</label>
                                            <input style={styles.inputForm} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                        </div>
                                    </div>
                                    <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
                                    <div style={styles.inputGroupFull}>
                                        <label style={styles.labelForm}>Password Baru (Opsional)</label>
                                        <input type="password" style={styles.inputForm} placeholder="Isi jika ingin ganti" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})}/>
                                    </div>
                                    <div style={styles.btnAreaLandscape}>
                                        <button type="button" style={styles.btnCancelLandscape} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                                        <button type="submit" style={styles.btnSaveLandscape}><Save size={16}/> Simpan Perubahan</button>
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
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    sidebar: { width: '280px', backgroundColor: '#052278', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    sidebarBrand: { padding: '30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' },
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navGroup: { marginBottom: '5px' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    dropdownWrapper: { paddingLeft: '20px', marginBottom: '10px', marginTop: '5px' },
    dropdownItem: { padding: '10px 15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' },
    dropdownItemActive: { padding: '10px 15px', fontSize: '13px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
    dotIndicator: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5 },
    avatarSmall: { width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#ff6600', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' },
    profileInfoText: { display: 'flex', flexDirection: 'column', textAlign: 'right', marginLeft: '12px' },
    profileNameSmall: { fontSize: '14px', fontWeight: 'bold', color: '#1b263b' },
    profileRoleSmall: { fontSize: '11px', color: '#778da9' },
    dropdownBox: { position: 'absolute', top: '55px', right: 0, width: '160px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee', overflow: 'hidden' },
    dropdownBoxItem: { padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', transition: '0.2s', cursor: 'pointer' },
    contentScroll: { padding: '40px', flex: 1 },
    dashboardView: { display: 'flex', flexDirection: 'column' },
    welcomeSection: { marginBottom: '20px' },
    statsGrid: { display: 'flex', gap: '20px', marginTop: '30px' },
    statCard: { flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    iconCircle: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    statNum: { margin: 0, fontSize: '24px', color: '#333' },
    statLabel: { margin: 0, fontSize: '13px', color: '#888' },
    unitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    unitCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eee' },
    unitHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    unitBody: { display: 'flex', flexDirection: 'column' },
    
    // FILTER BAR STYLES
    filterBar: { display: 'flex', gap: '15px', marginBottom: '20px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' },
    selectWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', color: '#333', cursor: 'pointer' },

    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', fontSize: '14px', color: '#333' },

    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '900px', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', margin: '0 auto' },
    landscapeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '24px', backgroundColor: '#ff6600', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 20px rgba(255, 102, 0, 0.2)' },
    roleBadgeSDM: { display: 'inline-block', backgroundColor: '#e1f7e7', color: '#27ae60', padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    notifIconWrapper: { position: 'relative', cursor: 'pointer', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '14px' },
    notifDot: { position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', backgroundColor: '#e74c3c', borderRadius: '50%', border: '2px solid #fff' },
    infoGridHorizontal: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItemHorizontal: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '16px', border: '1px solid #f1f3f9' },
    labelSmall: { color: '#778da9', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
    valSmall: { margin: 0, fontWeight: 'bold', color: '#1b263b', fontSize: '16px' },
    btnEditLandscape: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: '#e0e7ff', color: '#4361ee', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    formLandscape: { display: 'flex', flexDirection: 'column', gap: '20px' },
    rowForm: { display: 'flex', gap: '20px' },
    inputGroupFull: { display: 'flex', flexDirection: 'column' },
    inputGroupHalf: { flex: 1, display: 'flex', flexDirection: 'column' },
    labelForm: { color: '#778da9', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' },
    inputForm: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8f9fa' },
    btnAreaLandscape: { display: 'flex', gap: '15px' },
    btnSaveLandscape: { flex: 2, padding: '14px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancelLandscape: { flex: 1, padding: '14px', backgroundColor: '#f1f3f9', color: '#778da9', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' }
};

export default SuperAdminDashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, RefreshCcw, UserCog, Building2, 
    LogOut, ChevronDown, User, Users, Archive, Edit3, Mail, IdCard, 
    Building, Save, X, ChevronRight, ClipboardCheck, PlusCircle, Trash2, Bell
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({ active: 0, admins: 0, archive: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); 
    
    // State untuk Dropdown Sidebar & Data Peserta
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(true);
    const [pesertaAktif, setPesertaAktif] = useState([]);
    
    // State Baru untuk Unit & Syarat Dokumen
    const [units, setUnits] = useState([]);
    const [requirements, setRequirements] = useState([]);

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

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin-stats?role=superadmin');
            setStats(res.data);
        } catch (err) { console.error("Gagal ambil stats:", err); }
    };

    const fetchPesertaAktif = async () => {
    try {
        // Kita ambil semua data pengajuan
        const res = await axios.get('http://localhost:5000/api/submissions');
        
        // Filter khusus yang statusnya "Dalam Masa Kegiatan"
        // Inilah yang akan dihitung masuk ke kotak-kotak unit
        const aktif = (res.data || []).filter(s => s.status === 'Dalam Masa Kegiatan');
        
        setPesertaAktif(aktif);
    } catch (err) { 
        console.error("Gagal ambil peserta aktif", err); 
    }};

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data || []);
        } catch (err) { console.error("Gagal ambil unit", err); }
    };

    const fetchRequirements = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/requirements');
            setRequirements(res.data || []);
        } catch (err) { console.error("Gagal ambil syarat dokumen", err); }
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

    // CRUD SYARAT DOKUMEN
    const handleAddRequirement = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Syarat Dokumen',
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="Nama Dokumen (Contoh: KTP)">
                <select id="swal-input2" class="swal2-select">
                    <option value="1">Wajib</option>
                    <option value="0">Opsional (Tidak Wajib)</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#27ae60',
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                const nama = document.getElementById('swal-input1').value;
                const isWajib = document.getElementById('swal-input2').value;
                if (!nama) Swal.showValidationMessage('Nama dokumen harus diisi');
                return { nama_dokumen: nama, is_wajib: isWajib === "1" };
            }
        });

        if (formValues) {
            try {
                await axios.post('http://localhost:5000/api/requirements', formValues);
                Swal.fire('Berhasil', 'Syarat baru ditambahkan', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal menambah syarat', 'error'); }
        }
    };

    const handleEditRequirement = async (reqItem) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Syarat Dokumen',
            html: `
                <input id="swal-input1" class="swal2-input" value="${reqItem.nama_dokumen}" placeholder="Nama Dokumen">
                <select id="swal-input2" class="swal2-select">
                    <option value="1" ${reqItem.is_wajib ? 'selected' : ''}>Wajib</option>
                    <option value="0" ${!reqItem.is_wajib ? 'selected' : ''}>Opsional (Tidak Wajib)</option>
                </select>
                <select id="swal-input3" class="swal2-select">
                    <option value="1" ${reqItem.is_active ? 'selected' : ''}>Aktif (Tampil di Form)</option>
                    <option value="0" ${!reqItem.is_active ? 'selected' : ''}>Nonaktif (Sembunyikan)</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#003399',
            confirmButtonText: 'Update',
            preConfirm: () => {
                return { 
                    nama_dokumen: document.getElementById('swal-input1').value, 
                    is_wajib: document.getElementById('swal-input2').value === "1",
                    is_active: document.getElementById('swal-input3').value === "1"
                };
            }
        });

        if (formValues) {
            try {
                await axios.put(`http://localhost:5000/api/requirements/${reqItem.id}`, formValues);
                Swal.fire('Berhasil', 'Syarat berhasil diupdate', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal mengupdate syarat', 'error'); }
        }
    };

    const handleDeleteRequirement = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Syarat?',
            text: 'Syarat ini akan dihapus permanen dari form.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/requirements/${id}`);
                Swal.fire('Terhapus!', '', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal menghapus syarat', 'error'); }
        }
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
        fetchRequirements();
        if (parsedUser.id) fetchProfile(parsedUser.id);
        window.scrollTo(0, 0);
    }, [navigate]);

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>DAOP 6</span></h2>
                    <p style={styles.brandSubtitle}>SISTEM MANAJEMEN MAGANG</p>
                </div>

                <div style={styles.sidebarNav}>
                    {/* DROPDOWN GROUP: DASHBOARD */}
                    <div style={styles.navGroup}>
                        <div 
                            style={activeTab === 'dashboard' || activeTab === 'peserta_aktif' ? styles.navItemActive : styles.navItem}
                            onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                        >
                            <div style={styles.navLinkContent}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard Utama</span>
                            </div>
                            <ChevronDown size={16} style={{ 
                                transform: isDashboardMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: '0.3s'
                            }} />
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

                    <div style={styles.navItem} onClick={() => navigate('/admin/monitoring')}>
                        <div style={styles.navLinkContent}><RefreshCcw size={20} /> <span>Monitoring Pengajuan</span></div>
                    </div>

                    <div style={activeTab === 'requirements' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('requirements')}>
                        <div style={styles.navLinkContent}><ClipboardCheck size={20} /> <span>Syarat Dokumen</span></div>
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
                    <div style={styles.logoutBtn}>
                        <LogOut size={20} />
                        <span>Keluar Akun</span>
                    </div>
                </div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.topHeader}>
                    <div style={styles.profileTrigger} onClick={() => setShowProfileMenu(!showProfileMenu)}>
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

                            {/* PANTAUAN UNIT GRID */}
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
                                                <span style={{
                                                    fontSize: '32px', 
                                                    fontWeight: 'bold', 
                                                    color: activeInUnit > 0 ? '#27ae60' : '#ccc'
                                                }}>
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

                    {activeTab === 'peserta_aktif' && (
                        <div style={styles.dashboardView}>
                            <h2 style={{color: '#003399', margin: '0 0 20px 0'}}>Monitoring Peserta Aktif 📋</h2>
                            <div style={{backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f8f9fa'}}>
                                            <th style={styles.th}>Nama Peserta</th>
                                            <th style={styles.th}>Asal Instansi</th>
                                            <th style={styles.th}>Unit Penempatan</th>
                                            <th style={styles.th}>Periode Kegiatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pesertaAktif.length > 0 ? pesertaAktif.map(p => (
                                            <tr key={p.id}>
                                                <td style={styles.td}><b>{p.nama_lengkap}</b></td>
                                                <td style={styles.td}>{p.asal_instansi}</td>
                                                <td style={styles.td}>{p.nama_unit}</td>
                                                <td style={styles.td}>
                                                    <span style={{color:'#ff6600', fontWeight:'bold'}}>
                                                        {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#888'}}>Belum ada peserta yang sedang menjalani masa kegiatan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'requirements' && (
                        <div style={styles.dashboardView}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <div>
                                    <h2 style={{color: '#003399', margin: 0}}>Manajemen Syarat Dokumen 📋</h2>
                                    <p style={{color: '#666', marginTop: '5px', fontSize: '14px'}}>Atur dokumen yang wajib diunggah mahasiswa pada form pendaftaran.</p>
                                </div>
                                <button onClick={handleAddRequirement} style={styles.btnAdd}>
                                    <PlusCircle size={16}/> Tambah Syarat Baru
                                </button>
                            </div>
                            
                            <div style={{backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f8f9fa'}}>
                                            <th style={{...styles.th, width:'50px'}}>No</th>
                                            <th style={styles.th}>Nama Dokumen</th>
                                            <th style={styles.th}>Status Wajib</th>
                                            <th style={styles.th}>Visibilitas (Aktif)</th>
                                            <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requirements.length > 0 ? requirements.map((req, i) => (
                                            <tr key={req.id}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}><b>{req.nama_dokumen}</b></td>
                                                <td style={styles.td}>
                                                    <span style={req.is_wajib ? styles.badgeGreen : styles.badgeGray}>
                                                        {req.is_wajib ? 'Wajib' : 'Opsional'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={req.is_active ? styles.badgeBlue : styles.badgeRed}>
                                                        {req.is_active ? 'Tampil di Form' : 'Disembunyikan'}
                                                    </span>
                                                </td>
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                        <button onClick={() => handleEditRequirement(req)} style={styles.btnActionEdit}><Edit3 size={14}/></button>
                                                        <button onClick={() => handleDeleteRequirement(req.id)} style={styles.btnActionDelete}><Trash2 size={14}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#888'}}>Belum ada syarat dokumen yang ditambahkan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

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
    
    sidebar: { width: '280px', backgroundColor: '#132a71', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    sidebarBrand: { padding: '30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' },
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    
    dropdownWrapper: { paddingLeft: '20px', marginBottom: '10px', marginTop: '5px' },
    dropdownItem: { padding: '10px 15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' },
    dropdownItemActive: { padding: '10px 15px', fontSize: '13px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    dotIndicator: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' },
    
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },

    // AREA UTAMA
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 5 },
    profileTrigger: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' },
    avatarSmall: { width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#ff6600', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    profileInfoText: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
    profileNameSmall: { fontSize: '14px', fontWeight: 'bold', color: '#1b263b' },
    profileRoleSmall: { fontSize: '11px', color: '#778da9' },
    
    dropdownBox: { position: 'absolute', top: '55px', right: 0, width: '160px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #eee', overflow: 'hidden' },
    dropdownBoxItem: { padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', transition: '0.2s', cursor: 'pointer' },

    contentScroll: { padding: '40px', flex: 1 },

    // LANDSCAPE PROFILE
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

    // FORM
    formLandscape: { display: 'flex', flexDirection: 'column', gap: '20px' },
    rowForm: { display: 'flex', gap: '20px' },
    inputGroupFull: { display: 'flex', flexDirection: 'column' },
    inputGroupHalf: { flex: 1, display: 'flex', flexDirection: 'column' },
    labelForm: { color: '#778da9', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' },
    inputForm: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8f9fa' },
    btnAreaLandscape: { display: 'flex', gap: '15px' },
    btnSaveLandscape: { flex: 2, padding: '14px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancelLandscape: { flex: 1, padding: '14px', backgroundColor: '#f1f3f9', color: '#778da9', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' },

    // DASHBOARD VIEWS
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
    btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', fontSize: '14px', color: '#333' },
    badgeGreen: { backgroundColor: '#e1f7e7', color: '#27ae60', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeGray: { backgroundColor: '#f0f0f0', color: '#888', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeBlue: { backgroundColor: '#e0f0ff', color: '#0055cc', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeRed: { backgroundColor: '#ffe6e6', color: '#d33', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    btnActionEdit: { backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #cce0ff', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnActionDelete: { backgroundColor: '#fff0f0', color: '#e74c3c', border: '1px solid #ffcaca', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
};

export default SuperAdminDashboard;
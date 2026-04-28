import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, RefreshCcw, UserCog, Building2, 
    LogOut, ChevronDown, User, Users, Archive, Edit3, Mail, IdCard, 
    Building, Save, X, ChevronRight, ClipboardCheck, PlusCircle, Trash2
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({ active: 0, admins: 0, archive: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); 
    
    // State untuk Dropdown Sidebar & Data Peserta
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(true);
    const [pesertaAktif, setPesertaAktif] = useState([]);
    
    // ✨ State Baru untuk Unit & Syarat Dokumen ✨
    const [units, setUnits] = useState([]);
    const [requirements, setRequirements] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : {};
    });

    const [formData, setFormData] = useState({
        nama_lengkap: userData.nama_lengkap || '', email: userData.email || '', nomor_induk: userData.nomor_induk || '', password_baru: ''
    });

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin-stats?role=superadmin');
            setStats(res.data);
        } catch (err) { console.error("Gagal ambil stats:", err); }
    };

    const fetchPesertaAktif = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions?status=Dalam Masa Kegiatan');
            setPesertaAktif(res.data || []);
        } catch (err) { console.error("Gagal ambil peserta aktif", err); }
    };

    // ✨ FETCH UNITS UNTUK PANTAUAN UNIT ✨
    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data || []);
        } catch (err) { console.error("Gagal ambil unit", err); }
    };

    // ✨ FETCH SYARAT DOKUMEN ✨
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
            setFormData({ nama_lengkap: res.data.nama_lengkap || '', email: res.data.email || '', nomor_induk: res.data.nomor_induk || '', password_baru: '' });
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

    // ✨ CRUD SYARAT DOKUMEN ✨
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
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                <div>
                    <div 
                        style={activeTab === 'dashboard' || activeTab === 'peserta_aktif' ? styles.menuActive : styles.menuItem} 
                        onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}
                    >
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <LayoutDashboard size={18}/> Dashboard Utama
                        </div>
                        {isDashboardMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </div>
                    
                    {isDashboardMenuOpen && (
                        <div style={styles.subMenuContainer}>
                            <div 
                                style={activeTab === 'dashboard' ? styles.subMenuItemActive : styles.subMenuItem}
                                onClick={() => setActiveTab('dashboard')}
                            >
                                Ringkasan & Pantauan Unit
                            </div>
                            <div 
                                style={activeTab === 'peserta_aktif' ? styles.subMenuItemActive : styles.subMenuItem}
                                onClick={() => setActiveTab('peserta_aktif')}
                            >
                                Monitoring Peserta Aktif
                            </div>
                        </div>
                    )}
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/admin/monitoring')}><RefreshCcw size={18}/> Monitoring Pengajuan</div>
                <div style={activeTab === 'requirements' ? styles.menuActive : styles.menuItem} onClick={() => setActiveTab('requirements')}><ClipboardCheck size={18}/> Syarat Dokumen</div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}><UserCog size={18}/> Manajemen Pengguna</div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/units')}><Building2 size={18}/> Manajemen Unit</div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/archive')}><FileText size={18}/> Arsip Data Peserta</div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}><LogOut size={18}/> Keluar Sistem</div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.topHeader}>
                    <div style={styles.profileTrigger} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        <div style={styles.avatar}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                        <div style={styles.profileInfoText}>
                            <span style={styles.profileName}>{userData.nama_lengkap}</span>
                            <small style={styles.profileRole}>{userData.role}</small>
                        </div>
                        <ChevronDown size={16} color="#666" />
                        
                        {showProfileMenu && (
                            <div style={styles.dropdownBox}>
                                <div style={styles.dropdownItem} onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}>
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

                            {/* ✨ PANTAUAN UNIT GRID ✨ */}
                            <div style={{marginTop: '40px'}}>
                                <h3 style={{color: '#003399', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px'}}>
                                    Pantauan Unit (Peserta Aktif)
                                </h3>
                                <div style={styles.unitGrid}>
                                    {units.map(unit => {
                                        // Hitung peserta aktif di unit ini
                                        const activeInUnit = pesertaAktif.filter(p => p.unit_id === unit.id).length;
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

                    {/* ✨ VIEW CRUD SYARAT DOKUMEN ✨ */}
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
                                        <div><small style={styles.label}>Email Sistem</small><p style={styles.val}>{userData.email || '-'}</p></div>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <IdCard size={18} color="#003399" />
                                        <div><small style={styles.label}>NIPP / Nomor Induk</small><p style={styles.val}>{userData.nomor_induk || '-'}</p></div>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <Building size={18} color="#003399" />
                                        <div><small style={styles.label}>Lokasi Penempatan</small><p style={styles.val}>Kantor Pusat (KAI PUSAT)</p></div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdateProfile} style={styles.form}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Nama Lengkap</label>
                                        <input style={styles.input} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email Sistem</label>
                                        <input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>NIPP / Nomor Induk</label>
                                        <input style={styles.input} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                    </div>
                                    <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Password Baru</label>
                                        <input type="password" style={styles.input} placeholder="Isi jika ingin ganti" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})}/>
                                    </div>
                                    <div style={styles.btnArea}>
                                        <button type="button" style={styles.btnCancel} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                                        <button type="submit" style={styles.btnSave}><Save size={16}/> Simpan Perubahan</button>
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
    dropdownItem: { padding: '12px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', transition: '0.2s', cursor: 'pointer', '&:hover': { backgroundColor: '#f8f9fa' } },
    contentScroll: { padding: '40px', flex: 1 },
    welcomeSection: { marginBottom: '20px' },
    statsGrid: { display: 'flex', gap: '20px', marginTop: '30px' },
    statCard: { flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    iconCircle: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    statNum: { margin: 0, fontSize: '24px', color: '#333' },
    statLabel: { margin: 0, fontSize: '13px', color: '#888' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    subMenuContainer: { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px', marginBottom: '15px', padding: '5px 0' },
    subMenuItem: { padding: '12px 15px 12px 45px', color: '#ccc', fontSize: '13px', cursor: 'pointer', transition: '0.3s' },
    subMenuItemActive: { padding: '12px 15px 12px 45px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
    roleBadge: { backgroundColor: '#e1f7e7', color: '#27ae60', padding: '4px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' },
    btnEditAvatar: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' },
    label: { color: '#888', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', fontSize: '14px', color: '#333' },
    
    // Styles Baru
    unitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    unitCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #eee' },
    unitHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    unitBody: { display: 'flex', flexDirection: 'column' },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    badgeGreen: { backgroundColor: '#e1f7e7', color: '#27ae60', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeGray: { backgroundColor: '#f0f0f0', color: '#888', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeBlue: { backgroundColor: '#e0f0ff', color: '#0055cc', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeRed: { backgroundColor: '#ffe6e6', color: '#d33', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    btnActionEdit: { backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #cce0ff', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnActionDelete: { backgroundColor: '#fff0f0', color: '#e74c3c', border: '1px solid #ffcaca', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '10px' },
    btnSave: { flex: 1, padding: '10px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancel: { flex: 1, padding: '10px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default SuperAdminDashboard;
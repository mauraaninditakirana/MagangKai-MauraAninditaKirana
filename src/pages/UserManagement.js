import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    Users, ShieldCheck, Search, LogOut, RefreshCcw,
    LayoutDashboard, UserCog, Building2,
    Plus, Edit, Trash2, ChevronDown, Archive, X
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [units, setUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const navigate = useNavigate();
    
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);

    const currentUser = JSON.parse(sessionStorage.getItem('user')) || {};

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: '', nama_lengkap: '', email: '', password: '', role: 'user', unit_id: '', nomor_induk: '', asal_instansi: ''
    });

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser.role || '').toLowerCase();
        if (role !== 'super admin' && role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUsers();
        fetchUnits();
        window.scrollTo(0, 0);
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users?_t=${Date.now()}`); 
            setUsers(res.data);
        } catch (err) {
            Swal.fire('Error', 'Gagal memuat daftar pengguna', 'error');
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data);
        } catch (err) { console.error("Gagal ambil unit:", err); }
    };

    const handleUpdateRole = async (user, newRole) => {
        if (newRole === 'admin unit') {
            let unitOptions = units.map(u => `<option value="${u.id}">${u.nama_unit}</option>`).join('');

            const { value: selectedUnitId } = await Swal.fire({
                title: 'Tugaskan Admin Unit',
                html: `
                    <div style="text-align:left; font-size:14px; margin-bottom:5px;">Pilih Unit untuk <b>${user.nama_lengkap}</b>:</div>
                    <select id="swal-unit-select" class="swal2-input" style="margin-top:0;">
                        <option value="">-- Pilih Unit Tujuan --</option>
                        ${unitOptions}
                    </select>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonColor: '#f39c12',
                confirmButtonText: 'Jadikan Admin',
                preConfirm: () => {
                    const unitId = document.getElementById('swal-unit-select').value;
                    if (!unitId) Swal.showValidationMessage('Anda harus memilih unit!');
                    return unitId;
                }
            });

            if (selectedUnitId) { executeRoleUpdate(user.id, newRole, selectedUnitId); }
        } else {
            const result = await Swal.fire({
                title: 'Cabut Hak Akses?',
                text: `Akses ${user.nama_lengkap} akan dikembalikan menjadi User biasa.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3498db',
                confirmButtonText: 'Ya, Cabut Akses'
            });

            if (result.isConfirmed) { executeRoleUpdate(user.id, newRole, null); }
        }
    };

    const executeRoleUpdate = async (id, role, unit_id) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${id}/role`, { role, unit_id });
            Swal.fire('Berhasil!', `Akses berhasil diperbarui`, 'success');
            fetchUsers(); 
        } catch (err) { Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui akses', 'error'); }
    };

    const handleAdd = () => {
        setIsEdit(false);
        setFormData({ id: '', nama_lengkap: '', email: '', password: '', role: 'user', unit_id: '', nomor_induk: '', asal_instansi: '' });
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setIsEdit(true);
        setFormData({
            id: user.id,
            nama_lengkap: user.nama_lengkap || '',
            email: user.email || '',
            password: '', 
            role: (user.role || 'user').toLowerCase(), 
            unit_id: user.unit_id || '',
            nomor_induk: user.nomor_induk || '',
            asal_instansi: user.asal_instansi || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/users/${formData.id}`, formData);
                Swal.fire('Berhasil!', 'Data pengguna diperbarui.', 'success');
            } else {
                await axios.post('http://localhost:5000/api/users', formData);
                Swal.fire('Berhasil!', 'Pengguna baru ditambahkan.', 'success');
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) { Swal.fire('Error', 'Gagal menyimpan data.', 'error'); }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Pengguna?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                Swal.fire('Terhapus!', 'Pengguna telah dihapus.', 'success');
                fetchUsers();
            } catch (err) { Swal.fire('Error', 'Gagal menghapus pengguna.', 'error'); }
        }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = (u.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === '' || (u.role || '').toLowerCase() === filterRole.toLowerCase();
        return matchSearch && matchRole;
    });

    const getRoleColor = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'super admin') return '#27ae60';
        if (r === 'admin unit') return '#d35400';
        return '#003399';
    };

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>DAOP 6</span></h2>
                    <p style={styles.brandSubtitle}>SISTEM MANAJEMEN MAGANG</p>
                </div>

                <div style={styles.sidebarNav}>
                    <div style={styles.navGroup}>
                        <div style={styles.navItem} onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}>
                            <div style={styles.navLinkContent}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard Utama</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isDashboardMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                        </div>
                        
                        {isDashboardMenuOpen && (
                            <div style={styles.dropdownWrapper}>
                                <div style={styles.dropdownItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'dashboard' } })}>
                                    <div style={styles.dotIndicator} /> Ringkasan & Pantauan
                                </div>
                                <div style={styles.dropdownItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'peserta_aktif' } })}>
                                    <div style={styles.dotIndicator} /> Monitoring Peserta
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.navGroup}>
                        <div style={styles.navItem} onClick={() => setIsMonitoringMenuOpen(!isMonitoringMenuOpen)}>
                            <div style={styles.navLinkContent}>
                                <RefreshCcw size={20} />
                                <span>Monitoring Pengajuan</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isMonitoringMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s'}} />
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

                    <div style={styles.navItemActive}>
                        <div style={styles.navLinkContent}><UserCog size={20} /> <span>Manajemen Pengguna</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/units')}>
                        <div style={styles.navLinkContent}><Building2 size={20} /> <span>Manajemen Unit</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/archive')}>
                        <div style={styles.navLinkContent}><Archive size={20} /> <span>Arsip Data Peserta</span></div>
                    </div>
                </div>

                <div style={styles.sidebarFooter} onClick={() => {sessionStorage.clear(); navigate('/');}}>
                    <div style={styles.logoutBtn}><LogOut size={20} /> <span>Keluar Akun</span></div>
                </div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.contentScroll}>
                    <div style={{ marginBottom: '28px' }}>
                        <div style={styles.accentBar} />
                        <h2 style={styles.sectionTitle}>Manajemen Pengguna</h2>
                        <p style={styles.sectionDesc}>Atur hak akses dan penempatan unit untuk semua pengguna sistem.</p>
                    </div>
                    {/* Filter bar + tombol tambah (header dihapus, langsung action bar) */}
                    <div style={styles.actionBar}>
                        <div style={styles.searchBox}>
                            <Search size={18} color="#003399" />
                            <input 
                                placeholder="Cari nama pengguna..." 
                                style={styles.input} 
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={styles.selectWrapper}>
                            <ShieldCheck size={16} color="#003399" />
                            <select style={styles.select} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                                <option value="">Semua Role</option>
                                <option value="super admin">Super Admin</option>
                                <option value="admin unit">Admin Unit</option>
                                <option value="user">User (Mahasiswa)</option>
                            </select>
                        </div>
                        <button style={styles.btnAdd} onClick={handleAdd}>
                            <Plus size={16} /> Tambah User
                        </button>
                    </div>

                    {/* Tabel */}
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={{...styles.th, width: '50px'}}>No</th>
                                    <th style={styles.th}>Nama & Email</th>
                                    <th style={styles.th}>Nomor Induk</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={{...styles.th, textAlign:'center', width: '120px'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((u, index) => (
                                    <tr key={u.id} style={styles.tableRow}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}>
                                            <div style={{fontWeight: 'bold', color: '#111827'}}>{u.nama_lengkap}</div>
                                            <div style={{fontSize: '12px', color: '#888', marginTop: '2px'}}>{u.email}</div>
                                        </td>
                                        <td style={styles.td}>{u.nomor_induk || '-'}</td>
                                        <td style={styles.td}>
                                            {/* Role plain text bold colored (no buletan) */}
                                            <span style={{ color: getRoleColor(u.role), fontWeight: 'bold', fontSize: '13px' }}>
                                                {u.role === 'admin unit' && u.nama_unit 
                                                    ? `Admin: ${u.nama_unit}` 
                                                    : (u.role || '').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <div style={{display: 'flex', gap: '6px', justifyContent: 'center'}}>
                                                <button onClick={() => handleEdit(u)} style={styles.btnIconEdit} title="Edit User">
                                                    <Edit size={18} strokeWidth={2}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(u.id)} 
                                                    style={{...styles.btnIconDelete, opacity: u.id === currentUser?.id ? 0.3 : 1, cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer'}} 
                                                    disabled={u.id === currentUser?.id}
                                                    title={u.id === currentUser?.id ? "Tidak bisa hapus diri sendiri" : "Hapus User"}
                                                >
                                                    <Trash2 size={18} strokeWidth={2}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{textAlign:'center', padding:'40px', color: '#aaa'}}>Data pengguna tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL EDIT/TAMBAH — styling diperhalus */}
                {showModal && (
                    <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div style={styles.modalHeader}>
                                <div>
                                    <h3 style={styles.modalTitle}>
                                        {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                    </h3>
                                    <p style={styles.modalSub}>
                                        {isEdit ? 'Perbarui informasi & hak akses pengguna.' : 'Isi data pengguna baru dengan lengkap.'}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={styles.modalClose}>
                                    <X size={18}/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Section 1: Data Akun */}
                                <div style={styles.formSection}>
                                    <div style={styles.sectionLabel}>Data Akun</div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Nama Lengkap</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="Masukkan nama lengkap"
                                            style={styles.formInput} 
                                            value={formData.nama_lengkap} 
                                            onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} 
                                        />
                                    </div>
                                    
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Email (Username)</label>
                                            <input 
                                                required 
                                                type="email" 
                                                placeholder="nama@email.com"
                                                style={styles.formInput} 
                                                value={formData.email} 
                                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>{isEdit ? 'Password Baru (Opsional)' : 'Password'}</label>
                                            <input 
                                                required={!isEdit} 
                                                type="password" 
                                                placeholder={isEdit ? "Kosongkan jika tak diubah" : "Minimal 6 karakter"} 
                                                style={styles.formInput} 
                                                value={formData.password} 
                                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Hak Akses (sekarang termasuk ubah role + unit) */}
                                <div style={styles.formSection}>
                                    <div style={styles.sectionLabel}>Hak Akses & Penempatan</div>

                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Role / Hak Akses</label>
                                            <select 
                                                style={styles.formInput} 
                                                value={formData.role} 
                                                onChange={e => setFormData({...formData, role: e.target.value, unit_id: e.target.value !== 'admin unit' ? '' : formData.unit_id})}
                                            >
                                                <option value="user">User (Mahasiswa)</option>
                                                <option value="admin unit">Admin Unit</option>
                                                <option value="super admin">Super Admin</option>
                                            </select>
                                        </div>
                                        
                                        {formData.role === 'admin unit' && (
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Pilih Unit Penempatan</label>
                                                <select 
                                                    required 
                                                    style={styles.formInput} 
                                                    value={formData.unit_id} 
                                                    onChange={e => setFormData({...formData, unit_id: e.target.value})}
                                                >
                                                    <option value="">-- Pilih Unit --</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Identitas */}
                                <div style={styles.formSection}>
                                    <div style={styles.sectionLabel}>Identitas Tambahan</div>

                                    {formData.role === 'user' ? (
                                        <div style={styles.formRow}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Nomor Induk (NIM/NIS)</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    placeholder="Contoh: 20230140090"
                                                    style={styles.formInput} 
                                                    value={formData.nomor_induk} 
                                                    onChange={e => setFormData({...formData, nomor_induk: e.target.value})} 
                                                />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Asal Instansi</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    placeholder="Contoh: Universitas Muhammadiyah Yogyakarta"
                                                    style={styles.formInput} 
                                                    value={formData.asal_instansi} 
                                                    onChange={e => setFormData({...formData, asal_instansi: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>NIPP (Nomor Induk Pegawai)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Masukkan NIPP (opsional)" 
                                                style={styles.formInput} 
                                                value={formData.nomor_induk} 
                                                onChange={e => setFormData({...formData, nomor_induk: e.target.value})} 
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div style={styles.modalActions}>
                                    <button type="button" onClick={() => setShowModal(false)} style={styles.btnCancel}>
                                        Batal
                                    </button>
                                    <button type="submit" style={styles.btnSubmit}>
                                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navGroup: { marginBottom: '5px' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    dropdownWrapper: { paddingLeft: '20px', marginBottom: '10px', marginTop: '5px' },
    dropdownItem: { padding: '10px 15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' },
    dotIndicator: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },

    // MAIN
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    contentScroll: { padding: '40px', flex: 1 },
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },
    // ACTION BAR (sejajar, semua align center)
    actionBar: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    searchBox: { 
        flex: 1,
        minWidth: '280px',
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: '12px 20px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', 
        border: '1px solid #e0e7ff'
    },
    selectWrapper: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        backgroundColor: '#fff', 
        padding: '12px 20px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', 
        border: '1px solid #e0e7ff', 
        minWidth: '220px'
    },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', color: '#333', cursor: 'pointer' },
    btnAdd: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '12px 22px', 
        backgroundColor: '#ff6600', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '10px', 
        fontWeight: 'bold', 
        cursor: 'pointer', 
        fontSize: '13px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(255,102,0,0.25)'
    },

    // TABLE
    tableCard: { 
        backgroundColor: '#fff', 
        borderRadius: '16px', 
        padding: '8px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
        border: '1px solid #f0f4f8',
        overflow: 'hidden'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: 'transparent' },
    th: { 
        padding: '16px 12px', 
        textAlign: 'left', 
        color: '#6b7280', 
        fontSize: '11px', 
        fontWeight: '700',
        textTransform: 'uppercase', 
        letterSpacing: '0.5px',
        borderBottom: '2px solid #f3f4f6'
    },
    td: { 
        padding: '16px 12px', 
        borderBottom: '1px solid #f3f4f6', 
        fontSize: '14px', 
        color: '#374151', 
        verticalAlign: 'middle' 
    },
    tableRow: {},

    // ICON BUTTONS (selaras dengan Syarat Dokumen)
    btnIconEdit: { 
        background: 'none', 
        color: '#003399', 
        border: 'none', 
        padding: '6px', 
        cursor: 'pointer', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    btnIconDelete: { 
        background: 'none', 
        color: '#e74c3c', 
        border: 'none', 
        padding: '6px', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },

    // MODAL
    modalOverlay: { 
        position: 'fixed', 
        top: 0, left: 0, 
        width: '100vw', height: '100vh', 
        backgroundColor: 'rgba(15,23,42,0.55)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
    },
    modalBox: { 
        backgroundColor: '#fff', 
        width: '640px', 
        maxWidth: '92vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px 36px', 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)' 
    },
    modalHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f0f4f8'
    },
    modalTitle: { 
        color: '#111827', 
        margin: 0, 
        fontSize: '20px', 
        fontWeight: '800' 
    },
    modalSub: { 
        color: '#6b7280', 
        margin: '4px 0 0', 
        fontSize: '13px' 
    },
    modalClose: { 
        background: 'none', 
        border: 'none', 
        color: '#6b7280', 
        cursor: 'pointer', 
        padding: '6px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px'
    },

    // FORM SECTIONS
    formSection: { marginBottom: '24px' },
    sectionLabel: { 
        fontSize: '11px', 
        color: '#003399', 
        fontWeight: '700', 
        letterSpacing: '1.5px', 
        marginBottom: '14px',
        paddingBottom: '8px',
        borderBottom: '1px dashed #e0e7ff',
        textTransform: 'uppercase'
    },
    formRow: { 
        display: 'flex', 
        gap: '16px' 
    },
    formGroup: { 
        marginBottom: '14px',
        flex: 1
    },
    label: { 
        display: 'block', 
        fontSize: '12px', 
        color: '#374151', 
        fontWeight: '700', 
        marginBottom: '8px' 
    },
    formInput: { 
        width: '100%', 
        padding: '12px 14px', 
        borderRadius: '10px', 
        border: '1px solid #e0e7ff', 
        outline: 'none', 
        boxSizing: 'border-box',
        fontSize: '14px',
        fontFamily: 'inherit',
        backgroundColor: '#f8fafd',
        color: '#374151'
    },

    // MODAL ACTIONS
    modalActions: { 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '10px', 
        marginTop: '8px',
        paddingTop: '16px',
        borderTop: '1px solid #f0f4f8'
    },
    btnCancel: { 
        padding: '12px 24px', 
        backgroundColor: '#f1f3f9', 
        color: '#6b7280', 
        border: 'none', 
        borderRadius: '10px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '13px'
    },
    btnSubmit: { 
        padding: '12px 28px', backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,51,153,0.25)'
    }
};

export default UserManagement;
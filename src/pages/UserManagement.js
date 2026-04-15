import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    Users, ShieldCheck, Search, LogOut, 
    LayoutDashboard, UserCog, Building2, Archive, FileText 
} from 'lucide-react';


const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [units, setUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    // Ambil data user dari localStorage dengan aman
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'Super Admin' && parsedUser.role !== 'admin') {
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
        } catch (err) {
            console.error("Gagal ambil unit:", err);
        }
    };

    const handleUpdateRole = async (user, newRole) => {
        if (newRole === 'Admin Unit') {
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

            if (selectedUnitId) {
                executeRoleUpdate(user.id, newRole, selectedUnitId);
            }
        } else {
            const result = await Swal.fire({
                title: 'Cabut Hak Akses?',
                text: `Akses ${user.nama_lengkap} akan dikembalikan menjadi User biasa.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3498db',
                confirmButtonText: 'Ya, Cabut Akses'
            });

            if (result.isConfirmed) {
                executeRoleUpdate(user.id, newRole, null);
            }
        }
    };

    const executeRoleUpdate = async (id, role, unit_id) => {
        try {
            await axios.put(`http://localhost:5000/api/users/${id}/role`, { role, unit_id });
            Swal.fire('Berhasil!', `Akses berhasil diperbarui`, 'success');
            fetchUsers(); 
        } catch (err) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui akses', 'error');
        }
    };

    const filteredUsers = users.filter(u => 
        (u.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                {/* ✨ FIX: Sekarang mengarah ke /super-admin, bukan /admin ✨ */}
                <div style={styles.menuItem} onClick={() => navigate('/super-admin')}>
                    <LayoutDashboard size={18}/> Monitoring Pengajuan
                </div>
                <div style={styles.menuActive}>
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

            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                <div style={styles.header}>
                    <div>
                        <h2 style={{margin:0, color:'#003399'}}>Manajemen Pengguna 👥</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Atur hak akses dan penempatan unit Admin</p>
                    </div>
                    
                    <div style={styles.searchContainer}>
                        <Search size={18} color="#003399" />
                        <input 
                            placeholder="Cari nama pengguna..." 
                            style={styles.searchInput} 
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={{...styles.th, width: '50px'}}>No</th>
                                <th style={styles.th}>Nama & Email</th>
                                <th style={styles.th}>Nomor Induk</th>
                                <th style={styles.th}>Role Saat Ini</th>
                                <th style={{...styles.th, textAlign:'center'}}>Ubah Akses</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((u, index) => (
                                <tr key={u.id} style={styles.row}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>
                                        <div style={{fontWeight: 'bold', color: '#333'}}>{u.nama_lengkap}</div>
                                        <div style={{fontSize: '12px', color: '#888'}}>{u.email}</div>
                                    </td>
                                    <td style={styles.td}>{u.nomor_induk || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(u.role)}>
                                            {u.role === 'Admin Unit' && u.nama_unit ? `Admin: ${u.nama_unit}` : u.role}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {u.id !== currentUser?.id ? (
                                            <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                <button 
                                                    onClick={() => handleUpdateRole(u, 'Admin Unit')}
                                                    style={{...styles.btnRole, backgroundColor:'#f39c12'}}
                                                >
                                                    <ShieldCheck size={16}/> Unit
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateRole(u, 'User')}
                                                    style={{...styles.btnRole, backgroundColor:'#3498db'}}
                                                >
                                                    <Users size={16}/> User
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{textAlign: 'center', color: '#aaa', fontSize: '11px', fontStyle: 'italic'}}>Akun Anda</div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign:'center', padding:'30px', color: '#aaa'}}>Data pengguna tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', border: '1px solid transparent' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' } },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '350px', border: '1px solid #e0e0e0' },
    searchInput: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    badge: (role) => ({
        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
        backgroundColor: role === 'Super Admin' ? '#e1f7e7' : role === 'Admin Unit' ? '#fff4e5' : '#f0f4ff',
        color: role === 'Super Admin' ? '#27ae60' : role === 'Admin Unit' ? '#d35400' : '#003399'
    }),
    btnRole: { color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:'bold', transition: '0.2s' }
};

export default UserManagement;
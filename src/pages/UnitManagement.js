import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, UserCog, Building2, RefreshCcw,
    LogOut, PlusCircle, Edit, Trash2, Search, FileText, Archive
} from 'lucide-react';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        // Proteksi Halaman
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'Super Admin' && parsedUser.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchUnits();
        
        // Memastikan posisi scroll di atas saat pindah menu
        window.scrollTo(0, 0);
    }, [navigate]);

    const fetchUnits = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/units?_t=${Date.now()}`);
            setUnits(res.data);
        } catch (err) {
            console.error("Gagal memuat unit:", err);
            Swal.fire('Error', 'Gagal memuat daftar unit', 'error');
        }
    };

    const handleAddUnit = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Unit Baru',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Nama Unit (ex: Unit IT)">' +
                '<input id="swal-input2" type="number" class="swal2-input" placeholder="Kuota Magang">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#003399',
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ]
            }
        });

        if (formValues && formValues[0] && formValues[1]) {
            try {
                await axios.post('http://localhost:5000/api/units', { 
                    nama_unit: formValues[0], 
                    kuota: parseInt(formValues[1]) 
                });
                Swal.fire('Berhasil!', 'Unit baru ditambahkan', 'success');
                fetchUnits();
            } catch (err) {
                Swal.fire('Gagal', 'Gagal menambah unit', 'error');
            }
        }
    };

    const handleEdit = async (unit) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Unit',
            html:
                `<div style="text-align:left; font-size:14px; margin-bottom:5px;">Nama Divisi/Unit:</div>` +
                `<input id="swal-input1" class="swal2-input" style="margin-top:0;" value="${unit.nama_unit}">` +
                `<div style="text-align:left; font-size:14px; margin-top:15px; margin-bottom:5px;">Kuota Magang:</div>` +
                `<input id="swal-input2" type="number" class="swal2-input" style="margin-top:0;" value="${unit.kuota || 0}">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#f39c12',
            confirmButtonText: 'Update Data',
            preConfirm: () => {
                const nama = document.getElementById('swal-input1').value;
                const kuota = document.getElementById('swal-input2').value;
                if (!nama || !kuota) {
                    Swal.showValidationMessage('Nama unit dan kuota tidak boleh kosong!');
                }
                return [nama, kuota];
            }
        });

        if (formValues) {
            const namaBaru = formValues[0];
            const kuotaBaru = parseInt(formValues[1]) || 0; 

            try {
                await axios.put(`http://localhost:5000/api/units/${unit.id}`, { 
                    nama_unit: namaBaru, 
                    kuota: kuotaBaru 
                });
                
                Swal.fire('Berhasil!', 'Data unit berhasil diperbarui', 'success');
                fetchUnits();
            } catch (err) {
                Swal.fire('Gagal', 'Gagal menyimpan perubahan', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Unit ini?',
            text: "Data tidak bisa dikembalikan. Pastikan tidak ada mahasiswa yang sedang magang di unit ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/units/${id}`);
                Swal.fire('Terhapus!', 'Unit telah dihapus.', 'success');
                fetchUnits();
            } catch (err) {
                Swal.fire('Gagal', 'Gagal menghapus unit (Mungkin sedang dipakai)', 'error');
            }
        }
    };

    const filteredUnits = units.filter(u => 
        (u.nama_unit || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                <div style={styles.menuItem} onClick={() => navigate('/super-admin')}>
                    <LayoutDashboard size={18}/> Dashboard Utama
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/monitoring')}>
                    <RefreshCcw size={18}/> Monitoring Pengajuan
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}>
                    <UserCog size={18}/> Manajemen Pengguna
                </div>
                <div style={styles.menuActive}>
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
                        <h2 style={{margin:0, color:'#003399'}}>Manajemen Unit & Kuota 🏢</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Atur daftar divisi dan kuota maksimal peserta magang</p>
                    </div>
                    
                    <div style={{display:'flex', gap:'15px'}}>
                        <div style={styles.searchContainer}>
                            <Search size={18} color="#003399" />
                            <input 
                                placeholder="Cari unit..." 
                                style={styles.searchInput} 
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={handleAddUnit} style={styles.btnAdd}>
                            <PlusCircle size={18} /> Tambah Unit
                        </button>
                    </div>
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={{...styles.th, width: '50px'}}>No</th>
                                <th style={styles.th}>Nama Divisi / Unit</th>
                                <th style={styles.th}>Kuota Magang</th>
                                <th style={{...styles.th, textAlign:'center'}}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUnits.map((u, index) => (
                                <tr key={u.id} style={styles.row}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}><strong style={{color:'#333'}}>{u.nama_unit}</strong></td>
                                    <td style={styles.td}>
                                        <span style={styles.badgeKuota(u.kuota)}>
                                            {u.kuota} Orang
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                            <button onClick={() => handleEdit(u)} style={styles.btnEdit} title="Edit Unit">
                                                <Edit size={16}/>
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} style={styles.btnDelete} title="Hapus Unit">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const styles = {
    // KUNCI LAYOUT
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    main: { flex: 1, marginLeft: '260px', padding: '40px', minHeight: '100vh', boxSizing: 'border-box' },
    
    // Existing Styles
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' } },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '250px', border: '1px solid #e0e0e0' },
    searchInput: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    btnAdd: { backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    badgeKuota: (kuota) => ({
        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
        backgroundColor: kuota > 0 ? '#e1f7e7' : '#fff0f0',
        color: kuota > 0 ? '#27ae60' : '#e74c3c'
    }),
    btnEdit: { backgroundColor: '#fff4e5', color: '#f39c12', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnDelete: { backgroundColor: '#fff0f0', color: '#e74c3c', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }
};

export default UnitManagement;
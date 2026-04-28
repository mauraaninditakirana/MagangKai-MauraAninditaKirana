import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCog, Building2, RefreshCcw,
    LogOut, PlusCircle, Edit, Trash2, Search, FileText, 
    ChevronDown, ChevronRight, ClipboardCheck, Settings2, Save, X
} from 'lucide-react';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    
    const [expandedUnitId, setExpandedUnitId] = useState(null);
    const [quotaForm, setQuotaForm] = useState({});

    useEffect(() => {
        fetchUnits();
        fetchTypes();
    }, []);

    const fetchUnits = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/units`);
            setUnits(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submission-types`);
            setTypes(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddUnit = async () => {
        const { value: namaUnit } = await Swal.fire({
            title: 'Tambah Unit Baru',
            input: 'text',
            inputPlaceholder: 'Masukkan Nama Unit (Contoh: Divisi IT)',
            showCancelButton: true,
            confirmButtonText: 'Simpan Unit',
            confirmButtonColor: '#003399',
            inputValidator: (value) => {
                if (!value) return 'Nama unit wajib diisi!';
            }
        });

        if (namaUnit) {
            try {
                const defaultQuotas = types.map(t => ({ type_id: t.id, limit: 0 }));
                await axios.post('http://localhost:5000/api/units', { 
                    nama_unit: namaUnit, 
                    quotas: defaultQuotas 
                });
                Swal.fire('Berhasil!', 'Unit baru ditambahkan. Silakan atur kuotanya.', 'success');
                fetchUnits();
            } catch (err) { Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error'); }
        }
    };

    const handleEditName = async (unit) => {
        const { value: namaBaru } = await Swal.fire({
            title: 'Edit Nama Unit',
            input: 'text',
            inputValue: unit.nama_unit,
            showCancelButton: true,
            confirmButtonText: 'Update Nama',
            confirmButtonColor: '#f39c12'
        });

        if (namaBaru && namaBaru !== unit.nama_unit) {
            try {
                // ✨ FIX ERROR DI SINI: Tambahkan (unit.quotas || []) ✨
                const existingQuotas = types.map(t => {
                    const qLimit = (unit.quotas || []).find(q => q.submission_type_id === t.id)?.quota_limit || 0;
                    return { type_id: t.id, limit: qLimit };
                });

                await axios.put(`http://localhost:5000/api/units/${unit.id}`, {
                    nama_unit: namaBaru,
                    quotas: existingQuotas
                });
                Swal.fire('Berhasil!', 'Nama Unit diperbarui.', 'success');
                fetchUnits();
            } catch (err) { Swal.fire('Error', 'Gagal update nama unit', 'error'); }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Unit?',
            text: "Semua data kuota terkait unit ini akan ikut terhapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Ya, Hapus'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/units/${id}`);
                Swal.fire('Terhapus!', '', 'success');
                fetchUnits();
            } catch (err) { Swal.fire('Gagal', 'Unit masih memiliki data mahasiswa aktif', 'error'); }
        }
    };

    const toggleQuotaDropdown = (unit) => {
        if (expandedUnitId === unit.id) {
            setExpandedUnitId(null); 
        } else {
            setExpandedUnitId(unit.id);
            const initialForm = {};
            types.forEach(t => {
                // ✨ FIX ERROR DI SINI: Tambahkan (unit.quotas || []) ✨
                const limit = (unit.quotas || []).find(q => q.submission_type_id === t.id)?.quota_limit || 0;
                initialForm[t.id] = limit;
            });
            setQuotaForm(initialForm);
        }
    };

    const handleSaveQuotas = async (unit) => {
        try {
            const quotasPayload = types.map(t => ({
                type_id: t.id,
                limit: parseInt(quotaForm[t.id]) || 0
            }));

            await axios.put(`http://localhost:5000/api/units/${unit.id}`, {
                nama_unit: unit.nama_unit, 
                quotas: quotasPayload
            });

            Swal.fire({
                title: 'Tersimpan!',
                text: 'Kuota unit berhasil diperbarui.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            
            fetchUnits();
            setExpandedUnitId(null); 
        } catch (error) {
            Swal.fire('Gagal', 'Gagal memperbarui kuota', 'error');
        }
    };

    const filteredUnits = units.filter(u => 
        (u.nama_unit || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                <div>
                    <div style={styles.menuItem} onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}><LayoutDashboard size={18}/> Dashboard Utama</div>
                        {isDashboardMenuOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </div>
                    {isDashboardMenuOpen && (
                        <div style={styles.subMenuContainer}>
                            <div style={styles.subMenuItem} onClick={() => navigate('/super-admin')}>Ringkasan & Pantauan Unit</div>
                            <div style={styles.subMenuItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'peserta_aktif' } })}>Monitoring Peserta Aktif</div>
                        </div>
                    )}
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/monitoring')}><RefreshCcw size={18}/> Monitoring Pengajuan</div>
                <div style={styles.menuItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'requirements' } })}><ClipboardCheck size={18}/> Syarat Dokumen</div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}><UserCog size={18}/> Manajemen Pengguna</div>
                <div style={styles.menuActive}><Building2 size={18}/> Manajemen Unit</div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/archive')}><FileText size={18}/> Arsip Data Peserta</div>
                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}><LogOut size={18}/> Keluar Sistem</div>
            </div>

            <div style={styles.main}>
                <div style={styles.header}>
                    <div>
                        <h2 style={{margin:0, color:'#003399'}}>Manajemen Unit & Kuota 🏢</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Atur daftar divisi dan kuota spesifik per jenis kegiatan</p>
                    </div>
                    <button onClick={handleAddUnit} style={styles.btnAdd}>
                        <PlusCircle size={18} /> Tambah Unit
                    </button>
                </div>

                <div style={styles.searchContainer}>
                    <Search size={18} color="#003399" />
                    <input 
                        placeholder="Cari nama unit..." 
                        style={styles.searchInput} 
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={{...styles.th, width: '50px'}}>No</th>
                                <th style={styles.th}>Nama Divisi / Unit</th>
                                <th style={styles.th}>Detail Kuota</th>
                                <th style={{...styles.th, textAlign:'center', width: '200px'}}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUnits.length > 0 ? filteredUnits.map((u, index) => (
                                <React.Fragment key={u.id}>
                                    <tr style={styles.row}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}>
                                            <strong style={{color:'#333', fontSize: '15px'}}>{u.nama_unit}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                                                {/* ✨ FIX ERROR DI SINI JUGA ✨ */}
                                                {(u.quotas || []).length > 0 ? (
                                                    (u.quotas || []).map(q => (
                                                        <span key={q.id || Math.random()} style={styles.badgeQuota}>
                                                            {q.nama_jenis || 'Kegiatan'}: <b>{q.quota_limit}</b>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{fontSize:'12px', color:'#999', fontStyle:'italic'}}>Belum diatur</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                <button 
                                                    onClick={() => toggleQuotaDropdown(u)} 
                                                    style={{...styles.btnAction, backgroundColor: expandedUnitId === u.id ? '#003399' : '#e0f0ff', color: expandedUnitId === u.id ? '#fff' : '#0055cc'}}
                                                    title="Kelola Kuota"
                                                >
                                                    <Settings2 size={16}/> Kuota
                                                </button>
                                                <button onClick={() => handleEditName(u)} style={{...styles.btnAction, backgroundColor: '#fff4e5', color: '#f39c12'}} title="Edit Nama Unit">
                                                    <Edit size={16}/>
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} style={{...styles.btnAction, backgroundColor: '#fff0f0', color: '#e74c3c'}} title="Hapus Unit">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedUnitId === u.id && (
                                        <tr style={{backgroundColor: '#f8fbff'}}>
                                            <td colSpan="4" style={{padding: '20px', borderBottom: '1px solid #e0e0e0'}}>
                                                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', padding: '15px', borderLeft: '4px solid #0055cc', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'}}>
                                                    <div style={{flex: 1}}>
                                                        <h4 style={{margin: '0 0 15px 0', color: '#003399'}}>Kelola Kuota: {u.nama_unit}</h4>
                                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px'}}>
                                                            {types.map(t => (
                                                                <div key={t.id} style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                                                    <label style={{fontSize: '12px', fontWeight: 'bold', color: '#666'}}>{t.nama_jenis}</label>
                                                                    <div style={{display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden'}}>
                                                                        <span style={{padding: '8px 12px', backgroundColor: '#eee', color: '#555', borderRight: '1px solid #ddd'}}>Max</span>
                                                                        <input 
                                                                            type="number" 
                                                                            min="0"
                                                                            style={{border: 'none', padding: '8px 10px', width: '100%', outline: 'none', fontWeight: 'bold'}}
                                                                            value={quotaForm[t.id] !== undefined ? quotaForm[t.id] : 0}
                                                                            onChange={(e) => setQuotaForm({...quotaForm, [t.id]: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '35px'}}>
                                                        <button onClick={() => handleSaveQuotas(u)} style={styles.btnSaveDropdown}>
                                                            <Save size={16}/> Simpan Kuota
                                                        </button>
                                                        <button onClick={() => setExpandedUnitId(null)} style={styles.btnCancelDropdown}>
                                                            <X size={16}/> Tutup
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#999'}}>Tidak ada data unit yang ditemukan.</td></tr>
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
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    main: { flex: 1, marginLeft: '260px', padding: '40px', minHeight: '100vh', boxSizing: 'border-box' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px' },
    menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    subMenuContainer: { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px', marginBottom: '15px' },
    subMenuItem: { padding: '10px 15px 10px 45px', color: '#ccc', fontSize: '13px', cursor: 'pointer' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '300px', border: '1px solid #e0e0e0', marginBottom: '20px' },
    searchInput: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    btnAdd: { backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    badgeQuota: { padding: '6px 12px', backgroundColor: '#f0f4ff', color: '#003399', borderRadius: '8px', fontSize: '11px', border: '1px solid #cce0ff' },
    btnAction: { border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' },
    btnSaveDropdown: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' },
    btnCancelDropdown: { backgroundColor: '#eee', color: '#666', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' }
};

export default UnitManagement;
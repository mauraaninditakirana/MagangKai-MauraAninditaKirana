import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCog, Building2, RefreshCcw,
    LogOut, PlusCircle, Edit, Trash2, Search, FileText, 
    ChevronDown, ClipboardCheck, Settings2, Save, X, Archive, Bell
} from 'lucide-react';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // State Sidebar Dropdown
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);
    
    const [expandedUnitId, setExpandedUnitId] = useState(null);
    const [quotaForm, setQuotaForm] = useState({});

    // Ambil data user untuk header
    const user = JSON.parse(sessionStorage.getItem('user')) || {};

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        
        fetchUnits();
        fetchTypes();
        window.scrollTo(0, 0);
    }, [navigate]);

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
            {/* ✨ SIDEBAR PREMIUM STYLE ✨ */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>DAOP 6</span></h2>
                    <p style={styles.brandSubtitle}>SISTEM MANAJEMEN MAGANG</p>
                </div>

                <div style={styles.sidebarNav}>
                    {/* DROPDOWN 1: DASHBOARD UTAMA */}
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

                    {/* DROPDOWN 2: MONITORING PENGAJUAN */}
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

                    <div style={styles.navItem} onClick={() => navigate('/admin/users')}>
                        <div style={styles.navLinkContent}><UserCog size={20} /> <span>Manajemen Pengguna</span></div>
                    </div>

                    <div style={styles.navItemActive}>
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
                    <div style={styles.header}>
                        <div>
                            <h2 style={{margin:0, color:'#003399'}}>Manajemen Unit & Kuota 🏢</h2>
                            <p style={{color:'#666', fontSize:'14px'}}>Atur daftar divisi dan kuota spesifik per jenis kegiatan</p>
                        </div>
                        {/* ✨ TOMBOL TAMBAH UNIT YANG SUDAH KEMBALI STYLINGNYA ✨ */}
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
                                                        style={{...styles.btnAction, backgroundColor: expandedUnitId === u.id ? '#003399' : '#f0f4ff', color: expandedUnitId === u.id ? '#fff' : '#003399'}}
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
                                                                <Save size={16}/> Simpan
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
    contentScroll: { padding: '40px', flex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '300px', border: '1px solid #e0e0e0', marginBottom: '20px' },
    searchInput: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    selectWrapper: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0', width: '200px' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', color: '#333', cursor: 'pointer' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle', color: '#444', fontSize: '14px' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    badgeQuota: { padding: '6px 12px', backgroundColor: '#f0f4ff', color: '#003399', borderRadius: '8px', fontSize: '11px', border: '1px solid #cce0ff' },
    btnAction: { border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '12px', transition: '0.2s' },
    btnSaveDropdown: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' },
    btnCancelDropdown: { backgroundColor: '#eee', color: '#666', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px' },
    
    btnAdd: { 
        backgroundColor: '#2ecc71', 
        color: '#fff', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontWeight: 'bold', 
        fontSize: '14px', 
        boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)',
        transition: '0.2s'
    }
};

export default UnitManagement;
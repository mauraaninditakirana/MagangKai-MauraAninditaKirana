import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, UserCog, Building2, RefreshCcw,
    LogOut, PlusCircle, Edit, Trash2, Search,
    ChevronDown, Settings2, Save, X, Archive
} from 'lucide-react';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);
    
    const [expandedUnitId, setExpandedUnitId] = useState(null);
    const [quotaForm, setQuotaForm] = useState({});

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
            confirmButtonColor: '#003399'
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
                    {/* Section header (selaras dengan halaman lain) */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={styles.accentBar} />
                        <h2 style={styles.sectionTitle}>Manajemen Unit & Kuota</h2>
                        <p style={styles.sectionDesc}>Atur daftar divisi dan kuota spesifik per jenis kegiatan magang.</p>
                    </div>

                    {/* Action bar: search + tombol tambah */}
                    <div style={styles.actionBar}>
                        <div style={styles.searchBox}>
                            <Search size={18} color="#003399" />
                            <input 
                                placeholder="Cari nama unit..." 
                                style={styles.input} 
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={handleAddUnit} style={styles.btnAdd}>
                            <PlusCircle size={16} /> Tambah Unit
                        </button>
                    </div>

                    {/* Tabel */}
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={{...styles.th, width: '50px'}}>No</th>
                                    <th style={styles.th}>Nama Divisi / Unit</th>
                                    <th style={styles.th}>Detail Kuota</th>
                                    <th style={{...styles.th, textAlign:'center', width: '180px'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUnits.length > 0 ? filteredUnits.map((u, index) => (
                                    <React.Fragment key={u.id}>
                                        <tr style={styles.tableRow}>
                                            <td style={styles.td}>{index + 1}</td>
                                            <td style={styles.td}>
                                                <strong style={{color:'#111827', fontSize: '14px'}}>{u.nama_unit}</strong>
                                            </td>
                                            <td style={styles.td}>
                                                {(u.quotas || []).length > 0 ? (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        gap: '8px 32px',
                                                        fontSize: '13px',
                                                        color: '#374151',
                                                        maxWidth: '600px'
                                                    }}>
                                                        {(u.quotas || []).map((q, i) => (
                                                            <div key={q.id || i} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'baseline',
                                                                gap: '8px'
                                                            }}>
                                                                <span>{q.nama_jenis || 'Kegiatan'}</span>
                                                                <b style={{color: '#003399', flexShrink: 0}}>{q.quota_limit}</b>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{fontSize:'13px', color:'#9ca3af', fontStyle:'italic'}}>Belum diatur</span>
                                                )}
                                            </td>
                                            <td style={{...styles.td, textAlign: 'center'}}>
                                                <div style={{display:'flex', gap:'8px', justifyContent:'center', alignItems: 'center'}}>
                                                    <button 
                                                        onClick={() => toggleQuotaDropdown(u)} 
                                                        style={{
                                                            ...styles.btnKuota, 
                                                            backgroundColor: expandedUnitId === u.id ? '#003399' : '#f0f4ff', 
                                                            color: expandedUnitId === u.id ? '#fff' : '#003399'
                                                        }}
                                                        title="Kelola Kuota"
                                                    >
                                                        <Settings2 size={14}/> Kuota
                                                    </button>
                                                    <button onClick={() => handleEditName(u)} style={styles.btnIconEdit} title="Edit Nama Unit">
                                                        <Edit size={18} strokeWidth={2}/>
                                                    </button>
                                                    <button onClick={() => handleDelete(u.id)} style={styles.btnIconDelete} title="Hapus Unit">
                                                        <Trash2 size={18} strokeWidth={2}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedUnitId === u.id && (
                                            <tr>
                                                <td colSpan="4" style={{padding: '0 12px 16px'}}>
                                                    <div style={styles.quotaPanel}>
                                                        <div style={styles.quotaPanelHeader}>
                                                            <div>
                                                                <div style={styles.quotaPanelLabel}>KELOLA KUOTA</div>
                                                                <h4 style={styles.quotaPanelTitle}>{u.nama_unit}</h4>
                                                            </div>
                                                            <button onClick={() => setExpandedUnitId(null)} style={styles.btnClosePanel}>
                                                                <X size={18}/>
                                                            </button>
                                                        </div>

                                                        <div style={styles.quotaGrid}>
                                                            {types.map(t => (
                                                                <div key={t.id} style={styles.quotaItem}>
                                                                    <label style={styles.quotaLabel}>{t.nama_jenis}</label>
                                                                    <div style={styles.quotaInputWrap}>
                                                                        <span style={styles.quotaInputPrefix}>Max</span>
                                                                        <input 
                                                                            type="number" 
                                                                            min="0"
                                                                            style={styles.quotaInput}
                                                                            value={quotaForm[t.id] !== undefined ? quotaForm[t.id] : 0}
                                                                            onChange={(e) => setQuotaForm({...quotaForm, [t.id]: e.target.value})}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div style={styles.quotaActions}>
                                                            <button onClick={() => setExpandedUnitId(null)} style={styles.btnCancelDropdown}>
                                                                Batal
                                                            </button>
                                                            <button onClick={() => handleSaveQuotas(u)} style={styles.btnSaveDropdown}>
                                                                <Save size={14}/> Simpan Kuota
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

    // SECTION HEADER (FAQ-style)
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },

    // ACTION BAR
    actionBar: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#ff6600', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(255,102,0,0.25)' },

    // TABLE
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: 'transparent' },
    th: { padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
    tableRow: {},

    // ACTION BUTTONS
    btnKuota: { border: 'none', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '12px' },
    btnIconEdit: { background: 'none', color: '#003399', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnIconDelete: { background: 'none', color: '#e74c3c', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },

    // QUOTA PANEL (expanded row)
    quotaPanel: { background: '#f8fbff', border: '1px solid #cce0ff', borderLeft: '4px solid #003399', borderRadius: '12px', padding: '20px 24px', marginTop: '4px' },
    quotaPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px dashed #cce0ff' },
    quotaPanelLabel: { fontSize: '11px', color: '#003399', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '4px' },
    quotaPanelTitle: { margin: 0, color: '#111827', fontSize: '17px', fontWeight: '800' },
    btnClosePanel: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
    quotaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' },
    quotaItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    quotaLabel: { fontSize: '12px', fontWeight: '700', color: '#374151' },
    quotaInputWrap: { display: 'flex', alignItems: 'stretch', backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '8px', overflow: 'hidden' },
    quotaInputPrefix: { padding: '10px 14px', backgroundColor: '#f0f4ff', color: '#003399', fontSize: '12px', fontWeight: '700', borderRight: '1px solid #e0e7ff', display: 'flex', alignItems: 'center' },
    quotaInput: { border: 'none', padding: '10px 14px', width: '100%', outline: 'none', fontWeight: 'bold', fontSize: '14px', color: '#003399', background: 'transparent' },
    quotaActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #e0e7ff' },
    btnSaveDropdown: { backgroundColor: '#003399', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(42, 106, 179, 0.25)' },
    btnCancelDropdown: { backgroundColor: '#f1f3f9', color: '#6b7280', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
};

export default UnitManagement;
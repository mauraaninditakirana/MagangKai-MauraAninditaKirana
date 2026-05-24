import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { formatTanggalIndo } from '../utils/formatTanggal';
import { 
    LayoutDashboard, RefreshCcw, UserCog, Building2, Briefcase,
    LogOut, ChevronDown, Archive, Search, ArrowLeft, Calendar
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

const UnitDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [unit, setUnit] = useState(null);
    const [peserta, setPeserta] = useState([]);
    const [types, setTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');

    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [userData, setUserData] = useState(() => {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) { navigate('/'); return; }
        
        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser.role || '').toLowerCase();
        if (role !== 'super admin' && role !== 'admin') { navigate('/'); return; }
        
        setUserData(parsedUser);
        fetchUnit();
        fetchPeserta();
        fetchTypes();
        window.scrollTo(0, 0);
    }, [navigate, id]);

    const fetchUnit = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            const found = res.data.find(u => String(u.id) === String(id));
            setUnit(found || null);
        } catch (err) { console.error("Gagal ambil unit:", err); }
    };

    const fetchPeserta = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            const aktif = (res.data || []).filter(s => 
                s.status === 'Dalam Masa Kegiatan' && String(s.unit_id) === String(id)
            );
            setPeserta(aktif);
        } catch (err) { console.error("Gagal ambil peserta:", err); }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submission-types');
            setTypes(res.data || []);
        } catch (err) { console.error("Gagal ambil jenis:", err); }
    };

    const filteredPeserta = peserta.filter(p => {
        const matchName = (p.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === '' || String(p.submission_type_id) === String(filterType);
        return matchName && matchType;
    });

    // Breakdown per jenis kegiatan
    const breakdownPerJenis = types.map(t => ({
        ...t,
        count: peserta.filter(p => String(p.submission_type_id) === String(t.id)).length
    }));

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

            {/* MAIN */}
            <div style={styles.main}>

                <div style={styles.contentScroll}>
                    {/* Back button + Section header */}
                    <button onClick={() => navigate('/super-admin', { state: { activeTab: 'dashboard' } })} style={styles.btnBack}>
                        <ArrowLeft size={16} /> Kembali ke Dashboard
                    </button>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={styles.accentBar} />
                        <h2 style={styles.sectionTitle}>{unit?.nama_unit || 'Detail Unit'}</h2>
                        <p style={styles.sectionDesc}>
                            Daftar peserta aktif (sedang menjalani magang) di unit ini.
                        </p>
                    </div>

                    {/* Stats Card */}
                    <div style={styles.statsGrid}>
                        {breakdownPerJenis.map(t => (
                            <div key={t.id} style={styles.statItem}>
                                <Briefcase size={20} color="#ff6600" strokeWidth={2}/>
                                <div>
                                    <div style={styles.statNumSmall}>{t.count}</div>
                                    <div style={styles.statLabelSmall}>{t.nama_jenis}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter & Search */}
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
                            <Briefcase size={16} color="#003399" />
                            <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="">Semua Jenis</option>
                                {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Tabel Peserta */}
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={{...styles.th, width: '50px'}}>No</th>
                                    <th style={styles.th}>Nama Peserta</th>
                                    <th style={styles.th}>Asal Instansi</th>
                                    <th style={styles.th}>Jenis Kegiatan</th>
                                    <th style={styles.th}>Periode Kegiatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPeserta.length > 0 ? filteredPeserta.map((p, i) => (
                                    <tr key={p.id} style={styles.tableRow}>
                                        <td style={styles.td}>{i + 1}</td>
                                        <td style={styles.td}><b style={{color: '#111827'}}>{p.nama_lengkap}</b></td>
                                        <td style={styles.td}>{p.asal_instansi}</td>
                                        <td style={styles.td}>
                                            <span style={{color: '#ff6600', fontWeight: 'bold'}}>{p.nama_jenis}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003399', fontWeight: 'bold' }}>
                                                <Calendar size={14} />
                                                {formatTanggalIndo(p.tanggal_mulai)} — {formatTanggalIndo(p.tanggal_selesai)}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#999'}}>Tidak ada peserta aktif di unit ini.</td></tr>
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
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    dropdownWrapper: { paddingLeft: '20px', marginBottom: '10px', marginTop: '5px' },
    dropdownItem: { padding: '10px 15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
    dotIndicator: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    
    // MAIN
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    contentScroll: { padding: '40px', flex: 1 },

    // BACK BUTTON
    btnBack: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#003399', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginBottom: '18px', padding: 0 },

    // SECTION HEADER
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '28px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },

    // STATS
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
    statItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #f0f4f8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
    statNumSmall: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: 1 },
    statLabelSmall: { fontSize: '11px', color: '#6b7280', fontWeight: '600', marginTop: '4px' },
    // FILTER
    filterBar: { display: 'flex', gap: '15px', marginBottom: '24px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    selectWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', color: '#333', cursor: 'pointer' },

    // TABLE
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: {},
    th: { padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
    tableRow: {}
};

export default UnitDetail;
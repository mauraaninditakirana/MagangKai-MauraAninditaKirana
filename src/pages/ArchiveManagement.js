import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    LayoutDashboard, RefreshCcw, UserCog, Building2, 
    LogOut, Search, Eye, ChevronDown, Archive
} from 'lucide-react';

const ArchiveManagement = () => {
    const [archive, setArchive] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState(''); 
    const [types, setTypes] = useState([]);
    const [units, setUnits] = useState([]);
    const navigate = useNavigate();

    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) { navigate('/'); return; }

        fetchArchive();
        fetchUnits();
        fetchTypes();
        window.scrollTo(0, 0);
    }, [navigate]);

    const fetchArchive = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            const finished = res.data.filter(s => 
                s.status === 'Dalam Masa Kegiatan' ||
                s.status === 'Selesai (Surat Dirilis)' || 
                s.status === 'Ditolak' || 
                s.status === 'Selesai Kegiatan' || 
                s.status === 'Ditolak SDM' || 
                s.status === 'Ditolak Unit'
            );
            setArchive(finished);
        } catch (err) { console.error(err); }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data);
        } catch (err) { console.error(err); }
    };
    
    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submission-types');
            setTypes(res.data);
        } catch (err) { console.error(err); }
    };

    const viewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const s = res.data;
            const docs = s.documents || [];

            // Helper inline styles untuk modal
            const sectionCard = 'background:#f8fafd; padding:18px 22px; border-radius:12px; margin-bottom:14px; border:1px solid #f0f4f8;';
            const sectionLabel = 'font-size:11px; color:#003399; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; display:block;';
            const fieldRow = 'display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:13px;';
            const fieldLabel = 'color:#6b7280; font-weight:600;';
            const fieldValue = 'color:#111827; font-weight:600; text-align:right; max-width:60%;';

            let htmlContent = `
                <div style="text-align:left; font-family:'Segoe UI', Tahoma, sans-serif;">
                    
                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Data Mahasiswa</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Nama Lengkap</span>
                            <span style="${fieldValue}">${s.nama_lengkap}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Asal Instansi</span>
                            <span style="${fieldValue}">${s.asal_instansi || '-'}</span>
                        </div>
                    </div>

                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Detail Pelaksanaan</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Jenis Kegiatan</span>
                            <span style="${fieldValue}">${s.nama_jenis}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Unit Magang</span>
                            <span style="${fieldValue}">${s.nama_unit}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Judul Project</span>
                            <span style="${fieldValue}">${s.judul_atau_tujuan}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Kategori</span>
                            <span style="${fieldValue}">${s.kategori_pendaftar} (${s.jumlah_anggota} orang)</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Pembimbing</span>
                            <span style="${fieldValue}">${s.nama_pembimbing || '-'}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Kontak Pembimbing</span>
                            <span style="${fieldValue}">${s.kontak_pembimbing || '-'}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Periode Kegiatan</span>
                            <span style="${fieldValue}">${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</span>
                        </div>
                    </div>

                    <div style="${sectionCard} margin-bottom:0;">
                        <span style="${sectionLabel}">━━ Arsip Dokumen Lampiran</span>
                        ${docs.length > 0 ? docs.map((doc, i) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px 14px; border-radius:8px; margin-bottom:6px; border:1px solid #e0e7ff;">
                                <span style="font-size:13px; color:#374151; font-weight:600;">${i + 1}. ${doc.nama_dokumen || 'Berkas'}</span>
                                <a href="http://localhost:5000/${doc.file_path}" target="_blank" 
                                   style="background:#003399; color:#fff; padding:6px 14px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">
                                   Lihat Berkas
                                </a>
                            </div>
                        `).join('') : '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:20px 0;">Tidak ada dokumen dilampirkan.</p>'}
                    </div>
                </div>
            `;
            Swal.fire({
                title: 'Detail Arsip Pengajuan',
                html: htmlContent,
                width: '640px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#003399',
                didOpen: () => {
                    const titleEl = Swal.getTitle();
                    if (titleEl) {
                        titleEl.style.color = '#111827';
                        titleEl.style.fontWeight = '800';
                        titleEl.style.fontSize = '22px';
                        titleEl.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
                        titleEl.style.letterSpacing = '-0.2px';
                    }
                }
            });
        } catch (err) {
            Swal.fire('Error', 'Gagal memuat detail arsip.', 'error');
        }
    };

    const filteredData = archive.filter(s => {
        const matchName = (s.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchUnit = filterUnit === '' || String(s.unit_id) === String(filterUnit);
        const matchDate = filterDate === '' || (s.tanggal_selesai && s.tanggal_selesai.includes(filterDate));
        const matchType = filterType === '' || String(s.submission_type_id) === String(filterType); 

        return matchName && matchUnit && matchDate && matchType;
    });

    const getStatusColor = (status) => {
        if (status?.includes('Selesai')) return '#27ae60';
        if (status === 'Dalam Masa Kegiatan') return '#0055cc';
        return '#e74c3c';
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

                    <div style={styles.navItem} onClick={() => navigate('/admin/users')}>
                        <div style={styles.navLinkContent}><UserCog size={20} /> <span>Manajemen Pengguna</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/units')}>
                        <div style={styles.navLinkContent}><Building2 size={20} /> <span>Manajemen Unit</span></div>
                    </div>

                    <div style={styles.navItemActive}>
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
                    {/* Section header */}
                    <div style={{ marginBottom: '28px' }}>
                        <div style={styles.accentBar} />
                        <h2 style={styles.sectionTitle}>Arsip Data Peserta</h2>
                        <p style={styles.sectionDesc}>Pusat data peserta magang yang sedang berjalan, telah selesai, atau ditolak.</p>
                    </div>

                    {/* Filter bar */}
                    <div style={styles.filterBar}>
                        <div style={styles.searchBox}>
                            <Search size={18} color="#003399" />
                            <input 
                                placeholder="Cari nama peserta..." 
                                style={styles.input} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <select style={styles.selectBox} value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
                            <option value="">Semua Unit</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                        </select>
                        <select style={styles.selectBox} value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">Semua Jenis</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                        </select>
                        <input type="date" style={styles.selectBox} onChange={e => setFilterDate(e.target.value)} />
                    </div>

                    {/* Tabel */}
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={{...styles.th, width: '50px'}}>No</th>
                                    <th style={styles.th}>Nama Mahasiswa</th>
                                    <th style={styles.th}>Unit Magang</th>
                                    <th style={styles.th}>Jenis</th>
                                    <th style={styles.th}>Tanggal Mulai</th>
                                    <th style={styles.th}>Tanggal Selesai</th>
                                    <th style={{...styles.th, textAlign: 'center'}}>Status Akhir</th>
                                    <th style={{...styles.th, textAlign:'center', width: '120px'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? filteredData.map((s, index) => (
                                    <tr key={index} style={styles.tableRow}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}><b style={{color: '#111827'}}>{s.nama_lengkap}</b></td>
                                        <td style={styles.td}>
                                            <span style={{color: '#003399', fontWeight: 'bold'}}>{s.nama_unit}</span>
                                        </td>
                                        <td style={styles.td}>{s.nama_jenis}</td>
                                        <td style={styles.td}>{new Date(s.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                        <td style={styles.td}>{new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <span style={{ color: getStatusColor(s.status), fontWeight: 'bold', fontSize: '13px' }}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <button onClick={() => viewDetail(s.id)} style={styles.btnDetail} title="Lihat Detail">
                                                <Eye size={14}/> Lihat
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" style={{textAlign:'center', padding:'40px', color: '#aaa'}}>Tidak ada data arsip yang cocok.</td>
                                    </tr>
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

    // SECTION HEADER
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },

    // FILTER BAR
    filterBar: { display: 'flex', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' },
    searchBox: { flex: 2, minWidth: '260px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    selectBox: { flex: 1, minWidth: '160px', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e0e7ff', outline: 'none', backgroundColor: '#fff', fontSize: '14px', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },

    // TABLE
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: 'transparent' },
    th: { padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle', color: '#374151', fontSize: '14px' },
    tableRow: {},

    // BUTTONS
    btnDetail: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0f4ff', color: '#003399', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default ArchiveManagement;
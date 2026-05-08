import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    LayoutDashboard, RefreshCcw, UserCog, Building2, FileText, 
    LogOut, Search, Eye, ChevronDown, ClipboardCheck, Archive, Bell
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

    // State Sidebar Dropdown
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(false);

    // Ambil data user untuk header
    const user = JSON.parse(sessionStorage.getItem('user')) || {};

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
            
            // ✨ UPDATE: Tambahkan 'Dalam Masa Kegiatan' agar ikut masuk ke tabel Arsip Data Peserta
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

            let htmlContent = `
                <div style="text-align:left; font-family: sans-serif; font-size: 14px; color: #333;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px;">👤 Data Mahasiswa</h4>
                        <p style="margin: 5px 0;"><b>Nama Lengkap:</b> ${s.nama_lengkap}</p>
                        <p style="margin: 5px 0;"><b>Asal Instansi:</b> ${s.asal_instansi || '-'}</p>
                    </div>

                    <div style="background: #fff4e5; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <h4 style="margin-top:0; color: #d35400; border-bottom: 2px solid #d35400; padding-bottom: 5px;">📋 Detail Pelaksanaan</h4>
                        <p style="margin: 5px 0;"><b>Jenis Kegiatan:</b> ${s.nama_jenis}</p>
                        <p style="margin: 5px 0;"><b>Unit Magang:</b> ${s.nama_unit}</p>
                        <p style="margin: 5px 0;"><b>Judul Project:</b> ${s.judul_atau_tujuan}</p>
                        <p style="margin: 5px 0;"><b>Kategori:</b> ${s.kategori_pendaftar} (${s.jumlah_anggota} orang)</p>
                        <p style="margin: 5px 0;"><b>Dosen/Guru Pembimbing:</b> ${s.nama_pembimbing || '-'}</p>
                        <p style="margin: 5px 0;"><b>Kontak Pembimbing:</b> ${s.kontak_pembimbing || '-'}</p>
                        <p style="margin: 5px 0;"><b>Periode:</b> ${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                    </div>

                    <div style="padding: 15px; background: #e0f0ff; border-radius: 10px;">
                        <h4 style="margin-top:0; color: #0055cc; border-bottom: 2px solid #0055cc; padding-bottom: 5px;">📁 Arsip Dokumen Lampiran</h4>
                        ${docs.length > 0 ? docs.map((doc, i) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">
                                <span>${i + 1}. ${doc.nama_dokumen || 'Berkas'}</span>
                                <a href="http://localhost:5000/${doc.file_path}" target="_blank" 
                                   style="background: #0055cc; color: #fff; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; font-weight: bold;">
                                    👁️ Lihat Berkas
                                </a>
                            </div>
                        `).join('') : '<p style="color: #999; margin:0;">Tidak ada dokumen dilampirkan.</p>'}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Arsip Detail Pengajuan',
                html: htmlContent,
                width: '600px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#ff6600',
                showCloseButton: true
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

    return (
        <div style={styles.container}>
            {/* SIDEBAR PREMIUM STYLE */}
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
            
            {/* MAIN CONTENT */}
            <div style={styles.main}>
                <div style={styles.contentScroll}>
                    <div style={styles.headerArea}>
                        <h2 style={{margin:0, color:'#003399'}}>Arsip Data Peserta 📂</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Pusat data detail peserta magang yang sedang berjalan, selesai, atau ditolak.</p>
                    </div>

                    {/* BARIS FILTER */}
                    <div style={styles.filterBar}>
                        <div style={styles.searchBox}>
                            <Search size={16} color="#888" />
                            <input 
                                placeholder="Cari Nama Peserta..." 
                                style={styles.input} 
                                onChange={e => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <select style={styles.select} onChange={e => setFilterUnit(e.target.value)}>
                            <option value="">Semua Unit</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                        </select>
                        <select style={styles.select} onChange={e => setFilterType(e.target.value)}>
                            <option value="">Semua Jenis</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                        </select>
                        <input type="date" style={styles.select} onChange={e => setFilterDate(e.target.value)} />
                    </div>

                    {/* TABEL */}
                    <div style={styles.card}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>No</th>
                                    <th style={styles.th}>Nama Mahasiswa</th>
                                    <th style={styles.th}>Unit Magang</th>
                                    <th style={styles.th}>Jenis</th>
                                    <th style={styles.th}>Tanggal Mulai</th>
                                    <th style={styles.th}>Tanggal Selesai</th>
                                    <th style={styles.th}>Detail Form</th>
                                    <th style={{...styles.th, textAlign:'center'}}>Status Akhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? filteredData.map((s, index) => {
                                    // Logika warna badge status
                                    let bg = '#fdeaea'; let textColor = '#e74c3c'; // Default: Merah (Ditolak)
                                    if (s.status.includes('Selesai')) {
                                        bg = '#e1f7e7'; textColor = '#27ae60'; // Hijau (Selesai)
                                    } else if (s.status === 'Dalam Masa Kegiatan') {
                                        bg = '#e0f0ff'; textColor = '#0055cc'; // Biru (Sedang Berjalan)
                                    }

                                    return (
                                        <tr key={index} style={styles.row}>
                                            <td style={styles.td}>{index + 1}</td>
                                            <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                            <td style={styles.td}>{s.nama_unit}</td>
                                            <td style={styles.td}>{s.nama_jenis}</td>
                                            <td style={styles.td}>{new Date(s.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                            <td style={styles.td}>{new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                            <td style={styles.td}>
                                                <button onClick={() => viewDetail(s.id)} style={styles.btnDetail}>
                                                    <Eye size={14}/> Lihat Form
                                                </button>
                                            </td>
                                            <td style={{...styles.td, textAlign:'center'}}>
                                                <span style={{
                                                    padding:'5px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold',
                                                    backgroundColor: bg,
                                                    color: textColor,
                                                    display: 'inline-block'
                                                }}>{s.status}</span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="8" style={{textAlign:'center', padding:'30px', color: '#aaa'}}>Tidak ada data arsip yang cocok.</td>
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
    headerArea: { marginBottom: '30px' },
    filterBar: { display: 'flex', gap: '15px', marginBottom: '25px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '0 15px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    input: { border: 'none', outline: 'none', padding: '12px', width: '100%', fontSize: '14px', color: '#333' },
    select: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none', backgroundColor: '#fff', fontSize: '14px', color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle', color: '#444', fontSize: '14px' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    btnDetail: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s' }
};

export default ArchiveManagement;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    LayoutDashboard, UserCog, Building2, Archive, 
    LogOut, Search, Eye 
} from 'lucide-react';

const ArchiveManagement = () => {
    const [archive, setArchive] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [units, setUnits] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchArchive();
        fetchUnits();
        window.scrollTo(0, 0);
    }, []);

    const fetchArchive = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            // Ambil yang Selesai atau Ditolak
            const finished = res.data.filter(s => 
                s.status === 'Selesai (Surat Dirilis)' || s.status === 'Ditolak'
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

    // Fungsi Pop-Up Detail Dokumen
    const viewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const s = res.data;
            const docs = s.documents || [];

            let htmlContent = `
                <div style="text-align:left; font-family: sans-serif; font-size: 14px; color: #333;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; marginBottom: 20px;">
                        <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px;">👤 Data Mahasiswa</h4>
                        <p><b>Nama Lengkap:</b> ${s.nama_lengkap}</p>
                        <p><b>Asal Instansi:</b> ${s.asal_instansi || '-'}</p>
                    </div>

                    <div style="padding: 10px 15px;">
                        <h4 style="color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px;">📋 Detail Pelaksanaan</h4>
                        <p><b>Jenis Kegiatan:</b> ${s.nama_jenis}</p>
                        <p><b>Unit Tempat Magang:</b> ${s.nama_unit}</p>
                        <p><b>Judul Project:</b> ${s.judul_atau_tujuan}</p>
                        <p><b>Kategori:</b> ${s.kategori_pendaftar} (${s.jumlah_anggota} orang)</p>
                        <p><b>Periode:</b> ${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #e0f0ff; border-radius: 10px;">
                        <h4 style="margin-top:0; color: #0055cc;">📁 Arsip Dokumen Lampiran</h4>
                        ${docs.length > 0 ? docs.map((doc, i) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">
                                <span>${i + 1}. ${doc.nama_dokumen || 'Berkas'}</span>
                                <a href="http://localhost:5000/${doc.file_path}" target="_blank" 
                                   style="background: #0055cc; color: #fff; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; font-weight: bold;">
                                    👁️ Lihat Berkas
                                </a>
                            </div>
                        `).join('') : '<p style="color: #999;">Tidak ada dokumen dilampirkan.</p>'}
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
        return matchName && matchUnit && matchDate;
    });

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                <div style={styles.menuItem} onClick={() => navigate('/super-admin')}>
                    <LayoutDashboard size={18}/> Monitoring Pengajuan
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}>
                    <UserCog size={18}/> Manajemen Pengguna
                </div>
                <div style={styles.menuItem} onClick={() => navigate('/admin/units')}>
                    <Building2 size={18}/> Manajemen Unit
                </div>
                <div style={styles.menuActive}>
                    <Archive size={18}/> Arsip Data Peserta
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar Sistem
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={styles.main}>
                <div style={styles.headerArea}>
                    <h2 style={{margin:0, color:'#003399'}}>Arsip Data Peserta 📂</h2>
                    <p style={{color:'#666', fontSize:'14px'}}>Data seluruh peserta magang yang telah menyelesaikan proses.</p>
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
                                <th style={styles.th}>Tanggal Mulai</th>
                                <th style={styles.th}>Tanggal Selesai</th>
                                <th style={styles.th}>Detail Dokumen</th>
                                <th style={{...styles.th, textAlign:'center'}}>Status Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((s, index) => (
                                <tr key={index} style={styles.row}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                    <td style={styles.td}>{s.nama_unit}</td>
                                    <td style={styles.td}>{new Date(s.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                    <td style={styles.td}>{new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                    <td style={styles.td}>
                                        <button onClick={() => viewDetail(s.id)} style={styles.btnDetail}>
                                            <Eye size={14}/> Lihat Form Arsip
                                        </button>
                                    </td>
                                    <td style={{...styles.td, textAlign:'center'}}>
                                        <span style={{
                                            padding:'5px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold',
                                            backgroundColor: s.status.includes('Selesai') ? '#e1f7e7' : '#fdeaea',
                                            color: s.status.includes('Selesai') ? '#27ae60' : '#e74c3c'
                                        }}>{s.status}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{textAlign:'center', padding:'30px', color: '#aaa'}}>Tidak ada data arsip yang cocok.</td>
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
    // ✨ FIX LAYOUT: Sidebar dibikin tetap (fixed width & sticky) supaya tidak membesar ✨
    container: { display: 'flex', height: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', minWidth: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'sticky', top: 0, height: '100vh', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
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
    row: { transition: '0.2s' },
    
    // Style tombol detail
    btnDetail: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s' }
};

export default ArchiveManagement;
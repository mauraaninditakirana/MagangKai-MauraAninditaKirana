import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, UserCog, Building2, Archive, 
    LogOut, Search, Calendar, Filter, FileText 
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

    const filteredData = archive.filter(s => {
        const matchName = (s.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchUnit = filterUnit === '' || String(s.unit_id) === String(filterUnit);
        const matchDate = filterDate === '' || (s.created_at && s.created_at.includes(filterDate));
        return matchName && matchUnit && matchDate;
    });

    return (
        <div style={styles.container}>
            {/* SIDEBAR - DISAMAKAN PERSIS DENGAN HALAMAN LAIN */}
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

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Tanggal Selesai</th>
                                <th style={styles.th}>Nama Mahasiswa</th>
                                <th style={styles.th}>Unit Magang</th>
                                <th style={{...styles.th, textAlign:'center'}}>Status Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map((s, index) => (
                                <tr key={index} style={styles.row}>
                                    <td style={styles.td}>{new Date(s.updated_at || s.created_at).toLocaleDateString('id-ID')}</td>
                                    <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                    <td style={styles.td}>{s.nama_unit}</td>
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
                                    <td colSpan="4" style={{textAlign:'center', padding:'30px', color: '#aaa'}}>Tidak ada data arsip yang cocok.</td>
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
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle', color: '#444' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } }
};

export default ArchiveManagement;
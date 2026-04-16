import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    LayoutDashboard, FileText, LogOut, Search, CheckCircle, XCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [activeMenu, setActiveMenu] = useState('monitoring'); // 'monitoring' atau 'arsip'
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        fetchData(parsedUser.unit_id);
    }, [navigate]);

    const fetchData = async (unitId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?unit_id=${unitId}`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error("Gagal ambil data unit:", err);
        }
    };

    // Setujui / Tolak 
    const handleAction = async (id, actionType) => {
        const newStatus = actionType === 'approve' ? 'Disetujui Unit' : 'Ditolak';
        const confirmText = actionType === 'approve' ? 'Anda yakin ingin menyetujui peserta ini untuk magang di Unit Anda?' : 'Anda yakin ingin menolak peserta ini?';
        const confirmColor = actionType === 'approve' ? '#28a745' : '#dc3545';

        const result = await Swal.fire({
            title: 'Konfirmasi Tindakan',
            text: confirmText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            cancelButtonColor: '#6c757d',
            confirmButtonText: actionType === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: newStatus,
                    catatan: `Pengajuan ${actionType === 'approve' ? 'disetujui' : 'ditolak'} oleh Kepala Unit.`,
                    admin_id: userData.id
                });
                
                Swal.fire('Berhasil!', `Status telah diubah menjadi ${newStatus}.`, 'success');
                fetchData(userData.unit_id); // Refresh data agar tombol langsung hilang
            } catch (err) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat memproses status.', 'error');
            }
        }
    };

    if (!userData) return null;

    // Filter data untuk Monitoring (Yang sedang berjalan)
    const monitoringData = submissions.filter(s => s.status !== 'Selesai (Surat Dirilis)' && s.status !== 'Ditolak');

    // Filter data untuk Arsip (Yang sudah selesai saja)
    const archiveData = submissions.filter(s => s.status === 'Selesai (Surat Dirilis)');

    const displayData = activeMenu === 'monitoring' ? monitoringData : archiveData;

    return (
        <div style={styles.container}>
            {/* SIDEBAR ADMIN UNIT */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>UNIT</span></h3>
                    <small style={{opacity:0.7}}>{userData.nama_unit || 'Kepala Unit'}</small>
                </div>
                
                <div 
                    style={activeMenu === 'monitoring' ? styles.menuActive : styles.menuItem} 
                    onClick={() => setActiveMenu('monitoring')}
                >
                    <LayoutDashboard size={18}/> Monitoring Tugas
                </div>

                <div 
                    style={activeMenu === 'arsip' ? styles.menuActive : styles.menuItem} 
                    onClick={() => setActiveMenu('arsip')}
                >
                    <FileText size={18}/> Arsip Peserta Unit
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                <div style={styles.header}>
                    <h2 style={{color:'#003399', margin: 0}}>
                        {activeMenu === 'monitoring' ? 'Monitoring Peserta Aktif 📋' : 'Arsip Alumni Unit 📂'}
                    </h2>
                    <div style={styles.searchBox}>
                        <Search size={16} color="#888" />
                        <input 
                            placeholder="Cari nama peserta..." 
                            style={styles.searchInput}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>No</th>
                                <th style={styles.th}>Nama Peserta</th>
                                <th style={styles.th}>Asal Instansi</th>
                                {activeMenu === 'monitoring' ? (
                                    <>
                                        <th style={styles.th}>Jenis</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={styles.th}>Tanggal Mulai</th>
                                        <th style={styles.th}>Tanggal Selesai</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.filter(s => s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map((s, i) => (
                                <tr key={s.id} style={styles.row}>
                                    <td style={styles.td}>{i + 1}</td>
                                    <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                    <td style={styles.td}>{s.asal_instansi || '-'}</td>
                                    
                                    {activeMenu === 'monitoring' ? (
                                        <>
                                            <td style={styles.td}>{s.nama_jenis}</td>
                                            <td style={styles.td}>
                                                <span style={styles.badge}>{s.status}</span>
                                            </td>
                                            <td style={{...styles.td, textAlign: 'center'}}>
                                                {/* ✨ HANYA MUNCUL JIKA STATUS 'Ditinjau Unit' ✨ */}
                                                {s.status === 'Ditinjau Unit' ? (
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                        <button onClick={() => handleAction(s.id, 'approve')} style={styles.btnApprove}>
                                                            <CheckCircle size={14}/> Setujui
                                                        </button>
                                                        <button onClick={() => handleAction(s.id, 'reject')} style={styles.btnReject}>
                                                            <XCircle size={14}/> Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{color: '#999', fontSize: '12px', fontStyle: 'italic'}}>
                                                        {s.status === 'Disetujui Unit' ? 'Menunggu Rilis Pusat' : '-'}
                                                    </span>
                                                )}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={styles.td}>{new Date(s.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                            <td style={styles.td}>{new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {displayData.length === 0 && (
                        <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>
                            Tidak ada data untuk ditampilkan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd' },
    searchInput: { border: 'none', outline: 'none', fontSize: '13px' },
    card: { backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { textAlign: 'left', padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', fontSize: '14px' },
    badge: { padding: '4px 10px', backgroundColor: '#e0f0ff', color: '#0055cc', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    btnApprove: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#e6ffe6', color: '#28a745', border: '1px solid #28a745', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    btnReject: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ffe6e6', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default AdminDashboard;
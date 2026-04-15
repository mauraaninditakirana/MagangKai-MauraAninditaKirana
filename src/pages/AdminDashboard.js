import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, ClipboardList, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        if (!user.role || (user.role !== 'Admin Unit' && user.role !== 'admin')) { 
            navigate('/'); 
            return; 
        }
        fetchUnitData();
    }, [navigate, user.role]);

    const fetchUnitData = async () => {
        try {
            // Ambil semua data, lalu filter secara manual dengan String() agar akurat
            const res = await axios.get('http://localhost:5000/api/submissions');
            
            console.log("🔍 Identitas Admin:", user);
            console.log("📦 Total Data di Database:", res.data);

            const unitData = (res.data || []).filter(s => 
                s.status === 'Ditinjau Unit' && 
                String(s.unit_id) === String(user.unit_id)
            );
            
            console.log("✅ Data yang Lolos Filter:", unitData);
            setSubmissions(unitData);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        }
    };

    
    const viewDocs = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const docs = res.data.documents;
            if (!docs || docs.length === 0) return Swal.fire('Info', 'Tidak ada dokumen pendukung.', 'info');

            let list = '<div style="text-align:left">';
            docs.forEach((doc, i) => {
                list += `<p>${i+1}. <a href="http://localhost:5000/${doc.file_path}" target="_blank" style="color:#003399; font-weight:bold;">Lihat ${doc.nama_dokumen || 'File'}</a></p>`;
            });
            list += '</div>';

            Swal.fire({ title: 'Dokumen Persyaratan', html: list, confirmButtonColor: '#ff6600' });
        } catch (err) { Swal.fire('Error', 'Gagal memuat dokumen', 'error'); }
    };

    const sendDecision = async (id, decision) => {
        const statusResult = decision === 'Setuju' ? 'Disetujui Unit' : 'Ditolak';
        
        //konfirmasi ganda biar Admin tidak salah klik
        const confirm = await Swal.fire({
            title: `Yakin ingin ${decision} mahasiswa ini?`,
            text: decision === 'Setuju' ? "Kuota unit akan otomatis terpotong." : "Mahasiswa akan ditolak.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: decision === 'Setuju' ? '#2ecc71' : '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: `Ya, ${decision}!`
        });

        if (confirm.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: statusResult,
                    catatan: `Rekomendasi / Keputusan dari Unit ${user.nama_lengkap || ''}`,
                    admin_id: user.id
                });

                Swal.fire('Berhasil!', `Status pendaftar telah ${statusResult}.`, 'success');
                fetchUnitData(); 
            } catch (error) {
                Swal.fire('Gagal', 'Terjadi kesalahan pada server.', 'error');
                console.error(error);
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={{...styles.sidebar, backgroundColor: '#34495e'}}>
                <h3 style={{color: '#fff'}}>UNIT <span style={{color: '#ff6600'}}>KAI</span></h3>
                <div style={styles.menuActive}><ClipboardList size={18}/> Antrean Masuk</div>
                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}><LogOut size={18}/> Keluar</div>
            </div>

            <div style={styles.main}>
                <h2>Antrean Masuk Unit: {user.nama_lengkap || 'Admin'} 🚄</h2>
                <p>Silakan evaluasi berkas pendaftar di bawah ini.</p>

                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={styles.th}>Mahasiswa</th>
                                <th style={styles.th}>Keperluan</th>
                                <th style={styles.th}>Dokumen</th>
                                <th style={{...styles.th, textAlign:'center'}}>Keputusan Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length > 0 ? submissions.map(s => (
                                <tr key={s.id} style={styles.row}>
                                    <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                    <td style={styles.td}>{s.nama_jenis}</td>
                                    <td style={styles.td}>
                                        {/* ✨ Tombol ini sekarang hidup! ✨ */}
                                        <button onClick={() => viewDocs(s.id)} style={styles.btnBlue}>
                                            <Eye size={14} style={{marginRight: '5px'}}/> Lihat Proposal
                                        </button>
                                    </td>
                                    <td style={{...styles.td, display:'flex', gap:'10px', justifyContent:'center'}}>
                                        <button onClick={() => sendDecision(s.id, 'Setuju')} style={styles.btnGreen}>
                                            <Check size={16} style={{marginRight: '5px'}}/> Setujui
                                        </button>
                                        <button onClick={() => sendDecision(s.id, 'Tolak')} style={styles.btnRed}>
                                            <X size={16} style={{marginRight: '5px'}}/> Tolak
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#7f8c8d'}}>
                                        Tidak ada antrean pengajuan baru untuk unit ini.
                                    </td>
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
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' },
    sidebar: { width: '250px', backgroundColor: '#003399', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '10px', marginTop: '20px', fontWeight: 'bold' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', transition: '0.2s' },
    main: { flex: 1, padding: '40px' },
    tableCard: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { textAlign: 'left', padding: '15px', color: '#2c3e50', borderBottom: '2px solid #eee' },
    row: { transition: '0.2s', ':hover': { backgroundColor: '#f8f9fa' } },
    td: { padding: '15px', borderBottom: '1px solid #eee', color: '#34495e' },
    btnGreen: { display: 'flex', alignItems: 'center', backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnRed: { display: 'flex', alignItems: 'center', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnBlue: { display: 'flex', alignItems: 'center', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminDashboard;
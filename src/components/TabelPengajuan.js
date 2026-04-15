import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Clock, CheckCircle, XCircle, Download, FileCheck } from 'lucide-react';

const TabelPengajuan = ({ userId }) => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        fetchSubmissions();
    }, [userId]);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?user_id=${userId}`);
            setSubmissions(res.data);
        } catch (error) {
            console.error("Gagal mengambil data pengajuan", error);
        }
    };

    // ✨ EDIT 1: Menambahkan semua status baru ke dalam styling ✨
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selesai (Surat Dirilis)': 
                return { color: '#27ae60', icon: <FileCheck size={16} /> }; // Hijau Tua
            case 'Disetujui Unit': 
                return { color: '#0055cc', icon: <CheckCircle size={16} /> }; // Biru KAI
            case 'Ditinjau Unit': 
                return { color: '#ff6600', icon: <Clock size={16} /> }; // Oranye
            case 'Menunggu Verifikasi': 
                return { color: '#3498db', icon: <Clock size={16} /> }; // Biru Muda
            case 'Revisi': 
                return { color: '#f39c12', icon: <Clock size={16} /> }; // Kuning
            case 'Ditolak': 
                return { color: '#e74c3c', icon: <XCircle size={16} /> }; // Merah
            default: 
                return { color: '#7f8c8d', icon: <Clock size={16} /> };
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={{color: '#003399', marginBottom: '15px'}}>Riwayat & Status Pengajuan</h3>
            <div style={styles.tableResponsive}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.headerRow}>
                            <th style={styles.th}>Unit</th>
                            <th style={styles.th}>Judul Project</th>
                            <th style={styles.th}>Status Tracking</th>
                            <th style={styles.th}>Unduh Berkas Balasan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? submissions.map((s) => {
                            const statusStyle = getStatusStyle(s.status);
                            return (
                                <tr key={s.id} style={styles.row}>
                                    <td style={styles.td}><b>{s.nama_unit}</b></td>
                                    <td style={styles.td}>{s.judul_atau_tujuan}</td>
                                    <td style={styles.td}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: statusStyle.color, fontWeight: 'bold'}}>
                                            {statusStyle.icon} {s.status}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {/* ✨ EDIT 2: Logika Download disesuaikan dengan status 'Selesai' ✨ */}
                                        {s.status === 'Selesai (Surat Dirilis)' ? (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <a 
                                                    href={`http://localhost:5000/api/submissions/${s.id}/download`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    style={styles.btnDownload}
                                                >
                                                    <Download size={14} /> Surat Balasan
                                                </a>
                                                <a 
                                                    href="/template-id-card.pdf" 
                                                    download 
                                                    style={{...styles.btnDownload, backgroundColor: '#ff6600'}}
                                                >
                                                    <Download size={14} /> ID Card
                                                </a>
                                            </div>
                                        ) : (
                                            <span style={{color: '#aaa', fontSize: '12px', fontStyle: 'italic'}}>
                                                {s.status === 'Ditolak' ? 'Mohon maaf, pengajuan ditolak' : 'Tersedia setelah disetujui pusat'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#888'}}>Belum ada riwayat pengajuan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px' },
    tableResponsive: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    headerRow: { backgroundColor: '#f8f9fa', textAlign: 'left' },
    th: { padding: '15px', borderBottom: '2px solid #eee', fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #eee', fontSize: '13px', color: '#444' },
    row: { transition: '0.3s' },
    btnDownload: { 
        display: 'flex', alignItems: 'center', gap: '5px', 
        backgroundColor: '#27ae60', color: '#fff', 
        padding: '8px 14px', borderRadius: '8px', 
        textDecoration: 'none', fontSize: '11px', fontWeight: 'bold',
        transition: '0.2s'
    }
};

export default TabelPengajuan;
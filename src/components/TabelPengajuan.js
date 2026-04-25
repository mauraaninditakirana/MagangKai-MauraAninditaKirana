import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const TabelPengajuan = ({ userId }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        if (userId) {
            fetchRiwayat();
        }
    }, [userId]);

    const fetchRiwayat = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?user_id=${userId}`);
            setData(res.data);
        } catch (err) {
            console.error("Gagal ambil riwayat:", err);
        }
    };

    const showCatatan = (catatan) => {
        Swal.fire({
            title: 'Catatan Revisi',
            text: catatan || 'Silakan cek kembali berkas Anda.',
            icon: 'info',
            confirmButtonColor: '#ff6600'
        });
    };

    const getStatusStyle = (status) => {
        if (status === 'Selesai (Surat Dirilis)') return { color: '#27ae60', icon: <CheckCircle size={16} />, bg: '#e1f7e7' };
        if (status === 'Dalam Masa Kegiatan') return { color: '#f39c12', icon: <Clock size={16} />, bg: '#fff4e5' };
        if (status === 'Selesai Kegiatan') return { color: '#2c3e50', icon: <CheckCircle size={16} />, bg: '#eef2f7' };
        
        // Logika aslimu yang lain tetap biarkan
        switch (status) {
            case 'Disetujui Unit': return { color: '#0055cc', icon: <Clock size={16} />, bg: '#e0f0ff' };
            case 'Ditinjau Unit': return { color: '#ff6600', icon: <Clock size={16} />, bg: '#fff4e5' };
            case 'Revisi': return { color: '#e67e22', icon: <AlertCircle size={16} />, bg: '#fef5e7' };
            case 'Ditolak Unit': 
            case 'Ditolak SDM': return { color: '#e74c3c', icon: <AlertCircle size={16} />, bg: '#f9ebea' };
            default: return { color: '#7f8c8d', icon: <Clock size={16} />, bg: '#f8f9fa' };
        }
    };

    return (
        <div style={styles.card}>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.thRow}>
                        <th style={styles.th}>Unit Tujuan</th>
                        <th style={styles.th}>Judul Project</th>
                        <th style={styles.th}>Status Tracking</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Aksi / Berkas</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? data.map((s) => {
                        const style = getStatusStyle(s.status);
                        return (
                            <tr key={s.id} style={styles.row}>
                                <td style={styles.td}><b>{s.nama_unit}</b></td>
                                <td style={styles.td}>{s.judul_atau_tujuan}</td>
                                <td style={styles.td}>
                                    <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                        color: style.color, backgroundColor: style.bg,
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' 
                                    }}>
                                        {style.icon} {s.status}
                                    </div>
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                    
                                    {/* TOMBOL REVISI  */}
                                    {s.status === 'Revisi' && (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button 
                                            onClick={() => showCatatan(s.catatan)}
                                            style={styles.btnInfo}
                                            title="Lihat alasan revisi"
                                        >
                                            Lihat Catatan
                                        </button>
                                        <button 
                                            style={styles.btnRevisi} 
                                            onClick={() => navigate(`/dashboard?revisi=${s.id}`, { 
                                                state: { 
                                                    activeTab: 'pengajuan', 
                                                    initialData: s //
                                                } 
                                            })}
                                        >
                                            Perbaiki Data
                                        </button>
                                    </div>
                                )}
                                    {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-final`, '_blank')}
                                            style={styles.btnDownload}
                                        >
                                            <Download size={14} /> Unduh Surat Balasan
                                        </button>
                                    )}

                                    {['Ditinjau Unit', 'Disetujui Unit, Menunggu Verifikasi SDM', 'Menunggu Verifikasi', 'Disetujui SDM, Menunggu Surat Pengantar Magang'].includes(s.status) && (
                                        <span style={styles.textWait}>Berkas sedang diproses</span>
                                    )}

                                    {s.status === 'Ditolak' && (
                                        <button onClick={() => showCatatan(s.catatan)} style={{...styles.btnInfo, color: '#e74c3c'}}>Lihat Alasan</button>
                                    )}
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Belum ada pengajuan.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    card: { backgroundColor: '#fff', borderRadius: '15px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { borderBottom: '2px solid #f0f0f0' },
    th: { textAlign: 'left', padding: '15px 12px', color: '#888', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '20px 12px', borderBottom: '1px solid #f9f9f9', fontSize: '14px' },
    btnDownload: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    btnEdit: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    btnInfo: { backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #d0dfff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
    textWait: { color: '#bbb', fontStyle: 'italic', fontSize: '12px' },
    btnRevisi: { 
    backgroundColor: '#ff6600', 
    color: '#fff', 
    border: 'none', 
    padding: '8px 12px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '11px', 
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
}
};

export default TabelPengajuan;
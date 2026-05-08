import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, AlertCircle, Calendar, MessageSquare, UserCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const TabelPengajuan = ({ userId, onAjukanJadwal, onKirimSDM }) => {
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

    const showCatatan = (submission) => {
        const catatan = submission.catatan;
        const catatanBy = submission.catatan_by || 'Admin';
        const catatanAt = submission.catatan_at 
            ? new Date(submission.catatan_at).toLocaleString('id-ID', { 
                day: '2-digit', month: 'long', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })
            : '-';
        const statusContext = submission.catatan_status || submission.status;

        // Tentukan warna & icon sesuai konteks
        const isRejected = (submission.status || '').toLowerCase().includes('ditolak');
        const accentColor = isRejected ? '#e74c3c' : '#ff6600';
        const headerBg = isRejected ? '#fdecea' : '#fff4e5';
        const titleText = isRejected ? '❌ Alasan Penolakan' : '📝 Catatan dari Admin';

        // Kalau memang tidak ada catatan sama sekali (kasus jarang)
        if (!catatan || catatan.trim() === '') {
            Swal.fire({
                title: titleText,
                html: `<p style="color:#888; font-style:italic;">Tidak ada catatan khusus dari admin. Silakan cek kembali detail pengajuan Anda.</p>`,
                confirmButtonColor: accentColor
            });
            return;
        }

        const htmlContent = `
            <div style="text-align: left; font-family: 'Segoe UI', sans-serif;">
                <div style="background:${headerBg}; border-left: 4px solid ${accentColor}; padding: 15px 18px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">
                        Konteks Status
                    </div>
                    <div style="color: ${accentColor}; font-weight: bold; font-size: 14px;">
                        ${statusContext}
                    </div>
                </div>

                <div style="background: #fafbfd; padding: 18px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #777; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">
                        💬 Isi Catatan
                    </div>
                    <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                        ${catatan.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </p>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 5px; font-size: 12px; color: #666;">
                    <div>
                        <span style="color:#888;">Dari:</span>
                        <b style="color: #003399; margin-left: 4px;">${catatanBy}</b>
                    </div>
                    <div style="color: #888;">
                        🕒 ${catatanAt}
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: titleText,
            html: htmlContent,
            width: '500px',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: accentColor
        });
    };

    const getStatusStyle = (status) => {
        // Status Akhir & Masa Kegiatan
        if (status === 'Selesai (Surat Dirilis)') return { color: '#27ae60', icon: <CheckCircle size={16} />, bg: '#e1f7e7' };
        if (status === 'Dalam Masa Kegiatan') return { color: '#f39c12', icon: <Clock size={16} />, bg: '#fff4e5' };
        if (status === 'Selesai Kegiatan') return { color: '#2c3e50', icon: <CheckCircle size={16} />, bg: '#eef2f7' };
        
        // Status Alur Wawancara & Berkas Akhir
        if (status === 'Atur Jadwal Wawancara') return { color: '#003399', icon: <Calendar size={16} />, bg: '#f0f4ff' };
        if (status === 'Jadwal Wawancara Diajukan') return { color: '#8e44ad', icon: <Clock size={16} />, bg: '#f5eeff' };
        if (status === 'Wawancara Disetujui') return { color: '#27ae60', icon: <CheckCircle size={16} />, bg: '#e1f7e7' };
        if (status === 'Selesai Wawancara (Lengkapi Berkas Akhir)') return { color: '#0055cc', icon: <AlertCircle size={16} />, bg: '#e0f0ff' };
        if (status === 'Berkas Akhir Terkirim') return { color: '#d35400', icon: <Clock size={16} />, bg: '#fef5e7' };
        if (status === 'Berkas Disetujui Unit') return { color: '#ff6600', icon: <CheckCircle size={16} />, bg: '#fff4e5' };
        
        // Status SDM Pusat & Unit
        if (status?.includes('Pusat') || status?.includes('SDM')) return { color: '#34495e', icon: <Clock size={16} />, bg: '#eef2f7' };

        switch (status) {
            case 'Ditinjau Unit': return { color: '#ff6600', icon: <Clock size={16} />, bg: '#fff4e5' };
            case 'Revisi': return { color: '#e67e22', icon: <AlertCircle size={16} />, bg: '#fef5e7' };
            case 'Ditolak Unit': 
            case 'Ditolak SDM':
            case 'Ditolak': return { color: '#e74c3c', icon: <AlertCircle size={16} />, bg: '#f9ebea' };
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
                                    {s.jadwal_wawancara && (
                                        <div style={{fontSize: '10px', color: '#666', marginTop: '6px'}}>
                                            📅 Jadwal: {new Date(s.jadwal_wawancara).toLocaleString('id-ID')}
                                        </div>
                                    )}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                    
                                    {/* 1. TOMBOL ATUR JADWAL */}
                                    {s.status === 'Atur Jadwal Wawancara' && (
                                        <button 
                                            onClick={() => onAjukanJadwal(s.id)} 
                                            style={{ ...styles.btnDownload, backgroundColor: '#003399', color: '#fff' }}
                                        >
                                            📅 Pilih Jadwal Wawancara
                                        </button>
                                    )}

                                    {/* ✨ 2. TOMBOL KIRIM KE SDM (Baru ditambahkan) ✨ */}
                                    {s.status === 'Berkas Disetujui Unit' && (
                                        <button 
                                            onClick={() => onKirimSDM(s.id)} 
                                            style={{ ...styles.btnDownload, backgroundColor: '#ff6600', color: '#fff', border: 'none', marginBottom: '5px' }}
                                        >
                                            Kirim ke SDM DAOP6
                                        </button>
                                    )}

                                    {/* 3. TOMBOL DOWNLOAD SURAT UNIT (REKOMENDASI) */}
                                    {['Berkas Disetujui Unit', 'Disetujui Unit, Menunggu Verifikasi SDM', 'Disetujui SDM, Menunggu Surat Pengantar Magang', 'Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan', 'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Setujui, Tunggu Pengajuan Dikirim ke Pusat', 'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-unit`, '_blank')}
                                            style={{ ...styles.btnDownload, backgroundColor: '#fff', color: '#003399', border: '1px solid #003399', marginRight: '5px', marginBottom: '5px' }}
                                        >
                                            📄 Surat Unit
                                        </button>
                                    )}

                                    {/* 4. TOMBOL DOWNLOAD SURAT PUSAT (FINAL) */}
                                    {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-final`, '_blank')}
                                            style={{...styles.btnDownload, marginBottom: '5px'}}
                                        >
                                            <Download size={14} /> Surat KAI Pusat
                                        </button>
                                    )}

                                    {/* 5. TOMBOL REVISI ATAU LENGKAPI BERKAS FINAL */}
                                    {(s.status === 'Revisi' || s.status === 'Selesai Wawancara (Lengkapi Berkas Akhir)') && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => showCatatan(s)} style={styles.btnInfo}>📝 Cek Catatan</button>
                                            <button 
                                                style={{...styles.btnRevisi, backgroundColor: s.status === 'Revisi' ? '#ff6600' : '#27ae60'}} 
                                                onClick={() => navigate(`/dashboard?revisi=${s.id}`, { 
                                                    state: { activeTab: 'pengajuan', initialData: s } 
                                                })}
                                            >
                                                {s.status === 'Revisi' ? 'Perbaiki Data' : 'Lengkapi Berkas'}
                                            </button>
                                        </div>
                                    )}

                                    {/* 6. TEXT MENUNGGU PROSES (Disesuaikan) */}
                                    {['Menunggu Verifikasi', 'Ditinjau Unit', 'Jadwal Wawancara Diajukan', 'Wawancara Disetujui', 'Berkas Akhir Terkirim', 'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Setujui, Tunggu Pengajuan Dikirim ke Pusat', 'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat'].includes(s.status) && (
                                        <div style={styles.textWait}>Sedang diproses internal...</div>
                                    )}

                                    {/* 7. TOMBOL DITOLAK */}
                                    {s.status.includes('Ditolak') && (
                                        <button onClick={() => showCatatan(s)} style={{...styles.btnInfo, color: '#e74c3c'}}>Lihat Alasan Ditolak</button>
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
    btnInfo: { backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #d0dfff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
    textWait: { color: '#bbb', fontStyle: 'italic', fontSize: '12px' },
    btnRevisi: { color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default TabelPengajuan;
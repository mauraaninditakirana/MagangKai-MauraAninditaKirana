import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, AlertCircle, Calendar, MessageSquare, FileText, Send } from 'lucide-react';
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

        const isRejected = (submission.status || '').toLowerCase().includes('ditolak');
        const accentColor = isRejected ? '#dc2626' : '#ff6600';
        const titleText = isRejected ? 'Alasan Penolakan' : 'Catatan dari Admin';

        const styleTitle = () => {
            const titleEl = Swal.getTitle();
            if (titleEl) {
                titleEl.style.color = '#111827';
                titleEl.style.fontWeight = '800';
                titleEl.style.fontSize = '22px';
                titleEl.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
                titleEl.style.letterSpacing = '-0.2px';
            }
        };

        if (!catatan || catatan.trim() === '') {
            Swal.fire({
                title: titleText,
                html: `<p style="color:#6b7280; font-style:italic; font-size:14px; margin:0;">Tidak ada catatan khusus dari admin. Silakan cek kembali detail pengajuan Anda.</p>`,
                confirmButtonColor: accentColor,
                confirmButtonText: 'Mengerti',
                didOpen: styleTitle
            });
            return;
        }

        const htmlContent = `
            <div style="text-align:left; font-family:'Segoe UI', Tahoma, sans-serif;">
                
                <div style="background:#fff4e5; padding:16px 20px; border-radius:12px; margin-bottom:12px; border:1px solid #ffe0b2;">
                    <div style="font-size:11px; color:${accentColor}; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px;">
                        ━━ Konteks Status
                    </div>
                    <div style="color:${accentColor}; font-weight:800; font-size:15px;">
                        ${statusContext}
                    </div>
                </div>

                <div style="background:#f8fafd; padding:16px 20px; border-radius:12px; margin-bottom:14px; border:1px solid #f0f4f8;">
                    <div style="font-size:11px; color:#003399; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:10px;">
                        ━━ Isi Catatan
                    </div>
                    <p style="color:#111827; font-size:14px; line-height:1.7; margin:0; white-space:pre-wrap; font-weight:500;">
                        ${catatan.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </p>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 4px 0; font-size:12px;">
                    <div>
                        <span style="color:#9ca3af;">Dari:</span>
                        <b style="color:#003399; margin-left:6px;">${catatanBy}</b>
                    </div>
                    <div style="color:#9ca3af;">
                        ${catatanAt}
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: titleText,
            html: htmlContent,
            width: '520px',
            confirmButtonText: 'Mengerti',
            confirmButtonColor: accentColor,
            didOpen: styleTitle
        });
    };

    const getStatusStyle = (status) => {
        if (status === 'Selesai (Surat Dirilis)') return { color: '#27ae60', icon: <CheckCircle size={16} />, bg: '#e1f7e7' };
        if (status === 'Dalam Masa Kegiatan') return { color: '#ff6600', icon: <Clock size={16} />, bg: '#fff4e5' };
        if (status === 'Selesai Kegiatan') return { color: '#2c3e50', icon: <CheckCircle size={16} />, bg: '#eef2f7' };
        if (status === 'Atur Jadwal Wawancara') return { color: '#003399', icon: <Calendar size={16} />, bg: '#f0f4ff' };
        if (status === 'Jadwal Wawancara Diajukan') return { color: '#8e44ad', icon: <Clock size={16} />, bg: '#f5eeff' };
        if (status === 'Wawancara Disetujui') return { color: '#27ae60', icon: <CheckCircle size={16} />, bg: '#e1f7e7' };
        if (status === 'Selesai Wawancara (Lengkapi Berkas Akhir)') return { color: '#0055cc', icon: <AlertCircle size={16} />, bg: '#e0f0ff' };
        if (status === 'Berkas Akhir Terkirim') return { color: '#d35400', icon: <Clock size={16} />, bg: '#fef5e7' };
        if (status === 'Berkas Disetujui Unit') return { color: '#ff6600', icon: <CheckCircle size={16} />, bg: '#fff4e5' };
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
                                <td style={styles.td}><b style={{color: '#111827'}}>{s.nama_unit}</b></td>
                                <td style={styles.td}>{s.judul_atau_tujuan}</td>
                                <td style={styles.td}>
                                     <div style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                        color: style.color,
                                        fontSize: '13px', fontWeight: 'bold' 
                                    }}>
                                        {style.icon} {s.status}
                                    </div>
                                    {s.jadwal_wawancara && ['Jadwal Wawancara Diajukan', 'Wawancara Disetujui'].includes(s.status) && (
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#003399',
                                            marginTop: '10px',
                                            fontWeight: 'bold',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 14px',
                                            backgroundColor: '#f0f4ff',
                                            borderRadius: '10px',
                                            border: '1px solid #cce0ff'
                                        }}>
                                            <Calendar size={14}/> Jadwal Wawancara: <span style={{color: '#0055cc'}}>{new Date(s.jadwal_wawancara).toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                    
                                    {/* 1. TOMBOL ATUR JADWAL */}
                                    {s.status === 'Atur Jadwal Wawancara' && (
                                        <button 
                                            onClick={() => onAjukanJadwal(s.id)} 
                                            style={{ ...styles.btnAction, backgroundColor: '#003399', color: '#fff' }}
                                        >
                                            <Calendar size={14}/> Pilih Jadwal Wawancara
                                        </button>
                                    )}

                                    {/* 2. TOMBOL KIRIM KE SDM */}
                                    {s.status === 'Berkas Disetujui Unit' && (
                                        <button 
                                            onClick={() => onKirimSDM(s.id)} 
                                            style={{ ...styles.btnAction, backgroundColor: '#ff6600', color: '#fff', marginBottom: '6px' }}
                                        >
                                            <Send size={14}/> Kirim ke SDM DAOP6
                                        </button>
                                    )}

                                    {/* 3. TOMBOL DOWNLOAD SURAT UNIT */}
                                    {['Berkas Disetujui Unit', 'Disetujui Unit, Menunggu Verifikasi SDM', 'Disetujui SDM, Menunggu Surat Pengantar Magang', 'Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan', 'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Setujui, Tunggu Pengajuan Dikirim ke Pusat', 'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-unit`, '_blank')}
                                            style={{ ...styles.btnAction, backgroundColor: '#fff', color: '#003399', border: '1px solid #003399', marginRight: '6px', marginBottom: '6px' }}
                                        >
                                            <FileText size={14}/> Surat Unit
                                        </button>
                                    )}

                                    {/* 4. TOMBOL DOWNLOAD SURAT PUSAT */}
                                    {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-final`, '_blank')}
                                            style={{...styles.btnAction, backgroundColor: '#ff6600', color: '#fff', marginBottom: '6px'}}
                                        >
                                            <Download size={14}/> Surat KAI Pusat
                                        </button>
                                    )}

                                    {/* 5. TOMBOL REVISI ATAU LENGKAPI BERKAS FINAL */}
                                    {(s.status === 'Revisi' || s.status === 'Selesai Wawancara (Lengkapi Berkas Akhir)') && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => showCatatan(s)} style={styles.btnInfo}>
                                                <MessageSquare size={14}/> Cek Catatan
                                            </button>
                                            <button 
                                                style={{...styles.btnAction, backgroundColor: s.status === 'Revisi' ? '#ff6600' : '#003399', color: '#fff'}} 
                                                onClick={() => navigate(`/dashboard?revisi=${s.id}`, { 
                                                    state: { activeTab: 'pengajuan', initialData: s } 
                                                })}
                                            >
                                                {s.status === 'Revisi' ? 'Perbaiki Data' : 'Lengkapi Berkas'}
                                            </button>
                                        </div>
                                    )}

                                    {/* 6. TEXT MENUNGGU PROSES */}
                                    {['Menunggu Verifikasi', 'Ditinjau Unit', 'Jadwal Wawancara Diajukan', 'Wawancara Disetujui', 'Berkas Akhir Terkirim', 'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Setujui, Tunggu Pengajuan Dikirim ke Pusat', 'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat'].includes(s.status) && (
                                        <div style={styles.textWait}>Sedang diproses internal...</div>
                                    )}

                                    {/* 7. TOMBOL DITOLAK */}
                                    {s.status.includes('Ditolak') && (
                                        <button onClick={() => showCatatan(s)} style={{...styles.btnInfo, color: '#e74c3c', border: '1px solid #fecaca'}}>
                                            <MessageSquare size={14}/> Lihat Alasan Ditolak
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Belum ada pengajuan.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    card: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: {},
    th: { textAlign: 'left', padding: '16px 12px', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '18px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
    btnAction: { display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    btnInfo: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #d0dfff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    textWait: { color: '#bbb', fontStyle: 'italic', fontSize: '12px' }
};

export default TabelPengajuan;
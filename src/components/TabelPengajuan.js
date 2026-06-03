import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Clock, CheckCircle, AlertCircle, Calendar, MessageSquare, FileText, Send } from 'lucide-react';
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

    const showRiwayat = async (submissionId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${submissionId}`);
            const s = res.data;
            const logs = s.logs || [];
            const docs = s.documents || [];

            const sectionCard = 'background:#f8fafd; padding:18px 22px; border-radius:12px; margin-bottom:14px; border:1px solid #f0f4f8;';
            const sectionLabel = 'font-size:11px; color:#003399; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; display:block;';

            let riwayatHtml = '';
            if (logs.length > 0) {
                riwayatHtml = logs.map(log => `
                    <div style="display:flex; gap:10px; padding:10px 0; border-bottom:1px dashed #e5e7eb; font-size:12px; color:#374151;">
                        <span style="min-width:8px; height:8px; background:#003399; border-radius:50%; margin-top:6px; flex-shrink:0;"></span>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#003399; margin-bottom:2px; font-size:13px;">${log.status_perubahan}</div>
                            <div style="color:#6b7280; line-height:1.5;">${log.catatan || '-'}</div>
                            <div style="color:#9ca3af; font-size:11px; margin-top:4px;">${new Date(log.created_at).toLocaleDateString('id-ID').split('/').reverse().map((v,i)=>i===0?v:v.padStart(2,'0')).reverse().join('-')}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                riwayatHtml = '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:14px 0;">Belum ada riwayat.</p>';
            }

            // Berkas yang user upload (bisa download ulang)
            let myBerkasHtml = '';
            const myDocs = docs.filter(d => 
                d.nama_dokumen !== 'Surat Pengantar dari Pusat' &&
                d.nama_dokumen !== 'Surat Keterangan Selesai'
            );
            if (myDocs.length > 0) {
                myBerkasHtml = myDocs.map((doc, i) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px 14px; border-radius:8px; margin-bottom:6px; border:1px solid #e0e7ff;">
                        <span style="font-size:13px; color:#374151; font-weight:600;">${i + 1}. ${doc.nama_dokumen || 'Berkas'}</span>
                        <a href="http://localhost:5000/${doc.file_path}" target="_blank" 
                           style="background:#003399; color:#fff; padding:6px 14px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">
                           Unduh Ulang
                        </a>
                    </div>
                `).join('');
            } else {
                myBerkasHtml = '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:14px 0;">Tidak ada berkas Anda yang ter-upload.</p>';
            }

            Swal.fire({
                title: 'Riwayat Pengajuan',
                html: `
                    <div style="text-align:left; font-family:'Segoe UI', Tahoma, sans-serif;">
                        <div style="${sectionCard}">
                            <span style="${sectionLabel}">━━ Berkas Saya (Upload-an Anda)</span>
                            ${myBerkasHtml}
                        </div>
                        <div style="${sectionCard} margin-bottom:0;">
                            <span style="${sectionLabel}">━━ Riwayat Perubahan Status</span>
                            ${riwayatHtml}
                        </div>
                    </div>
                `,
                width: '600px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#003399',
                didOpen: () => {
                    const titleEl = Swal.getTitle();
                    if (titleEl) {
                        titleEl.style.color = '#111827';
                        titleEl.style.fontWeight = '800';
                        titleEl.style.fontSize = '22px';
                        titleEl.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
                    }
                }
            });
        } catch (err) {
            Swal.fire('Error', 'Gagal memuat riwayat.', 'error');
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
                                </td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                    
                                    {/* 4. TOMBOL DOWNLOAD SURAT PUSAT */}
                                    {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan'].includes(s.status) && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-final`, '_blank')}
                                            style={{...styles.btnAction, backgroundColor: '#27ae60', color: '#fff', marginBottom: '6px'}}
                                        >
                                            <Download size={14}/> Surat Pengantar KAI Pusat
                                        </button>
                                    )}

                                    {/* Download Sertifikat — muncul kalau sudah selesai & ada sertifikat  */}
                                    {s.status === 'Selesai Kegiatan' && (
                                        <button 
                                            onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/download-sertifikat`, '_blank')}
                                            style={{...styles.btnAction, backgroundColor: '#9333ea', color: '#fff', marginBottom: '6px'}}
                                        >
                                            <Download size={14}/> Sertifikat
                                        </button>
                                    )}

                                    {/* Lihat Riwayat */}
                                    <button 
                                        onClick={() => showRiwayat(s.id)} 
                                        style={{...styles.btnInfo, marginBottom: '6px'}}
                                    >
                                        <Clock size={14}/> Lihat Riwayat
                                    </button>
                                    {s.status === 'Revisi' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <button onClick={() => showCatatan(s)} style={styles.btnInfo}>
                                                <MessageSquare size={14}/> Cek Catatan
                                            </button>
                                            <button 
                                                style={{...styles.btnAction, backgroundColor: '#ff6600', color: '#fff'}} 
                                                onClick={() => navigate(`/dashboard?revisi=${s.id}`, { 
                                                    state: { activeTab: 'pengajuan', initialData: s } 
                                                })}
                                            >
                                                Perbaiki Data
                                            </button>
                                        </div>
                                    )}
                                    {['Menunggu Verifikasi', 'Disetujui Unit, Menunggu Verifikasi SDM', 'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Disetujui SDM, Tunggu Pengajuan Dikirim ke Pusat', 'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat'].includes(s.status) && (
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, CheckCircle, XCircle, 
    ArrowRight, Upload, Search, LogOut, Eye, RefreshCcw, Edit3, UserCog, Building2
} from 'lucide-react';

const SuperAdminDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        // 1. Jika tidak ada data login sama sekali
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        
        // 2. Jika role bukan admin/super admin
        if (parsedUser.role !== 'Super Admin' && parsedUser.role !== 'admin') { 
            navigate('/'); 
            return; 
        }

        // 3. Jika lolos sensor, baru ambil data
        fetchData();
        
        // Memastikan halaman selalu mulai dari atas saat pindah menu
        window.scrollTo(0, 0);

    }, [navigate]); // Cukup navigate sebagai dependency agar stabil

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            const activeSubmissions = (res.data || []).filter(s => s.status !== 'Selesai (Surat Dirilis)');
            const sortedData = activeSubmissions.sort((a, b) => 
                new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
            );
            setSubmissions(sortedData);
        } catch (err) { 
            console.error("Gagal mengambil data:", err); 
        }
    };

    const viewDetail = async (id) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
        const s = res.data;
        const docs = s.documents || [];

        // Menyusun tampilan isi form di dalam pop-up
        let htmlContent = `
            <div style="text-align:left; font-family: sans-serif; font-size: 14px; color: #333;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; marginBottom: 20px;">
                    <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px;">👤 Data Mahasiswa</h4>
                    <p><b>Nama Lengkap:</b> ${s.nama_lengkap}</p>
                    <p><b>Asal Instansi:</b> ${s.asal_instansi || '-'}</p>
                </div>

                <div style="padding: 10px 15px;">
                    <h4 style="color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px;">📋 Detail Rencana</h4>
                    <p><b>Jenis Kegiatan:</b> ${s.nama_jenis}</p>
                    <p><b>Unit Tujuan:</b> ${s.nama_unit}</p>
                    <p><b>Judul Project:</b> ${s.judul_atau_tujuan}</p>
                    <p><b>Kategori:</b> ${s.kategori_pendaftar} (${s.jumlah_anggota} orang)</p>
                    <p><b>Periode:</b> ${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #fff4e5; border-radius: 10px;">
                    <h4 style="margin-top:0; color: #ff6600;">📁 Dokumen Lampiran</h4>
                    ${docs.length > 0 ? docs.map((doc, i) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px dotted #ccc;">
                            <span>${i + 1}. ${doc.nama_dokumen || 'Berkas'}</span>
                            <a href="http://localhost:5000/${doc.file_path}" target="_blank" 
                               style="background: #003399; color: #fff; padding: 4px 10px; border-radius: 5px; text-decoration: none; font-size: 12px; font-weight: bold;">
                               👁️ Lihat Dokumen
                            </a>
                        </div>
                    `).join('') : '<p style="color: #999;">Tidak ada dokumen dilampirkan.</p>'}
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Review Form Pengajuan',
            html: htmlContent,
            width: '600px',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#003399',
            showCloseButton: true
        });
    } catch (err) {
        Swal.fire('Error', 'Gagal memuat detail data.', 'error');
    }
};

    const handleAction = async (id, type) => {
        const isRevisi = type === 'revisi';
        const { value: catatan } = await Swal.fire({
            title: isRevisi ? 'Berikan Catatan Revisi' : 'Teruskan ke Unit?',
            input: 'textarea',
            inputLabel: isRevisi ? 'Apa yang perlu diperbaiki mahasiswa?' : 'Pesan tambahan (opsional)',
            inputPlaceholder: 'Tulis di sini...',
            showCancelButton: true,
            confirmButtonColor: isRevisi ? '#f39c12' : '#ff6600',
            confirmButtonText: isRevisi ? 'Kirim Revisi' : 'Ya, Teruskan'
        });

        if (catatan !== undefined) {
            await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                status: isRevisi ? 'Revisi' : 'Ditinjau Unit',
                catatan: catatan || (isRevisi ? 'Berkas kurang lengkap' : 'Diteruskan oleh Pusat'),
                admin_id: user.id
            });
            Swal.fire('Berhasil!', isRevisi ? 'Permintaan revisi dikirim' : 'Berhasil diteruskan', 'success');
            fetchData();
        }
    };

    const handleRilisSurat = async (id) => {
        const { value: file } = await Swal.fire({
            title: 'Upload Surat & ID Card',
            text: 'Pilih file (PDF/ZIP) yang berisi Surat Balasan Magang dan Template ID Card.',
            input: 'file',
            inputAttributes: {
                'accept': 'application/pdf, application/zip',
                'aria-label': 'Upload dokumen magang'
            },
            showCancelButton: true,
            confirmButtonText: 'Upload & Rilis',
            confirmButtonColor: '#2ecc71',
            cancelButtonColor: '#95a5a6'
        });

        if (file) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: 'Selesai (Surat Dirilis)',
                    catatan: `Selamat! Pengajuan magang Anda telah disetujui. Silakan unduh Surat Balasan dan ID Card Anda di menu dokumen.`,
                    admin_id: user.id
                });
                
                Swal.fire('Berhasil Rilis!', 'Surat magang dan ID Card berhasil dikirim ke dashboard mahasiswa.', 'success');
                fetchData(); 
            } catch (error) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat memproses surat.', 'error');
            }
        }
    };

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>PUSAT</span></h3>
                    <small style={{opacity:0.7}}>Sistem Manajemen Magang</small>
                </div>
                
                {/* Menu Monitoring (Active) */}
                <div style={styles.menuActive} onClick={() => navigate('/super-admin')}>
                    <LayoutDashboard size={18}/> Monitoring Pengajuan
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/admin/users')}>
                    <UserCog size={18}/> Manajemen Pengguna
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/admin/units')}>
                    <Building2 size={18}/> Manajemen Unit
                </div>
                
                <div style={styles.menuItem} onClick={() => navigate('/admin/archive')}>    
                    <FileText size={18}/> Arsip Data Peserta
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar Sistem
                </div>
            </div>

            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                <div style={styles.header}>
                    <div>
                        <h2 style={{margin:0, color:'#003399'}}>Monitoring Verifikasi 🚄</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Fase screening berkas dan validasi data mahasiswa</p>
                    </div>
                    
                    <div style={styles.searchContainer}>
                        <Search size={18} color="#003399" />
                        <input 
                            placeholder="Cari nama atau instansi..." 
                            style={styles.searchInput} 
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.thRow}>
                                <th style={{...styles.th, width:'50px'}}>No</th>
                                <th style={styles.th}>Data Mahasiswa</th>
                                <th style={styles.th}>Unit & Jenis</th>
                                <th style={styles.th}>Detail Pengajuan</th>
                                <th style={styles.th}>Status</th>
                                <th style={{...styles.th, textAlign:'center'}}>Aksi Fase</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.filter(s => (s.nama_lengkap || '').toLowerCase().includes((searchTerm || '').toLowerCase())).map((s, index) => (
                                <tr key={s.id} style={styles.row}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>
                                        <div style={{fontWeight: 'bold', color:'#333'}}>{s.nama_lengkap}</div>
                                        <div style={{fontSize: '11px', color: '#888'}}>{s.asal_instansi}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{fontSize: '13px'}}>{s.nama_unit}</div>
                                        <div style={{fontSize: '11px', color: '#ff6600', fontWeight:'600'}}>{s.nama_jenis}</div>
                                    </td>
                                    <td style={styles.td}>
                                    <button onClick={() => viewDetail(s.id)} style={styles.btnDetail}>
                                        <Eye size={14}/> Lihat Isi Form
                                    </button>
                                    </td>
                                    <td style={styles.td}><span style={styles.badge(s.status)}>{s.status}</span>
                                    {s.status === 'Menunggu Verifikasi' && s.catatan && s.catatan.includes('perbaikan') && (
                                        <div style={{ fontSize: '10px', color: '#ff6600', marginTop: '4px', fontWeight: 'bold' }}>
                                            (Data Baru Diperbaiki)
                                        </div>
                                    )}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                            {s.status === 'Menunggu Verifikasi' && (
                                                <>
                                                    <button onClick={() => handleAction(s.id, 'forward')} style={styles.btnForward} title="Teruskan ke Unit">
                                                        <ArrowRight size={16}/> Teruskan
                                                    </button>
                                                    <button onClick={() => handleAction(s.id, 'revisi')} style={styles.btnRevisi} title="Kembalikan untuk Revisi">
                                                        <Edit3 size={16}/> Revisi
                                                    </button>
                                                </>
                                            )}
                                            
                                            {s.status === 'Disetujui Unit' && (
                                                <button onClick={() => handleRilisSurat(s.id)} style={styles.btnFinal}>
                                                    <Upload size={14} style={{marginRight: '5px'}}/> Rilis Surat
                                                </button>
                                            )}
                                            
                                            {s.status === 'Selesai (Surat Dirilis)' && (
                                                <span style={{fontSize: '12px', color: '#27ae60', fontWeight: 'bold'}}>
                                                    <CheckCircle size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> Selesai
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
    searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '350px', border: '1px solid #e0e0e0' },
    searchInput: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    row: { transition: '0.2s', '&:hover': { backgroundColor: '#fcfcfc' } },
    badge: (status) => {
        let bg = '#e1f7e7'; let color = '#27ae60';
        if (status === 'Ditinjau Unit') { bg = '#fff4e5'; color = '#d35400'; }
        if (status === 'Revisi' || status === 'Ditolak') { bg = '#fff0f0'; color = '#e74c3c'; }
        if (status === 'Selesai (Surat Dirilis)') { bg = '#e0f0ff'; color = '#0055cc'; }
        return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: bg, color: color };
    },
    btnDetail: { backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #d0dfff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:'600' },
    btnForward: { backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold', fontSize:'12px' },
    btnRevisi: { backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold', fontSize:'12px' },
    btnFinal: { display: 'flex', alignItems: 'center', backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', fontSize:'12px' }
};

export default SuperAdminDashboard;
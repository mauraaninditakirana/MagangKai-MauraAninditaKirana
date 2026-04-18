import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, Search, LogOut, Eye, 
    RefreshCcw, Edit3, UserCog, Building2, Briefcase, 
    ArrowRight, ChevronDown, User, FilePlus, UploadCloud 
} from 'lucide-react';

const MonitoringPengajuan = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [units, setUnits] = useState([]); 
    const [types, setTypes] = useState([]); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterType, setFilterType] = useState('');

    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'Super Admin' && parsedUser.role !== 'admin' && parsedUser.role !== 'super admin') { 
            navigate('/'); 
            return; 
        }

        fetchData();
        fetchUnits();
        fetchTypes();
        window.scrollTo(0, 0);
    }, [navigate]); 

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions');
            const activeSubmissions = (res.data || []).filter(s => 
                s.status !== 'Selesai (Surat Dirilis)' && s.status !== 'Ditolak'
            );
            const sortedData = activeSubmissions.sort((a, b) => 
                new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
            );
            setSubmissions(sortedData);
        } catch (err) { console.error("Gagal mengambil data:", err); }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data || []);
        } catch (err) { console.error("Gagal ambil unit:", err); }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submission-types');
            setTypes(res.data || []);
        } catch (err) { console.error("Gagal ambil jenis:", err); }
    };

    const viewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const s = res.data;
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
                </div>
            `;
            Swal.fire({ title: 'Review Form Pengajuan', html: htmlContent, width: '600px', confirmButtonText: 'Tutup', confirmButtonColor: '#003399' });
        } catch (err) { Swal.fire('Error', 'Gagal memuat detail.', 'error'); }
    };

    const handleAction = async (id, type) => {
        const isRevisi = type === 'revisi';
        const { value: catatan } = await Swal.fire({
            title: isRevisi ? 'Berikan Catatan Revisi' : 'Teruskan ke Unit?',
            input: 'textarea',
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
            Swal.fire('Berhasil!', 'Status diperbarui', 'success');
            fetchData();
        }
    };

    // ✨ FUNGSI BARU: Upload Dokumen Final (Surat & ID Card) ✨
    const handleUploadFinal = async (submissionId) => {
        const { value: file } = await Swal.fire({
            title: 'Upload Dokumen Final',
            text: 'Pilih Surat Pengantar & Template ID Card (Gabungkan dalam 1 ZIP atau PDF)',
            input: 'file',
            inputAttributes: { 'accept': 'application/pdf,application/zip', 'aria-label': 'Upload dokumen final' },
            showCancelButton: true,
            confirmButtonText: 'Upload & Rilis',
            confirmButtonColor: '#28a745'
        });

        if (file) {
            const formData = new FormData();
            formData.append('final_docs', file); // Menggunakan key 'final_docs'
            formData.append('status', 'Selesai (Surat Dirilis)');
            formData.append('admin_id', user.id);

            try {
                // Route ini akan kita buat di backend setelah ini
                await axios.put(`http://localhost:5000/api/submissions/${submissionId}/release`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire('Berhasil!', 'Surat telah dirilis ke Mahasiswa.', 'success');
                fetchData(); 
            } catch (err) {
                Swal.fire('Gagal', 'Gagal mengunggah dokumen.', 'error');
            }
        }
    };

    const filteredData = submissions.filter(s => {
        const matchName = (s.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.asal_instansi || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchUnit = filterUnit === '' || String(s.unit_id) === String(filterUnit);
        const matchType = filterType === '' || String(s.submission_type_id) === String(filterType);
        return matchName && matchUnit && matchType;
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
                    <LayoutDashboard size={18}/> Dashboard Utama
                </div>
                <div style={styles.menuActive}>
                    <RefreshCcw size={18}/> Monitoring Pengajuan
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

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.contentScroll}>
                    <div style={{marginBottom: '25px'}}>
                        <h2 style={{margin:0, color:'#003399'}}>Monitoring Verifikasi 🚄</h2>
                        <p style={{color:'#666', fontSize:'14px'}}>Fase screening berkas dan validasi data mahasiswa</p>
                    </div>

                    <div style={styles.filterBar}>
                        <div style={styles.searchBox}>
                            <Search size={18} color="#003399" />
                            <input placeholder="Cari nama lengkap..." style={styles.input} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div style={styles.selectWrapper}>
                            <Building2 size={16} color="#003399" />
                            <select style={styles.select} value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
                                <option value="">Semua Unit</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                            </select>
                        </div>
                        <div style={styles.selectWrapper}>
                            <Briefcase size={16} color="#003399" />
                            <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="">Semua Jenis</option>
                                {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={{...styles.th, width:'50px'}}>No</th>
                                    <th style={styles.th}>Data Mahasiswa</th>
                                    <th style={styles.th}>Unit & Jenis</th>
                                    <th style={{...styles.th, textAlign:'center'}}>Detail / Berkas</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={{...styles.th, textAlign:'center'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((s, index) => (
                                    <tr key={s.id} style={styles.row}>
                                        <td style={styles.td}>{index + 1}</td>
                                        <td style={styles.td}>
                                            <div style={{fontWeight: 'bold'}}>{s.nama_lengkap}</div>
                                            <div style={{fontSize: '11px', color: '#888'}}>{s.asal_instansi}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{fontSize: '13px'}}>{s.nama_unit}</div>
                                            <div style={{fontSize: '11px', color: '#ff6600', fontWeight:'600'}}>{s.nama_jenis}</div>
                                        </td>
                                        <td style={{...styles.td, textAlign:'center'}}>
                                            <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                                                <button onClick={() => viewDetail(s.id)} style={styles.btnDetail} title="Lihat Detail Form">
                                                    <Eye size={14}/>
                                                </button>
                                                {/* ✨ TOMBOL LIHAT BERKAS (BARU) ✨ */}
                                                <button onClick={() => window.open(`http://localhost:5000/api/submissions/${s.id}/view-docs`, '_blank')} style={styles.btnDocs} title="Lihat Berkas Mahasiswa">
                                                    <FilePlus size={14}/>
                                                </button>
                                            </div>
                                        </td>
                                        <td style={styles.td}><span style={styles.badge(s.status)}>{s.status}</span></td>
                                        <td style={styles.td}>
                                            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                
                                                {/* AKSI JIKA MASIH MENUNGGU VERIFIKASI */}
                                                {s.status === 'Menunggu Verifikasi' && (
                                                    <>
                                                        <button onClick={() => handleAction(s.id, 'forward')} style={styles.btnForward} title="Teruskan ke Unit"><ArrowRight size={16}/></button>
                                                        <button onClick={() => handleAction(s.id, 'revisi')} style={styles.btnRevisi} title="Minta Revisi"><Edit3 size={16}/></button>
                                                    </>
                                                )}

                                                {/* ✨ AKSI JIKA SUDAH DISETUJUI UNIT (RILIS SURAT) ✨ */}
                                                {s.status === 'Disetujui Unit' && (
                                                    <button onClick={() => handleUploadFinal(s.id)} style={styles.btnRelease}>
                                                        <UploadCloud size={14} style={{marginRight: '5px'}}/> Rilis Surat
                                                    </button>
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
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' },
    main: { flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    contentScroll: { padding: '40px', flex: 1 },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px' },
    filterBar: { display: 'flex', gap: '15px', marginBottom: '30px', marginTop: '20px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' },
    selectWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', cursor: 'pointer' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    badge: (status) => {
        let bg = '#e1f7e7'; let color = '#27ae60';
        if (status === 'Ditinjau Unit') { bg = '#fff4e5'; color = '#d35400'; }
        if (status === 'Revisi' || status === 'Ditolak') { bg = '#fff0f0'; color = '#e74c3c'; }
        if (status === 'Selesai (Surat Dirilis)') { bg = '#e0f0ff'; color = '#0055cc'; }
        return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: bg, color: color };
    },
    btnDetail: { backgroundColor: '#f0f4ff', color: '#003399', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnDocs: { backgroundColor: '#e0f0ff', color: '#0055cc', border: '1px solid #cce0ff', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnForward: { backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnRevisi: { backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnRelease: { display: 'flex', alignItems: 'center', backgroundColor: '#e1f7e7', color: '#27ae60', border: '1px solid #27ae60', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }
};

export default MonitoringPengajuan;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    LayoutDashboard, FileText, LogOut, Search, CheckCircle, XCircle, User, 
    Edit3, Mail, IdCard, Building, Save, X, Eye 
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [submissions, setSubmissions] = useState([]);
    const [activeMenu, setActiveMenu] = useState(location.state?.activeMenu || 'profile'); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '', email: '', nomor_induk: '', asal_instansi: '', password_lama: '', password_baru: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser.role || '').toLowerCase();
        if (role !== 'admin unit') {
            navigate('/dashboard'); 
            return;
        }
        
        fetchData(parsedUser.unit_id);
        fetchProfile(parsedUser.id);
        window.history.replaceState({}, document.title);
    }, [navigate]);

    const fetchProfile = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            let dataUser = res.data;
            if (dataUser.unit_id) {
                const resUnit = await axios.get('http://localhost:5000/api/units');
                const myUnit = resUnit.data.find(u => u.id === dataUser.unit_id);
                if (myUnit) {
                    dataUser.nama_unit = myUnit.nama_unit; 
                }
            }
            setUserData(dataUser);
            setFormData({
                nama_lengkap: dataUser.nama_lengkap || '',
                email: dataUser.email || '',
                nomor_induk: dataUser.nomor_induk || '',
                asal_instansi: dataUser.asal_instansi || '',
                password_lama: '',
                password_baru: ''
            });
        } catch (err) {
            console.error("Gagal mengambil profil:", err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${userData.id}/profile`, formData);
            Swal.fire('Berhasil!', 'Profil diperbarui. Silakan login ulang jika mengubah password.', 'success');
            setIsEditing(false);
            
            const updatedUser = { ...userData, nama_lengkap: formData.nama_lengkap, email: formData.email, nomor_induk: formData.nomor_induk, asal_instansi: formData.asal_instansi };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
        }
    };

    const fetchData = async (unitId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?unit_id=${unitId}`);
            setSubmissions(res.data || []);
        } catch (err) {
            console.error("Gagal ambil data unit:", err);
        }
    };

    const handleAction = async (id, actionType) => {
        let newStatus = '';
        let confirmText = '';
        let confirmColor = '';
        if (actionType === 'approve') {
            newStatus = 'Disetujui Unit, Menunggu Verifikasi SDM';
            confirmText = 'Setujui pengajuan ini dan teruskan ke SDM Pusat?';
            confirmColor = '#28a745';
        } else if (actionType === 'reject') {
            newStatus = 'Ditolak Unit';
            confirmText = 'Anda yakin ingin menolak pengajuan ini?';
            confirmColor = '#dc3545';
        } else if (actionType === 'revising') {
            newStatus = 'Revisi';
            confirmText = 'Minta mahasiswa untuk memperbaiki dokumen/data?';
            confirmColor = '#ff6600';
        }
        const result = await Swal.fire({
            title: 'Konfirmasi Tindakan',
            text: confirmText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Proses',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: newStatus,
                    catatan: `Status diubah menjadi ${newStatus} oleh Admin Unit.`,
                    admin_id: userData.id
                });
                
                Swal.fire('Berhasil!', `Status telah diubah menjadi ${newStatus}.`, 'success');
                fetchData(userData.unit_id); 
            } catch (err) {
                Swal.fire('Gagal', 'Terjadi kesalahan saat memproses status.', 'error');
            }
        }
    };

    const viewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const s = res.data;

            let berkasHtml = '';
            if (s.documents && s.documents.length > 0) {
                berkasHtml = s.documents.map((doc, index) => {
                    const justFileName = doc.file_path.split(/[\\/]/).pop();
                    const pathFile = `http://localhost:5000/api/preview/${justFileName}`;
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 15px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e0e0e0;">
                            <span style="font-size: 13px; color: #444; font-weight: 500;">
                                ${index + 1}. ${doc.nama_dokumen === 'files' ? 'Dokumen Pengajuan' : doc.nama_dokumen}
                            </span>
                            <a href="${pathFile}" target="_blank" rel="noopener noreferrer" 
                               style="background-color: #0055cc; color: white; padding: 5px 12px; border-radius: 5px; text-decoration: none; font-size: 11px; font-weight: bold; transition: 0.2s;">
                                📄 Lihat File
                            </a>
                        </div>
                    `;
                }).join('');
            } else {
                berkasHtml = '<p style="color: #999; font-style: italic; text-align: center;">Tidak ada berkas yang dilampirkan.</p>';
            }

            let htmlContent = `
                <div style="text-align:left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
                    <div style="background: #f0f4f8; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                        <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px; font-size: 15px;">👤 Profil Mahasiswa</h4>
                        <p style="margin: 5px 0;"><b>Nama:</b> ${s.nama_lengkap}</p>
                        <p style="margin: 5px 0;"><b>Instansi:</b> ${s.asal_instansi || '-'}</p>
                    </div>

                    <div style="padding: 0 10px 20px 10px;">
                        <h4 style="color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px; font-size: 15px;">📋 Rencana Kegiatan</h4>
                        <p style="margin: 5px 0;"><b>Judul:</b> ${s.judul_atau_tujuan}</p>
                        <p style="margin: 5px 0;"><b>Periode:</b> ${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</p>
                    </div>
                    
                    <div style="background: #eef2f7; padding: 15px; border-radius: 12px;">
                        <h4 style="margin-top:0; color: #003399; font-size: 15px; margin-bottom: 15px;">📂 Berkas Lampiran</h4>
                        ${berkasHtml}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Detail Pengajuan Magang',
                html: htmlContent,
                width: '600px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#666',
                showCloseButton: true
            });

        } catch (err) {
            Swal.fire('Error', 'Gagal memuat detail data.', 'error');
        }
    };

    if (!userData) return null;

    const monitoringData = submissions.filter(s => 
        s.status === 'Menunggu Verifikasi' || 
        s.status === 'Ditinjau Unit' ||
        s.status === 'Revisi'
    );

    const archiveData = submissions.filter(s => 
        s.status === 'Disetujui Unit, Menunggu Verifikasi SDM' || 
        s.status === 'Disetujui SDM, Menunggu Surat Pengantar Magang' ||
        s.status === 'Selesai (Surat Dirilis)' ||
        s.status === 'Dalam Masa Kegiatan' ||
        s.status === 'Selesai Kegiatan' ||
        s.status === 'Ditolak Unit' || 
        s.status === 'Ditolak SDM'
    );

    const displayData = activeMenu === 'monitoring' ? monitoringData : archiveData;

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>UNIT</span></h3>
                    <small style={{opacity:0.7}}>{userData.nama_unit || 'Kepala Unit'}</small>
                </div>
                
                <div style={activeMenu === 'profile' ? styles.menuActive : styles.menuItem} onClick={() => setActiveMenu('profile')}>
                    <User size={18}/> Profil Saya
                </div>
                <div style={activeMenu === 'monitoring' ? styles.menuActive : styles.menuItem} onClick={() => setActiveMenu('monitoring')}>
                    <LayoutDashboard size={18}/> Monitoring Tugas
                </div>
                <div style={activeMenu === 'arsip' ? styles.menuActive : styles.menuItem} onClick={() => setActiveMenu('arsip')}>
                    <FileText size={18}/> Arsip Peserta Unit
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            <div style={styles.main}>
                {activeMenu === 'profile' ? (
                    <div style={styles.profileContainer}>
                        <div style={styles.profileHeader}>
                            <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0)}</div>
                            <h2 style={{margin: '10px 0 5px 0', color: '#003399'}}>{userData.nama_lengkap}</h2>
                            <span style={styles.roleBadge}>Admin Unit</span>
                            
                            {!isEditing && (
                                <button style={styles.btnEditAvatar} onClick={() => setIsEditing(true)}>
                                    <Edit3 size={14} /> Edit Profil & Password
                                </button>
                            )}
                        </div>

                        {!isEditing ? (
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <Mail size={18} color="#003399" />
                                    <div><small style={styles.label}>Email Sistem</small><p style={styles.val}>{userData.email}</p></div>
                                </div>
                                <div style={styles.infoItem}>
                                    <Building size={18} color="#003399" />
                                    <div><small style={styles.label}>Nama Unit Penempatan</small><p style={styles.val}>{userData.nama_unit || '-'}</p></div>
                                </div>
                                <div style={styles.infoItem}>
                                    <IdCard size={18} color="#003399" />
                                    <div><small style={styles.label}>Nomor Induk Pegawai (NIPP)</small><p style={styles.val}>{userData.nomor_induk || '-'}</p></div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nama Lengkap</label>
                                    <input style={styles.input} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email Sistem</label>
                                    <input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nomor Induk Pegawai (NIPP)</label>
                                    <input style={styles.input} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                </div>
                                
                                <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
                                <p style={{fontSize: '12px', color: '#ff6600', fontWeight: 'bold', margin: 0}}>Ganti Password</p>
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Password Lama</label>
                                    <input type="password" style={styles.input} placeholder="Masukkan password saat ini" value={formData.password_lama} onChange={e => setFormData({...formData, password_lama: e.target.value})} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Password Baru</label>
                                    <input type="password" style={styles.input} placeholder="Masukkan password baru" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})} />
                                </div>
                                
                                <div style={styles.btnArea}>
                                    <button type="button" style={styles.btnCancel} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                                    <button type="submit" style={styles.btnSave}><Save size={16}/> Simpan</button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={styles.header}>
                            <h2 style={{color:'#003399', margin: 0}}>
                                {activeMenu === 'monitoring' ? 'Monitoring Peserta Aktif 📋' : 'Arsip Alumni Unit 📂'}
                            </h2>
                            <div style={styles.searchBox}>
                                <Search size={16} color="#888" />
                                <input placeholder="Cari nama peserta..." style={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div style={styles.card}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thRow}>
                                        <th style={styles.th}>No</th>
                                        <th style={styles.th}>Nama Peserta</th>
                                        <th style={styles.th}>Nomor Induk</th>
                                        <th style={styles.th}>Asal Instansi</th>
                                        {activeMenu === 'monitoring' ? (
                                            <>
                                                <th style={styles.th}>Jenis</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={styles.th}>Jenis</th>
                                                <th style={styles.th}>Status Akhir</th>
                                                <th style={styles.th}>Periode Magang</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.filter(s => s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map((s, i) => (
                                        <tr key={s.id} style={styles.row}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                            <td style={styles.td}>{s.nomor_induk || '-'}</td>
                                            <td style={styles.td}>{s.asal_instansi || '-'}</td>
                                            
                                            {activeMenu === 'monitoring' ? (
                                                <>
                                                    <td style={styles.td}>{s.nama_jenis}</td>
                                                    <td style={styles.td}><span style={styles.badge(s.status)}>{s.status}</span></td>
                                                    <td style={{...styles.td, textAlign: 'center'}}>
                                                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center'}}>
                                                            <button onClick={() => viewDetail(s.id)} style={styles.btnDetail}>
                                                                <Eye size={14} style={{marginRight: '5px'}}/> Detail & Berkas
                                                            </button>
                                                            {(s.status === 'Menunggu Verifikasi' || s.status === 'Ditinjau Unit') ? (
                                                                <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                                    <button onClick={() => handleAction(s.id, 'approve')} style={styles.btnApprove}><CheckCircle size={14}/> Setuju</button>
                                                                    <button onClick={() => handleAction(s.id, 'revising')} style={{...styles.btnReject, backgroundColor: '#fff4e5', color: '#ff6600', borderColor: '#ff6600'}}><Edit3 size={14}/> Revisi</button>
                                                                    <button onClick={() => handleAction(s.id, 'reject')} style={styles.btnReject}><XCircle size={14}/> Tolak</button>
                                                                </div>
                                                            ) : (
                                                                <span style={{color: '#999', fontSize: '12px', fontStyle: 'italic'}}>Diteruskan ke Pusat</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={styles.td}>{s.nama_jenis}</td>
                                                    <td style={styles.td}><span style={styles.badge(s.status)}>{s.status}</span></td>
                                                    <td style={styles.td}>
                                                        <div style={{fontSize: '12px', fontWeight: '500'}}>
                                                            {new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </td> 
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {displayData.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>Tidak ada data.</div>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#003399', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    main: { flex: 1, padding: '40px', marginLeft: '260px', minHeight: '100vh' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd' },
    searchInput: { border: 'none', outline: 'none', fontSize: '13px' },
    card: { backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { textAlign: 'left', padding: '15px', fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', fontSize: '14px', verticalAlign: 'middle' },
    badge: (status) => {
        let bg = '#e0f0ff'; let color = '#0055cc'; 
        if (status?.includes('Ditolak')) { bg = '#fff0f0'; color = '#e74c3c'; }
        else if (status === 'Selesai (Surat Dirilis)') { bg = '#e1f7e7'; color = '#27ae60'; }
        else if (status === 'Dalam Masa Kegiatan') { bg = '#f39c12'; color = '#fff'; }
        else if (status === 'Selesai Kegiatan') { bg = '#2c3e50'; color = '#fff'; }
        else if (status === 'Revisi') { bg = '#fff4e5'; color = '#ff6600'; }
        else if (status?.includes('SDM')) { bg = '#eef2f7'; color = '#34495e'; }
        return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: bg, color: color, display: 'inline-block' };
    },
    btnApprove: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#e6ffe6', color: '#28a745', border: '1px solid #28a745', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    btnReject: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ffe6e6', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    btnDetail: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #d0dfff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' },
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
    roleBadge: { backgroundColor: '#fff4e5', color: '#d35400', padding: '4px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' },
    btnEditAvatar: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' },
    label: { color: '#888', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default AdminDashboard;
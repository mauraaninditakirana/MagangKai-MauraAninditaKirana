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

    // ✨ FUNGSI UPDATE STATUS BARU DENGAN DROPDOWN ✨
    const handleUpdateStatus = async (id, newStatus) => {
        let confirmText = `Ubah status menjadi: ${newStatus}?`;
        let confirmColor = '#0055cc';

        if (newStatus === 'Atur Jadwal Wawancara') confirmText = 'Terima berkas awal dan minta mahasiswa atur jadwal wawancara?';
        if (newStatus === 'Wawancara Disetujui') confirmText = 'Setujui jadwal wawancara ini?';
        if (newStatus === 'Selesai Wawancara (Lengkapi Berkas Akhir)') confirmText = 'Wawancara selesai? Mahasiswa akan diminta upload berkas final.';

        const result = await Swal.fire({
            title: 'Konfirmasi Aksi',
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            confirmButtonText: 'Ya, Proses'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: newStatus,
                    catatan: `Status diperbarui oleh Admin Unit: ${newStatus}`,
                    admin_id: userData.id
                });
                Swal.fire('Berhasil!', 'Status pengajuan telah diperbarui.', 'success');
                fetchData(userData.unit_id);
            } catch (err) {
                Swal.fire('Gagal', 'Gagal memperbarui status.', 'error');
            }
        }
    };

    // Fungsi Tolak & Revisi tetap menggunakan modal karena butuh catatan manual
    const handleRejection = async (id, type) => {
        const { value: text } = await Swal.fire({
            title: type === 'revisi' ? 'Berikan Catatan Revisi' : 'Alasan Penolakan',
            input: 'textarea',
            inputPlaceholder: 'Tuliskan detail di sini...',
            showCancelButton: true,
            confirmButtonColor: type === 'revisi' ? '#ff6600' : '#d33'
        });

        if (text) {
            try {
                const status = type === 'revisi' ? 'Revisi' : 'Ditolak Unit';
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: status,
                    catatan: text,
                    admin_id: userData.id
                });
                Swal.fire('Berhasil', 'Status diperbarui.', 'success');
                fetchData(userData.unit_id);
            } catch (err) {
                Swal.fire('Error', 'Gagal memproses.', 'error');
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
                <div style="text-align:left; font-family: sans-serif; color: #333;">
                    <div style="background: #f0f4f8; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                        <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px; font-size: 15px;">👤 Profil Mahasiswa</h4>
                        <p style="margin: 5px 0;"><b>Nama:</b> ${s.nama_lengkap}</p>
                        <p style="margin: 5px 0;"><b>Instansi:</b> ${s.asal_instansi || '-'}</p>
                        ${s.jadwal_wawancara ? `<p style="margin: 5px 0; color: #ff6600;"><b>Jadwal Wawancara:</b> ${new Date(s.jadwal_wawancara).toLocaleString('id-ID')}</p>` : ''}
                    </div>
                    <div style="background: #eef2f7; padding: 15px; border-radius: 12px;">
                        <h4 style="margin-top:0; color: #003399; font-size: 15px; margin-bottom: 15px;">📂 Berkas Lampiran</h4>
                        ${berkasHtml}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Detail Pengajuan',
                html: htmlContent,
                width: '600px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#666'
            });

        } catch (err) {
            Swal.fire('Error', 'Gagal memuat detail data.', 'error');
        }
    };

    if (!userData) return null;

    // ✨ FILTER MONITORING: Fokus pada alur internal Unit ✨
    const monitoringData = submissions.filter(s => 
        ['Menunggu Verifikasi', 'Atur Jadwal Wawancara', 'Jadwal Wawancara Diajukan', 'Wawancara Disetujui', 'Selesai Wawancara (Lengkapi Berkas Akhir)', 'Berkas Akhir Terkirim', 'Revisi'].includes(s.status)
    );

    const archiveData = submissions.filter(s => 
        ['Berkas Disetujui Unit', 'Disetujui Unit, Menunggu Verifikasi SDM', 'Menunggu Verifikasi SDM', 'Selesai (Surat Dirilis)', 'Ditolak Unit', 'Ditolak SDM'].includes(s.status)
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
                                    <Edit3 size={14} /> Edit Profil
                                </button>
                            )}
                        </div>
                        {!isEditing ? (
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <Mail size={18} color="#003399" />
                                    <div><small style={styles.label}>Email</small><p style={styles.val}>{userData.email}</p></div>
                                </div>
                                <div style={styles.infoItem}>
                                    <Building size={18} color="#003399" />
                                    <div><small style={styles.label}>Unit</small><p style={styles.val}>{userData.nama_unit || '-'}</p></div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Nama Lengkap</label>
                                    <input style={styles.input} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
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
                                {activeMenu === 'monitoring' ? 'Monitoring Unit 📋' : 'Arsip Unit 📂'}
                            </h2>
                            <div style={styles.searchBox}>
                                <Search size={16} color="#888" />
                                <input placeholder="Cari nama..." style={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div style={styles.card}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thRow}>
                                        <th style={styles.th}>No</th>
                                        <th style={styles.th}>Nama Peserta</th>
                                        <th style={styles.th}>Instansi</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.filter(s => s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map((s, i) => (
                                        <tr key={s.id} style={styles.row}>
                                            <td style={styles.td}>{i + 1}</td>
                                            <td style={styles.td}><b>{s.nama_lengkap}</b></td>
                                            <td style={styles.td}>{s.asal_instansi || '-'}</td>
                                            <td style={styles.td}><span style={styles.badge(s.status)}>{s.status}</span></td>
                                            <td style={{...styles.td, textAlign: 'center'}}>
                                                <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                    <button onClick={() => viewDetail(s.id)} style={styles.btnActionIcon} title="Detail"><Eye size={16}/></button>
                                                    
                                                    {/* ✨ DROPDOWN AKSI DINAMIS ✨ */}
                                                    {activeMenu === 'monitoring' && (
                                                        <select 
                                                            style={styles.dropdown}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'revisi' || val === 'tolak') handleRejection(s.id, val);
                                                                else if (val) handleUpdateStatus(s.id, val);
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Pilih Tindakan</option>
                                                            
                                                            {s.status === 'Menunggu Verifikasi' && (
                                                                <option value="Atur Jadwal Wawancara">Terima & Atur Wawancara</option>
                                                            )}
                                                            
                                                            {s.status === 'Jadwal Wawancara Diajukan' && (
                                                                <option value="Wawancara Disetujui">Setujui Jadwal Wawancara</option>
                                                            )}
                                                            
                                                            {s.status === 'Wawancara Disetujui' && (
                                                                <option value="Selesai Wawancara (Lengkapi Berkas Akhir)">Selesaikan Wawancara</option>
                                                            )}

                                                            {s.status === 'Berkas Akhir Terkirim' && (
                                                                <option value="Berkas Disetujui Unit">Terima Berkas Final</option>
                                                            )}

                                                            <option value="revisi">Minta Revisi</option>
                                                            <option value="tolak">Tolak Pengajuan</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {displayData.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#999'}}>Tidak ada data pengajuan.</div>}
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
    dropdown: { padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', outline: 'none', cursor: 'pointer', backgroundColor: '#f9f9f9' },
    btnActionIcon: { padding: '6px', backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #d0dfff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    badge: (status) => {
        let bg = '#e0f0ff'; let color = '#0055cc'; 
        if (status?.includes('Ditolak')) { bg = '#ffe6e6'; color = '#dc3545'; }
        else if (status?.includes('Revisi')) { bg = '#fff4e5'; color = '#ff6600'; }
        else if (status?.includes('Wawancara')) { bg = '#f5eeff'; color = '#8e44ad'; }
        else if (status?.includes('Selesai')) { bg = '#e1f7e7'; color = '#27ae60'; }
        return { padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', backgroundColor: bg, color: color };
    },
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '32px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
    roleBadge: { backgroundColor: '#fff4e5', color: '#d35400', padding: '4px 15px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' },
    btnEditAvatar: { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0f4f8', color: '#003399', border: 'none', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px' },
    label: { color: '#888', fontSize: '11px', fontWeight: 'bold' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '10px' },
    btnSave: { flex: 1, padding: '10px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    btnCancel: { flex: 1, padding: '10px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default AdminDashboard;
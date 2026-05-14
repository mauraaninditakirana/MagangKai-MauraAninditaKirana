import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import NotificationBell from '../components/NotificationBell';
import { 
    LayoutDashboard, FileText, LogOut, Search, User, 
    Edit3, Mail, IdCard, Building, Save, X, Eye 
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [userData, setUserData] = useState(() => {
        const saved = sessionStorage.getItem('user');
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
        const storedUser = sessionStorage.getItem('user');
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

    const handleUpdateJadwal = async (id) => {
        const { value: jadwalBaru } = await Swal.fire({
            title: 'Ubah Jadwal Wawancara',
            input: 'datetime-local',
            inputLabel: 'Pilih Jadwal Baru',
            showCancelButton: true,
            confirmButtonText: 'Simpan',
        });

        if (jadwalBaru) {
            const { value: catatan } = await Swal.fire({
                title: 'Catatan (Opsional)',
                input: 'textarea',
                inputPlaceholder: 'Alasan ubah jadwal...',
                showCancelButton: true,
            });

            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/update-jadwal`, {
                    jadwal_baru: jadwalBaru,
                    admin_id: userData.id,
                    catatan: catatan
                });

                Swal.fire('Berhasil!', 'Jadwal berhasil diubah.', 'success');
                fetchData(userData.unit_id);
            } catch (err) {
                Swal.fire('Error', 'Gagal mengubah jadwal.', 'error');
            }
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${userData.id}/profile`, formData);
            Swal.fire('Berhasil!', 'Profil diperbarui. Silakan login ulang jika mengubah password.', 'success');
            setIsEditing(false);
            
            const updatedUser = { ...userData, nama_lengkap: formData.nama_lengkap, email: formData.email, nomor_induk: formData.nomor_induk, asal_instansi: formData.asal_instansi };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
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

    const handleUpdateStatus = async (id, newStatus) => {
        
        let confirmText = `Ubah status menjadi: ${newStatus}?`;
        let confirmTitle = 'Konfirmasi Aksi';
        let confirmColor = '#0055cc';
        let confirmBtnText = 'Ya, Proses';

        if (newStatus === 'Disetujui Unit, Menunggu Verifikasi SDM') {
            confirmTitle = 'Terima Pengajuan?';
            confirmText = 'Pengajuan akan langsung diteruskan ke SDM DAOP 6 untuk diverifikasi. Lanjutkan?';
            confirmColor = '#27ae60';
            confirmBtnText = 'Ya, Terima & Teruskan';
        }

        const result = await Swal.fire({
            title: confirmTitle,
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            confirmButtonText: confirmBtnText
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                    status: newStatus,
                    catatan: `Admin Unit mengubah status menjadi "${newStatus}".`,
                    admin_id: userData.id
                });
                Swal.fire('Berhasil!', 'Status pengajuan telah diperbarui.', 'success');
                fetchData(userData.unit_id);
            } catch (err) {
                Swal.fire('Gagal', 'Gagal memperbarui status.', 'error');
            }
        }
    };

        const handleRejection = async (id, type) => {
        const { value: text } = await Swal.fire({
            title: type === 'revisi' ? 'Pending — Minta Revisi' : 'Tolak Pengajuan',
            text: type === 'revisi' 
                ? 'Berikan catatan apa yang perlu diperbaiki/direvisi oleh mahasiswa.' 
                : 'Berikan alasan penolakan (data akan tetap masuk arsip SDM).',
            input: 'textarea',
            inputPlaceholder: type === 'revisi' 
                ? 'Contoh: Mohon perbaiki nama pembimbing dan judul project...' 
                : 'Contoh: Kuota unit sudah penuh / dokumen tidak valid...',
            showCancelButton: true,
            confirmButtonColor: type === 'revisi' ? '#ff6600' : '#d33',
            confirmButtonText: type === 'revisi' ? 'Kirim Catatan Revisi' : 'Tolak Pengajuan'
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

            // Helper inline styles untuk modal (selaras ArchiveManagement)
            const sectionCard = 'background:#f8fafd; padding:18px 22px; border-radius:12px; margin-bottom:14px; border:1px solid #f0f4f8;';
            const sectionLabel = 'font-size:11px; color:#003399; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; display:block;';
            const fieldRow = 'display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:13px;';
            const fieldLabel = 'color:#6b7280; font-weight:600;';
            const fieldValue = 'color:#111827; font-weight:600; text-align:right; max-width:60%;';

            let berkasHtml = '';
            if (s.documents && s.documents.length > 0) {
                berkasHtml = s.documents.map((doc, index) => {
                    const justFileName = doc.file_path.split(/[\\/]/).pop();
                    const pathFile = `http://localhost:5000/api/preview/${justFileName}`;
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px 14px; border-radius:8px; margin-bottom:6px; border:1px solid #e0e7ff;">
                            <span style="font-size:13px; color:#374151; font-weight:600;">
                                ${index + 1}. ${doc.nama_dokumen === 'files' ? 'Dokumen Pengajuan' : doc.nama_dokumen}
                            </span>
                            <a href="${pathFile}" target="_blank" rel="noopener noreferrer" 
                               style="background:#003399; color:#fff; padding:6px 14px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">
                                Lihat File
                            </a>
                        </div>
                    `;
                }).join('');
            } else {
                berkasHtml = '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:20px 0;">Tidak ada berkas yang dilampirkan.</p>';
            }

            let logHtml = '';
            if (s.logs && s.logs.length > 0) {
                logHtml = s.logs.map(log => `
                    <div style="display:flex; gap:10px; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:12px; color:#374151;">
                        <span style="min-width:8px; height:8px; background:#003399; border-radius:50%; margin-top:6px; flex-shrink:0;"></span>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#003399; margin-bottom:2px;">${log.status_perubahan}</div>
                            <div style="color:#6b7280;">${log.catatan || '-'}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                logHtml = '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:14px 0;">Belum ada riwayat perubahan.</p>';
            }

            let htmlContent = `
                <div style="text-align:left; font-family:'Segoe UI', Tahoma, sans-serif;">
                    
                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Profil Mahasiswa</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Nama Lengkap</span>
                            <span style="${fieldValue}">${s.nama_lengkap}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Asal Instansi</span>
                            <span style="${fieldValue}">${s.asal_instansi || '-'}</span>
                        </div>
                    </div>

                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Detail Kegiatan</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Judul / Kegiatan</span>
                            <span style="${fieldValue}">${s.judul_atau_tujuan || '-'}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Periode</span>
                            <span style="${fieldValue}">${new Date(s.tanggal_mulai).toLocaleDateString('id-ID')} s/d ${new Date(s.tanggal_selesai).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Pembimbing</span>
                            <span style="${fieldValue}">${s.nama_pembimbing || '-'}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Kontak Pembimbing</span>
                            <span style="${fieldValue}">${s.kontak_pembimbing || '-'}</span>
                        </div>
                    </div>

                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Berkas Lampiran</span>
                        ${berkasHtml}
                    </div>

                    <div style="${sectionCard} margin-bottom:0;">
                        <span style="${sectionLabel}">━━ Riwayat Status</span>
                        ${logHtml}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Detail Pengajuan',
                html: htmlContent,
                width: '640px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#003399',
                didOpen: () => {
                    const titleEl = Swal.getTitle();
                    if (titleEl) {
                        titleEl.style.color = '#111827';
                        titleEl.style.fontWeight = '800';
                        titleEl.style.fontSize = '22px';
                        titleEl.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
                        titleEl.style.letterSpacing = '-0.2px';
                    }
                }
            });

        } catch (err) {
            Swal.fire('Error', 'Gagal memuat detail data.', 'error');
        }
    };

    if (!userData) return null;

        const monitoringData = submissions.filter(s => 
        ['Menunggu Verifikasi', 'Revisi'].includes(s.status)
    );

    const archiveData = submissions.filter(s => 
        [
            'Disetujui Unit, Menunggu Verifikasi SDM', 
            'Menunggu Verifikasi SDM', 'Sedang Ditinjau SDM', 'Setujui, Tunggu Pengajuan Dikirim ke Pusat', 
            'Pengajuan Telah Dikirim ke Pusat', 'Surat Telah Masuk dari Pusat', 'Disetujui SDM, Menunggu Surat Pengantar Magang', 
            'Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan', 'Selesai Kegiatan', 
            'Ditolak Unit', 'Ditolak SDM'
        ].includes(s.status)
    );

    const displayData = activeMenu === 'monitoring' ? monitoringData : archiveData;

    const getStatusColor = (status) => {
        if (status?.includes('Ditolak')) return '#dc2626';
        if (status?.includes('Revisi')) return '#ff6600';
        if (status?.includes('Wawancara')) return '#8e44ad';
        if (status?.includes('Selesai')) return '#27ae60';
        if (status?.includes('Dalam Masa')) return '#0055cc';
        return '#003399';
    };

    return (
        <div style={styles.container}>
            {/* SIDEBAR (selaras SuperAdmin) */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>UNIT</span></h2>
                    <p style={styles.brandSubtitle}>{userData.nama_unit || 'KEPALA UNIT'}</p>
                </div>

                <div style={styles.sidebarNav}>
                    <div style={activeMenu === 'profile' ? styles.navItemActive : styles.navItem} onClick={() => setActiveMenu('profile')}>
                        <div style={styles.navLinkContent}><User size={20}/> <span>Profil Saya</span></div>
                    </div>
                    <div style={activeMenu === 'monitoring' ? styles.navItemActive : styles.navItem} onClick={() => setActiveMenu('monitoring')}>
                        <div style={styles.navLinkContent}><LayoutDashboard size={20}/> <span>Monitoring Tugas</span></div>
                    </div>
                    <div style={activeMenu === 'arsip' ? styles.navItemActive : styles.navItem} onClick={() => setActiveMenu('arsip')}>
                        <div style={styles.navLinkContent}><FileText size={20}/> <span>Arsip Peserta Unit</span></div>
                    </div>
                </div>

                <div style={styles.sidebarFooter} onClick={() => {sessionStorage.clear(); navigate('/');}}>
                    <div style={styles.logoutBtn}><LogOut size={20}/> <span>Keluar Akun</span></div>
                </div>
            </div>

            {/* MAIN */}
            <div style={styles.main}>
                {/* TOP HEADER (sticky) */}
                <div style={styles.topHeader}>
                    <div style={styles.topBarInfo}>
                        <small style={styles.topBarLabel}>LOGIN SEBAGAI</small>
                        <span style={styles.topBarName}>{userData.nama_lengkap} <span style={{color:'#ff6600'}}>• {userData.nama_unit || 'Admin Unit'}</span></span>
                    </div>
                    {userData.id && <NotificationBell userId={userData.id} iconColor="#ff6600" iconSize={22} />}
                </div>

                <div style={styles.contentScroll}>
                    {/* TAB: PROFILE */}
                    {activeMenu === 'profile' && (
                        <div style={styles.profileContainer}>
                            <div style={styles.landscapeHeader}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
                                    <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <h2 style={{margin: '0 0 5px 0', color: '#003399', fontSize: '24px'}}>{userData.nama_lengkap}</h2>
                                        <span style={styles.roleBadgeUnit}>Admin Unit</span>
                                    </div>
                                </div>
                            </div>

                            <hr style={{border: '0.5px solid #eee', margin: '25px 0'}} />

                            {!isEditing ? (
                                <>
                                    <div style={styles.infoGridHorizontal}>
                                        <div style={styles.infoItemHorizontal}>
                                            <Mail size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>Email Sistem</small><p style={styles.valSmall}>{userData.email || '-'}</p></div>
                                        </div>
                                        <div style={styles.infoItemHorizontal}>
                                            <IdCard size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>NIPP / Nomor Induk</small><p style={styles.valSmall}>{userData.nomor_induk || '-'}</p></div>
                                        </div>
                                        <div style={styles.infoItemHorizontal}>
                                            <Building size={18} color="#003399" />
                                            <div><small style={styles.labelSmall}>Unit Penempatan</small><p style={styles.valSmall}>{userData.nama_unit || '-'}</p></div>
                                        </div>
                                    </div>
                                    <div style={{marginTop: '30px'}}>
                                        <button style={styles.btnEditLandscape} onClick={() => setIsEditing(true)}>
                                            <Edit3 size={16} /> Edit Profil & Password
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleUpdateProfile} style={styles.formLandscape}>
                                    <div style={styles.inputGroupFull}>
                                        <label style={styles.labelForm}>Nama Lengkap</label>
                                        <input style={styles.inputForm} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                                    </div>
                                    <div style={styles.rowForm}>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>Email Sistem</label>
                                            <input style={styles.inputForm} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>NIPP / Nomor Induk</label>
                                            <input style={styles.inputForm} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                        </div>
                                    </div>
                                    <hr style={{margin: '8px 0', border: '0.5px solid #eee'}} />
                                    <p style={{fontSize: '12px', color: '#ff6600', fontWeight: '700', letterSpacing: '1px', margin: 0, textTransform: 'uppercase'}}>Ganti Password (Opsional)</p>
                                    <div style={styles.rowForm}>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>Password Lama</label>
                                            <input type="password" style={styles.inputForm} placeholder="Kosongkan jika tidak diubah" value={formData.password_lama} onChange={e => setFormData({...formData, password_lama: e.target.value})}/>
                                        </div>
                                        <div style={styles.inputGroupHalf}>
                                            <label style={styles.labelForm}>Password Baru</label>
                                            <input type="password" style={styles.inputForm} placeholder="Kosongkan jika tidak diubah" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})}/>
                                        </div>
                                    </div>
                                    <div style={styles.btnAreaLandscape}>
                                        <button type="button" style={styles.btnCancelLandscape} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                                        <button type="submit" style={styles.btnSaveLandscape}><Save size={16}/> Simpan Perubahan</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* TAB: MONITORING / ARSIP */}
                    {activeMenu !== 'profile' && (
                        <>
                            {/* Section header (selaras dengan halaman lain) */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={styles.accentBar} />
                                <h2 style={styles.sectionTitle}>{activeMenu === 'monitoring' ? 'Monitoring Tugas' : 'Arsip Peserta Unit'}</h2>
                                <p style={styles.sectionDesc}>
                                    {activeMenu === 'monitoring' 
                                        ? 'Daftar pengajuan magang yang sedang menunggu tindakan Anda.' 
                                        : 'Pengajuan yang sudah lewat tahap Unit (sedang di SDM, selesai, atau ditolak).'}
                                </p>
                            </div>

                            {/* Search bar */}
                            <div style={styles.actionBar}>
                                <div style={styles.searchBox}>
                                    <Search size={18} color="#003399" />
                                    <input placeholder="Cari nama peserta..." style={styles.input} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                            </div>

                            {/* Tabel */}
                            <div style={styles.tableCard}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.thRow}>
                                            <th style={{...styles.th, width: '50px'}}>No</th>
                                            <th style={styles.th}>Nama Peserta</th>
                                            <th style={styles.th}>Instansi</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={{...styles.th, textAlign: 'center', width: '180px'}}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.filter(s => s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map((s, i) => (
                                            <tr key={s.id} style={styles.tableRow}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}><b style={{color: '#111827'}}>{s.nama_lengkap}</b></td>
                                                <td style={styles.td}>{s.asal_instansi || '-'}</td>
                                                <td style={styles.td}>
                                                    <span style={{ color: getStatusColor(s.status), fontWeight: 'bold', fontSize: '12.5px' }}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
                                                        <button onClick={() => viewDetail(s.id)} style={styles.btnIconDetail} title="Lihat Detail">
                                                            <Eye size={18} strokeWidth={2}/>
                                                        </button>
                                                        
                                                        {activeMenu === 'monitoring' && (
                                                        <select 
                                                            style={styles.dropdown}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (!val) return;
                                                                if (val === 'revisi' || val === 'tolak') handleRejection(s.id, val);
                                                                else handleUpdateStatus(s.id, val);
                                                                e.target.value = "";
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Pilih Tindakan</option>
                                                            <option value="Disetujui Unit, Menunggu Verifikasi SDM">✓ Terima & Teruskan ke SDM</option>
                                                            <option value="revisi">⏸ Pending (Minta Revisi)</option>
                                                            <option value="tolak">✗ Tolak Pengajuan</option>
                                                        </select>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {displayData.length === 0 && (
                                            <tr><td colSpan="5" style={{padding: '40px', textAlign: 'center', color: '#999'}}>Tidak ada data pengajuan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },

    // SIDEBAR (selaras SuperAdmin)
    sidebar: { width: '280px', backgroundColor: '#052278', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    sidebarBrand: { padding: '30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' },
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold', letterSpacing: '1px' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },

    // MAIN
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    topBarInfo: { display: 'flex', flexDirection: 'column' },
    topBarLabel: { fontSize: '11px', color: '#888', fontWeight: 'bold', letterSpacing: '1px' },
    topBarName: { fontSize: '14px', color: '#003399', fontWeight: 'bold', marginTop: '2px' },
    contentScroll: { padding: '40px', flex: 1 },

    // SECTION HEADER
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },

    // ACTION BAR
    actionBar: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },

    // TABLE
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: 'transparent' },
    th: { padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
    tableRow: {},

    // ICON BUTTONS & DROPDOWN
    btnIconDetail: { background: 'none', color: '#003399', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    dropdown: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cce0ff', fontSize: '12px', backgroundColor: '#f0f4ff', color: '#003399', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },

    // PROFILE (selaras SuperAdmin landscape)
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '900px', borderRadius: '24px', padding: '40px', boxShadow: '0 8px 28px rgba(0,0,0,0.04)', margin: '0 auto', border: '1px solid #f0f4f8' },
    landscapeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, #ff6600, #cc5200)', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 20px rgba(255, 102, 0, 0.25)' },
    roleBadgeUnit: { display: 'inline-block', backgroundColor: '#fff4e5', color: '#d35400', padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    infoGridHorizontal: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItemHorizontal: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '16px', border: '1px solid #f1f3f9' },
    labelSmall: { color: '#778da9', fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' },
    valSmall: { margin: 0, fontWeight: 'bold', color: '#1b263b', fontSize: '16px' },
    btnEditLandscape: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: '#003399', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,51,153,0.25)' },formLandscape: { display: 'flex', flexDirection: 'column', gap: '16px' },
    rowForm: { display: 'flex', gap: '20px' },
    inputGroupFull: { display: 'flex', flexDirection: 'column' },
    inputGroupHalf: { flex: 1, display: 'flex', flexDirection: 'column' },
    labelForm: { color: '#778da9', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' },
    inputForm: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', backgroundColor: '#f8f9fa' },
    btnAreaLandscape: { display: 'flex', gap: '15px', marginTop: '8px' },
    btnSaveLandscape: { flex: 2, padding: '14px', backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancelLandscape: { flex: 1, padding: '14px', backgroundColor: '#f1f3f9', color: '#778da9', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default AdminDashboard;
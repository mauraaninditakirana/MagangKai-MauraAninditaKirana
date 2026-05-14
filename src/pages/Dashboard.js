import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import FormPengajuan from '../components/FormPengajuan';
import NotificationBell from '../components/NotificationBell';
import { 
    FilePlus, History, LogOut, AlertTriangle, CheckCircle, 
    User, Edit3, Mail, IdCard, Building, Save, X, CalendarClock
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [userData, setUserData] = useState(() => {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [activeSubmission, setActiveSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExtending, setIsExtending] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
    
    useEffect(() => {
        window.history.replaceState({}, document.title);
    }, []);

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
        
        checkUserStatus(parsedUser.id);
        fetchProfile(parsedUser.id);
        
        window.scrollTo(0, 0);
    }, [navigate]);

    const [revisiData, setRevisiData] = useState(location.state?.revisiData || null);

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            if (location.state.revisiData) {
                setRevisiData(location.state.revisiData);
            }
        }
    }, [location.state]);

    const fetchProfile = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            setUserData(res.data);
            setFormData({
                nama_lengkap: res.data.nama_lengkap || '',
                email: res.data.email || '',
                nomor_induk: res.data.nomor_induk || '',
                asal_instansi: res.data.asal_instansi || '',
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
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
        }
    };

    const checkUserStatus = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?user_id=${userId}`);
            const submissions = res.data || [];
            
            const active = submissions.find(s => {
                const statusBebas = ['Ditolak', 'Ditolak Unit', 'Ditolak SDM', 'Selesai Kegiatan'];
                if (statusBebas.includes(s.status)) return false;

                if (['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan'].includes(s.status)) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); 
                    const endDate = new Date(s.tanggal_selesai);
                    return endDate >= today; 
                }

                return true; 
            });

            setActiveSubmission(active);
        } catch (error) {
            console.error("Gagal mengecek status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) return null;

    let daysRemaining = null;
    if (activeSubmission && ['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan'].includes(activeSubmission.status)) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const endDate = new Date(activeSubmission.tanggal_selesai);
        endDate.setHours(0,0,0,0);
        const diffTime = endDate - today;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
        <div style={styles.container}>
            {/* SIDEBAR (selaras admin/superadmin) */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h2>
                    <p style={styles.brandSubtitle}>PORTAL MAHASISWA</p>
                </div>

                <div style={styles.sidebarNav}>
                    <div style={activeTab === 'profile' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('profile'); setIsExtending(false); }}>
                        <div style={styles.navLinkContent}><User size={20}/> <span>Profil Saya</span></div>
                    </div>
                    <div style={activeTab === 'pengajuan' ? styles.navItemActive : styles.navItem} onClick={() => { setActiveTab('pengajuan'); setIsExtending(false); }}>
                        <div style={styles.navLinkContent}><FilePlus size={20}/> <span>Buat Pengajuan</span></div>
                    </div>
                    <div style={styles.navItem} onClick={() => navigate('/riwayat')}>
                        <div style={styles.navLinkContent}><History size={20}/> <span>Riwayat Pengajuan</span></div>
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
                        <span style={styles.topBarName}>{userData.nama_lengkap} <span style={{color:'#ff6600'}}>• Mahasiswa</span></span>
                    </div>
                    {userData.id && <NotificationBell userId={userData.id} iconColor="#ff6600" iconSize={22} />}
                </div>

                <div style={styles.contentScroll}>
                    {isLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#888'}}>
                            <p>Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {/* TAB: PROFILE (landscape style) */}
                            {activeTab === 'profile' && (
                                <div style={styles.profileContainer}>
                                    <div style={styles.landscapeHeader}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
                                            <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <h2 style={{margin: '0 0 5px 0', color: '#003399', fontSize: '24px'}}>{userData.nama_lengkap}</h2>
                                                <span style={styles.roleBadge}>Mahasiswa Magang</span>
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
                                                    <div><small style={styles.labelSmall}>Nomor Induk (NIM/NIS)</small><p style={styles.valSmall}>{userData.nomor_induk || '-'}</p></div>
                                                </div>
                                                <div style={styles.infoItemHorizontal}>
                                                    <Building size={18} color="#003399" />
                                                    <div><small style={styles.labelSmall}>Asal Instansi / Universitas</small><p style={styles.valSmall}>{userData.asal_instansi || '-'}</p></div>
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
                                                    <label style={styles.labelForm}>Nomor Induk (NIM/NIS)</label>
                                                    <input style={styles.inputForm} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                                </div>
                                            </div>
                                            <div style={styles.inputGroupFull}>
                                                <label style={styles.labelForm}>Asal Instansi</label>
                                                <input style={styles.inputForm} value={formData.asal_instansi} onChange={e => setFormData({...formData, asal_instansi: e.target.value})} />
                                            </div>

                                            <hr style={{margin: '8px 0', border: '0.5px solid #eee'}} />
                                            <p style={{fontSize: '12px', color: '#ff6600', fontWeight: '700', letterSpacing: '1px', margin: 0, textTransform: 'uppercase'}}>Ganti Password (Opsional)</p>

                                            <div style={styles.rowForm}>
                                                <div style={styles.inputGroupHalf}>
                                                    <label style={styles.labelForm}>Password Lama</label>
                                                    <input type="password" style={styles.inputForm} placeholder="Kosongkan jika tidak diubah" value={formData.password_lama} onChange={e => setFormData({...formData, password_lama: e.target.value})} />
                                                </div>
                                                <div style={styles.inputGroupHalf}>
                                                    <label style={styles.labelForm}>Password Baru</label>
                                                    <input type="password" style={styles.inputForm} placeholder="Kosongkan jika tidak diubah" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})} />
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

                            {/* TAB: PENGAJUAN */}
                            {activeTab === 'pengajuan' && (
                                <>
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={styles.accentBar} />
                                        <h2 style={styles.sectionTitle}>
                                            {isExtending ? 'Formulir Perpanjangan Magang' : 'Formulir Pengajuan'}
                                        </h2>
                                        <p style={styles.sectionDesc}>
                                            {isExtending 
                                                ? 'Silakan lengkapi form di bawah ini untuk mengajukan perpanjangan kegiatan Anda.' 
                                                : 'Silakan lengkapi data dan dokumen untuk mengajukan kegiatan baru.'}
                                        </p>
                                    </div>

                                    {activeSubmission && !location.state?.initialData && !isExtending ? (
                                        <div style={styles.alertCard}>
                                            {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan'].includes(activeSubmission.status) ? (
                                                <>
                                                    <CheckCircle size={40} color="#27ae60" style={{marginBottom: '15px'}} />
                                                    <h3 style={{color: '#27ae60', margin: '0 0 10px 0'}}>Anda Sedang Menjalani Kegiatan Magang</h3>
                                                    <p style={{color: '#555', lineHeight: '1.6', fontSize: '14px'}}>
                                                        Sistem mendeteksi bahwa Anda sedang aktif melaksanakan <b>{activeSubmission.nama_jenis}</b> hingga <b>{new Date(activeSubmission.tanggal_selesai).toLocaleDateString('id-ID')}</b>.
                                                    </p>
                                                    {daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0 && (
                                                        <div style={styles.extendBox}>
                                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d35400', marginBottom: '8px'}}>
                                                                <CalendarClock size={20} />
                                                                <strong style={{fontSize: '15px'}}>Masa Kegiatan Hampir Selesai ({daysRemaining} Hari Lagi)</strong>
                                                            </div>
                                                            <p style={{color: '#856404', fontSize: '13px', margin: '0 0 15px 0'}}>
                                                                Apakah Anda membutuhkan perpanjangan waktu untuk kegiatan Anda? Anda bisa mengajukannya sekarang.
                                                            </p>
                                                            <button onClick={() => setIsExtending(true)} style={styles.btnExtend}>
                                                                <FilePlus size={16} /> Ajukan Perpanjangan Waktu
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                                ) : activeSubmission.status === 'Revisi' ? (
                                                <>
                                                    <AlertTriangle size={40} color="#0055cc" style={{marginBottom: '15px'}} />
                                                    <h3 style={{color: '#0055cc', margin: '0 0 10px 0'}}>Pengajuan Anda Perlu Tindakan</h3>
                                                    <p style={{color: '#555', lineHeight: '1.6', fontSize: '14px'}}>
                                                        Status pengajuan Anda saat ini adalah:
                                                    </p>
                                                    <div style={{...styles.statusBadgeInline, color: '#0055cc'}}>{activeSubmission.status}</div>
                                                    <p style={{color: '#555', lineHeight: '1.6', fontSize: '14px', marginTop: '14px'}}>
                                                        Silakan buka menu <b>Riwayat Pengajuan</b> dan klik tombol <b>Perbaiki Data</b> untuk mengunggah dokumen Anda.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle size={40} color="#f39c12" style={{marginBottom: '15px'}} />
                                                    <h3 style={{color: '#d35400', margin: '0 0 10px 0'}}>Pengajuan Anda Sedang Diproses</h3>
                                                    <p style={{color: '#555', lineHeight: '1.6', fontSize: '14px'}}>
                                                        Anda sudah memiliki pengajuan yang saat ini berstatus:
                                                    </p>
                                                    <div style={{...styles.statusBadgeInline, color: '#d35400'}}>{activeSubmission.status}</div>
                                                    <p style={{color: '#555', lineHeight: '1.6', fontSize: '14px', marginTop: '14px'}}>
                                                        Mohon tunggu hingga proses ini selesai atau ditolak sebelum membuat pengajuan baru.
                                                    </p>
                                                </>
                                            )}

                                            <div style={{marginTop: '25px'}}>
                                                <button style={styles.btnRiwayat} onClick={() => navigate('/riwayat')}>
                                                    Cek Riwayat Pengajuan
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={styles.formContainer}>
                                            <FormPengajuan 
                                                userId={userData.id} 
                                                onDocsUploaded={() => navigate('/riwayat')} 
                                                initialData={location.state?.initialData}
                                            />
                                            {isExtending && (
                                                <button onClick={() => setIsExtending(false)} style={styles.btnBatalPerpanjang}>
                                                    Batal Perpanjang
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },

    // SIDEBAR
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

    // MAIN & TOP HEADER
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
    topBarInfo: { display: 'flex', flexDirection: 'column' },
    topBarLabel: { fontSize: '11px', color: '#888', fontWeight: 'bold', letterSpacing: '1px' },
    topBarName: { fontSize: '14px', color: '#003399', fontWeight: 'bold', marginTop: '2px' },
    contentScroll: { padding: '40px', flex: 1 },

    // SECTION HEADER (FAQ-style)
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },

    // PROFILE (landscape style)
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '900px', borderRadius: '24px', padding: '40px', boxShadow: '0 8px 28px rgba(0,0,0,0.04)', margin: '0 auto', border: '1px solid #f0f4f8' },
    landscapeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, #ff6600, #cc5200)', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 20px rgba(255, 102, 0, 0.25)' },
    roleBadge: { display: 'inline-block', backgroundColor: '#e0f0ff', color: '#0055cc', padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
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
    btnSaveLandscape: { flex: 2, padding: '14px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancelLandscape: { flex: 1, padding: '14px', backgroundColor: '#f1f3f9', color: '#778da9', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },

    // ALERT CARD (pengajuan tab)
    alertCard: { backgroundColor: '#fff', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.04)', maxWidth: '640px', margin: '0 auto', border: '1px solid #f0f4f8' },
    statusBadgeInline: { display: 'inline-block', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', marginTop: '8px', backgroundColor: '#f8fafd', border: '1px solid #e0e7ff' },
    extendBox: { marginTop: '24px', padding: '18px', backgroundColor: '#fff4e5', borderRadius: '12px', border: '1px solid #ffe0b2' },
    btnExtend: { backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255,102,0,0.25)' },
    btnRiwayat: { backgroundColor: '#003399', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,51,153,0.25)' },

    // FORM CONTAINER
    formContainer: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8' },
    btnBatalPerpanjang: { marginTop: '15px', padding: '10px 20px', backgroundColor: '#f1f3f9', color: '#6b7280', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }
};

export default Dashboard;
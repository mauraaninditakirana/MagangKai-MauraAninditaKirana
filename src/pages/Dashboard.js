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
        const saved = localStorage.getItem('user');
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
        const storedUser = localStorage.getItem('user');
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
            localStorage.setItem('user', JSON.stringify(updatedUser));
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
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h3>
                    <small style={{opacity:0.7}}>Portal Mahasiswa</small>
                </div>
                
                <div style={activeTab === 'profile' ? styles.menuActive : styles.menuItem} onClick={() => { setActiveTab('profile'); setIsExtending(false); }}>
                    <User size={18}/> Profil Saya
                </div>

                <div style={activeTab === 'pengajuan' ? styles.menuActive : styles.menuItem} onClick={() => { setActiveTab('pengajuan'); setIsExtending(false); }}>
                    <FilePlus size={18}/> Buat Pengajuan
                </div>

                <div style={styles.menuItem} onClick={() => navigate('/riwayat')}>
                    <History size={18}/> Riwayat Pengajuan
                </div>

                <div style={styles.logout} onClick={() => {localStorage.clear(); navigate('/');}}>
                    <LogOut size={18}/> Keluar
                </div>
            </div>

            {/* KONTEN UTAMA */}
            <div style={styles.main}>
                {isLoading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#888'}}>
                        <p>Memuat data... 🚄</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'profile' ? (
                            <div style={styles.profileContainer}>
                                {/* ✨ HEADER LANDSCAPE BARU ✨ */}
                                <div style={styles.landscapeHeader}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '25px'}}>
                                        <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <h2 style={{margin: '0 0 5px 0', color: '#003399', fontSize: '24px'}}>{userData.nama_lengkap}</h2>
                                            <span style={styles.roleBadge}>Mahasiswa Magang</span>
                                        </div>
                                    </div>
                                    
                                     <NotificationBell userId={userData.id} iconColor="#ff6600" iconSize={22} />
                                </div>

                                <hr style={{border: '0.5px solid #eee', margin: '25px 0'}} />

                                {!isEditing ? (
                                    <>
                                        <div style={styles.infoGrid}>
                                            <div style={styles.infoItem}>
                                                <Mail size={18} color="#003399" />
                                                <div><small style={styles.label}>Email Sistem</small><p style={styles.val}>{userData.email}</p></div>
                                            </div>
                                            <div style={styles.infoItem}>
                                                <IdCard size={18} color="#003399" />
                                                <div><small style={styles.label}>Nomor Induk (NIM/NIS)</small><p style={styles.val}>{userData.nomor_induk || '-'}</p></div>
                                            </div>
                                            <div style={styles.infoItem}>
                                                <Building size={18} color="#003399" />
                                                <div><small style={styles.label}>Asal Instansi / Universitas</small><p style={styles.val}>{userData.asal_instansi || '-'}</p></div>
                                            </div>
                                        </div>

                                        <div style={{marginTop: '30px'}}>
                                            <button style={styles.btnEditAvatar} onClick={() => setIsEditing(true)}>
                                                <Edit3 size={16} /> Edit Profil & Password
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <form onSubmit={handleUpdateProfile} style={styles.form}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Nama Lengkap</label>
                                            <input style={styles.input} required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                                        </div>
                                        <div style={styles.rowForm}>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Email Sistem</label>
                                                <input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Nomor Induk (NIM/NIS)</label>
                                                <input style={styles.input} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                            </div>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Asal Instansi</label>
                                            <input style={styles.input} value={formData.asal_instansi} onChange={e => setFormData({...formData, asal_instansi: e.target.value})} />
                                        </div>
                                        
                                        <hr style={{margin: '20px 0', border: '0.5px solid #eee'}} />
                                        
                                        <p style={{fontSize: '14px', color: '#ff6600', fontWeight: 'bold', margin: '0 0 10px 0'}}>Ganti Password (Opsional)</p>
                                        <div style={styles.rowForm}>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Password Lama</label>
                                                <input type="password" style={styles.input} placeholder="Kosongkan jika tidak diubah" value={formData.password_lama} onChange={e => setFormData({...formData, password_lama: e.target.value})} />
                                            </div>
                                            <div style={styles.inputGroup}>
                                                <label style={styles.label}>Password Baru</label>
                                                <input type="password" style={styles.input} placeholder="Kosongkan jika tidak diubah" value={formData.password_baru} onChange={e => setFormData({...formData, password_baru: e.target.value})} />
                                            </div>
                                        </div>
                                        
                                        <div style={styles.btnArea}>
                                            <button type="button" style={styles.btnCancel} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                                            <button type="submit" style={styles.btnSave}><Save size={16}/> Simpan Perubahan</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <>
                                <div style={styles.headerArea}>
                                    <h2 style={{color:'#003399', marginBottom: '5px'}}>
                                        {isExtending ? 'Formulir Perpanjangan Magang' : 'Formulir Pengajuan'}
                                    </h2>
                                    <p style={{color:'#666', margin: 0}}>
                                        {isExtending ? 'Silakan lengkapi form di bawah ini untuk mengajukan perpanjangan kegiatan Anda.' : 'Silakan lengkapi data dan dokumen untuk mengajukan kegiatan baru.'}
                                    </p>
                                </div>
                                
                                {activeSubmission && !location.state?.initialData && !isExtending ? (
                                    <div style={styles.alertCard}>
                                        {['Selesai (Surat Dirilis)', 'Dalam Masa Kegiatan'].includes(activeSubmission.status) ? (
                                            <>
                                                <CheckCircle size={40} color="#27ae60" style={{marginBottom: '15px'}} />
                                                <h3 style={{color: '#27ae60', margin: '0 0 10px 0'}}>Anda Sedang Menjalani Kegiatan Magang</h3>
                                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                                    Sistem mendeteksi bahwa Anda sedang aktif melaksanakan <b>{activeSubmission.nama_jenis}</b> hingga <b>{new Date(activeSubmission.tanggal_selesai).toLocaleDateString('id-ID')}</b>. 
                                                </p>
                                                {daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0 && (
                                                    <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#fff4e5', borderRadius: '10px', border: '1px solid #ffe0b2'}}>
                                                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#d35400', marginBottom: '8px'}}>
                                                            <CalendarClock size={20} />
                                                            <strong style={{fontSize: '15px'}}>Masa Kegiatan Hampir Selesai ({daysRemaining} Hari Lagi)</strong>
                                                        </div>
                                                        <p style={{color: '#856404', fontSize: '13px', margin: '0 0 15px 0'}}>
                                                            Apakah Anda membutuhkan perpanjangan waktu untuk kegiatan Anda? Anda bisa mengajukannya sekarang.
                                                        </p>
                                                        <button 
                                                            onClick={() => setIsExtending(true)}
                                                            style={{backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px'}}
                                                        >
                                                            <FilePlus size={16} /> Ajukan Perpanjangan Waktu
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : activeSubmission.status === 'Revisi' || activeSubmission.status === 'Selesai Wawancara (Lengkapi Berkas Akhir)' ? (
                                            <>
                                                <AlertTriangle size={40} color="#0055cc" style={{marginBottom: '15px'}} />
                                                <h3 style={{color: '#0055cc', margin: '0 0 10px 0'}}>Pengajuan Anda Perlu Tindakan</h3>
                                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                                    Status pengajuan Anda saat ini adalah: <br/>
                                                    <span style={{...styles.badgeWarning, backgroundColor: '#e0f0ff', color: '#0055cc'}}>{activeSubmission.status}</span>
                                                    <br/><br/>Silakan buka menu <b>Riwayat Pengajuan</b> dan klik tombol <b>Perbaiki Data</b> untuk mengunggah dokumen Anda.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle size={40} color="#f39c12" style={{marginBottom: '15px'}} />
                                                <h3 style={{color: '#d35400', margin: '0 0 10px 0'}}>Pengajuan Anda Sedang Diproses</h3>
                                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                                    Anda sudah memiliki pengajuan yang saat ini berstatus: <br/>
                                                    <span style={styles.badgeWarning}>{activeSubmission.status}</span>
                                                    <br/><br/>Mohon tunggu hingga proses ini selesai atau ditolak sebelum membuat pengajuan baru.
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
                                            <button 
                                                onClick={() => setIsExtending(false)} 
                                                style={{marginTop: '15px', padding: '10px 20px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
                                            >
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
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#083182', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', position: 'fixed', top: 0, left: 0, height: '100vh', boxSizing: 'border-box', zIndex: 100 },
    main: { flex: 1, padding: '40px', overflowY: 'auto', marginLeft: '260px', minHeight: '100vh', boxSizing: 'border-box' },
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    headerArea: { marginBottom: '30px' },
    formContainer: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    alertCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', borderTop: '5px solid #f39c12' },
    badgeWarning: { display: 'inline-block', backgroundColor: '#fff3cd', color: '#856404', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', marginTop: '10px' },
    btnRiwayat: { backgroundColor: '#003399', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s' },
    
    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '800px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    landscapeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '32px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(255, 102, 0, 0.3)' },
    roleBadge: { display: 'inline-block', backgroundColor: '#e0f0ff', color: '#0055cc', padding: '4px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' },
    
    btnEditAvatar: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: '0.2s' },
    
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' },
    label: { color: '#888', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '15px' },
    
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    rowForm: { display: 'flex', gap: '20px' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', backgroundColor: '#fcfcfc', marginTop: '5px' },
    btnArea: { display: 'flex', gap: '15px', marginTop: '15px' },
    btnSave: { flex: 2, padding: '14px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' },
    btnCancel: { flex: 1, padding: '14px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import FormPengajuan from '../components/FormPengajuan';
import { 
    FilePlus, History, LogOut, AlertTriangle, CheckCircle, 
    User, Edit3, Mail, IdCard, Building, Save, X 
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
    
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
    useEffect(() => {
        // Menghapus 'ingatan tab' dari browser supaya pas login ulang / refresh selalu kembali ke Profil
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
        
        // Cek status pengajuan user (FUNGSI ASLI TIDAK DIUBAH)
        checkUserStatus(parsedUser.id);
        
        // Ambil data profil terbaru
        fetchProfile(parsedUser.id);
        
        window.scrollTo(0, 0);
    }, [navigate]);

    //  Ambil Data Profil Terbaru 
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

    // Simpan Profil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/users/${userData.id}/profile`, formData);
            Swal.fire('Berhasil!', 'Profil diperbarui. Silakan login ulang jika mengubah password.', 'success');
            setIsEditing(false);
            
            // Update Local Storage
            const updatedUser = { ...userData, nama_lengkap: formData.nama_lengkap, email: formData.email, nomor_induk: formData.nomor_induk, asal_instansi: formData.asal_instansi };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
        }
    };

    // FUNGSI ASLI: TIDAK DISENTUH
    const checkUserStatus = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions?user_id=${userId}`);
            const submissions = res.data || [];
            
            const active = submissions.find(s => {
                if (s.status === 'Menunggu Verifikasi' || s.status === 'Ditinjau Unit' || s.status === 'Disetujui Unit') {
                    return true;
                }
                if (s.status === 'Selesai (Surat Dirilis)') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); 
                    const endDate = new Date(s.tanggal_selesai);
                    if (endDate >= today) {
                        return true;
                    }
                }
                return false;
            });

            setActiveSubmission(active);
        } catch (error) {
            console.error("Gagal mengecek status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) return null;

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h3 style={{margin:0}}>KAI <span style={{color: '#ff6600'}}>MAGANG</span></h3>
                    <small style={{opacity:0.7}}>Portal Mahasiswa</small>
                </div>
                
                <div 
                    style={activeTab === 'profile' ? styles.menuActive : styles.menuItem} 
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18}/> Profil Saya
                </div>

                <div 
                    style={activeTab === 'pengajuan' ? styles.menuActive : styles.menuItem} 
                    onClick={() => setActiveTab('pengajuan')}
                >
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
                                <div style={styles.profileHeader}>
                                    <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0)}</div>
                                    <h2 style={{margin: '10px 0 5px 0', color: '#003399'}}>{userData.nama_lengkap}</h2>
                                    <span style={styles.roleBadge}>Mahasiswa Magang</span>
                                    
                                    {/* Tombol Edit tepat di bawah foto/nama */}
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
                                            <IdCard size={18} color="#003399" />
                                            <div><small style={styles.label}>Nomor Induk (NIM/NIS)</small><p style={styles.val}>{userData.nomor_induk || '-'}</p></div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <Building size={18} color="#003399" />
                                            <div><small style={styles.label}>Asal Instansi / Universitas</small><p style={styles.val}>{userData.asal_instansi || '-'}</p></div>
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
                                            <label style={styles.label}>Nomor Induk (NIM/NIS)</label>
                                            <input style={styles.input} value={formData.nomor_induk} onChange={e => setFormData({...formData, nomor_induk: e.target.value})} />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Asal Instansi</label>
                                            <input style={styles.input} value={formData.asal_instansi} onChange={e => setFormData({...formData, asal_instansi: e.target.value})} />
                                        </div>
                                        
                                        <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
                                        <p style={{fontSize: '12px', color: '#ff6600', fontWeight: 'bold', margin: 0}}>Ganti Password (Kosongkan jika tidak ingin mengubah)</p>
                                        
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
                                            <button type="submit" style={styles.btnSave}><Save size={16}/> Simpan Perubahan</button>
                                        </div>
                                    </form>
                                )}
                            </div>

                        ) : (
                            <>
                                <div style={styles.headerArea}>
                                    <h2 style={{color:'#003399', marginBottom: '5px'}}>Formulir Pengajuan 🚄</h2>
                                    <p style={{color:'#666', margin: 0}}>Silakan lengkapi data dan dokumen untuk mengajukan kegiatan baru.</p>
                                </div>
                                
                                {activeSubmission ? (
                                    <div style={styles.alertCard}>
                                        {activeSubmission.status === 'Selesai (Surat Dirilis)' ? (
                                            <>
                                                <CheckCircle size={40} color="#27ae60" style={{marginBottom: '15px'}} />
                                                <h3 style={{color: '#27ae60', margin: '0 0 10px 0'}}>Anda Sedang Menjalani Kegiatan Magang</h3>
                                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                                    Sistem mendeteksi bahwa Anda sedang aktif melaksanakan <b>{activeSubmission.nama_jenis}</b> di <b>{activeSubmission.nama_unit}</b> hingga tanggal <b>{new Date(activeSubmission.tanggal_selesai).toLocaleDateString('id-ID')}</b>. 
                                                    <br/><br/>Anda baru dapat mengajukan permohonan baru setelah periode kegiatan saat ini berakhir.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle size={40} color="#f39c12" style={{marginBottom: '15px'}} />
                                                <h3 style={{color: '#d35400', margin: '0 0 10px 0'}}>Pengajuan Anda Sedang Diproses</h3>
                                                <p style={{color: '#555', lineHeight: '1.5'}}>
                                                    Anda sudah memiliki pengajuan <b>{activeSubmission.nama_jenis}</b> yang saat ini berstatus: <br/>
                                                    <span style={styles.badgeWarning}>{activeSubmission.status}</span>
                                                    <br/><br/>Mohon tunggu hingga proses ini selesai atau ditolak sebelum membuat pengajuan baru. Anda dapat mengecek status lengkapnya di menu Riwayat.
                                                </p>
                                            </>
                                        )}
                                        <button style={styles.btnRiwayat} onClick={() => navigate('/riwayat')}>
                                            Cek Riwayat Pengajuan
                                        </button>
                                    </div>
                                ) : (
                                    <div style={styles.formContainer}>
                                        <FormPengajuan 
                                            userId={userData.id} 
                                            onDocsUploaded={() => navigate('/riwayat')} 
                                        />
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
    // LAYOUT DASAR
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' },
    sidebar: { width: '260px', backgroundColor: '#083182', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', position: 'fixed', top: 0, left: 0, height: '100vh', boxSizing: 'border-box', zIndex: 100 },
    main: { flex: 1, padding: '40px', overflowY: 'auto', marginLeft: '260px', minHeight: '100vh', boxSizing: 'border-box' },
    
    // SIDEBAR
    logoArea: { marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    menuActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: '#ff6600', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '10px', cursor: 'pointer' },
    menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#ccc', marginBottom: '10px', transition: '0.3s' },
    logout: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', cursor: 'pointer', color: '#ffaaaa', fontSize: '14px', fontWeight: 'bold' },
    
    // HEADER & CARD PENGAJUAN
    headerArea: { marginBottom: '30px' },
    formContainer: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    alertCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', borderTop: '5px solid #f39c12' },
    badgeWarning: { display: 'inline-block', backgroundColor: '#fff3cd', color: '#856404', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', marginTop: '10px' },
    btnRiwayat: { marginTop: '25px', backgroundColor: '#003399', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.3s' },

    profileContainer: { backgroundColor: '#fff', width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', margin: '0 auto' },
    profileHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
    avatarLarge: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ff6600', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' },
    roleBadge: { backgroundColor: '#e0f0ff', color: '#0055cc', padding: '4px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' },
    btnEditAvatar: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f4f8', color: '#003399', border: '1px solid #cce0ff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: '0.2s' },
    
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' },
    label: { color: '#888', margin: 0, fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    val: { margin: 0, fontWeight: 'bold', color: '#333', fontSize: '14px' },
    
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', backgroundColor: '#fcfcfc' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default Dashboard;
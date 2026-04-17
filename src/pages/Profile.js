import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, Mail, Lock, Building, IdCard, Edit3, Save, X } from 'lucide-react';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        email: '',
        nomor_induk: '',
        asal_instansi: '',
        password_lama: '',
        password_baru: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            fetchProfile(user.id);
        }
    }, []);

    const fetchProfile = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${id}`);
            setUserData(res.data);
            setFormData({
                ...formData,
                nama_lengkap: res.data.nama_lengkap,
                email: res.data.email,
                nomor_induk: res.data.nomor_induk || '',
                asal_instansi: res.data.asal_instansi || ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/users/${userData.id}/profile`, formData);
            Swal.fire('Berhasil!', 'Profil diperbarui. Silakan login ulang jika mengubah password.', 'success');
            setIsEditing(false);
            fetchProfile(userData.id);
        } catch (err) {
            Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
        }
    };

    if (!userData) return <p style={{padding: '40px'}}>Memuat data profil...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatarLarge}>{userData.nama_lengkap?.charAt(0)}</div>
                    <h2 style={{margin: '10px 0 5px 0'}}>Halo, {userData.nama_lengkap}! 👋</h2>
                    <span style={styles.roleBadge}>{userData.role}</span>
                </div>

                {!isEditing ? (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <User size={18} color="#003399" />
                            <div><small style={styles.label}>Nama Lengkap</small><p style={styles.val}>{userData.nama_lengkap}</p></div>
                        </div>
                        <div style={styles.infoItem}>
                            <Mail size={18} color="#003399" />
                            <div><small style={styles.label}>Email Sistem</small><p style={styles.val}>{userData.email}</p></div>
                        </div>
                        {userData.role === 'user' && (
                            <>
                                <div style={styles.infoItem}>
                                    <IdCard size={18} color="#003399" />
                                    <div><small style={styles.label}>Nomor Induk</small><p style={styles.val}>{userData.nomor_induk}</p></div>
                                </div>
                                <div style={styles.infoItem}>
                                    <Building size={18} color="#003399" />
                                    <div><small style={styles.label}>Asal Instansi</small><p style={styles.val}>{userData.asal_instansi}</p></div>
                                </div>
                            </>
                        )}
                        <button style={styles.btnEdit} onClick={() => setIsEditing(true)}>
                            <Edit3 size={16} /> Edit Profil & Password
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nama Lengkap</label>
                            <input style={styles.input} value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input style={styles.input} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <hr style={{margin: '20px 0', border: '0.5px solid #eee'}} />
                        <p style={{fontSize: '12px', color: '#ff6600', fontWeight: 'bold'}}>Ganti Password (Kosongkan jika tidak ingin mengubah)</p>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password Lama</label>
                            <input type="password" style={styles.input} placeholder="Masukkan password saat ini" onChange={e => setFormData({...formData, password_lama: e.target.value})} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password Baru</label>
                            <input type="password" style={styles.input} placeholder="Masukkan password baru" onChange={e => setFormData({...formData, password_baru: e.target.value})} />
                        </div>
                        <div style={styles.btnArea}>
                            <button type="button" style={styles.btnCancel} onClick={() => setIsEditing(false)}><X size={16}/> Batal</button>
                            <button type="submit" style={styles.btnSave}><Save size={16}/> Simpan Perubahan</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px', display: 'flex', justifyContent: 'center', backgroundColor: '#f0f4f8', minHeight: '100vh' },
    card: { backgroundColor: '#fff', width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 'fit-content' },
    header: { textAlign: 'center', marginBottom: '30px' },
    avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#003399', color: '#fff', fontSize: '32px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' },
    roleBadge: { backgroundColor: '#fff4e5', color: '#ff6600', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px' },
    label: { color: '#888', margin: 0 },
    val: { margin: 0, fontWeight: 'bold', color: '#333' },
    btnEdit: { marginTop: '10px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#003399', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
    btnArea: { display: 'flex', gap: '10px', marginTop: '10px' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};

export default Profile;
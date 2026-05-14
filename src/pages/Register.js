import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { UserPlus, Mail, Lock, User, Building, Phone, Hash, GraduationCap } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        email: '',
        password: '',
        nomor_induk: '',
        no_telp: '',
        asal_instansi: '',
        jenjang: 'Mahasiswa'
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'email') {
            value = value.toLowerCase().replace(/\s/g, '');
        }
        if (name === 'nomor_induk' || name === 'no_telp') {
            value = value.replace(/\s/g, '');
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            Swal.fire({
                icon: 'success',
                title: 'Registrasi Berhasil!',
                text: res.data.message,
                confirmButtonColor: '#003399'
            });
            navigate('/');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Daftar',
                text: error.response?.data?.message || 'Terjadi kesalahan'
            });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Daftar Akun <span style={{color: '#ff6600'}}>Magang</span></h2>
                    <p style={styles.subtitle}>Lengkapi data diri untuk mulai pengajuan</p>
                </div>

                <form onSubmit={handleRegister} style={styles.form}>
                    {/* Jenjang — full width di atas */}
                    <div style={styles.inputGroup}>
                        <GraduationCap size={18} style={styles.icon} />
                        <select 
                            name="jenjang" 
                            value={formData.jenjang}
                            onChange={handleChange} 
                            style={{...styles.input, cursor: 'pointer'}} 
                            required
                        >
                            <option value="Mahasiswa">Mahasiswa (Kuliah)</option>
                            <option value="Siswa">Siswa (SMA/SMK/sederajat)</option>
                        </select>
                    </div>

                    {/* 2 kolom landscape */}
                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <User size={18} style={styles.icon} />
                            <input name="nama_lengkap" placeholder="Nama Lengkap" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <Mail size={18} style={styles.icon} />
                            <input name="email" type="email" placeholder="Email" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <Hash size={18} style={styles.icon} />
                            <input 
                                name="nomor_induk" 
                                placeholder={formData.jenjang === 'Siswa' ? 'NIS' : 'NIM'} 
                                style={styles.input} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <Phone size={18} style={styles.icon} />
                            <input name="no_telp" placeholder="No. WhatsApp" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <Lock size={18} style={styles.icon} />
                            <input name="password" type="password" placeholder="Password" style={styles.input} onChange={handleChange} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <Building size={18} style={styles.icon} />
                            <input 
                                name="asal_instansi" 
                                placeholder={formData.jenjang === 'Siswa' ? 'Asal Sekolah' : 'Asal Kampus'} 
                                style={styles.input} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" style={styles.button}>
                        <UserPlus size={20} style={{marginRight: '8px'}} />
                        Daftar Sekarang
                    </button>
                </form>

                <p style={styles.footerText}>
                    Sudah punya akun? <span onClick={() => navigate('/')} style={styles.link}>Login di sini</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f4', padding: '20px' },
    card: { backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '720px', textAlign: 'center' },
    header: { marginBottom: '20px' },
    title: { margin: '0', fontSize: '22px', fontWeight: 'bold', color: '#003399' },
    subtitle: { color: '#666', fontSize: '13px', marginTop: '6px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '0 12px' },
    icon: { color: '#003399', flexShrink: 0 },
    input: { border: 'none', backgroundColor: 'transparent', padding: '10px', width: '100%', outline: 'none', fontSize: '13px' },
    button: { backgroundColor: '#ff6600', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '8px' },
    footerText: { marginTop: '15px', fontSize: '13px', color: '#666' },
    link: { color: '#003399', fontWeight: 'bold', cursor: 'pointer' }
};

export default Register;
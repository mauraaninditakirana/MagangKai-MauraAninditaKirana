import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        
        const userData = res.data.user;
        localStorage.setItem('user', JSON.stringify(userData));

        Swal.fire('Berhasil Login!', 'Selamat datang kembali', 'success');

        const role = (userData.role || '').toLowerCase();

        if (role === 'super admin' || role === 'admin') {
                // Lempar HC Pusat ke SuperAdminDashboard
                navigate('/super-admin'); 
            } 
            else if (role === 'admin unit') {
                // Lempar Kepala Unit ke AdminDashboard
                navigate('/admin'); 
            }
            else {
                // Lempar mahasiswa ke halaman User
                navigate('/dashboard'); 
            }

        } catch (err) {
            console.error(err);
            Swal.fire('Gagal!', 'Email atau password salah', 'error');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Sistem Magang <span style={{color: '#ff6600'}}>KAI</span></h2>
                    <p style={styles.subtitle}>Silakan login untuk masuk ke sistem</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <Mail size={20} style={styles.icon} />
                        <input 
                            type="email" 
                            placeholder="Email Instansi / Pribadi" 
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <Lock size={20} style={styles.icon} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        <LogIn size={20} style={{marginRight: '8px'}} />
                        Masuk Ke Sistem
                    </button>
                </form>

                <p style={styles.footerText}>
                    Belum punya akun? <span onClick={() => navigate('/register')} style={styles.link}>Daftar Sekarang</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4', padding: '20px' },
    card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    header: { marginBottom: '30px' },
    title: { margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#003399' },
    subtitle: { color: '#666', fontSize: '14px', marginTop: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '0 15px' },
    icon: { color: '#003399' },
    input: { border: 'none', backgroundColor: 'transparent', padding: '12px', width: '100%', outline: 'none', fontSize: '14px' },
    button: { backgroundColor: '#003399', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' },
    footerText: { marginTop: '20px', fontSize: '13px', color: '#666' },
    link: { color: '#ff6600', fontWeight: 'bold', cursor: 'pointer' }
};

export default Login;
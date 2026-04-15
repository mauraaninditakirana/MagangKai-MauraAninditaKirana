import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Send, FileUp, ClipboardList } from 'lucide-react';

const FormPengajuan = ({ userId, onDocsUploaded }) => {
    const [units, setUnits] = useState([]);
    const [submissionTypes, setSubmissionTypes] = useState([]); 
    const [formData, setFormData] = useState({
        submission_type_id: '',
        unit_id: '',
        judul_atau_tujuan: '',
        kategori_pendaftar: 'Individu',
        jumlah_anggota: 1,
        tanggal_mulai: '',
        tanggal_selesai: ''
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Ambil data unit (tambahkan penangkal cache agar kuota selalu update)
        axios.get(`http://localhost:5000/api/units?_t=${Date.now()}`)
            .then(res => setUnits(res.data))
            .catch(err => console.error(err));

        setSubmissionTypes([
            { id: 1, nama: 'Magang / Kerja Praktek' },
            { id: 2, nama: 'PKL (Praktek Kerja Lapangan)' },
            { id: 3, nama: 'Penelitian / Riset Data' },
            { id: 4, nama: 'Tugas Akhir / Skripsi' }
        ]);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.submission_type_id || !formData.unit_id) {
            return Swal.fire('Perhatian', 'Mohon pilih Keperluan dan Unit Tujuan', 'warning');
        }

        // Cek apakah sisa kuota cukup untuk jumlah anggota 
        const selectedUnit = units.find(u => u.id.toString() === formData.unit_id.toString());
        if (selectedUnit && formData.jumlah_anggota > selectedUnit.kuota) {
            return Swal.fire(
                'Kuota Tidak Cukup!', 
                `Maaf, sisa kuota di ${selectedUnit.nama_unit} hanya tinggal ${selectedUnit.kuota} orang. Mohon kurangi anggota atau pilih unit lain.`, 
                'error'
            );
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('user_id', userId);
        
        for (let i = 0; i < files.length; i++) {
            data.append('files', files[i]);
        }

        try {
            await axios.post('http://localhost:5000/api/submissions', data);
            Swal.fire('Berhasil!', 'Pengajuan Anda telah berhasil dikirim.', 'success');
            onDocsUploaded();
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim pengajuan.', 'error');
        }
    };

    return (
        <div style={styles.card}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                <ClipboardList color="#003399" />
                <h3 style={{color: '#003399', margin: 0}}>Form Pengajuan Baru</h3>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Jenis Keperluan</label>
                        <select name="submission_type_id" onChange={handleChange} style={styles.input} required>
                            <option value="">-- Pilih Keperluan --</option>
                            {submissionTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputBox}>
                        <label style={styles.label}>Unit Tujuan</label>
                        <select name="unit_id" onChange={handleChange} style={styles.input} required>
                            <option value="">-- Pilih Unit --</option>
                            {/* ✨ LOGIKA CERDAS: Kunci opsi jika kuota habis ✨ */}
                            {units.map(u => (
                                <option key={u.id} value={u.id} disabled={u.kuota <= 0}>
                                    {u.nama_unit} {u.kuota <= 0 ? '(KUOTA PENUH 🚫)' : `(Sisa Kuota: ${u.kuota} Orang)`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Kategori Pendaftar</label>
                        <select name="kategori_pendaftar" onChange={handleChange} style={styles.input}>
                            <option value="Individu">Individu</option>
                            <option value="Kelompok">Kelompok</option>
                        </select>
                    </div>
                    {formData.kategori_pendaftar === 'Kelompok' && (
                        <div style={styles.inputBox}>
                            <label style={styles.label}>Jumlah Anggota (Termasuk Anda)</label>
                            <input type="number" name="jumlah_anggota" min="2" onChange={handleChange} style={styles.input} required />
                        </div>
                    )}
                </div>

                <div style={styles.inputBox}>
                    <label style={styles.label}>Judul Project / Nama Penelitian</label>
                    <input 
                        name="judul_atau_tujuan" 
                        placeholder="Contoh: Analisis Sistem Manajemen Barang di KAI Jogja" 
                        onChange={handleChange} 
                        style={styles.input} 
                        required 
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Rencana Tanggal Mulai</label>
                        <input type="date" name="tanggal_mulai" onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Rencana Tanggal Selesai</label>
                        <input type="date" name="tanggal_selesai" onChange={handleChange} style={styles.input} required />
                    </div>
                </div>

                <div style={styles.inputBox}>
                    <label style={styles.label}>Upload Dokumen Pendukung (Proposal/KTP/Surat Pengantar)</label>
                    <div style={styles.fileContainer}>
                        <FileUp size={20} color="#666" />
                        <input type="file" multiple onChange={handleFileChange} style={{border: 'none', width: '100%'}} />
                    </div>
                    <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>*Anda dapat memilih lebih dari 1 file sekaligus.</p>
                </div>

                <button type="submit" style={styles.btnSubmit}>
                    <Send size={18} style={{marginRight: '8px'}} /> Kirim Pengajuan Ke KAI
                </button>
            </form>
        </div>
    );
};

const styles = {
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'flex', gap: '20px' },
    inputBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#444' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#fcfcfc', fontSize: '14px' },
    fileContainer: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '2px dashed #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' },
    btnSubmit: { backgroundColor: '#003399', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }
};

export default FormPengajuan;
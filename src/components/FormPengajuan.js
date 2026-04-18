import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// UBAH/TAMBAH: Import useLocation untuk membaca parameter URL
import { useLocation } from 'react-router-dom'; 
import { Send, FileUp, ClipboardList, Edit3 } from 'lucide-react'; 

const FormPengajuan = ({ userId, onDocsUploaded, initialData }) => {
    // UBAH/TAMBAH: Ambil parameter ?revisi= dari URL
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const revisiId = queryParams.get('revisi');

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
        // 1. Ambil data unit (tetap sama)
        axios.get(`http://localhost:5000/api/units?_t=${Date.now()}`)
            .then(res => setUnits(res.data))
            .catch(err => console.error(err));

        setSubmissionTypes([
            { id: 1, nama: 'Magang / Kerja Praktek' },
            { id: 2, nama: 'PKL (Praktek Kerja Lapangan)' },
            { id: 3, nama: 'Penelitian / Riset Data' },
            { id: 4, nama: 'Tugas Akhir / Skripsi' }
        ]);

        if (revisiId) {
            // Cek apakah ada data titipan (initialData) dari halaman Riwayat
            if (initialData) {
                console.log("Menggunakan data titipan dari Riwayat");
                setFormData({
                    submission_type_id: initialData.submission_type_id || '',
                    unit_id: initialData.unit_id || '',
                    judul_atau_tujuan: initialData.judul_atau_tujuan || '',
                    kategori_pendaftar: initialData.kategori_pendaftar || 'Individu',
                    jumlah_anggota: initialData.jumlah_anggota || 1,
                    asal_instansi: initialData.asal_instansi || '', // ✨ Tambahkan ini
                    tanggal_mulai: initialData.tanggal_mulai ? initialData.tanggal_mulai.split('T')[0] : '',
                    tanggal_selesai: initialData.tanggal_selesai ? initialData.tanggal_selesai.split('T')[0] : ''
                });
            } else {
                // Jika tidak ada initialData, baru ambil dari API (cadangan)
                axios.get(`http://localhost:5000/api/submissions/${revisiId}`)
                    .then(res => {
                        const dataLama = res.data;
                        setFormData({
                            submission_type_id: dataLama.submission_type_id || '',
                            unit_id: dataLama.unit_id || '',
                            judul_atau_tujuan: dataLama.judul_atau_tujuan || '',
                            kategori_pendaftar: dataLama.kategori_pendaftar || 'Individu',
                            jumlah_anggota: dataLama.jumlah_anggota || 1,
                            asal_instansi: dataLama.asal_instansi || '', // ✨ Tambahkan ini
                            tanggal_mulai: dataLama.tanggal_mulai ? dataLama.tanggal_mulai.split('T')[0] : '',
                            tanggal_selesai: dataLama.tanggal_selesai ? dataLama.tanggal_selesai.split('T')[0] : ''
                        });
                    })
                    .catch(err => console.error("Gagal load data revisi:", err));
            }
        } else {
            // Bersihkan form jika bukan mode revisi
            setFormData({
                submission_type_id: '', unit_id: '', judul_atau_tujuan: '', asal_instansi: '',
                kategori_pendaftar: 'Individu', jumlah_anggota: 1, tanggal_mulai: '', tanggal_selesai: ''
            });
        }
    }, [revisiId, initialData]); 

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
            if (revisiId) {
                // Beri tahu backend bahwa ini adalah hasil revisi mahasiswa
                data.append('catatan', 'Mahasiswa telah melakukan perbaikan data/dokumen.');
                
                await axios.put(`http://localhost:5000/api/submissions/${revisiId}/revisi`, data);
                Swal.fire('Berhasil!', 'Perbaikan data Anda telah terkirim.', 'success');
            } else {
                await axios.post('http://localhost:5000/api/submissions', data);
                Swal.fire('Berhasil!', 'Pengajuan Anda telah berhasil dikirim.', 'success');
            }
            onDocsUploaded();
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim data.', 'error');
        }
    };

    return (
        <div style={styles.card}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                {revisiId ? <Edit3 color="#ff6600" /> : <ClipboardList color="#003399" />}
                <h3 style={{color: revisiId ? '#ff6600' : '#003399', margin: 0}}>
                    {revisiId ? 'Form Perbaikan Data (Revisi)' : 'Form Pengajuan Baru'}
                </h3>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Jenis Keperluan</label>
                        <select name="submission_type_id" value={formData.submission_type_id} onChange={handleChange} style={styles.input} required>
                            <option value="">-- Pilih Keperluan --</option>
                            {submissionTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputBox}>
                        <label style={styles.label}>Unit Tujuan</label>
                        <select name="unit_id" value={formData.unit_id} onChange={handleChange} style={styles.input} required>
                            <option value="">-- Pilih Unit --</option>
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
                        <select name="kategori_pendaftar" value={formData.kategori_pendaftar} onChange={handleChange} style={styles.input}>
                            <option value="Individu">Individu</option>
                            <option value="Kelompok">Kelompok</option>
                        </select>
                    </div>
                    {formData.kategori_pendaftar === 'Kelompok' && (
                        <div style={styles.inputBox}>
                            <label style={styles.label}>Jumlah Anggota (Termasuk Anda)</label>
                            <input type="number" name="jumlah_anggota" value={formData.jumlah_anggota} min="2" onChange={handleChange} style={styles.input} required />
                        </div>
                    )}
                </div>
                <div style={styles.inputBox}>
                    <label style={styles.label}>Asal Instansi / Universitas</label>
                    <input 
                        name="asal_instansi" 
                        value={formData.asal_instansi}
                        placeholder="Contoh: Universitas Muhammadiyah Yogyakarta" 
                        onChange={handleChange} 
                        style={styles.input} 
                        required 
                    />
                </div>

                <div style={styles.inputBox}>
                    <label style={styles.label}>Judul Project / Nama Penelitian</label>
                    <input 
                        name="judul_atau_tujuan" 
                        value={formData.judul_atau_tujuan}
                        placeholder="Contoh: Analisis Sistem Manajemen Barang di KAI Jogja" 
                        onChange={handleChange} 
                        style={styles.input} 
                        required 
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Rencana Tanggal Mulai</label>
                        <input type="date" name="tanggal_mulai" value={formData.tanggal_mulai} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Rencana Tanggal Selesai</label>
                        <input type="date" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleChange} style={styles.input} required />
                    </div>
                </div>

                <div style={styles.inputBox}>
                    <label style={styles.label}>Upload Dokumen Pendukung (Proposal/KTP/Surat Pengantar)</label>
                    <div style={styles.fileContainer}>
                        <FileUp size={20} color="#666" />
                        <input type="file" multiple onChange={handleFileChange} style={{border: 'none', width: '100%'}} required={!revisiId} />
                    </div>
                    <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>
                        {revisiId 
                            ? '*Biarkan kosong jika tidak ada dokumen yang perlu diperbaiki/diubah.' 
                            : '*Anda dapat memilih lebih dari 1 file sekaligus.'}
                    </p>
                </div>

                <button type="submit" style={{...styles.btnSubmit, backgroundColor: revisiId ? '#ff6600' : '#003399'}}>
                    {revisiId ? (
                        <><Edit3 size={18} style={{marginRight: '8px'}} /> Kirim Perbaikan Data</>
                    ) : (
                        <><Send size={18} style={{marginRight: '8px'}} /> Kirim Pengajuan Ke KAI</>
                    )}
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
    btnSubmit: { color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }
};

export default FormPengajuan;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom'; 
import { Send, FileUp, ClipboardList, Edit3, CheckCircle } from 'lucide-react'; 

const FormPengajuan = ({ userId, onDocsUploaded, initialData }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const revisiId = queryParams.get('revisi');

    const [units, setUnits] = useState([]);
    const [submissionTypes, setSubmissionTypes] = useState([]); 
    const [requirements, setRequirements] = useState([]); 

    const [formData, setFormData] = useState({
        submission_type_id: '',
        unit_id: '',
        judul_atau_tujuan: '',
        nama_pembimbing: '',    
        kontak_pembimbing: '',  
        kategori_pendaftar: 'Individu',
        jumlah_anggota: 1,
        asal_instansi: '', 
        tanggal_mulai: '',
        tanggal_selesai: ''
    });
    
    const [filesByReq, setFilesByReq] = useState({}); 
    // Helper: tambah X bulan ke tanggal (return YYYY-MM-DD)
    const addMonths = (dateStr, months) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    // Max bulan magang: PKL boleh 6 bulan, lainnya 3 bulan 
    const getMaxMonths = () => {
        return formData.submission_type_id?.toString() === '2' ? 6 : 3;
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const unitRes = await axios.get(`http://localhost:5000/api/units?_t=${Date.now()}`);
                setUnits(unitRes.data);

                setSubmissionTypes([
                    { id: 1, nama: 'Magang / Kerja Praktek' },
                    { id: 2, nama: 'PKL (Praktek Kerja Lapangan)' },
                    { id: 3, nama: 'Penelitian / Riset Data' },
                    { id: 4, nama: 'Tugas Akhir / Skripsi' }
                ]);

                try {
                    const reqRes = await axios.get('http://localhost:5000/api/requirements');
                    setRequirements(reqRes.data.filter(r => r.is_active) || []);
                } catch (reqErr) {
                    console.error("Belum ada API requirements, abaikan sementara", reqErr);
                }

                let userInstansi = '';
                if (userId) {
                    const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
                    userInstansi = userRes.data.asal_instansi || '';
                }

                if (revisiId) {
                    if (initialData) {
                        setFormData({
                            submission_type_id: initialData.submission_type_id || '',
                            unit_id: initialData.unit_id || '',
                            judul_atau_tujuan: initialData.judul_atau_tujuan || '',
                            nama_pembimbing: initialData.nama_pembimbing || '',
                            kontak_pembimbing: initialData.kontak_pembimbing || '',
                            kategori_pendaftar: initialData.kategori_pendaftar || 'Individu',
                            jumlah_anggota: initialData.jumlah_anggota || 1,
                            asal_instansi: userInstansi, 
                            tanggal_mulai: initialData.tanggal_mulai ? initialData.tanggal_mulai.split('T')[0] : '',
                            tanggal_selesai: initialData.tanggal_selesai ? initialData.tanggal_selesai.split('T')[0] : ''
                        });
                    } else {
                        const resLama = await axios.get(`http://localhost:5000/api/submissions/${revisiId}`);
                        const dataLama = resLama.data;

                        setFormData({
                            submission_type_id: dataLama.submission_type_id || '',
                            unit_id: dataLama.unit_id || '',
                            judul_atau_tujuan: dataLama.judul_atau_tujuan || '',
                            nama_pembimbing: dataLama.nama_pembimbing || '',
                            kontak_pembimbing: dataLama.kontak_pembimbing || '',
                            kategori_pendaftar: dataLama.kategori_pendaftar || 'Individu',
                            jumlah_anggota: dataLama.jumlah_anggota || 1,
                            asal_instansi: userInstansi, 
                            tanggal_mulai: dataLama.tanggal_mulai ? dataLama.tanggal_mulai.split('T')[0] : '',
                            tanggal_selesai: dataLama.tanggal_selesai ? dataLama.tanggal_selesai.split('T')[0] : ''
                        });
                    }
                } else {
                    const savedDraft = localStorage.getItem('draft_form_magang');
                    if (savedDraft) {
                        const parsedDraft = JSON.parse(savedDraft);
                        setFormData({
                            ...parsedDraft,
                            asal_instansi: userInstansi 
                        });
                    } else {
                        setFormData({
                            submission_type_id: '', unit_id: '', judul_atau_tujuan: '', 
                            nama_pembimbing: '', kontak_pembimbing: '',
                            asal_instansi: userInstansi, 
                            kategori_pendaftar: 'Individu', jumlah_anggota: 1, tanggal_mulai: '', tanggal_selesai: ''
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchInitialData();
    }, [revisiId, initialData, userId]); 

    const handleChange = (e) => {
        let updatedData = { ...formData, [e.target.name]: e.target.value };
        
        if (e.target.name === 'submission_type_id') {
            updatedData.unit_id = ''; 
        }

        // ✨ Auto-fill tanggal selesai = tanggal mulai + 1 bulan saat user pilih tanggal mulai ✨
        if (e.target.name === 'tanggal_mulai' && e.target.value) {
            updatedData.tanggal_selesai = addMonths(e.target.value, 1);
        }

        setFormData(updatedData);
        
        if (!revisiId) {
            localStorage.setItem('draft_form_magang', JSON.stringify(updatedData));
        }
    };

    const handleFileForReq = (reqName, file) => {
        setFilesByReq(prev => ({ ...prev, [reqName]: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.submission_type_id || !formData.unit_id) {
            return Swal.fire('Perhatian', 'Mohon pilih Keperluan dan Unit Tujuan', 'warning');
        }

        const isRegularRevisi = !!revisiId;
        if (!isRegularRevisi) {
            const missingRequired = requirements
                .filter(r => r.is_wajib)
                .filter(r => !filesByReq[r.nama_dokumen]);
            
            if (missingRequired.length > 0) {
                return Swal.fire(
                    'Berkas Belum Lengkap',
                    `Mohon upload dokumen wajib berikut:<br/><b>${missingRequired.map(r => r.nama_dokumen).join('<br/>')}</b>`,
                    'warning'
                );
            }
        }

        // ✨ VALIDASI TANGGAL ✨
        if (formData.tanggal_mulai && formData.tanggal_selesai) {
            const start = new Date(formData.tanggal_mulai);
            const end = new Date(formData.tanggal_selesai);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Tanggal mulai tidak boleh di masa lalu (kecuali revisi - data lama)
            if (!revisiId && start < today) {
                return Swal.fire('Tanggal Tidak Valid', 'Tanggal mulai tidak boleh di masa lalu.', 'warning');
            }

            // 2. Tanggal selesai harus SETELAH tanggal mulai (tidak boleh sama)
            if (end <= start) {
                return Swal.fire('Tanggal Tidak Valid', 'Tanggal selesai harus setelah tanggal mulai (minimal 1 hari).', 'warning');
            }

            // 3. Durasi MINIMAL 1 bulan
            const minEnd = new Date(start);
            minEnd.setMonth(minEnd.getMonth() + 1);
            if (end < minEnd) {
                return Swal.fire('Durasi Terlalu Singkat', 'Durasi magang minimal <b>1 bulan</b> dari tanggal mulai.', 'warning');
            }

            // 4. Durasi MAKSIMAL 3 bulan, pkl 6 bulan (sesuai jenis pengajuan)
            const maxBulan = getMaxMonths();
            const maxEnd = new Date(start);
            maxEnd.setMonth(maxEnd.getMonth() + maxBulan);
            if (end > maxEnd) {
                return Swal.fire('Durasi Terlalu Lama', `Durasi maksimal <b>${maxBulan} bulan</b> dari tanggal mulai.`, 'warning');
            }
        }

        const selectedUnit = units.find(u => u.id.toString() === formData.unit_id.toString());
        if (selectedUnit) {
            const specificQuota = selectedUnit.quotas?.find(q => q.submission_type_id.toString() === formData.submission_type_id.toString())?.quota_limit || 0;
            
            if (formData.jumlah_anggota > specificQuota) {
                return Swal.fire(
                    'Kuota Tidak Cukup!', 
                    `Maaf, sisa kuota untuk jenis kegiatan ini di ${selectedUnit.nama_unit} hanya tinggal ${specificQuota} orang.`, 
                    'error'
                );
            }
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('user_id', userId);
        
        Object.keys(filesByReq).forEach(reqName => {
            if (filesByReq[reqName]) {
                data.append(reqName, filesByReq[reqName]);
            }
        });

        try {
            if (revisiId) {
                const pesanLog = 'Mahasiswa telah melakukan perbaikan data/dokumen.';                
                data.append('catatan', pesanLog);
                await axios.put(`http://localhost:5000/api/submissions/${revisiId}/revisi`, data);
                
                Swal.fire('Berhasil!', 'Perbaikan data Anda telah terkirim.', 'success');
            } else {
                await axios.post('http://localhost:5000/api/submissions', data);
                Swal.fire('Berhasil!', 'Pengajuan Anda telah berhasil dikirim.', 'success');
                localStorage.removeItem('draft_form_magang');
            }
            onDocsUploaded();
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim data.', 'error');
        }
    };

    const getAvailableUnits = () => {
        if (!formData.submission_type_id) return [];

        return units.map(u => {
            const typeQuota = u.quotas?.find(q => q.submission_type_id.toString() === formData.submission_type_id.toString());
            const limit = typeQuota ? typeQuota.quota_limit : 0;
            
            return { ...u, availableQuota: limit };
        });
    };

    const availableUnits = getAvailableUnits();

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
                            <option value="">-- Pilih Keperluan Dahulu --</option>
                            {submissionTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.inputBox}>
                        <label style={styles.label}>Unit Tujuan</label>
                        <select 
                            name="unit_id" 
                            value={formData.unit_id} 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                            disabled={!formData.submission_type_id}
                        >
                            <option value="">
                                {!formData.submission_type_id ? 'Pilih Keperluan di atas terlebih dahulu' : '-- Pilih Unit --'}
                            </option>
                            
                            {availableUnits.map(u => (
                                <option key={u.id} value={u.id} disabled={u.availableQuota <= 0}>
                                    {u.nama_unit} {u.availableQuota <= 0 ? '(KUOTA PENUH)' : `(Sisa: ${u.availableQuota} Slot)`}
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
                        style={{...styles.input, backgroundColor: '#eee', color: '#666', cursor: 'not-allowed'}} 
                        readOnly 
                    />
                </div>

                <div style={styles.row}>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Nama Dosen / Guru Pembimbing</label>
                        <input 
                            name="nama_pembimbing" 
                            value={formData.nama_pembimbing}
                            placeholder="Contoh: Dr. Budi Santoso, S.T., M.Kom" 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                        />
                    </div>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Kontak Pembimbing (No. HP / Email)</label>
                        <input 
                            name="kontak_pembimbing" 
                            value={formData.kontak_pembimbing}
                            placeholder="Contoh: 08123456789 / budi@univ.ac.id" 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                        />
                    </div>
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
                        <input 
                            type="date" 
                            name="tanggal_mulai" 
                            value={formData.tanggal_mulai} 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                            min={!revisiId ? new Date().toISOString().split('T')[0] : undefined}
                        />
                    </div>
                    <div style={styles.inputBox}>
                        <label style={styles.label}>Rencana Tanggal Selesai</label>
                        <input 
                            type="date" 
                            name="tanggal_selesai" 
                            value={formData.tanggal_selesai} 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                            min={formData.tanggal_mulai ? addMonths(formData.tanggal_mulai, 1) : undefined}
                            max={formData.tanggal_mulai ? addMonths(formData.tanggal_mulai, getMaxMonths()) : undefined}
                        />
                    </div>
                </div>
                {formData.tanggal_mulai && (
                    <p style={{fontSize: '11px', color: '#6b7280', margin: '-10px 0 0', fontStyle: 'italic'}}>
                        *Default 1 bulan dari tanggal mulai. Bisa diperpanjang hingga <b>{getMaxMonths()} bulan</b>
                        {formData.submission_type_id?.toString() === '2' ? ' (khusus PKL)' : ''}.
                    </p>
                )}

                <div style={styles.inputBox}>
                    <label style={styles.label}>Upload Dokumen Pendukung</label>
                    
                    {requirements.length === 0 ? (
                        <div style={{...styles.reqBox, color: '#888', fontStyle: 'italic'}}>
                            Belum ada syarat dokumen yang ditetapkan oleh Admin.
                        </div>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {revisiId && (
                                <div style={{backgroundColor: '#fff4e5', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', color: '#d35400', borderLeft: '3px solid #ff6600', fontWeight: '500'}}>
                                    <b>Mode Revisi:</b> Upload hanya dokumen yang perlu diperbarui. Yang lama akan tetap tersimpan.
                                </div>
                            )}

                            {requirements.map(req => {
                                const uploaded = filesByReq[req.nama_dokumen];
                                const isWajib = !!req.is_wajib;
                                const isRegularRevisi = !!revisiId;
                                
                                return (
                                    <div key={req.id} style={styles.reqUploadBox}>
                                        <div style={{flex: 1, minWidth: 0}}>
                                            <div style={{fontSize: '13px', fontWeight: 'bold', color: '#333'}}>
                                                {req.nama_dokumen}
                                                {isWajib && <span style={{color: '#e74c3c', marginLeft: '6px', fontSize: '11px'}}>*wajib</span>}
                                                {!isWajib && <span style={{color: '#888', marginLeft: '6px', fontSize: '11px'}}>(opsional)</span>}
                                            </div>
                                            {uploaded && (
                                                <div style={{fontSize: '11px', color: '#27ae60', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                    <CheckCircle size={12} /> {uploaded.name}
                                                </div>
                                            )}
                                        </div>
                                        <label style={styles.btnPickFile}>
                                            <FileUp size={14} /> {uploaded ? 'Ganti' : 'Pilih File'}
                                            <input 
                                                type="file" 
                                                accept="application/pdf" 
                                                onChange={(e) => handleFileForReq(req.nama_dokumen, e.target.files[0])}
                                                style={{display: 'none'}}
                                                required={isWajib && !uploaded && !isRegularRevisi}
                                            />
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <p style={{fontSize: '11px', color: '#888', marginTop: '8px'}}>
                        {revisiId 
                            ? '*Hanya upload dokumen yang perlu diperbaiki. Format wajib: PDF.' 
                            : '*Setiap dokumen di-upload terpisah. Format wajib: PDF.'}
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
    btnSubmit: { color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' },
    reqBox: { backgroundColor: '#fff4e5', border: '1px solid #ffe0b2', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' },
    reqUploadBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', transition: '0.2s' },
    btnPickFile: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#003399', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }
};

export default FormPengajuan;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, Search, LogOut, Eye, 
    RefreshCcw, UserCog, Building2, Briefcase, 
    ChevronDown, ClipboardCheck, Archive, Bell, PlusCircle, Edit3, Trash2
} from 'lucide-react';

const MonitoringPengajuan = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✨ STATE UNTUK TAB & DROPDOWN ✨
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'monitoring');
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(true);
    
    // ✨ STATE BARU: Untuk Dropdown Dashboard Utama ✨
    const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

    const [submissions, setSubmissions] = useState([]);
    const [units, setUnits] = useState([]); 
    const [types, setTypes] = useState([]); 
    const [requirements, setRequirements] = useState([]); 
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnit, setFilterUnit] = useState('');
    const [filterType, setFilterType] = useState('');

    const user = JSON.parse(sessionStorage.getItem('user')) || {};
    
    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        const role = (parsedUser.role || '').toLowerCase();
        if (role !== 'super admin' && role !== 'admin') { 
            navigate('/'); 
            return; 
        }

        fetchData();
        fetchUnits();
        fetchTypes();
        fetchRequirements();
        window.scrollTo(0, 0);
    }, [navigate]); 

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions?role=superadmin');
            const activeProcess = (res.data || []).filter(s => 
                s.status !== 'Dalam Masa Kegiatan' && 
                s.status !== 'Selesai (Surat Dirilis)' && 
                s.status !== 'Ditolak' &&
                s.status !== 'Ditolak SDM' &&
                s.status !== 'Selesai Kegiatan'
            );

            const sortedData = activeProcess.sort((a, b) => 
                new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
            );
            setSubmissions(sortedData);
        } catch (err) { 
            console.error("Gagal mengambil data monitoring:", err); 
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/units');
            setUnits(res.data || []);
        } catch (err) { console.error("Gagal ambil unit:", err); }
    };

    const fetchTypes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submission-types');
            setTypes(res.data || []);
        } catch (err) { console.error("Gagal ambil jenis:", err); }
    };

    const fetchRequirements = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/requirements');
            setRequirements(res.data || []);
        } catch (err) { console.error("Gagal ambil syarat dokumen", err); }
    };

    const handleAddRequirement = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Syarat Dokumen',
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="Nama Dokumen (Contoh: KTP)">
                <select id="swal-input2" class="swal2-select">
                    <option value="1">Wajib</option>
                    <option value="0">Opsional (Tidak Wajib)</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#27ae60',
            confirmButtonText: 'Simpan',
            preConfirm: () => {
                const nama = document.getElementById('swal-input1').value;
                const isWajib = document.getElementById('swal-input2').value;
                if (!nama) Swal.showValidationMessage('Nama dokumen harus diisi');
                return { nama_dokumen: nama, is_wajib: isWajib === "1" };
            }
        });

        if (formValues) {
            try {
                await axios.post('http://localhost:5000/api/requirements', formValues);
                Swal.fire('Berhasil', 'Syarat baru ditambahkan', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal menambah syarat', 'error'); }
        }
    };

    const handleEditRequirement = async (reqItem) => {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Syarat Dokumen',
            html: `
                <input id="swal-input1" class="swal2-input" value="${reqItem.nama_dokumen}" placeholder="Nama Dokumen">
                <select id="swal-input2" class="swal2-select">
                    <option value="1" ${reqItem.is_wajib ? 'selected' : ''}>Wajib</option>
                    <option value="0" ${!reqItem.is_wajib ? 'selected' : ''}>Opsional (Tidak Wajib)</option>
                </select>
                <select id="swal-input3" class="swal2-select">
                    <option value="1" ${reqItem.is_active ? 'selected' : ''}>Aktif (Tampil di Form)</option>
                    <option value="0" ${!reqItem.is_active ? 'selected' : ''}>Nonaktif (Sembunyikan)</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#003399',
            confirmButtonText: 'Update',
            preConfirm: () => {
                return { 
                    nama_dokumen: document.getElementById('swal-input1').value, 
                    is_wajib: document.getElementById('swal-input2').value === "1",
                    is_active: document.getElementById('swal-input3').value === "1"
                };
            }
        });

        if (formValues) {
            try {
                await axios.put(`http://localhost:5000/api/requirements/${reqItem.id}`, formValues);
                Swal.fire('Berhasil', 'Syarat berhasil diupdate', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal mengupdate syarat', 'error'); }
        }
    };

    const handleDeleteRequirement = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Syarat?',
            text: 'Syarat ini akan dihapus permanen dari form pendaftaran.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/requirements/${id}`);
                Swal.fire('Terhapus!', '', 'success');
                fetchRequirements();
            } catch (err) { Swal.fire('Gagal', 'Gagal menghapus syarat', 'error'); }
        }
    };

    const viewDetail = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/submissions/${id}`);
            const s = res.data; 

            let berkasHtml = '';
            if (s.documents && s.documents.length > 0) {
                berkasHtml = s.documents.map((doc, index) => {
                    const justFileName = doc.file_path.split(/[\\/]/).pop();
                    const pathFile = `http://localhost:5000/api/preview/${justFileName}`;
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 15px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e0e0e0;">
                            <span style="font-size: 13px; color: #444; font-weight: 500;">
                                ${index + 1}. ${doc.nama_dokumen === 'files' ? 'Dokumen' : doc.nama_dokumen}
                            </span>
                            <a href="${pathFile}" target="_blank" rel="noopener noreferrer" 
                               style="background-color: #0055cc; color: white; padding: 5px 12px; border-radius: 5px; text-decoration: none; font-size: 11px; font-weight: bold; transition: 0.2s;">
                               📄 Lihat File
                            </a>
                        </div>
                    `;
                }).join('');
            } else {
                berkasHtml = '<p style="color: #999; font-style: italic; text-align: center;">Tidak ada berkas yang dilampirkan.</p>';
            }

            let htmlContent = `
                <div style="text-align:left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
                    <div style="background: #f0f4f8; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                        <h4 style="margin-top:0; color: #003399; border-bottom: 2px solid #003399; padding-bottom: 5px; font-size: 15px;">👤 Data Mahasiswa</h4>
                        <p style="margin: 5px 0;"><b>Nama:</b> ${s.nama_lengkap}</p>
                        <p style="margin: 5px 0;"><b>Instansi:</b> ${s.asal_instansi || '-'}</p>
                    </div>

                    <div style="background: #fff4e5; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                        <h4 style="margin-top:0; color: #d35400; border-bottom: 2px solid #d35400; padding-bottom: 5px; font-size: 15px;">📋 Detail Kegiatan</h4>
                        <p style="margin: 5px 0;"><b>Jenis:</b> ${s.nama_jenis}</p>
                        <p style="margin: 5px 0;"><b>Judul:</b> ${s.judul_atau_tujuan}</p>
                        <p style="margin: 5px 0;"><b>Pembimbing:</b> ${s.nama_pembimbing || '-'}</p>
                        <p style="margin: 5px 0;"><b>Kontak:</b> ${s.kontak_pembimbing || '-'}</p>
                    </div>
                    
                    <div style="background: #eef2f7; padding: 15px; border-radius: 12px;">
                        <h4 style="margin-top:0; color: #003399; font-size: 15px; margin-bottom: 15px;">📂 Berkas Lampiran</h4>
                        ${berkasHtml}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Detail Pengajuan Magang',
                html: htmlContent,
                width: '600px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#666'
            });
        } catch (err) {
            Swal.fire('Error', 'Gagal mengambil detail data.', 'error');
        }
    };

    const sendStatusUpdate = async (id, status, extraData = {}, pesanSukses) => {
        try {
            await axios.put(`http://localhost:5000/api/submissions/${id}/status`, {
                status: status,
                admin_id: user.id,
                ...extraData
            });
            Swal.fire('Berhasil!', pesanSukses, 'success');
            fetchData();
        } catch (err) {
            Swal.fire('Error', 'Gagal memperbarui status', 'error');
        }
    };

    const handleStatusDropdown = async (id, newStatus) => {
        if (newStatus === 'Pengajuan Telah Dikirim ke Pusat') {
            const { value: date } = await Swal.fire({
                title: 'Kirim ke Pusat',
                input: 'date',
                inputLabel: 'Masukkan tanggal berkas dikirim ke KAI Pusat',
                showCancelButton: true,
                confirmButtonText: 'Simpan & Lanjutkan',
                inputValidator: (value) => { if (!value) return 'Tanggal wajib diisi!' }
            });
            if (date) sendStatusUpdate(id, newStatus, { tgl_kirim_pusat: date, catatan: `Berkas dikirim ke Pusat pada ${date}` }, 'Status diubah ke Dikirim ke Pusat');
        } else if (newStatus === 'Surat Telah Masuk dari Pusat') {
            const { value: date } = await Swal.fire({
                title: 'Surat Masuk',
                input: 'date',
                inputLabel: 'Masukkan tanggal surat turun dari KAI Pusat',
                showCancelButton: true,
                confirmButtonText: 'Simpan & Lanjutkan',
                inputValidator: (value) => { if (!value) return 'Tanggal wajib diisi!' }
            });
            if (date) sendStatusUpdate(id, newStatus, { tgl_terima_pusat: date, catatan: `Surat diterima dari Pusat pada ${date}` }, 'Status diubah ke Surat Masuk dari Pusat');
        } else {
            const result = await Swal.fire({
                title: 'Konfirmasi',
                text: `Ubah status menjadi: ${newStatus}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#003399'
            });
            if (result.isConfirmed) {
                sendStatusUpdate(id, newStatus, { catatan: `Status diperbarui oleh SDM: ${newStatus}` }, 'Status berhasil diperbarui');
            }
        }
    };

    const handleRejection = async (id) => {
        const { value: alasan } = await Swal.fire({
            title: 'Tolak Pengajuan',
            input: 'textarea',
            inputPlaceholder: 'Tuliskan alasan penolakan...',
            showCancelButton: true,
            confirmButtonColor: '#d33'
        });
        if (alasan) {
            try {
                await axios.put(`http://localhost:5000/api/submissions/${id}/release`, { 
                    action: 'tolak', admin_id: user.id, catatan: alasan 
                });
                Swal.fire('Ditolak', 'Pengajuan telah ditolak oleh SDM Pusat.', 'error');
                fetchData();
            } catch (err) {
                Swal.fire('Error', 'Gagal menolak pengajuan.', 'error');
            }
        }
    };

    const handleUploadFinal = async (submissionId) => {
        const { value: file } = await Swal.fire({
            title: 'Upload Dokumen Final',
            text: 'Upload Surat Pengantar / Surat Balasan dari Pusat',
            input: 'file',
            inputAttributes: { 'accept': 'application/pdf,application/zip' },
            showCancelButton: true,
            confirmButtonText: 'Upload & Rilis',
            confirmButtonColor: '#28a745'
        });

        if (file) {
            const formData = new FormData();
            formData.append('final_docs', file); 
            formData.append('action', 'setuju');
            formData.append('admin_id', user.id);

            try {
                await axios.put(`http://localhost:5000/api/submissions/${submissionId}/release`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire('Berhasil!', 'Surat telah dirilis ke Mahasiswa.', 'success');
                fetchData(); 
            } catch (err) {
                Swal.fire('Gagal', 'Gagal mengunggah dokumen.', 'error');
            }
        }
    };

    const filteredData = submissions.filter(s => {
        const matchName = (s.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchUnit = filterUnit === '' || String(s.unit_id) === String(filterUnit);
        const matchType = filterType === '' || String(s.submission_type_id) === String(filterType);
        return matchName && matchUnit && matchType;
    });

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <h2 style={styles.brandTitle}>KAI <span style={{color: '#ff6600'}}>DAOP 6</span></h2>
                    <p style={styles.brandSubtitle}>SISTEM MANAJEMEN MAGANG</p>
                </div>

                <div style={styles.sidebarNav}>
                    {/* ✨ FIX: DROPDOWN UNTUK DASHBOARD UTAMA ✨ */}
                    <div style={styles.navGroup}>
                        <div style={styles.navItem} onClick={() => setIsDashboardMenuOpen(!isDashboardMenuOpen)}>
                            <div style={styles.navLinkContent}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard Utama</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isDashboardMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                        </div>
                        {isDashboardMenuOpen && (
                            <div style={styles.dropdownWrapper}>
                                <div style={styles.dropdownItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'dashboard' } })}>
                                    <div style={styles.dotIndicator} /> Ringkasan & Pantauan
                                </div>
                                <div style={styles.dropdownItem} onClick={() => navigate('/super-admin', { state: { activeTab: 'peserta_aktif' } })}>
                                    <div style={styles.dotIndicator} /> Monitoring Verifikasi
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.navGroup}>
                        <div 
                            style={activeTab === 'monitoring' || activeTab === 'requirements' ? styles.navItemActive : styles.navItem} 
                            onClick={() => setIsMonitoringMenuOpen(!isMonitoringMenuOpen)}
                        >
                            <div style={styles.navLinkContent}>
                                <RefreshCcw size={20} />
                                <span>Monitoring Pengajuan</span>
                            </div>
                            <ChevronDown size={16} style={{ transform: isMonitoringMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s'}} />
                        </div>
                        {isMonitoringMenuOpen && (
                            <div style={styles.dropdownWrapper}>
                                <div style={activeTab === 'monitoring' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => setActiveTab('monitoring')}>
                                    <div style={styles.dotIndicator} /> Monitoring Verifikasi
                                </div>
                                <div style={activeTab === 'requirements' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => setActiveTab('requirements')}>
                                    <div style={styles.dotIndicator} /> Syarat Dokumen
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/users')}>
                        <div style={styles.navLinkContent}><UserCog size={20} /> <span>Manajemen Pengguna</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/units')}>
                        <div style={styles.navLinkContent}><Building2 size={20} /> <span>Manajemen Unit</span></div>
                    </div>

                    <div style={styles.navItem} onClick={() => navigate('/admin/archive')}>
                        <div style={styles.navLinkContent}><Archive size={20} /> <span>Arsip Data Peserta</span></div>
                    </div>
                </div>

                <div style={styles.sidebarFooter} onClick={() => {sessionStorage.clear(); navigate('/');}}>
                    <div style={styles.logoutBtn}><LogOut size={20} /> <span>Keluar Akun</span></div>
                </div>
            </div>

            {/* AREA UTAMA */}
            <div style={styles.main}>
                <div style={styles.contentScroll}>
                    
                    {activeTab === 'monitoring' && (
                        <>
                            <div style={{marginBottom: '25px'}}>
                                <h2 style={{margin:0, color:'#003399'}}>Monitoring Verifikasi</h2>
                                <p style={{color:'#666', fontSize:'14px'}}>Fase tracking dokumen dan rilis surat pengantar KAI Pusat</p>
                            </div>

                            <div style={styles.filterBar}>
                                <div style={styles.searchBox}>
                                    <Search size={18} color="#003399" />
                                    <input placeholder="Cari nama..." style={styles.input} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <div style={styles.selectWrapper}>
                                    <Building2 size={16} color="#003399" />
                                    <select style={styles.select} value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
                                        <option value="">Semua Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.nama_unit}</option>)}
                                    </select>
                                </div>
                                <div style={styles.selectWrapper}>
                                    <Briefcase size={16} color="#003399" />
                                    <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                                        <option value="">Semua Jenis</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.nama_jenis}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={styles.card}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.thRow}>
                                            <th style={{...styles.th, width:'50px'}}>No</th>
                                            <th style={styles.th}>Data Mahasiswa</th>
                                            <th style={styles.th}>Unit & Jenis</th>
                                            <th style={{...styles.th, textAlign:'center'}}>Detail</th>
                                            <th style={styles.th}>Status SDM</th>
                                            <th style={{...styles.th, textAlign:'center'}}>Aksi Tracking</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length > 0 ? filteredData.map((s, index) => (
                                            <tr key={s.id} style={styles.row}>
                                                <td style={styles.td}>{index + 1}</td>
                                                <td style={styles.td}>
                                                    <div style={{fontWeight: 'bold'}}>{s.nama_lengkap}</div>
                                                    <div style={{fontSize: '11px', color: '#888'}}>{s.asal_instansi}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{fontSize: '13px'}}>{s.nama_unit}</div>
                                                    <div style={{fontSize: '11px', color: '#ff6600', fontWeight:'600'}}>{s.nama_jenis}</div>
                                                </td>
                                                <td style={{...styles.td, textAlign:'center'}}>
                                                    <button onClick={() => viewDetail(s.id)} style={styles.btnDetail}><Eye size={14}/></button>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.badge(s.status)}>{s.status}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                        <select 
                                                            style={styles.dropdown}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (!val) return;
                                                                if (val === 'tolak') handleRejection(s.id);
                                                                else if (val === 'upload_final') handleUploadFinal(s.id);
                                                                else handleStatusDropdown(s.id, val);
                                                                e.target.value = "";
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Pilih Tindakan</option>
                                                            {(s.status === 'Disetujui Unit, Menunggu Verifikasi SDM' || s.status === 'Menunggu Verifikasi SDM') && (
                                                                <><option value="Sedang Ditinjau SDM">Mulai Tinjau Berkas</option><option value="tolak">Tolak Pengajuan</option></>
                                                            )}
                                                            {s.status === 'Sedang Ditinjau SDM' && (
                                                                <><option value="Setujui, Tunggu Pengajuan Dikirim ke Pusat">Setujui & Siapkan Kirim</option><option value="tolak">Tolak Pengajuan</option></>
                                                            )}
                                                            {s.status === 'Setujui, Tunggu Pengajuan Dikirim ke Pusat' && (
                                                                <option value="Pengajuan Telah Dikirim ke Pusat">Tandai Dikirim ke Pusat (Input Tgl)</option>
                                                            )}
                                                            {s.status === 'Pengajuan Telah Dikirim ke Pusat' && (
                                                                <option value="Surat Telah Masuk dari Pusat">Surat Persetujuan dari Pusat (Input Tgl)</option>
                                                            )}
                                                            {s.status === 'Surat Telah Masuk dari Pusat' && (
                                                                <option value="upload_final">Upload & Rilis Surat Final</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{padding: '40px', textAlign: 'center', color: '#999'}}>Tidak ada data aktif untuk diproses.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'requirements' && (
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <div>
                                    <h2 style={{color: '#003399', margin: 0}}>Manajemen Syarat Dokumen 📋</h2>
                                    <p style={{color: '#666', marginTop: '5px', fontSize: '14px'}}>Atur dokumen yang wajib diunggah mahasiswa pada form pendaftaran.</p>
                                </div>
                                <button onClick={handleAddRequirement} style={styles.btnAdd}>
                                    <PlusCircle size={16}/> Tambah Syarat Baru
                                </button>
                            </div>
                            
                            <div style={styles.card}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.thRow}>
                                            <th style={{...styles.th, width:'50px'}}>No</th>
                                            <th style={styles.th}>Nama Dokumen</th>
                                            <th style={styles.th}>Status Wajib</th>
                                            <th style={styles.th}>Visibilitas (Aktif)</th>
                                            <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requirements.length > 0 ? requirements.map((req, i) => (
                                            <tr key={req.id} style={styles.row}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}><b>{req.nama_dokumen}</b></td>
                                                <td style={styles.td}>
                                                    <span style={req.is_wajib ? styles.badgeGreen : styles.badgeGray}>
                                                        {req.is_wajib ? 'Wajib' : 'Opsional'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={req.is_active ? styles.badgeBlue : styles.badgeRed}>
                                                        {req.is_active ? 'Tampil di Form' : 'Disembunyikan'}
                                                    </span>
                                                </td>
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                        <button onClick={() => handleEditRequirement(req)} style={styles.btnActionEdit}><Edit3 size={14}/></button>
                                                        <button onClick={() => handleDeleteRequirement(req.id)} style={styles.btnActionDelete}><Trash2 size={14}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#888'}}>Belum ada syarat dokumen yang ditambahkan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    sidebar: { width: '280px', backgroundColor: '#052278', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 },
    sidebarBrand: { padding: '30px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    brandTitle: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' },
    brandSubtitle: { margin: '5px 0 0 0', fontSize: '10px', opacity: 0.5, fontWeight: 'bold' },
    sidebarNav: { flex: 1, padding: '20px 15px', overflowY: 'auto' },
    navGroup: { marginBottom: '5px' },
    navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', transition: '0.3s', color: 'rgba(255,255,255,0.7)' },
    navItemActive: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', marginBottom: '5px', backgroundColor: '#ff6600', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' },
    navLinkContent: { display: 'flex', alignItems: 'center', gap: '15px' },
    dropdownWrapper: { paddingLeft: '20px', marginBottom: '10px', marginTop: '5px' },
    dropdownItem: { padding: '10px 15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' },
    dropdownItemActive: { padding: '10px 15px', fontSize: '13px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' },
    dotIndicator: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' },
    sidebarFooter: { padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', color: '#ff6b6b', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    topHeader: { height: '80px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 5 },
   
    contentScroll: { padding: '40px', flex: 1 },
    filterBar: { display: 'flex', gap: '15px', marginBottom: '30px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', border: '1px solid #e0e0e0' },
    selectWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '30px', border: '1px solid #e0e0e0' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#f8f9fa' },
    th: { padding: '18px 15px', textAlign: 'left', color: '#888', fontSize: '12px', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' },
    dropdown: { padding: '8px 10px', borderRadius: '8px', border: '1px solid #cce0ff', fontSize: '12px', backgroundColor: '#f0f4ff', color: '#003399', fontWeight: 'bold' },
    badge: (status) => {
        let bg = '#eef2f7'; let color = '#34495e';
        if (status === 'Sedang Ditinjau SDM') { bg = '#fff4e5'; color = '#d35400'; }
        if (status === 'Setujui, Tunggu Pengajuan Dikirim ke Pusat') { bg = '#e0f0ff'; color = '#0055cc'; }
        if (status === 'Pengajuan Telah Dikirim ke Pusat') { bg = '#f5eeff'; color = '#8e44ad'; }
        if (status === 'Surat Telah Masuk dari Pusat') { bg = '#e1f7e7'; color = '#27ae60'; }
        return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', backgroundColor: bg, color: color, display: 'inline-block' };
    },
    btnDetail: { backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #cce0ff', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    row: { transition: '0.2s' },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#ff6600', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
    badgeGreen: { backgroundColor: '#e1f7e7', color: '#27ae60', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeGray: { backgroundColor: '#f0f0f0', color: '#888', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeBlue: { backgroundColor: '#e0f0ff', color: '#0055cc', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    badgeRed: { backgroundColor: '#ffe6e6', color: '#d33', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
    btnActionEdit: { backgroundColor: '#f0f4ff', color: '#003399', border: '1px solid #cce0ff', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
    btnActionDelete: { backgroundColor: '#fff0f0', color: '#e74c3c', border: '1px solid #ffcaca', padding: '8px', borderRadius: '8px', cursor: 'pointer' }
};

export default MonitoringPengajuan;
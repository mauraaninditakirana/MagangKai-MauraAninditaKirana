import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatTanggalIndo } from '../utils/formatTanggal';
import { 
    LayoutDashboard, Search, LogOut, Eye, 
    RefreshCcw, UserCog, Building2, Briefcase, 
    ChevronDown, Archive, PlusCircle, Edit3, Trash2
} from 'lucide-react';

const MonitoringPengajuan = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'monitoring');
    const [isMonitoringMenuOpen, setIsMonitoringMenuOpen] = useState(true);
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
            console.log('🔍 AFTER FILTER:', activeProcess);

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
        const inputStyle = 'width:100%; padding:12px 14px; border:1px solid #e0e7ff; border-radius:10px; font-size:14px; font-family:inherit; outline:none; background:#f8fafd; box-sizing:border-box; color:#374151;';
        const labelStyle = 'display:block; font-size:12px; font-weight:700; color:#003399; margin-bottom:6px; letter-spacing:0.3px;';

        const { value: formValues } = await Swal.fire({
            title: 'Tambah Syarat Dokumen',
            html: `
                <div style="text-align:left; padding:8px 0;">
                    <label style="${labelStyle}">Nama Dokumen</label>
                    <input id="swal-input1" placeholder="Contoh: KTP, KTM, Surat Pengantar" style="${inputStyle} margin-bottom:16px;">

                    <label style="${labelStyle}">Status Dokumen</label>
                    <select id="swal-input2" style="${inputStyle} cursor:pointer;">
                        <option value="1">Wajib</option>
                        <option value="0">Opsional</option>
                    </select>
                </div>
            `,
            width: '460px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#003399',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
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
        const inputStyle = 'width:100%; padding:12px 14px; border:1px solid #e0e7ff; border-radius:10px; font-size:14px; font-family:inherit; outline:none; background:#f8fafd; box-sizing:border-box; color:#374151;';
        const labelStyle = 'display:block; font-size:12px; font-weight:700; color:#003399; margin-bottom:6px; letter-spacing:0.3px;';

        const { value: formValues } = await Swal.fire({
            title: 'Edit Syarat Dokumen',
            html: `
                <div style="text-align:left; padding:8px 0;">
                    <label style="${labelStyle}">Nama Dokumen</label>
                    <input id="swal-input1" value="${reqItem.nama_dokumen}" placeholder="Nama Dokumen" style="${inputStyle} margin-bottom:16px;">

                    <label style="${labelStyle}">Status Wajib</label>
                    <select id="swal-input2" style="${inputStyle} cursor:pointer; margin-bottom:16px;">
                        <option value="1" ${reqItem.is_wajib ? 'selected' : ''}>Wajib</option>
                        <option value="0" ${!reqItem.is_wajib ? 'selected' : ''}>Opsional</option>
                    </select>

                    <label style="${labelStyle}">Visibilitas di Form</label>
                    <select id="swal-input3" style="${inputStyle} cursor:pointer;">
                        <option value="1" ${reqItem.is_active ? 'selected' : ''}>Tampil di Form</option>
                        <option value="0" ${!reqItem.is_active ? 'selected' : ''}>Sembunyikan</option>
                    </select>
                </div>
            `,
            width: '460px',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#003399',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Update',
            cancelButtonText: 'Batal',
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

            // Helper inline styles (selaras ArchiveManagement / AdminDashboard)
            const sectionCard = 'background:#f8fafd; padding:18px 22px; border-radius:12px; margin-bottom:14px; border:1px solid #f0f4f8;';
            const sectionLabel = 'font-size:11px; color:#003399; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; display:block;';
            const fieldRow = 'display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #e5e7eb; font-size:13px;';
            const fieldLabel = 'color:#6b7280; font-weight:600;';
            const fieldValue = 'color:#111827; font-weight:600; text-align:right; max-width:60%;';

            let berkasHtml = '';
            if (s.documents && s.documents.length > 0) {
                berkasHtml = s.documents.map((doc, index) => {
                    const justFileName = doc.file_path.split(/[\\/]/).pop();
                    const pathFile = `http://localhost:5000/api/preview/${justFileName}`;
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px 14px; border-radius:8px; margin-bottom:6px; border:1px solid #e0e7ff;">
                            <span style="font-size:13px; color:#374151; font-weight:600;">
                                ${index + 1}. ${doc.nama_dokumen === 'files' ? 'Dokumen Pengajuan' : doc.nama_dokumen}
                            </span>
                            <a href="${pathFile}" target="_blank" rel="noopener noreferrer" 
                               style="background:#003399; color:#fff; padding:6px 14px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:bold;">
                                Lihat File
                            </a>
                        </div>
                    `;
                }).join('');
            } else {
                berkasHtml = '<p style="color:#9ca3af; margin:0; font-style:italic; font-size:13px; text-align:center; padding:20px 0;">Tidak ada berkas yang dilampirkan.</p>';
            }

            const htmlContent = `
                <div style="text-align:left; font-family:'Segoe UI', Tahoma, sans-serif;">
                    
                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Data Mahasiswa</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Nama Lengkap</span>
                            <span style="${fieldValue}">${s.nama_lengkap}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Asal Instansi</span>
                            <span style="${fieldValue}">${s.asal_instansi || '-'}</span>
                        </div>
                    </div>

                    <div style="${sectionCard}">
                        <span style="${sectionLabel}">━━ Detail Kegiatan</span>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Jenis Kegiatan</span>
                            <span style="${fieldValue}">${s.nama_jenis}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Judul Project</span>
                            <span style="${fieldValue}">${s.judul_atau_tujuan || '-'}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Pembimbing</span>
                            <span style="${fieldValue}">${s.nama_pembimbing || '-'}</span>
                        </div>
                        <div style="${fieldRow}">
                            <span style="${fieldLabel}">Kontak Pembimbing</span>
                            <span style="${fieldValue}">${s.kontak_pembimbing || '-'}</span>
                        </div>
                        <div style="${fieldRow} border-bottom:none;">
                            <span style="${fieldLabel}">Lokasi Penempatan</span>
                            <span style="${fieldValue} ${s.lokasi_penempatan ? 'color:#27ae60;' : 'color:#9ca3af; font-style:italic;'}">${s.lokasi_penempatan || 'Belum ditentukan'}</span>
                        </div>
                    </div>

                    <div style="${sectionCard} margin-bottom:0;">
                        <span style="${sectionLabel}">━━ Berkas Lampiran</span>
                        ${berkasHtml}
                    </div>
                </div>
            `;

            Swal.fire({
                title: 'Detail Pengajuan Magang',
                html: htmlContent,
                width: '640px',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#003399',
                didOpen: () => {
                    const titleEl = Swal.getTitle();
                    if (titleEl) {
                        titleEl.style.color = '#111827';
                        titleEl.style.fontWeight = '800';
                        titleEl.style.fontSize = '22px';
                        titleEl.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
                        titleEl.style.letterSpacing = '-0.2px';
                    }
                }
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
                title: 'Kirim Berkas ke Pusat',
                input: 'date',
                inputLabel: 'Tanggal berkas dikirim ke KAI Pusat',
                showCancelButton: true,
                confirmButtonText: 'Simpan & Lanjutkan',
                confirmButtonColor: '#003399',
                cancelButtonText: 'Batal',
                inputValidator: (value) => { if (!value) return 'Tanggal wajib diisi!' }
            });
            if (date) sendStatusUpdate(id, newStatus, { tgl_kirim_pusat: date, catatan: `Berkas dikirim ke Pusat pada ${formatTanggalIndo(date)}` }, 'Status diubah ke Dikirim ke Pusat');
        } else if (newStatus === 'Surat Telah Masuk dari Pusat') {
            const { value: date } = await Swal.fire({
                title: 'Surat Masuk',
                input: 'date',
                inputLabel: 'Masukkan tanggal surat turun dari KAI Pusat',
                showCancelButton: true,
                confirmButtonText: 'Simpan & Lanjutkan',
                inputValidator: (value) => { if (!value) return 'Tanggal wajib diisi!' }
            });
            if (date) sendStatusUpdate(id, newStatus, { tgl_terima_pusat: date, catatan: `Surat diterima dari Pusat pada ${formatTanggalIndo(date)}` }, 'Status diubah ke Surat Masuk dari Pusat');
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
                                    <div style={styles.dotIndicator} /> Monitoring Peserta
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
                            <div style={{ marginBottom: '32px' }}>
                                <div style={styles.accentBar} />
                                <h2 style={styles.sectionTitle}>Monitoring Verifikasi</h2>
                                <p style={styles.sectionDesc}>
                                    Fase tracking dokumen dan rilis surat pengantar KAI Pusat.
                                </p>
                            </div>
                            <div style={styles.filterBar}>
                                <div style={styles.searchBox}>
                                    <Search size={18} color="#003399" />
                                    <input placeholder="Cari nama peserta..." style={styles.input} onChange={e => setSearchTerm(e.target.value)} />
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

                            <div style={styles.tableCard}>
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
                                            <tr key={s.id} style={styles.tableRow}>
                                                <td style={styles.td}>{index + 1}</td>
                                                <td style={styles.td}>
                                                    <div style={{fontWeight: 'bold', color: '#111827'}}>{s.nama_lengkap}</div>
                                                    <div style={{fontSize: '11px', color: '#888', marginTop: '2px'}}>{s.asal_instansi}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{fontSize: '13px', fontWeight: 'bold', color: '#003399'}}>{s.nama_unit}</div>
                                                    <div style={{fontSize: '11px', color: '#ff6600', fontWeight:'600', marginTop: '2px'}}>{s.nama_jenis}</div>
                                                </td>
                                                <td style={{...styles.td, textAlign:'center'}}>
                                                <button onClick={() => viewDetail(s.id)} style={styles.btnDetail} title="Lihat detail"><Eye size={18} strokeWidth={2}/></button>
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
                                                                <><option value="Disetujui SDM, Tunggu Pengajuan Dikirim ke Pusat">Setujui & Siapkan Kirim</option><option value="tolak">Tolak Pengajuan</option></>
                                                            )}
                                                            {s.status === 'Disetujui SDM, Tunggu Pengajuan Dikirim ke Pusat' && (
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
                            <div style={styles.sectionHeaderRow}>
                                <div>
                                    <div style={styles.accentBar} />
                                    <h2 style={styles.sectionTitle}>Manajemen Syarat Dokumen</h2>
                                    <p style={styles.sectionDesc}>
                                        Atur dokumen yang wajib diunggah mahasiswa pada form pendaftaran.
                                    </p>
                                </div>
                                <button onClick={handleAddRequirement} style={styles.btnAdd}>
                                    <PlusCircle size={16}/> Tambah Syarat Baru
                                </button>
                            </div>
                            
                            <div style={styles.tableCard}>
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
                                            <tr key={req.id} style={styles.tableRow}>
                                                <td style={styles.td}>{i + 1}</td>
                                                <td style={styles.td}><b style={{color: '#111827'}}>{req.nama_dokumen}</b></td>
                                                <td style={styles.td}>
                                                    <span style={{ 
                                                        color: req.is_wajib ? '#dc2626' : '#9ca3af', 
                                                        fontWeight: 'bold', 
                                                        fontSize: '13px' 
                                                    }}>
                                                        {req.is_wajib ? 'Wajib' : 'Opsional'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{ 
                                                        color: req.is_active ? '#003399' : '#dc2626', 
                                                        fontWeight: 'bold', 
                                                        fontSize: '13px' 
                                                    }}>
                                                        {req.is_active ? 'Tampil di Form' : 'Disembunyikan'}
                                                    </span>
                                                </td>
                                                <td style={{...styles.td, textAlign: 'center'}}>
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                        <button onClick={() => handleEditRequirement(req)} style={styles.btnActionEdit} title="Edit"><Edit3 size={18} strokeWidth={2}/></button>
                                                        <button onClick={() => handleDeleteRequirement(req.id)} style={styles.btnActionDelete} title="Hapus"><Trash2 size={18} strokeWidth={2}/></button>    
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#888'}}>Belum ada syarat dokumen yang ditambahkan.</td></tr>
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
    
    // SIDEBAR
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
    
    // MAIN
    main: { flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' },
    contentScroll: { padding: '40px', flex: 1 },

    // SECTION HEADER (FAQ-style ala SuperAdminDashboard)
    accentBar: { width: '40px', height: '3px', background: '#ff6600', borderRadius: '2px', marginBottom: '12px' },
    sectionTitle: { color: '#111827', margin: 0, fontSize: '24px', fontWeight: '800' },
    sectionDesc: { color: '#6b7280', fontSize: '13px', margin: '6px 0 0' },
    sectionHeaderRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' },

    // FILTER BAR (selaras SuperAdmin)
    filterBar: { display: 'flex', gap: '15px', marginBottom: '24px' },
    searchBox: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    selectWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e0e7ff' },
    input: { border: 'none', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#333' },
    select: { border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '14px', color: '#333', cursor: 'pointer' },

    // TABLE (selaras SuperAdmin)
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '8px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: 'transparent' },
    th: { padding: '16px 12px', textAlign: 'left', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f3f4f6' },
    td: { padding: '16px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
    tableRow: {},

    // ACTION DROPDOWN
    dropdown: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cce0ff', fontSize: '12px', backgroundColor: '#f0f4ff', color: '#003399', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },

    // STATUS BADGES
    badge: (status) => {
        let color = '#34495e';
        if (status === 'Sedang Ditinjau SDM') color = '#d35400';
        if (status === 'Disetujui SDM, Tunggu Pengajuan Dikirim ke Pusat') color = '#003399';
        if (status === 'Pengajuan Telah Dikirim ke Pusat') color = '#8e44ad';
        if (status === 'Surat Telah Masuk dari Pusat') color = '#27ae60';
        return { fontSize: '13px', fontWeight: 'bold', color: color, display: 'inline-block' };
    },

    // BUTTONS
        btnDetail: { background: 'none', color: '#003399', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnAdd: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#ff6600', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(255,102,0,0.25)' },
    btnActionEdit: { background: 'none', color: '#003399', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnActionDelete: { background: 'none', color: '#e74c3c', border: 'none', padding: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
};

export default MonitoringPengajuan;
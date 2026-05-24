import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, X } from 'lucide-react';
import { formatTanggalIndo } from '../utils/formatTanggal';

const API = 'http://localhost:5000/api';

// Helper: ubah timestamp jadi "5 menit lalu"
const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const then = new Date(dateStr);
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} hari lalu`;
    return formatTanggalIndo(dateStr);
};

const NotificationBell = ({ userId, iconColor = '#ff6600', iconSize = 22 }) => {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    const fetchNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API}/notifications`, { params: { user_id: userId } });
            setNotifs(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error('Gagal ambil notifikasi:', err);
        } finally {
            setLoading(false);
        }
    };

    // Polling tiap 30 detik
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Klik di luar untuk tutup dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkOne = async (id, isRead) => {
        if (isRead) return;
        try {
            await axios.put(`${API}/notifications/${id}/read`);
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Gagal tandai notif:', err);
        }
    };

    const handleMarkAll = async () => {
        try {
            await axios.put(`${API}/notifications/read-all`, null, { params: { user_id: userId } });
            setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Gagal tandai semua:', err);
        }
    };

    const handleDelete = async (e, id, isRead) => {
        e.stopPropagation();
        try {
            await axios.delete(`${API}/notifications/${id}`);
            setNotifs(prev => prev.filter(n => n.id !== id));
            if (!isRead) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Gagal hapus notif:', err);
        }
    };

    return (
        <div ref={wrapperRef} style={styles.wrapper}>
            {/* Tombol Lonceng */}
            <div style={styles.bellButton} onClick={() => setOpen(!open)} title="Notifikasi">
                <Bell size={iconSize} color={iconColor} />
                {unreadCount > 0 && (
                    <span style={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            {/* Panel Dropdown */}
            {open && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>
                        <div>
                            <h4 style={styles.title}>Notifikasi</h4>
                            <small style={styles.subtitle}>
                                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                            </small>
                        </div>
                        {unreadCount > 0 && (
                            <button style={styles.markAllBtn} onClick={handleMarkAll}>
                                <CheckCheck size={14} /> Tandai Semua
                            </button>
                        )}
                    </div>

                    <div style={styles.list}>
                        {loading && notifs.length === 0 ? (
                            <div style={styles.empty}>Memuat...</div>
                        ) : notifs.length === 0 ? (
                            <div style={styles.empty}>
                                <Bell size={32} color="#ddd" />
                                <p style={styles.emptyText}>Belum ada notifikasi</p>
                            </div>
                        ) : (
                            notifs.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        ...styles.item,
                                        backgroundColor: n.is_read ? '#fff' : '#fff8f0',
                                    }}
                                    onClick={() => handleMarkOne(n.id, n.is_read)}
                                >
                                    {!n.is_read && <span style={styles.unreadDot} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={styles.message}>{n.message}</p>
                                        <small style={styles.time}>{formatTimeAgo(n.created_at)}</small>
                                    </div>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={(e) => handleDelete(e, n.id, n.is_read)}
                                        title="Hapus notifikasi"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    wrapper: { position: 'relative', display: 'inline-block' },
    bellButton: {
        position: 'relative',
        cursor: 'pointer',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: '0.2s',
    },
    badge: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid #fff',
        boxSizing: 'border-box',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        width: '360px',
        maxHeight: '480px',
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        border: '1px solid #eee',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
    },
    header: {
        padding: '15px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafbfd',
    },
    title: { margin: 0, fontSize: '15px', color: '#003399', fontWeight: 'bold' },
    subtitle: { color: '#888', fontSize: '11px' },
    markAllBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: '#fff4e5',
        color: '#ff6600',
        border: 'none',
        padding: '6px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    list: {
        flex: 1,
        overflowY: 'auto',
        maxHeight: '400px',
    },
    item: {
        padding: '12px 20px',
        borderBottom: '1px solid #f5f5f5',
        cursor: 'pointer',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        transition: '0.15s',
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#ff6600',
        borderRadius: '50%',
        marginTop: '6px',
        flexShrink: 0,
    },
    message: {
        margin: 0,
        fontSize: '13px',
        color: '#333',
        lineHeight: '1.5',
        wordBreak: 'break-word',
    },
    time: {
        color: '#999',
        fontSize: '11px',
        marginTop: '4px',
        display: 'block',
    },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        color: '#bbb',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    empty: {
        padding: '40px 20px',
        textAlign: 'center',
        color: '#888',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    emptyText: {
        margin: '10px 0 0 0',
        color: '#999',
        fontSize: '13px',
    },
};

export default NotificationBell;
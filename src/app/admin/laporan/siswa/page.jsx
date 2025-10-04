"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link'; // ✅ IMPORT Link DITAMBAHKAN

export default function LaporanSiswaPage() {
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLaporan();
    }, []);

    const fetchLaporan = async () => {
        setLoading(true);
        setMessage('');
        try {
            // API untuk menggabungkan data siswa, jurusan, dan ranking SAW
            const res = await fetch('/api/admin/laporan'); 
            const data = await res.json();
            
            if (res.ok) {
                setLaporan(data);
            } else {
                setMessage(data.error || 'Gagal memuat laporan siswa.');
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div style={styles.container}>Memuat laporan...</div>;
    if (message) return <div style={{...styles.container, color: 'red'}}>{message}</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Laporan Rekomendasi Siswa</h1>
            <p style={{marginBottom: '20px'}}>Total Siswa dengan Hasil: <strong>{laporan.length}</strong></p>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>NISN</th>
                        <th style={styles.th}>Nama Siswa</th>
                        <th style={styles.th}>Kelas</th>
                        <th style={styles.th}>Rekomendasi Utama (Rank 1)</th>
                        <th style={styles.th}>Skor SAW</th>
                        <th style={styles.th}>Lihat Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {laporan.map(item => (
                        <tr key={item.siswa_id}>
                            <td style={styles.td}>{item.nisn}</td>
                            <td style={styles.td}>{item.nama}</td>
                            <td style={styles.td}>{item.kelas}</td>
                            <td style={{...styles.td, fontWeight: 'bold', color: '#27ae60'}}>{item.jurusan_rekomendasi || 'Belum Dihitung'}</td>
                            <td style={styles.td}>{item.skor_saw ? parseFloat(item.skor_saw).toFixed(6) : '-'}</td>
                            <td style={styles.td}>
                                <Link href={`/siswa/rekomendasi?siswa_id=${item.siswa_id}`} style={styles.detailButton}>Detail</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '50px auto', padding: '20px' },
    header: { color: '#e67e22', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    tdActions: { border: '1px solid #ddd', padding: '12px', display: 'flex', gap: '5px' },
    detailButton: { padding: '5px 10px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '3px' },
};

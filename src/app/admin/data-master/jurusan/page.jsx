"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaJurusanPage() {
    const [jurusan, setJurusan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ kode: '', nama: '', deskripsi: '' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchJurusan();
    }, []);

    const fetchJurusan = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jurusan');
            const data = await res.json();
            
            if (res.ok) {
                setJurusan(data);
            } else {
                setMessage(data.error || 'Gagal memuat data jurusan.');
            }
        } catch (err) {
            setMessage('Gagal memuat data jurusan.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const method = isEdit ? 'PATCH' : 'POST';
        const url = isEdit ? `/api/jurusan/${currentId}` : '/api/jurusan';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Jurusan ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ kode: '', nama: '', deskripsi: '' });
                setIsEdit(false);
                setCurrentId(null);
                fetchJurusan(); 
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({ kode: item.kode, nama: item.nama, deskripsi: item.deskripsi || '' });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jurusan ini? Ini akan menghapus semua relasi dan hasil perhitungan terkait!')) return;

        try {
            const res = await fetch(`/api/jurusan/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Jurusan berhasil dihapus.');
                fetchJurusan();
            } else {
                const data = await res.json();
                setMessage(`Gagal menghapus: ${data.message || 'Terjadi kesalahan.'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    if (loading) return <div style={styles.container}>Memuat data master...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>{isEdit ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}</h1>
            
            <form onSubmit={handleFormSubmit} style={styles.form}>
                <input name="kode" type="text" placeholder="Kode (e.g., MPLB)" onChange={handleInputChange} value={formData.kode} required style={styles.input} />
                <input name="nama" type="text" placeholder="Nama Jurusan Lengkap" onChange={handleInputChange} value={formData.nama} required style={styles.input} />
                <textarea name="deskripsi" placeholder="Deskripsi Singkat (Opsional)" onChange={handleInputChange} value={formData.deskripsi} style={styles.input} rows="3" />
                
                <button type="submit" style={styles.button}>
                    {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH JURUSAN'}
                </button>
                {isEdit && <button type="button" onClick={() => {setIsEdit(false); setFormData({ kode: '', nama: '', deskripsi: '' }); setCurrentId(null);}} style={{...styles.button, backgroundColor: '#6c757d'}}>Batal Edit</button>}
            </form>
            
            {message && <p style={{ marginTop: '15px', color: message.includes('berhasil') ? 'green' : 'red' }}>{message}</p>}

            <h2 style={styles.subHeader}>Daftar Jurusan ({jurusan.length})</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Kode</th>
                        <th style={styles.th}>Nama Jurusan</th>
                        <th style={styles.th}>Deskripsi</th>
                        <th style={styles.th}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {jurusan.map(item => (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.id}</td>
                            <td style={styles.td}>{item.kode}</td>
                            <td style={styles.tdLeft}>{item.nama}</td>
                            <td style={styles.tdLeft}>{item.deskripsi || '-'}</td>
                            <td style={styles.tdActions}>
                                <button onClick={() => handleEdit(item)} style={{...styles.actionButton, backgroundColor: '#ffc107'}}>Edit</button>
                                <button onClick={() => handleDelete(item.id)} style={{...styles.actionButton, backgroundColor: '#dc3545'}}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Reuse styles from Kriteria page
const styles = {
    container: { maxWidth: '900px', margin: '50px auto', padding: '20px' },
    header: { color: '#007bff', marginBottom: '25px' },
    subHeader: { marginTop: '40px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', border: '1px solid #ccc', borderRadius: '6px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'center' },
    tdLeft: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' }, // Untuk nama/deskripsi panjang
    tdActions: { border: '1px solid #ddd', padding: '12px', display: 'flex', gap: '5px' },
    actionButton: { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
    info: { marginTop: '10px', fontSize: '0.9em', color: '#888' }
};

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaKriteriaPage() {
    const [kriteria, setKriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nama: '', tipe: 'benefit' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchKriteria();
    }, []);

    const fetchKriteria = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kriteria');
            const data = await res.json();
            
            if (res.ok) {
                 // Pastikan bobot diubah menjadi float untuk tampilan
                setKriteria(data.map(k => ({
                    ...k,
                    bobot_ahp: parseFloat(k.bobot_ahp)
                })));
            } else {
                setMessage(data.error || 'Gagal memuat data kriteria.');
            }
        } catch (err) {
            setMessage('Gagal memuat data kriteria.');
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
        const url = isEdit ? `/api/kriteria/${currentId}` : '/api/kriteria';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Kriteria ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ nama: '', tipe: 'benefit' });
                setIsEdit(false);
                setCurrentId(null);
                fetchKriteria(); 
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({ nama: item.nama, tipe: item.tipe });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kriteria ini? Ini akan menghapus semua perbandingan dan jawaban yang terkait!')) return;

        try {
            const res = await fetch(`/api/kriteria/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Kriteria berhasil dihapus.');
                fetchKriteria();
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
            <h1 style={styles.header}>{isEdit ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}</h1>
            
            <form onSubmit={handleFormSubmit} style={styles.form}>
                <input name="nama" type="text" placeholder="Nama Kriteria (e.g., Minat)" onChange={handleInputChange} value={formData.nama} required style={styles.input} />
                
                <select name="tipe" onChange={handleInputChange} value={formData.tipe} required style={styles.input}>
                    <option value="benefit">Benefit (Semakin besar semakin baik)</option>
                    <option value="cost">Cost (Semakin kecil semakin baik)</option>
                </select>
                
                <button type="submit" style={styles.button}>
                    {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH KRITERIA'}
                </button>
                {isEdit && <button type="button" onClick={() => {setIsEdit(false); setFormData({ nama: '', tipe: 'benefit' }); setCurrentId(null);}} style={{...styles.button, backgroundColor: '#6c757d'}}>Batal Edit</button>}
            </form>
            
            {message && <p style={{ marginTop: '15px', color: message.includes('berhasil') ? 'green' : 'red' }}>{message}</p>}

            <h2 style={styles.subHeader}>Daftar Kriteria ({kriteria.length})</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Nama Kriteria</th>
                        <th style={styles.th}>Tipe</th>
                        <th style={styles.th}>Bobot AHP</th>
                        <th style={styles.th}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {kriteria.map(item => (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.id}</td>
                            <td style={styles.td}>{item.nama}</td>
                            <td style={styles.td}>{item.tipe.toUpperCase()}</td>
                            <td style={styles.td}>{item.bobot_ahp ? item.bobot_ahp.toFixed(4) : '0.0000'}</td>
                            <td style={styles.tdActions}>
                                <button onClick={() => handleEdit(item)} style={{...styles.actionButton, backgroundColor: '#ffc107'}}>Edit</button>
                                <button onClick={() => handleDelete(item.id)} style={{...styles.actionButton, backgroundColor: '#dc3545'}}>Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p style={styles.info}>*Bobot AHP dihitung di halaman "Perhitungan AHP".</p>
        </div>
    );
}

// Reuse styles from Jurusan page
const styles = {
    container: { maxWidth: '900px', margin: '50px auto', padding: '20px' },
    header: { color: '#007bff', marginBottom: '25px' },
    subHeader: { marginTop: '40px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', border: '1px solid #ccc', borderRadius: '6px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    tdActions: { border: '1px solid #ddd', padding: '12px', display: 'flex', gap: '5px' },
    actionButton: { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
    info: { marginTop: '10px', fontSize: '0.9em', color: '#888' }
};

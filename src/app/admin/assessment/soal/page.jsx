"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaSoalPage() {
    const [soal, setSoal] = useState([]);
    const [kriteria, setKriteria] = useState([]);
    const [jurusan, setJurusan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ pertanyaan: '', kriteria_id: '', jurusan_id: '', tipe: 'skala' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setMessage('');
        try {
            // Ambil semua data yang diperlukan
            const [resSoal, resKriteria, resJurusan] = await Promise.all([
                fetch('/api/soal'),
                fetch('/api/kriteria'),
                fetch('/api/jurusan')
            ]);

            const [dataSoal, dataKriteria, dataJurusan] = await Promise.all([
                resSoal.json(), resKriteria.json(), resJurusan.json()
            ]);

            setSoal(dataSoal);
            setKriteria(dataKriteria);
            setJurusan(dataJurusan);
            
            // Set default ID untuk form jika data master ada
            if (dataKriteria.length > 0) {
                setFormData(prev => ({ ...prev, kriteria_id: dataKriteria[0].id }));
            }
            if (dataJurusan.length > 0) {
                setFormData(prev => ({ ...prev, jurusan_id: dataJurusan[0].id }));
            }
            
        } catch (err) {
            setMessage('Gagal memuat data master soal.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: (name.includes('_id') ? Number(value) : value) });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const method = isEdit ? 'PATCH' : 'POST';
        const url = isEdit ? `/api/soal/${currentId}` : '/api/soal';

        // Validasi Kriteria/Jurusan ID harus dipilih jika ada data master
        if (!formData.kriteria_id && kriteria.length > 0) {
            setMessage('Kriteria harus dipilih.');
            return;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Soal ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ pertanyaan: '', kriteria_id: kriteria[0]?.id || '', jurusan_id: jurusan[0]?.id || '', tipe: 'skala' });
                setIsEdit(false);
                setCurrentId(null);
                fetchData(); 
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({ 
            pertanyaan: item.pertanyaan, 
            kriteria_id: item.kriteria_id, 
            jurusan_id: item.jurusan_id || '', // Jurusan ID bisa null
            tipe: item.tipe 
        });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus soal ini? Ini akan menghapus semua jawaban siswa terkait.')) return;

        try {
            const res = await fetch(`/api/soal/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Soal berhasil dihapus.');
                fetchData();
            } else {
                const data = await res.json();
                setMessage(`Gagal menghapus: ${data.message || 'Terjadi kesalahan.'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    if (loading) return <div style={styles.container}>Memuat soal dan data master...</div>;
    
    // Validasi dasar
    if (kriteria.length === 0 || jurusan.length === 0) {
        return <div style={styles.container}>
            <h1 style={{color: 'red'}}>Data Master Belum Lengkap</h1>
            <p>Silakan lengkapi data kriteria di <Link href="/admin/data-master/kriteria" style={styles.link}>Halaman Kelola Kriteria</Link> dan jurusan di <Link href="/admin/data-master/jurusan" style={styles.link}>Halaman Kelola Jurusan</Link>.</p>
        </div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>{isEdit ? 'Edit Soal Assessment' : 'Tambah Soal Assessment Baru'}</h1>
            
            <form onSubmit={handleFormSubmit} style={styles.form}>
                <textarea name="pertanyaan" placeholder="Masukkan teks pertanyaan di sini..." onChange={handleInputChange} value={formData.pertanyaan} required rows="3" style={styles.input} />
                
                <div style={styles.selectGroup}>
                    <select name="kriteria_id" onChange={handleInputChange} value={formData.kriteria_id} required style={{...styles.input, flex: 1}}>
                        <option value="">-- Pilih Kriteria --</option>
                        {kriteria.map(k => (
                            <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>

                    <select name="jurusan_id" onChange={handleInputChange} value={formData.jurusan_id} style={{...styles.input, flex: 1}}>
                        <option value="">-- Pilih Jurusan (Opsional) --</option>
                        {jurusan.map(j => (
                            <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                    </select>
                    
                    <select name="tipe" onChange={handleInputChange} value={formData.tipe} required style={{...styles.input, flex: 0.5}}>
                        <option value="skala">Skala 1-5 (Likert)</option>
                        <option value="pilihan">Pilihan Ganda</option>
                        <option value="isian">Isian Singkat</option>
                    </select>
                </div>
                
                <button type="submit" style={styles.button}>
                    {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH SOAL'}
                </button>
                {isEdit && <button type="button" onClick={() => {setIsEdit(false); setFormData({ pertanyaan: '', kriteria_id: kriteria[0]?.id || '', jurusan_id: jurusan[0]?.id || '', tipe: 'skala' }); setCurrentId(null);}} style={{...styles.button, backgroundColor: '#6c757d'}}>Batal Edit</button>}
            </form>
            
            {message && <p style={{ marginTop: '15px', color: message.includes('berhasil') ? 'green' : 'red' }}>{message}</p>}

            <h2 style={styles.subHeader}>Daftar Soal Assessment ({soal.length})</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Pertanyaan</th>
                        <th style={styles.th}>Kriteria</th>
                        <th style={styles.th}>Jurusan</th>
                        <th style={styles.th}>Tipe</th>
                        <th style={styles.th}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {soal.map(item => (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.id}</td>
                            <td style={styles.tdLeft}>{item.pertanyaan.substring(0, 80)}...</td>
                            <td style={styles.td}>{item.kriteria_nama}</td>
                            <td style={styles.td}>{item.jurusan_nama || 'Umum'}</td>
                            <td style={styles.td}>{item.tipe}</td>
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

const styles = {
    container: { maxWidth: '1000px', margin: '50px auto', padding: '20px' },
    header: { color: '#007bff', marginBottom: '25px' },
    subHeader: { marginTop: '40px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', border: '1px solid #ccc', borderRadius: '6px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    selectGroup: { display: 'flex', gap: '10px' },
    button: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'center', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'center' },
    tdLeft: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    tdActions: { border: '1px solid #ddd', padding: '12px', display: 'flex', gap: '5px', justifyContent: 'center' },
    actionButton: { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }
};

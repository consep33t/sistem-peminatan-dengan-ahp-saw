"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    nisn: '',
    kelas: 'X',
    jurusan_asal: '',
    tahun_ajaran: '2025/2026'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // ✅ FIX: State untuk melacak status sukses/gagal
  const [isSuccess, setIsSuccess] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false); // Reset status
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true); // Set sukses
        setMessage(`Pendaftaran Berhasil! Silakan Login. User ID: ${data.userId}`);
      } else {
        setIsSuccess(false); // Set gagal
        setMessage(`Gagal mendaftar: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setIsSuccess(false);
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Daftar Siswa Baru</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Input Akun */}
        <input name="username" type="text" placeholder="Username (Login)" onChange={handleChange} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={styles.input} />

        {/* Input Data Diri */}
        <input name="nama" type="text" placeholder="Nama Lengkap" onChange={handleChange} required style={styles.input} />
        <input name="nisn" type="text" placeholder="NISN" onChange={handleChange} required style={styles.input} />
        <input name="kelas" type="text" placeholder="Kelas (e.g., XI)" onChange={handleChange} value={formData.kelas} required style={styles.input} />
        <input name="jurusan_asal" type="text" placeholder="Jurusan Asal (e.g., SMP)" onChange={handleChange} required style={styles.input} />
        <input name="tahun_ajaran" type="text" placeholder="Tahun Ajaran" onChange={handleChange} value={formData.tahun_ajaran} required style={styles.input} />
        
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Mendaftar...' : 'DAFTAR SEKARANG'}
        </button>
      </form>
      
      {/* ✅ KODE PERBAIKAN: Menggunakan isSuccess state */}
      {message && <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>} 
      
      <p style={{ marginTop: '15px' }}>
        Sudah punya akun? <Link href="/login" style={styles.link}>Login di sini</Link>
      </p>
    </div>
  );
}

// Simple internal styling (bisa diganti dengan Tailwind/CSS Module)
const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    header: { textAlign: 'center', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    link: { color: '#007bff', textDecoration: 'none' }
};

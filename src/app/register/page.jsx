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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setMessage(`Pendaftaran Berhasil! Silakan Login. User ID: ${data.userId}`);
      } else {
        setIsSuccess(false);
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
    <div className="max-w-md mx-auto mt-12 p-6 card">
      <h1 className="text-2xl font-semibold text-center mb-4">Daftar Siswa Baru</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="username" type="text" placeholder="Username (Login)" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />

        <input name="nama" type="text" placeholder="Nama Lengkap" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
        <input name="nisn" type="text" placeholder="NISN" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
        <input name="kelas" type="text" placeholder="Kelas (e.g., XI)" onChange={handleChange} value={formData.kelas} required className="w-full px-3 py-2 border rounded-md" />
        <input name="jurusan_asal" type="text" placeholder="Jurusan Asal (e.g., SMP)" onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
        <input name="tahun_ajaran" type="text" placeholder="Tahun Ajaran" onChange={handleChange} value={formData.tahun_ajaran} required className="w-full px-3 py-2 border rounded-md" />

        <button type="submit" disabled={loading} className="btn-primary mt-2">{loading ? 'Mendaftar...' : 'DAFTAR SEKARANG'}</button>
      </form>

      {message && <p className={`mt-4 font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

      <p className="mt-4 text-center text-sm">Sudah punya akun? <Link href="/login" className="text-teal-600 hover:underline">Login di sini</Link></p>
    </div>
  );
}

// app/siswa/dashboard/page.js

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SiswaDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter(); 

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');

      if (!token) {
        router.push('/login'); 
        setError('Anda belum login. Silakan login.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setProfile(data);
        } else {
          setError(data.error || 'Gagal memuat profil. Silakan login ulang.');
          localStorage.removeItem('userToken'); 
          router.push('/login'); 
        }
      } catch (err) {
        setError('Kesalahan jaringan saat memuat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    router.push('/login');
  };

  if (loading) return <div className="max-w-3xl mx-auto mt-12 p-6 text-center">Loading Profil...</div>;

  if (error) return <div className="max-w-3xl mx-auto mt-12 p-6 text-center text-red-600">{error}</div>;

  if (!profile) return <div className="max-w-3xl mx-auto mt-12 p-6 text-center">Data profil tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 card">
      <h1 className="text-2xl text-teal-600 font-semibold text-center">Dashboard Siswa</h1>

      <div className="mt-6 border rounded-md p-4 bg-gray-50 dark:bg-slate-800">
        <h2 className="text-lg font-medium mb-3">Data Profil</h2>
        <p><strong>NISN:</strong> {profile.nisn}</p>
        <p><strong>Kelas:</strong> {profile.kelas}</p>
        <p><strong>Tahun Ajaran:</strong> {profile.tahun_ajaran}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Link href="/siswa/assessment" className="btn-primary bg-amber-400 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-center">Mulai Isi Assessment</Link>
        <Link href="/siswa/rekomendasi" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center">Lihat Hasil Rekomendasi</Link>
      </div>
    </div>
  );
}
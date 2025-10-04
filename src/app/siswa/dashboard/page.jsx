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

  if (loading) {
    return <div style={styles.container}>Loading Profil...</div>;
  }

  if (error) {
    return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;
  }

  if (!profile) {
    return <div style={styles.container}>Data profil tidak ditemukan.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Dashboard Siswa</h1>
      <p style={styles.welcome}>Selamat Datang, <strong>{profile.nama || profile.username}</strong>!</p>
      <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      
      <div style={styles.card}>
        <h2 style={styles.cardHeader}>Data Profil</h2>
        <p><strong>NISN:</strong> {profile.nisn}</p>
        <p><strong>Kelas:</strong> {profile.kelas}</p>
        <p><strong>Tahun Ajaran:</strong> {profile.tahun_ajaran}</p>
      </div>

      <div style={styles.actions}>
        <Link href="/siswa/assessment" style={styles.button}>Mulai Isi Assessment</Link>
        <Link href="/siswa/rekomendasi" style={styles.buttonSecondary}>Lihat Hasil Rekomendasi</Link>
      </div>
    </div>
  );
}

const styles = {
    container: { maxWidth: '800px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    header: { textAlign: 'center', color: '#007bff' },
    welcome: { fontSize: '1.2em', marginBottom: '20px', textAlign: 'center' },
    card: { border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#f9f9f9' },
    cardHeader: { color: '#333', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '15px' },
    actions: { display: 'flex', gap: '20px', justifyContent: 'center' },
    button: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', textAlign: 'center' },
    logoutButton: { padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto' },
};
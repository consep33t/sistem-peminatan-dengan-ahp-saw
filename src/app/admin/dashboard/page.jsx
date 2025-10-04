// app/admin/dashboard/page.js
"use client";
import Link from 'next/link';

export default function AdminDashboard() {
  
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard Peminatan</h1>
      <p style={styles.welcome}>Selamat Datang, Admin! Kelola data sistem di bawah ini.</p>

      <div style={styles.grid}>
        <Link href="/admin/data-master/jurusan" style={styles.card}>
          <h3>Kelola Jurusan 🛠️</h3>
          <p>Tambah, edit, atau hapus daftar jurusan (Alternatif).</p>
        </Link>

        <Link href="/admin/data-master/kriteria" style={styles.card}>
          <h3>Kelola Kriteria 📊</h3>
          <p>Atur kriteria penilaian (Minat, Bakat, dll.) dan tipe (Benefit/Cost).</p>
        </Link>
        
        <Link href="/admin/assessment/soal" style={styles.card}>
          <h3>Kelola Soal Assessment ❓</h3>
          <p>Buat, edit, dan tautkan soal dengan kriteria dan jurusan.</p>
        </Link>
        
        <Link href="/admin/ahp/input" style={styles.cardHighlight}>
          <h3>Perhitungan AHP ⭐</h3>
          <p>Input Matriks Perbandingan dan Hitung Bobot Kriteria.</p>
        </Link>
        
        <Link href="/admin/laporan/siswa" style={styles.card}>
          <h3>Laporan Siswa 🎓</h3>
          <p>Lihat daftar siswa, nilai assessment, dan hasil rekomendasi.</p>
        </Link>
      </div>
    </div>
  );
}

const styles = {
    container: { maxWidth: '1000px', margin: '50px auto', padding: '20px' },
    header: { textAlign: 'center', color: '#007bff', marginBottom: '10px' },
    welcome: { textAlign: 'center', marginBottom: '40px', fontSize: '1.1em', color: '#555' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { 
        padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textDecoration: 'none', 
        color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s', 
        backgroundColor: '#f9f9f9' 
    },
    cardHighlight: { 
        padding: '20px', border: '2px solid #ffc107', borderRadius: '8px', textDecoration: 'none', 
        color: '#333', boxShadow: '0 4px 8px rgba(255,193,7,0.3)', transition: 'transform 0.2s', 
        backgroundColor: '#fffbe6' 
    },
};

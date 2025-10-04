// app/siswa/rekomendasi/page.js

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RekomendasiPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const fetchRekomendasi = async () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // ✅ PERBAIKAN: Ambil ID dari objek profile.siswa_id
      const siswaId = userData?.profile?.siswa_id; 

      if (!siswaId) {
        // Jika tidak ada siswaId, kemungkinan user tidak login atau token expired
        setError('Data siswa tidak ditemukan. Harap login ulang.');
        setLoading(false);
        router.push('/login'); 
        return;
      }

      try {
        // Panggil API Rekomendasi dengan siswa_id yang benar
        const res = await fetch(`/api/rekomendasi?siswa_id=${siswaId}`);

        const result = await res.json();
        
        if (res.ok) {
          setData(result);
        } else {
          // Jika status 404, berarti hasil SAW belum dihitung
          if (res.status === 404) {
            setError(result.message || "Hasil rekomendasi belum tersedia. Mohon selesaikan assessment dan pastikan admin telah menghitung bobot AHP dan skor SAW.");
          } else {
             setError(result.error || 'Gagal memuat hasil rekomendasi.');
          }
        }
      } catch (err) {
        setError('Kesalahan jaringan saat mengambil data rekomendasi.');
      } finally {
        setLoading(false);
      }
    };

    fetchRekomendasi();
  }, [router]); // Tambahkan router ke dependency array

  if (loading) {
    return <div style={styles.container}>Memuat hasil rekomendasi...</div>;
  }

  if (error) {
    return <div style={{ ...styles.container, color: 'red', textAlign: 'center' }}>
        <h1 style={styles.header}>Hasil Rekomendasi</h1>
        <p>{error}</p>
        <p style={{marginTop: '20px'}}>Silakan <a href="/siswa/assessment" style={{color: '#007bff'}}>kembali ke Assessment</a> jika belum mengisinya.</p>
    </div>;
  }

  if (!data || !data.rekomendasi_utama) {
    return <div style={styles.container}>Data hasil tidak valid.</div>;
  }
  
  const { siswa, rekomendasi_utama, ranking_lengkap } = data;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Hasil Rekomendasi Jurusan</h1>
      
      <div style={styles.profileBox}>
        <p><strong>Siswa:</strong> {siswa.nama}</p>
        <p><strong>NISN:</strong> {siswa.nisn}</p>
      </div>

      <div style={styles.mainResult}>
        <h2>Rekomendasi Utama Terbaik:</h2>
        <div style={styles.resultBox}>
          <h3>{rekomendasi_utama.jurusan}</h3>
          <p>Skor SAW: <strong>{rekomendasi_utama.skor}</strong></p>
        </div>
      </div>
      
      {/* Tabel Ranking Lengkap */}
      <h2 style={{marginTop: '40px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Daftar Ranking Jurusan Lengkap</h2>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Ranking</th>
            <th style={styles.th}>Jurusan</th>
            <th style={styles.th}>Skor SAW</th>
          </tr>
        </thead>
        <tbody>
          {ranking_lengkap.map((item) => (
            <tr key={item.ranking} style={item.ranking === 1 ? styles.rowHighlight : {}}>
              <td style={styles.td}>{item.ranking}</td>
              <td style={styles.td}>
                {item.jurusan}
                {item.ranking === 1 && <span style={styles.badge}> (TERBAIK)</span>}
              </td>
              <td style={styles.td}>{item.skor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
    container: { maxWidth: '900px', margin: '50px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    header: { textAlign: 'center', color: '#007bff', marginBottom: '20px' },
    profileBox: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '30px', border: '1px solid #eee' },
    mainResult: { textAlign: 'center', marginBottom: '40px' },
    resultBox: { display: 'inline-block', padding: '20px 40px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    rowHighlight: { backgroundColor: '#e6ffe6', fontWeight: 'bold' },
    badge: { backgroundColor: '#ffc107', color: '#333', padding: '2px 6px', borderRadius: '3px', marginLeft: '10px', fontSize: '0.8em' }
};
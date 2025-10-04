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

  if (loading) return <div className="max-w-4xl mx-auto mt-12 p-6 text-center">Memuat hasil rekomendasi...</div>;

  if (error) return (
    <div className="max-w-4xl mx-auto mt-12 p-6 text-center text-red-600">
      <h1 className="text-2xl font-semibold mb-2">Hasil Rekomendasi</h1>
      <p>{error}</p>
      <p className="mt-4">Silakan <a href="/siswa/assessment" className="text-teal-600 hover:underline">kembali ke Assessment</a> jika belum mengisinya.</p>
    </div>
  );

  if (!data || !data.rekomendasi_utama) return <div className="max-w-4xl mx-auto mt-12 p-6 text-center">Data hasil tidak valid.</div>;

  const { siswa, rekomendasi_utama, ranking_lengkap } = data;

  return (
    <div className="max-w-4xl mx-auto p-6 card">
      <h1 className="text-2xl text-teal-600 font-semibold text-center mb-4">Hasil Rekomendasi Jurusan</h1>

      <div className="p-4 mb-6 rounded-md border bg-gray-50 dark:bg-slate-800">
        <p><strong>Siswa:</strong> {siswa.nama}</p>
        <p><strong>NISN:</strong> {siswa.nisn}</p>
      </div>

      

      <div className="text-center mb-8">
        <h2 className="text-lg font-medium mb-2">Rekomendasi Utama Terbaik:</h2>
        <div className="inline-block px-8 py-6 bg-green-600 text-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">{rekomendasi_utama.jurusan}</h3>
          <p className="mt-1">Skor SAW: <strong>{rekomendasi_utama.skor}</strong></p>
        </div>
      </div>

      {/* Per-jurusan chart */}
      <section aria-label="Grafik skor jurusan" className="mb-8">
        <h3 className="text-lg font-medium mb-3">Visualisasi Skor SAW per Jurusan</h3>
        <div className="space-y-3">
          {(() => {
            const rows = ranking_lengkap || [];
            const scores = rows.map(r => parseFloat(r.skor) || 0);
            const max = scores.length ? Math.max(...scores) : 1;
            return rows.map((r) => {
              const score = parseFloat(r.skor) || 0;
              const pct = max > 0 ? Math.round((score / max) * 100) : 0;
              return (
                <div key={r.jurusan} className="flex items-center gap-3">
                  <div className="w-40 text-sm text-slate-700 dark:text-slate-200">{r.jurusan}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-md h-4 overflow-hidden">
                      <div className={`h-4 rounded-md ${r.ranking === 1 ? 'bg-amber-400' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-mono text-slate-600 dark:text-slate-300">{score.toFixed(4)}</div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      <h2 className="mt-6 mb-3 text-lg font-medium border-b pb-2">Daftar Ranking Jurusan Lengkap</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Ranking</th>
              <th className="p-3 text-left">Jurusan</th>
              <th className="p-3 text-left">Skor SAW</th>
            </tr>
          </thead>
          <tbody>
            {ranking_lengkap.map((item) => (
              <tr key={item.ranking} className={item.ranking === 1 ? 'bg-green-50 font-semibold' : ''}>
                <td className="p-3">{item.ranking}</td>
                <td className="p-3">{item.jurusan}{item.ranking === 1 && <span className="ml-2 inline-block bg-yellow-300 text-slate-800 px-2 py-0.5 rounded text-sm">TERBAIK</span>}</td>
                <td className="p-3">{item.skor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
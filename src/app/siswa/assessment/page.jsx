"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 

// Utility function to get the correct student ID
const getSiswaIdFromStorage = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // Ambil ID dari profile.siswa_id jika ada, atau kembalikan null
    return userData?.profile?.siswa_id || null;
  } catch (e) {
    return null;
  }
};


export default function AssessmentPage() {
  // Soal adalah array dari objek soal (termasuk kriteria_id dan jurusan_id)
  const [questions, setQuestions] = useState([]); 
  // Jawaban adalah objek { soal_id: nilai }
  const [answers, setAnswers] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      // Pengecekan sebelum fetch, pastikan siswa_id tersedia
      const siswaId = getSiswaIdFromStorage();
      if (!siswaId) {
        setLoading(false);
        // Jika tidak ada ID, redirect ke login
        router.push('/login');
        return;
      }
      
      try {
        // Ambil semua soal dari API
        const res = await fetch('/api/soal'); 
        const data = await res.json();
        
        if (res.ok) {
          // Di sini kita filter hanya soal yang punya jurusan_id (soal spesifik)
          const specificQuestions = data.filter(q => q.jurusan_nama !== null); 
          setQuestions(specificQuestions);
          
          // Inisialisasi jawaban default (misal, 3)
          const initialAnswers = specificQuestions.reduce((acc, q) => {
            acc[q.id] = 3; 
            return acc;
          }, {});
          setAnswers(initialAnswers);

        } else {
          setMessage(data.error || 'Gagal memuat daftar soal.');
        }
      } catch (err) {
        setMessage('Kesalahan jaringan saat memuat soal.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  const handleAnswerChange = (soalId, value) => {
    // Memastikan nilai jawaban berada di skala 1-5
    const numericValue = Math.min(5, Math.max(1, parseInt(value, 10) || 1));

    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [soalId]: numericValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    
    // Ambil siswa_id yang benar
    const siswaId = getSiswaIdFromStorage(); 

    if (!siswaId) {
        setMessage('Error: ID Siswa tidak ditemukan. Silakan login ulang.');
        setSubmitting(false);
        router.push('/login');
        return;
    }

    // Format jawaban menjadi array [{soal_id, nilai}, ...] sesuai API
    const formattedAnswers = questions.map(q => ({
        soal_id: q.id,
        nilai: answers[q.id] || 3 // Gunakan nilai 3 jika tidak diisi
    }));

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Pastikan siswa_id dikirim
        body: JSON.stringify({ siswa_id: siswaId, answers: formattedAnswers }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // 🚨 Setelah submit assessment, WAJIB jalankan perhitungan SAW
        // Jika tidak, API rekomendasi (Step 7) akan 404
        await fetch('/api/saw/hitung-skor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siswa_id: siswaId }),
        });
        
        setMessage('Assessment Berhasil Disimpan & Skor Dihitung! Mengalihkan ke Rekomendasi...');
        
        // Redirect ke halaman hasil
        setTimeout(() => {
            router.push('/siswa/rekomendasi');
        }, 1500);

      } else {
        setMessage(`Gagal submit: ${data.error || 'Terjadi kesalahan saat menyimpan jawaban.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Terjadi kesalahan jaringan saat mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto mt-12 p-6 text-center">Memuat soal assessment...</div>;

  if (questions.length === 0) return <div className="max-w-4xl mx-auto mt-12 p-6 text-center">Tidak ada soal assessment yang tersedia.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 card">
      <h1 className="text-2xl text-teal-600 font-semibold text-center mb-4">Assessment Peminatan</h1>
      <p className="text-center text-sm text-slate-600 mb-6">Jawablah setiap pertanyaan dengan skala <strong>1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju)</strong>.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="p-4 border rounded-md bg-white dark:bg-slate-800">
            <p className="mb-2"><strong>{index + 1}. ({q.jurusan_nama} - {q.kriteria_nama})</strong> {q.pertanyaan}</p>
            <input
              type="number"
              min="1"
              max="5"
              value={answers[q.id] || 3}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              required
              className="w-24 px-2 py-1 border rounded-md"
            />
          </div>
        ))}

        <button type="submit" disabled={submitting} className="w-full btn-primary py-3 text-lg">
          {submitting ? 'Mengirim Jawaban...' : 'Selesaikan Assessment & Hitung Nilai'}
        </button>
      </form>

      {message && <p className={`mt-4 text-center ${message.includes('Berhasil') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </div>
  );
}

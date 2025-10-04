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

  if (loading) {
    return <div style={styles.container}>Memuat soal assessment...</div>;
  }

  if (questions.length === 0) {
    return <div style={styles.container}>Tidak ada soal assessment yang tersedia.</div>;
  }
 return (
    <div style={styles.container}>
      <h1 style={styles.header}>Assessment Peminatan</h1>
      <p style={styles.instruction}>Jawablah setiap pertanyaan dengan skala **1 (Sangat Tidak Setuju) hingga 5 (Sangat Setuju)**.</p>

      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <div key={q.id} style={styles.questionCard}>
            <p><strong>{index + 1}. ({q.jurusan_nama} - {q.kriteria_nama})</strong> {q.pertanyaan}</p>
            <input
              type="number"
              min="1"
              max="5"
              value={answers[q.id] || 3}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              required
              style={styles.input}
            />
          </div>
        ))}
        
        <button type="submit" disabled={submitting} style={styles.buttonSubmit}>
          {submitting ? 'Mengirim Jawaban...' : 'Selesaikan Assessment & Hitung Nilai'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '15px', color: message.includes('Berhasil') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

const styles = {
    container: { maxWidth: '900px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
    header: { textAlign: 'center', color: '#007bff', marginBottom: '30px' },
    instruction: { textAlign: 'center', marginBottom: '20px', color: '#555' },
    questionCard: { border: '1px solid #eee', padding: '15px', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#fff' },
    input: { padding: '8px', width: '60px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' },
    buttonSubmit: { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', marginTop: '20px', fontSize: '1.1em' },
};

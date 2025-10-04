// app/login/page.js

"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Uncomment jika menggunakan Next.js App Router

export default function LoginPage() {
  const router = useRouter(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // --- Langkah Krusial: Simpan Data Login ---
        // Simpan token untuk autentikasi API selanjutnya (misal: mengambil profile)
        localStorage.setItem('userToken', data.token); 
        localStorage.setItem('userData', JSON.stringify(data.user)); 
        // ------------------------------------------

        setMessage('Login Berhasil! Mengalihkan ke Dashboard...');
        
        // Cek Role dan Redirect
        if (data.user.role === 'admin') {
            router.push('/admin/dashboard');
            console.log('Redirecting to Admin Dashboard');
        } else {
            router.push('/siswa/dashboard');
            console.log('Redirecting to Siswa Dashboard');
        }

      } else {
        setMessage(`Login Gagal: ${data.error || 'Username atau password salah.'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Login Sistem Peminatan</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        
        <input name="username" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
        <input name="password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Memproses...' : 'LOGIN'}
        </button>
      </form>

      {message && <p style={{ ...styles.message, color: message.includes('Berhasil') ? 'green' : 'red' }}>{message}</p>}
      <p style={{ marginTop: '15px' }}>
        Belum punya akun? <Link href="/register" style={styles.link}>Daftar di sini</Link>
      </p>
    </div>
  );
}

// Simple internal styling
const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    header: { textAlign: 'center', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    message: { textAlign: 'center', marginTop: '10px' },
    link: { color: '#3498db', textDecoration: 'none' }
};
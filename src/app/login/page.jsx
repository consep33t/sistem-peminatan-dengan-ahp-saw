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
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
    <div className="max-w-md mx-auto p-6 card border border-gray-300 shadow-lg rounded-2xl">
      <h1 className="text-2xl font-semibold text-center mb-4">Login Sistem Peminatan</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="username" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-400" />
        <input name="password" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-400" />

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? 'Memproses...' : 'LOGIN'}
        </button>
      </form>

      {message && <p className={`mt-4 text-center font-medium ${message.includes('Berhasil') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

      <p className="mt-4 text-center text-sm">
        Belum punya akun? <Link href="/register" className="text-teal-600 hover:underline">Daftar di sini</Link>
      </p>
    </div>
    </div>
  );
}
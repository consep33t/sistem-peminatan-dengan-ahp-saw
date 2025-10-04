"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userDataJSON = localStorage.getItem('userData');
        
        if (userDataJSON) {
            const userData = JSON.parse(userDataJSON);
            
            // Cek Role di sisi client
            if (userData?.role === 'admin') {
                setIsAuthenticated(true);
            } else {
                // Jika user login tapi bukan admin (misal: siswa), paksa redirect
                router.push('/siswa/dashboard');
            }
        } else {
            // Jika tidak ada data login sama sekali
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    if (loading || !isAuthenticated) {
        // Tampilkan loading/verifikasi jika belum terotentikasi
        return <div style={styles.loadingContainer}>Memverifikasi Akses Admin...</div>;
    }

    return (
        <div style={styles.mainContainer}>
            <header style={styles.header}>
                <h2 style={{ margin: 0 }}>Panel Admin</h2>
                <nav style={styles.nav}>
                    <Link href="/admin/dashboard" style={styles.navLink}>Dashboard</Link>
                    <Link href="/admin/data-master/jurusan" style={styles.navLink}>Data Master</Link>
                    <Link href="/admin/ahp/input" style={styles.navLink}>Perhitungan AHP</Link>
                    <Link href="/admin/laporan/siswa" style={styles.navLink}>Laporan</Link>
                    <button onClick={() => {
                        localStorage.clear();
                        router.push('/login');
                    }} style={styles.logoutButton}>Logout</button>
                </nav>
            </header>
            
            {/* Konten halaman spesifik (Dashboard, Jurusan, Kriteria, dll.) */}
            <main style={styles.content}>{children}</main>
        </div>
    );
}

// Styling (Tailwind-like)
const styles = {
    mainContainer: { minHeight: '100vh', backgroundColor: '#f4f4f9' },
    loadingContainer: { 
        maxWidth: '1000px', margin: '50px auto', padding: '20px', 
        textAlign: 'center', fontSize: '1.2em' 
    },
    header: { 
        backgroundColor: '#343a40', color: 'white', padding: '15px 30px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    nav: { display: 'flex', gap: '20px' },
    navLink: { color: '#adb5bd', textDecoration: 'none', padding: '5px 10px', transition: 'color 0.2s' },
    logoutButton: { 
        backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', 
        borderRadius: '4px', cursor: 'pointer' 
    },
    content: { padding: '20px' }
};

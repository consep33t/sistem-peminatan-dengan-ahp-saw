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

    if (loading || !isAuthenticated) return <div className="max-w-4xl mx-auto mt-12 p-6 text-center">Memverifikasi Akses Admin...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-slate-800 text-white py-4 px-6 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Panel Admin</h2>
                    <nav className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
                        <Link href="/admin/data-master/jurusan" className="text-slate-300 hover:text-white">Data Master</Link>
                        <Link href="/admin/ahp/input" className="text-slate-300 hover:text-white">Perhitungan AHP</Link>
                        <Link href="/admin/laporan/siswa" className="text-slate-300 hover:text-white">Laporan</Link>
                        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="ml-4 btn-danger">Logout</button>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
    );
}

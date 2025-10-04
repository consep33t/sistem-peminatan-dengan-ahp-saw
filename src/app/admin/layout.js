"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Navigasi Item Admin
const NAV_ITEMS = [
    { href: "/admin/dashboard", label: "Dashboard" },
    // ✅ Mengarahkan ke jalur yang benar
    { href: "/admin/data-master/jurusan", label: "Master Data" }, 
    { href: "/admin/ahp/input", label: "Perhitungan AHP" },
    // ✅ Mengarahkan ke jalur yang benar
    { href: "/admin/laporan/siswa", label: "Laporan Siswa" }, 
];

export default function AdminLayout({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false); // State untuk Hamburger
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const userDataJSON = localStorage.getItem('userData');
        if (userDataJSON) {
            const userData = JSON.parse(userDataJSON);
            if (userData?.role === 'admin') {
                setIsAuthenticated(true);
            } else {
                // Jika user login tapi bukan admin, redirect ke dashboard siswa
                router.push('/siswa/dashboard');
            }
        } else {
            // Jika tidak ada data login
            router.push('/login');
        }
        setLoading(false);
    }, [router]);

    // Ensure we know when we're on desktop so we can render the desktop nav reliably
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(min-width: 768px)');
        const update = (e) => {
            setIsDesktop(e.matches ?? mq.matches);
            if (e.matches) setMenuOpen(false); // close mobile menu when switching to desktop
        };

        // Initial
        setIsDesktop(mq.matches);

        // Prefer addEventListener when available
        if (mq.addEventListener) mq.addEventListener('change', update);
        else mq.addListener(update);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener('change', update);
            else mq.removeListener(update);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto mt-12 p-6 text-center text-xl font-medium min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                Memverifikasi Akses Admin...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-slate-800 text-white py-4 px-6 shadow-xl sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Panel Admin</h2>
                    
                    {/* Desktop Nav - explicitly controlled by isDesktop */}
                    {isDesktop ? (
                        <nav className="items-center gap-6 flex">
                            {NAV_ITEMS.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-slate-200 text-sm font-medium hover:text-cyan-400 transition duration-150"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-sm rounded-lg font-semibold transition"
                            >
                                Logout
                            </button>
                        </nav>
                    ) : null}
                    
                    {/* Mobile Hamburger - Terlihat di Mobile, Tersembunyi di MD+ */}
                    {!isDesktop && (
                        <button
                            className="flex items-center p-2 rounded-lg hover:bg-slate-700 transition"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                        </button>
                    )}
                </div>
                
                {/* Mobile Menu Content - Muncul ketika menuOpen=true */}
                {menuOpen && (
                    <nav className="md:hidden mt-3 flex flex-col gap-2 px-2 bg-slate-700 rounded-lg shadow-inner">
                        {NAV_ITEMS.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block py-2 px-4 rounded text-slate-200 hover:bg-slate-600 transition"
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => { setMenuOpen(false); handleLogout(); }}
                            className="mt-2 mb-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                        >
                            Logout
                        </button>
                    </nav>
                )}
            </header>
            
            <main className="max-w-6xl mx-auto p-6">{children}</main>
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SiswaLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) setUser(JSON.parse(raw)?.profile || JSON.parse(raw));
    } catch (e) {
      // ignore
    }
    // detect desktop width (md breakpoint ~768px)
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 768px)');
      const handler = (e) => setIsDesktop(e.matches);
      setIsDesktop(mq.matches);
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else mq.addListener(handler);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', handler);
        else mq.removeListener(handler);
      };
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-teal-600 font-bold text-lg cursor-pointer">
                Peminatan
              </Link>
              {isDesktop && (
                <nav className="items-center space-x-3 md:flex sm:hidden">
                  <Link href="/siswa/dashboard" className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">Dashboard</Link>
                  <Link href="/siswa/assessment" className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">Assessment</Link>
                  <Link href="/siswa/rekomendasi" className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">Rekomendasi</Link>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <div className="text-sm text-slate-700 dark:text-slate-200">
                    <div className="font-medium">{user.nama || user.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.kelas ? `Kelas ${user.kelas}` : ''}</div>
                  </div>
                ) : (
                  <Link href="/login" className="px-3 py-2 text-sm text-teal-600 hover:underline cursor-pointer">Login</Link>
                )}

                <button onClick={handleLogout} className="border border-black rounded-md py-1 px-2 cursor-pointer">Logout</button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                aria-expanded={open}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/siswa/dashboard" className="block px-3 py-2 rounded-md cursor-pointer">Dashboard</Link>
              <Link href="/siswa/assessment" className="block px-3 py-2 rounded-md cursor-pointer">Assessment</Link>
              <Link href="/siswa/rekomendasi" className="block px-3 py-2 rounded-md cursor-pointer">Rekomendasi</Link>
              <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 px-3">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.nama || user.username}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.kelas ? `Kelas ${user.kelas}` : ''}</div>
                    </div>
                    <button onClick={handleLogout} className="ml-4 btn-danger cursor-pointer">Logout</button>
                  </div>
                ) : (
                  <Link href="/login" className="block px-3 py-2 cursor-pointer">Login</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Definisikan route API yang hanya boleh diakses oleh ADMIN
const ADMIN_API_ROUTES = [
    "/api/admin/", 
    "/api/jurusan", 
    "/api/kriteria", 
    "/api/ahp/pairwise", 
    "/api/ahp/hitung-bobot",
    "/api/soal", 
];

// Definisikan route halaman/API yang hanya boleh diakses oleh SISWA
const SISWA_ROUTES = [
    "/api/assessment/submit",
    "/api/rekomendasi",
    // "/siswa/assessment", // Contoh proteksi halaman siswa
    // "/siswa/rekomendasi",
];

// Definisikan route halaman ADMIN (Cukup cek prefix /admin)
const ADMIN_PAGES_PREFIX = "/admin/";

export function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // --- 1. Proteksi Halaman Frontend (Page Protection) ---
    // ✅ PERBAIKAN: Gunakan pengecekan prefix yang kuat untuk seluruh folder /admin
    const isAdminPage = pathname.startsWith(ADMIN_PAGES_PREFIX);
    
    if (isAdminPage) {
        const cookies = req.cookies.get('userToken'); // Ambil token dari cookies (lebih aman)
        // Gunakan token dari cookies atau Authorization header
        const token = cookies ? cookies.value : req.headers.get("authorization")?.split(" ")[1];

        // 1. Jika tidak ada token, redirect ke halaman login
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key");
            
            // 2. Jika token ada tapi bukan admin, redirect ke dashboard siswa
            if (decoded.role !== 'admin') {
                return NextResponse.redirect(new URL('/siswa/dashboard', req.url));
            }
            // 3. Jika admin, lanjutkan
            return NextResponse.next();

        } catch (err) {
            // Token tidak valid/expired
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }


    // --- 2. Proteksi Endpoint API (API Protection) ---

    // Lewati (Bypass) endpoint Auth (login, register)
    if (pathname.startsWith("/api/auth/")) {
        return NextResponse.next();
    }
    
    const authHeader = req.headers.get("authorization");

    // A. Cek Keberadaan Token untuk API
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Akses Ditolak. Token tidak ditemukan." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    // B. Verifikasi Token dan Ambil Role
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key");
    } catch (err) {
        return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa." }, { status: 401 });
    }
    
    const userRole = decoded.role;
    
    // C. Cek Otorisasi (Role-Based Access Control / RBAC)
    const isAdminApiRoute = ADMIN_API_ROUTES.some(route => pathname.startsWith(route));
    const isSiswaApiRoute = SISWA_ROUTES.some(route => pathname.startsWith(route));


    if (isAdminApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: "Anda tidak memiliki izin (Hanya Admin)." }, { status: 403 });
    }
    
    // Contoh proteksi API Siswa: Blokir Admin dari submit assessment, dll.
    if (isSiswaApiRoute && userRole !== 'siswa') {
         // Admin mungkin perlu akses ke /api/rekomendasi untuk laporan, tapi kita blokir submit assessment.
         if (pathname.startsWith("/api/assessment/submit")) {
            return NextResponse.json({ error: "Akses ke assessment hanya untuk Siswa." }, { status: 403 });
         }
    }


    // Jika token valid dan role diizinkan, lanjutkan request
    return NextResponse.next();
}

// Tentukan matcher: Semua route API dan halaman Admin akan melewati middleware ini
export const config = {
    matcher: ["/api/:path*", "/admin/:path*"], 
};

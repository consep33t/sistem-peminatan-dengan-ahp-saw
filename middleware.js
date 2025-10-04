import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Define API routes that only ADMIN can access
const ADMIN_API_ROUTES = [
    "/api/admin/",
    "/api/jurusan",
    "/api/kriteria",
    "/api/ahp/pairwise",
    "/api/ahp/hitung-bobot",
    "/api/soal",
];

// Define API routes that only SISWA (student) can access
const SISWA_ROUTES = [
    "/api/assessment/submit",
    "/api/rekomendasi",
    // "/siswa/assessment", // Example of student page protection
    // "/siswa/rekomendasi",
];

// Define ADMIN page prefix
const ADMIN_PAGES_PREFIX = "/admin/";

export function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. Protect ADMIN pages
    const isAdminPage = pathname.startsWith(ADMIN_PAGES_PREFIX);

    if (isAdminPage) {
        const cookies = req.cookies.get('userToken');
        const token = cookies ? cookies.value : req.headers.get("authorization")?.split(" ")[1];

        // If no token, redirect to login
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key");

            // Only allow admin to access admin pages
            if (decoded.role !== 'admin') {
                return NextResponse.redirect(new URL('/siswa/dashboard', req.url));
            }
            return NextResponse.next();

        } catch (err) {
            // Invalid/expired token
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // 2. Protect API endpoints

    // Allow auth endpoints without token
    if (pathname.startsWith("/api/auth/")) {
        return NextResponse.next();
    }

    const authHeader = req.headers.get("authorization");

    // Require Bearer token for API
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Access denied. Token not found." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    // Verify token and get role
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_key");
    } catch (err) {
        return NextResponse.json({ error: "Token invalid or expired." }, { status: 401 });
    }

    const userRole = decoded.role;

    // Only admin can access admin API routes
    const isAdminApiRoute = ADMIN_API_ROUTES.some(route => pathname.startsWith(route));
    if (isAdminApiRoute && userRole !== 'admin') {
        return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    // Only siswa can access siswa API routes
    const isSiswaApiRoute = SISWA_ROUTES.some(route => pathname.startsWith(route));
    if (isSiswaApiRoute && userRole !== 'siswa') {
        return NextResponse.json({ error: "Forbidden. Siswa only." }, { status: 403 });
    }

    // If token is valid and role is allowed, continue
    return NextResponse.next();
}

// Tentukan matcher: Semua route API dan halaman Admin akan melewati middleware ini
export const config = {
    matcher: ["/api/:path*", "/admin/:path*"], 
};
// Specify matcher: All API routes and admin pages will use this middleware

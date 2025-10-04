import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "@/app/lib/db";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const db = await getConnection();
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username.trim()]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const user = rows[0];

    // Cek password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // Buat token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "super_secret_key", 
      { expiresIn: "1d" }
    );

    let profile = null;

    // JIKA SISWA: Ambil data lengkap dari tabel siswa (termasuk ID siswa)
    if (user.role === "siswa") {
        const [siswaRows] = await db.query(
            `SELECT 
                id AS siswa_id, nama, nisn, kelas, jurusan_asal, tahun_ajaran 
             FROM siswa 
             WHERE user_id = ?`, 
            [user.id]
        );
        // Data siswa lengkap, dengan ID dari tabel siswa di-alias menjadi siswa_id
        profile = siswaRows[0] || null; 
    }

    return NextResponse.json({
      message: "Login berhasil",
      token,
      user: { 
          id: user.id, // ID dari tabel USERS (Auth ID)
          username: user.username, 
          role: user.role,
          profile: profile // Sisipkan data siswa lengkap, termasuk siswa_id
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
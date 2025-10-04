import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getConnection } from "@/app/lib/db";

export async function POST(req) {
  try {
    // Tambahkan 'role' ke destructured payload. Jika tidak dikirim, default ke 'siswa'.
    const { username, password, role, nama, nisn, kelas, jurusan_asal, tahun_ajaran } = await req.json();

    // Validasi dasar (hanya username dan password yang wajib universal)
    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const currentRole = role || "siswa"; // Tentukan role, default ke siswa

    // Validasi tambahan untuk SISWA
    if (currentRole === 'siswa' && (!nama || !nisn)) {
       return NextResponse.json({ error: "Registrasi Siswa: Nama dan NISN wajib diisi" }, { status: 400 });
    }


    const db = await getConnection();

    // 1. Cek username
    const [rows] = await db.query("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (rows.length > 0) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke tabel users (untuk semua role)
    const [result] = await db.query(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)",
      [username.trim(), hashedPassword, currentRole]
    );

    const userId = result.insertId;

    // 4. Kondisi: HANYA simpan ke tabel siswa jika role adalah 'siswa'
    if (currentRole === "siswa") {
      await db.query(
        "INSERT INTO siswa (user_id,nama,nisn,kelas,jurusan_asal,tahun_ajaran) VALUES (?,?,?,?,?,?)",
        [
          userId,
          nama.trim(),
          nisn.trim(),
          kelas || "",
          jurusan_asal || "",
          tahun_ajaran || "",
        ]
      );
    }
    // Jika role adalah 'admin', proses insert selesai sampai di tabel users.

    return NextResponse.json(
      { message: "Registrasi berhasil", userId, role: currentRole },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
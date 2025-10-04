import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getConnection } from "@/app/lib/db";

export async function POST(req) {
  try {
    const { username, password, nama, nisn, kelas, jurusan_asal, tahun_ajaran } = await req.json();

    if (!username || !password || !nama || !nisn) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const db = await getConnection();

    // cek username
    const [rows] = await db.query("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (rows.length > 0) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan ke tabel users
    const [result] = await db.query(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)",
      [username.trim(), hashedPassword, "siswa"]
    );

    const userId = result.insertId;

    // simpan ke tabel siswa
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

    return NextResponse.json(
      { message: "Registrasi berhasil", userId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

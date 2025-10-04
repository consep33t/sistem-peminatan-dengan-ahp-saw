import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getConnection } from "@/app/lib/db";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Token tidak ada" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = await getConnection();
    const [rows] = await db.query(
      `SELECT u.id as user_id, u.username, u.role, s.nama, s.nisn, s.kelas, s.jurusan_asal, s.tahun_ajaran
       FROM users u
       LEFT JOIN siswa s ON u.id = s.user_id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}

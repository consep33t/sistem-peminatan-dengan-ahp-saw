import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET: Ambil laporan siswa, hasil, dan ranking utama
export async function GET() {
    const pool = await getConnection();
    let conn;

    try {
        conn = await pool.getConnection();

        const [rows] = await conn.query(
            `SELECT 
                s.id AS siswa_id, s.nama, s.nisn, s.kelas,
                j.nama AS jurusan_rekomendasi,
                hs.skor AS skor_saw
            FROM siswa s
            LEFT JOIN hasil_saw hs ON s.id = hs.siswa_id AND hs.ranking = 1
            LEFT JOIN jurusan j ON hs.jurusan_id = j.id
            ORDER BY s.nama ASC`
        );

        return NextResponse.json(rows);

    } catch (err) {
        console.error("GET Laporan Siswa Error:", err);
        return NextResponse.json({ error: "Terjadi kesalahan server saat memuat laporan" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

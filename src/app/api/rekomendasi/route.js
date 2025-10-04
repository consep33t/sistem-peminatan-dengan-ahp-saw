import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET: Ambil hasil rekomendasi (ranking) siswa
// Query Params: ?siswa_id=1
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const siswaId = searchParams.get('siswa_id');

  if (!siswaId) {
    return NextResponse.json({ message: "Parameter siswa_id wajib diisi" }, { status: 400 });
  }

  const pool = await getConnection();
  let conn;

  try {
    conn = await pool.getConnection();

    const [rankingRows] = await conn.query(
      `SELECT
        hs.ranking,
        j.nama AS nama_jurusan,
        hs.skor AS skor_saw
      FROM hasil_saw hs
      JOIN jurusan j ON hs.jurusan_id = j.id
      WHERE hs.siswa_id = ?
      ORDER BY hs.ranking ASC`,
      [siswaId]
    );

    if (rankingRows.length === 0) {
      return NextResponse.json({ 
        message: "Hasil rekomendasi belum tersedia. Harap hitung skor SAW terlebih dahulu." 
      }, { status: 404 });
    }
    
    // Ambil data siswa untuk detail laporan
    const [siswaRows] = await conn.query("SELECT nama, nisn FROM siswa WHERE id = ?", [siswaId]);
    const siswaDetail = siswaRows[0] || {};
    
    // Tentukan rekomendasi utama (ranking 1)
    const rekomendasiUtama = rankingRows[0];

    return NextResponse.json({
      message: `Rekomendasi jurusan untuk Siswa ${siswaDetail.nama} (NISN: ${siswaDetail.nisn}) berhasil diambil.`,
      siswa: siswaDetail,
      rekomendasi_utama: {
          jurusan: rekomendasiUtama.nama_jurusan,
          // ✅ FIX 1: Konversi string ke float sebelum toFixed()
          skor: parseFloat(rekomendasiUtama.skor_saw).toFixed(6) 
      },
      ranking_lengkap: rankingRows.map(r => ({
          ranking: r.ranking,
          jurusan: r.nama_jurusan,
          // ✅ FIX 2: Konversi string ke float sebelum toFixed()
          skor: parseFloat(r.skor_saw).toFixed(6) 
      }))
    });

  } catch (err) {
    console.error("GET Rekomendasi Error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server saat mengambil rekomendasi: " + err.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
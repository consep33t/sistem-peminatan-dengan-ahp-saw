import { getConnection } from "@/app/lib/db";

// GET semua soal (dengan nama kriteria & jurusan)
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(
      `SELECT 
        s.id, s.pertanyaan, s.tipe, 
        k.nama AS kriteria_nama, 
        j.nama AS jurusan_nama
      FROM soal s
      JOIN kriteria k ON s.kriteria_id = k.id
      LEFT JOIN jurusan j ON s.jurusan_id = j.id
      ORDER BY s.id DESC`
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET Soal Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST tambah soal (ADMIN)
export async function POST(req) {
  try {
    const body = await req.json();
    const { pertanyaan, kriteria_id, jurusan_id, tipe } = body;

    if (!pertanyaan || !kriteria_id) {
      return Response.json({ message: "Pertanyaan dan Kriteria ID wajib diisi" }, { status: 400 });
    }

    const conn = await getConnection();
    const [result] = await conn.query(
      "INSERT INTO soal (pertanyaan, kriteria_id, jurusan_id, tipe) VALUES (?, ?, ?, ?)",
      [pertanyaan.trim(), kriteria_id, jurusan_id || null, tipe || 'skala']
    );

    return Response.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (err) {
    console.error("POST Soal Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
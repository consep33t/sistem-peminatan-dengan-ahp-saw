import { getConnection } from "@/app/lib/db";

// GET semua jurusan
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM jurusan ORDER BY id DESC");
    return Response.json(rows);
  } catch (err) {
    console.error("GET Jurusan Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST tambah jurusan
export async function POST(req) {
  try {
    const body = await req.json();
    const { kode, nama, deskripsi } = body;

    if (!kode || !nama) {
      return Response.json({ message: "Kode dan Nama wajib diisi" }, { status: 400 });
    }

    const conn = await getConnection();
    const [result] = await conn.query(
      "INSERT INTO jurusan (kode, nama, deskripsi) VALUES (?, ?, ?)",
      [kode.trim(), nama.trim(), deskripsi || null]
    );

    return Response.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (err) {
    console.error("POST Jurusan Error:", err);
    // Error code 1062 = Duplicate entry (misal: kode sudah ada)
    if (err.code === 'ER_DUP_ENTRY') {
       return Response.json({ error: "Kode Jurusan sudah digunakan" }, { status: 400 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
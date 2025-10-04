import { getConnection } from "@/app/lib/db";

// GET semua siswa
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM siswa ORDER BY id DESC");
    return Response.json(rows);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST tambah siswa
export async function POST(req) {
  try {
    const body = await req.json();
    const { nisn, nama, kelas, jurusan_asal } = body;

    if (!nisn || !nama) {
      return Response.json({ message: "NISN dan Nama wajib diisi" }, { status: 400 });
    }

    const conn = await getConnection();
    const [result] = await conn.query(
      "INSERT INTO siswa (nisn, nama, kelas, jurusan_asal) VALUES (?, ?, ?, ?)",
      [nisn, nama, kelas, jurusan_asal]
    );

    return Response.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

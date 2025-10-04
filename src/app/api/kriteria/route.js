import { getConnection } from "@/app/lib/db";

// GET semua kriteria
export async function GET() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM kriteria ORDER BY id DESC");
    return Response.json(rows);
  } catch (err) {
    console.error("GET Kriteria Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST tambah kriteria
export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, tipe } = body; // tipe: benefit/cost

    if (!nama) {
      return Response.json({ message: "Nama kriteria wajib diisi" }, { status: 400 });
    }

    const conn = await getConnection();
    const [result] = await conn.query(
      "INSERT INTO kriteria (nama, tipe) VALUES (?, ?)",
      [nama.trim(), tipe || 'benefit']
    );

    return Response.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (err) {
    console.error("POST Kriteria Error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
       return Response.json({ error: "Nama kriteria sudah ada" }, { status: 400 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
import { getConnection } from "@/app/lib/db";

// GET soal by id
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM soal WHERE id=?", [id]);
    if (rows.length === 0) {
      return Response.json({ message: "Soal tidak ditemukan" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    console.error("GET Soal Detail Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PATCH update soal
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { pertanyaan, kriteria_id, jurusan_id, tipe } = body;

    const conn = await getConnection();
    await conn.query(
      "UPDATE soal SET pertanyaan=?, kriteria_id=?, jurusan_id=?, tipe=? WHERE id=?",
      [pertanyaan.trim(), kriteria_id, jurusan_id || null, tipe || 'skala', id]
    );

    return Response.json({ id, ...body });
  } catch (err) {
    console.error("PATCH Soal Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE soal
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const conn = await getConnection();
    await conn.query("DELETE FROM soal WHERE id=?", [id]);
    return Response.json({ message: "Soal berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Soal Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
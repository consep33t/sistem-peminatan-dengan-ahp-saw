import { getConnection } from "@/app/lib/db";

// GET kriteria by id
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM kriteria WHERE id=?", [id]);
    if (rows.length === 0) {
      return Response.json({ message: "Kriteria tidak ditemukan" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    console.error("GET Kriteria Detail Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PATCH update kriteria
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { nama, tipe } = body;

    const conn = await getConnection();
    await conn.query(
      "UPDATE kriteria SET nama=?, tipe=? WHERE id=?",
      [nama.trim(), tipe, id]
    );

    return Response.json({ id, ...body });
  } catch (err) {
    console.error("PATCH Kriteria Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE kriteria
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const conn = await getConnection();
    // ON DELETE CASCADE akan menghapus relasi di ahp_pairwise, soal, dan nilai_siswa
    await conn.query("DELETE FROM kriteria WHERE id=?", [id]);
    return Response.json({ message: "Kriteria berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Kriteria Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
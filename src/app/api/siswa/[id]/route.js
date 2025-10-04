import { getConnection } from "@/app/lib/db";

// GET siswa by id
export async function GET(req, context) {
  try {
    const { id } = await context.params;   // ✅ pakai await
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM siswa WHERE id = ?", [id]);
    if (rows.length === 0) {
      return Response.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH update siswa
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;   // ✅ pakai await
    const body = await req.json();
    const { nisn, nama, kelas, jurusan_asal } = body;

    const conn = await getConnection();
    await conn.query(
      "UPDATE siswa SET nisn=?, nama=?, kelas=?, jurusan_asal=? WHERE id=?",
      [nisn, nama, kelas, jurusan_asal, id]
    );

    return Response.json({ id, ...body });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE siswa
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;   // ✅ pakai await
    const conn = await getConnection();
    await conn.query("DELETE FROM siswa WHERE id = ?", [id]);
    return Response.json({ message: "Siswa berhasil dihapus" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

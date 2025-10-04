import { getConnection } from "@/app/lib/db";

// GET jurusan by id
export async function GET(req, context) {
  try {
    const { id } = await context.params; // Ambil ID dari params
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM jurusan WHERE id=?", [id]);
    if (rows.length === 0) {
      return Response.json({ message: "Jurusan tidak ditemukan" }, { status: 404 });
    }
    return Response.json(rows[0]);
  } catch (err) {
    console.error("GET Jurusan Detail Error:", err);
    return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PATCH update jurusan
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { kode, nama, deskripsi } = body;

    const conn = await getConnection();
    await conn.query(
      "UPDATE jurusan SET kode=?, nama=?, deskripsi=? WHERE id=?",
      [kode.trim(), nama.trim(), deskripsi || null, id]
    );

    return Response.json({ id, ...body });
  } catch (err) {
    console.error("PATCH Jurusan Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE jurusan
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const conn = await getConnection();
    // ON DELETE CASCADE akan menghapus relasi di tabel lain (soal, nilai_siswa, hasil_ahp, dll)
    await conn.query("DELETE FROM jurusan WHERE id=?", [id]);
    return Response.json({ message: "Jurusan berhasil dihapus" });
  } catch (err) {
    console.error("DELETE Jurusan Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
import { getConnection } from "@/app/lib/db";

// POST/PUT: Simpan/Update Matriks Perbandingan Berpasangan
// BODY: { "matrix": [{kriteria_id_1: 1, kriteria_id_2: 2, nilai: 3.0}, ...] }
export async function POST(req) {
  const body = await req.json();
  const matrix = body.matrix; 

  if (!Array.isArray(matrix) || matrix.length === 0) {
    return Response.json({ message: "Matriks perbandingan wajib diisi" }, { status: 400 });
  }

  const pool = await getConnection();
  let conn; 

  try {
    conn = await pool.getConnection(); // Dapatkan koneksi tunggal untuk transaksi
    await conn.beginTransaction();

    let updatedCount = 0;
    
    for (const item of matrix) {
      const { kriteria_id_1, kriteria_id_2, nilai } = item;
      const parsedNilai = parseFloat(nilai);

      // Cek apakah data perbandingan sudah ada (nilai asli)
      const [existing] = await conn.query(
        "SELECT id FROM ahp_pairwise WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?",
        [kriteria_id_1, kriteria_id_2]
      );

      if (existing.length > 0) {
        // Update nilai asli
        await conn.query(
          "UPDATE ahp_pairwise SET nilai = ? WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?",
          [parsedNilai, kriteria_id_1, kriteria_id_2]
        );
      } else {
        // Insert nilai asli
        await conn.query(
          "INSERT INTO ahp_pairwise (kriteria_id_1, kriteria_id_2, nilai) VALUES (?, ?, ?)",
          [kriteria_id_1, kriteria_id_2, parsedNilai]
        );
      }
      updatedCount++;

      // Simpan/Update Kebalikannya (Reciprocal)
      const reciprocalValue = 1 / parsedNilai;
      const [existingReciprocal] = await conn.query(
        "SELECT id FROM ahp_pairwise WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?",
        [kriteria_id_2, kriteria_id_1] // Perhatikan urutan ID dibalik
      );

      if (existingReciprocal.length > 0) {
        await conn.query(
          "UPDATE ahp_pairwise SET nilai = ? WHERE kriteria_id_1 = ? AND kriteria_id_2 = ?",
          [reciprocalValue, kriteria_id_2, kriteria_id_1]
        );
      } else {
        await conn.query(
          "INSERT INTO ahp_pairwise (kriteria_id_1, kriteria_id_2, nilai) VALUES (?, ?, ?)",
          [kriteria_id_2, kriteria_id_1, reciprocalValue] // Nilai kebalikan, lalu ID dibalik
        );
      }
    }
    
    await conn.commit(); 
    return Response.json({ message: "Matriks perbandingan berhasil disimpan/diupdate", updatedCount: updatedCount * 2 }, { status: 201 });

  } catch (err) {
    if (conn) {
      await conn.rollback(); // Rollback transaksi jika terjadi error
    }
    console.error("POST AHP Pairwise Error:", err);
    return Response.json({ error: err.message }, { status: 500 });

  } finally {
    if (conn) {
      conn.release(); // WAJIB: Koneksi dikembalikan ke pool
    }
  }
}
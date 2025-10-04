import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

// POST: Hitung skor SAW untuk siswa tertentu
// Body: { "siswa_id": 1 }
export async function POST(req) {
  const body = await req.json();
  const siswaId = body.siswa_id;

  if (!siswaId) {
    return NextResponse.json({ message: "ID Siswa wajib diisi" }, { status: 400 });
  }

  const pool = await getConnection();
  let conn;

  try {
    conn = await pool.getConnection();
    
    // 1. Ambil data nilai mentah siswa (nilai_siswa) dan bobot (kriteria)
    const [nilaiMentahRows] = await conn.query(
      `SELECT
        ns.siswa_id, ns.jurusan_id, ns.kriteria_id, ns.nilai_mentah,
        k.nama AS kriteria_nama, k.tipe, k.bobot_ahp
      FROM nilai_siswa ns
      JOIN kriteria k ON ns.kriteria_id = k.id
      WHERE ns.siswa_id = ?`,
      [siswaId]
    );

    if (nilaiMentahRows.length === 0) {
      return NextResponse.json({ message: "Nilai mentah siswa belum tersedia. Pastikan assessment sudah diisi." }, { status: 404 });
    }

    // 2. Tentukan Nilai Max/Min untuk Normalisasi per Kriteria
    const maxMinValues = {}; // { kriteria_id: { max: N, min: N } }
    
    // Ambil semua nilai mentah dari SEMUA siswa untuk menentukan MAX/MIN
    // (SAW harus membandingkan alternatif (jurusan) di antara semua siswa)
    const [allNilaiRows] = await conn.query(
      "SELECT kriteria_id, nilai_mentah, tipe FROM nilai_siswa JOIN kriteria ON nilai_siswa.kriteria_id = kriteria.id"
    );

    allNilaiRows.forEach(row => {
      const kid = row.kriteria_id;
      const nilai = parseFloat(row.nilai_mentah);
      
      if (!maxMinValues[kid]) {
        maxMinValues[kid] = { max: nilai, min: nilai, tipe: row.tipe };
      } else {
        maxMinValues[kid].max = Math.max(maxMinValues[kid].max, nilai);
        maxMinValues[kid].min = Math.min(maxMinValues[kid].min, nilai);
      }
    });

    // 3. Normalisasi & Pembobotan (Hitung Skor SAW)
    const scores = {}; // { jurusan_id: score_total }

    nilaiMentahRows.forEach(row => {
      const kid = row.kriteria_id;
      const jid = row.jurusan_id;
      const nilai = parseFloat(row.nilai_mentah);
      const bobot = parseFloat(row.bobot_ahp);
      const { max, min, tipe } = maxMinValues[kid];
      
      let normalized;

      // Normalisasi (Rij)
      if (tipe === 'benefit') {
        // Benefit: nilai / max (semakin besar semakin baik)
        normalized = max === 0 ? 0 : nilai / max;
      } else {
        // Cost: min / nilai (semakin kecil semakin baik)
        normalized = nilai === 0 ? 0 : min / nilai;
      }

      // Pembobotan (Vi) = Rij * Bobot AHP
      const weightedScore = normalized * bobot;

      // Agregasi Skor per Jurusan
      scores[jid] = (scores[jid] || 0) + weightedScore;
    });

    // 4. Ranking dan Simpan Hasil ke DB (hasil_saw)
    const rankingData = Object.keys(scores).map(jid => ({
      jurusan_id: parseInt(jid),
      skor: scores[jid]
    }));

    // Urutkan (ranking 1 = skor tertinggi)
    rankingData.sort((a, b) => b.skor - a.skor);

    // Hapus hasil lama
    await conn.query("DELETE FROM hasil_saw WHERE siswa_id = ?", [siswaId]);

    // Simpan hasil baru ke hasil_saw
    let rank = 1;
    for (const data of rankingData) {
      await conn.query(
        "INSERT INTO hasil_saw (siswa_id, jurusan_id, skor, ranking) VALUES (?, ?, ?, ?)",
        [siswaId, data.jurusan_id, data.skor, rank]
      );
      rank++;
    }

    return NextResponse.json({
      message: `Perhitungan SAW untuk Siswa ID ${siswaId} berhasil.`,
      ranking: rankingData.map((d, i) => ({ ...d, ranking: i + 1 })),
    });

  } catch (err) {
    console.error("POST Hitung SAW Error:", err);
    if (conn) conn.release();
    return NextResponse.json({ error: "Terjadi kesalahan server saat menghitung SAW: " + err.message }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
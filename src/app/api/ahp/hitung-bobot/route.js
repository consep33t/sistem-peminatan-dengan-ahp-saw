import { getConnection } from "@/app/lib/db";

// Nilai Random Index (RI) standar untuk AHP
// Digunakan untuk menghitung Rasio Konsistensi (CR)
const RI = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32 };

export async function POST() {
  const pool = await getConnection();
  let conn;

  try {
    conn = await pool.getConnection(); // Dapatkan koneksi tunggal
    
    // 1. Ambil data kriteria dan pairwise comparison
    const [kriteriaRows] = await conn.query("SELECT id, nama, tipe FROM kriteria ORDER BY id ASC");
    const [pairwiseRows] = await conn.query("SELECT kriteria_id_1, kriteria_id_2, nilai FROM ahp_pairwise");
    
    const n = kriteriaRows.length; // Jumlah kriteria
    
    if (n === 0) return Response.json({ message: "Tidak ada kriteria yang terdaftar" }, { status: 400 });
    
    // Matriks harus lengkap (n*n, termasuk nilai diagonal)
    if (pairwiseRows.length !== n * n) {
       return Response.json({ message: `Matriks perbandingan belum lengkap. Dibutuhkan ${n*n} entri.` }, { status: 400 });
    }

    // 2. Bentuk Matriks Perbandingan (M)
    const kriteriaMap = kriteriaRows.map(k => k.id);
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));

    pairwiseRows.forEach(row => {
      const i = kriteriaMap.indexOf(row.kriteria_id_1);
      const j = kriteriaMap.indexOf(row.kriteria_id_2);
      if (i !== -1 && j !== -1) {
        matrix[i][j] = parseFloat(row.nilai);
      }
    });

    // 3. Hitung Jumlah Kolom ($\sum C$)
    const colSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSums[j] += matrix[i][j];
      }
    }

    // 4. Normalisasi Matriks & Hitung Eigenvector (Prioritas)
    const priorities = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < n; j++) {
        const normalizedValue = matrix[i][j] / colSums[j]; // Normalisasi
        rowSum += normalizedValue;
      }
      priorities[i] = rowSum / n; // Rata-rata baris = Bobot Prioritas
    }
    
    // 5. Hitung Consistency Ratio (CR)
    
    // Weighted Sum Vector (WS) = M x Priorities
    const weightedSum = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        weightedSum[i] += matrix[i][j] * priorities[j];
      }
    }
    
    // Rasio Konsistensi & Lambda Max ($\lambda_{\text{max}}$)
    const consistencyRatios = weightedSum.map((ws, i) => ws / priorities[i]);
    const lambdaMax = consistencyRatios.reduce((a, b) => a + b, 0) / n;
    
    // Consistency Index (CI)
    const CI = (lambdaMax - n) / (n - 1);
    
    // Consistency Ratio (CR)
    const CR = CI / (RI[n] || 1.49); // Gunakan RI, default 1.49 jika n tidak ada

    // 6. Simpan Bobot Prioritas ke tabel kriteria
    if (CR > 0.10) {
      return Response.json({ 
        message: `Matriks TIDAK KONSISTEN. CR: ${CR.toFixed(4)}. Bobot tidak disimpan.`, 
        CR: CR.toFixed(4),
        lambdaMax: lambdaMax.toFixed(4)
      }, { status: 400 });
    }

    // Jika Konsisten (CR <= 0.10)
    await conn.beginTransaction();
    for (let i = 0; i < n; i++) {
      await conn.query(
        "UPDATE kriteria SET bobot_ahp = ? WHERE id = ?",
        [priorities[i], kriteriaMap[i]]
      );
    }
    await conn.commit();

    return Response.json({ 
      message: `Bobot kriteria berhasil dihitung dan disimpan. Matriks KONSISTEN.`,
      CR: CR.toFixed(4),
      lambdaMax: lambdaMax.toFixed(4),
      bobot: kriteriaRows.map((k, i) => ({ nama: k.nama, bobot: priorities[i].toFixed(4) }))
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("POST Hitung Bobot AHP Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
     if (conn) conn.release(); // WAJIB: Koneksi dikembalikan ke pool
  }
}
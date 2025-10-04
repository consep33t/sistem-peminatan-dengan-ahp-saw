import { getConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

/**
 * Fungsi Pembantu: Menghitung nilai mentah agregat
 * dari jawaban_siswa dan menyimpannya ke nilai_siswa.
 * @param {object} conn - Objek koneksi database (diperlukan untuk transaksi).
 * @param {number} siswaId - ID Siswa yang nilainya akan dihitung.
 */
async function calculateAggregates(conn, siswaId) {
    // 1. Hapus nilai lama (agar hasil selalu baru)
    await conn.query("DELETE FROM nilai_siswa WHERE siswa_id = ?", [siswaId]);

    // 2. Hitung Rata-Rata Nilai per Kriteria dan per Jurusan
    const [aggregateResults] = await conn.query(
        `INSERT INTO nilai_siswa (siswa_id, kriteria_id, jurusan_id, nilai_mentah)
         SELECT
             js.siswa_id,
             s.kriteria_id,
             s.jurusan_id,
             AVG(js.nilai) AS nilai_mentah
         FROM jawaban_siswa js
         JOIN soal s ON js.soal_id = s.id
         WHERE js.siswa_id = ? AND s.jurusan_id IS NOT NULL -- Hanya soal yang memiliki jurusan
         GROUP BY s.kriteria_id, s.jurusan_id, js.siswa_id`,
        [siswaId]
    );

    return aggregateResults;
}


// POST submit jawaban siswa
export async function POST(req) {
    const pool = await getConnection();
    let conn;

    try {
        const body = await req.json();
        const { siswa_id, answers } = body;

        if (!siswa_id || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ message: "Data tidak lengkap atau format salah" }, { status: 400 });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const values = []; 
        const placeholders = []; 

        // 1. Persiapan data untuk bulk insert
        answers.forEach(answer => {
            if (answer.soal_id && typeof answer.nilai !== 'undefined') {
                values.push(siswa_id, answer.soal_id, parseFloat(answer.nilai));
                placeholders.push('(?, ?, ?)'); 
            }
        });

        if (values.length === 0) {
            await conn.rollback();
            return NextResponse.json({ message: "Tidak ada jawaban yang valid untuk disimpan" }, { status: 400 });
        }

        // 2. Buat query INSERT dinamis untuk bulk insert
        const sql = `INSERT INTO jawaban_siswa (siswa_id, soal_id, nilai) VALUES ${placeholders.join(', ')}`;

        // Hapus jawaban lama siswa
        await conn.query("DELETE FROM jawaban_siswa WHERE siswa_id = ?", [siswa_id]);
        
        // Lakukan bulk insert
        await conn.query(sql, values); 

        // 3. Setelah jawaban disimpan, kita hitung nilai agregat dan simpan ke nilai_siswa
        await calculateAggregates(conn, siswa_id);

        await conn.commit();
        return NextResponse.json({ message: "Jawaban berhasil disimpan dan nilai agregat dihitung" }, { status: 201 });

    } catch (err) {
        if (conn) {
            await conn.rollback();
        }
        // Pastikan error dicatat
        console.error("POST Jawaban Siswa Error:", err);
        return NextResponse.json({ error: "Terjadi kesalahan server: " + err.message }, { status: 500 });
    } finally {
        if (conn) {
            conn.release(); // Pastikan koneksi dikembalikan ke pool
        }
    }
}
// app/admin/dashboard/page.js
"use client";
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-2 drop-shadow">
        Admin Dashboard Peminatan
      </h1>
      <p className="text-center mb-8 text-gray-600 text-base md:text-lg">
        Selamat Datang, Admin! Kelola data sistem di bawah ini.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/data-master/jurusan"
          className="group bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition hover:-translate-y-1 flex flex-col gap-2 hover:bg-blue-50"
        >
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2 group-hover:text-blue-900 transition">
            Kelola Jurusan 🛠️
          </h3>
          <p className="text-gray-600 text-sm">
            Tambah, edit, atau hapus daftar jurusan (Alternatif).
          </p>
        </Link>

        <Link
          href="/admin/data-master/kriteria"
          className="group bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition hover:-translate-y-1 flex flex-col gap-2 hover:bg-green-50"
        >
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 group-hover:text-green-900 transition">
            Kelola Kriteria 📊
          </h3>
          <p className="text-gray-600 text-sm">
            Atur kriteria penilaian (Minat, Bakat, dll.) dan tipe (Benefit/Cost).
          </p>
        </Link>

        <Link
          href="/admin/assessment/soal"
          className="group bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition hover:-translate-y-1 flex flex-col gap-2 hover:bg-purple-50"
        >
          <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2 group-hover:text-purple-900 transition">
            Kelola Soal Assessment ❓
          </h3>
          <p className="text-gray-600 text-sm">
            Buat, edit, dan tautkan soal dengan kriteria dan jurusan.
          </p>
        </Link>

        <Link
          href="/admin/ahp/input"
          className="group bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 shadow-lg hover:shadow-xl transition hover:-translate-y-1 flex flex-col gap-2"
        >
          <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2 group-hover:text-yellow-900 transition">
            Perhitungan AHP ⭐
          </h3>
          <p className="text-gray-700 text-sm">
            Input Matriks Perbandingan dan Hitung Bobot Kriteria.
          </p>
        </Link>

        <Link
          href="/admin/laporan/siswa"
          className="group bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition hover:-translate-y-1 flex flex-col gap-2 hover:bg-indigo-50"
        >
          <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2 group-hover:text-indigo-900 transition">
            Laporan Siswa 🎓
          </h3>
          <p className="text-gray-600 text-sm">
            Lihat daftar siswa, nilai assessment, dan hasil rekomendasi.
          </p>
        </Link>
      </div>
    </div>
  );
}

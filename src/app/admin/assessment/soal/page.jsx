"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaSoalPage() {
    const [soal, setSoal] = useState([]);
    const [kriteria, setKriteria] = useState([]);
    const [jurusan, setJurusan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ pertanyaan: '', kriteria_id: '', jurusan_id: '', tipe: 'skala' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setMessage('');
        try {
            const [resSoal, resKriteria, resJurusan] = await Promise.all([
                fetch('/api/soal'),
                fetch('/api/kriteria'),
                fetch('/api/jurusan')
            ]);
            const [dataSoal, dataKriteria, dataJurusan] = await Promise.all([
                resSoal.json(), resKriteria.json(), resJurusan.json()
            ]);
            setSoal(dataSoal);
            setKriteria(dataKriteria);
            setJurusan(dataJurusan);
            if (dataKriteria.length > 0) {
                setFormData(prev => ({ ...prev, kriteria_id: dataKriteria[0].id }));
            }
            if (dataJurusan.length > 0) {
                setFormData(prev => ({ ...prev, jurusan_id: dataJurusan[0].id }));
            }
        } catch (err) {
            setMessage('Gagal memuat data master soal.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: (name.includes('_id') ? Number(value) : value) });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const method = isEdit ? 'PATCH' : 'POST';
        const url = isEdit ? `/api/soal/${currentId}` : '/api/soal';
        if (!formData.kriteria_id && kriteria.length > 0) {
            setMessage('Kriteria harus dipilih.');
            return;
        }
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Soal ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ pertanyaan: '', kriteria_id: kriteria[0]?.id || '', jurusan_id: jurusan[0]?.id || '', tipe: 'skala' });
                setIsEdit(false);
                setCurrentId(null);
                fetchData();
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            pertanyaan: item.pertanyaan,
            kriteria_id: item.kriteria_id,
            jurusan_id: item.jurusan_id || '',
            tipe: item.tipe
        });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus soal ini? Ini akan menghapus semua jawaban siswa terkait.')) return;
        try {
            const res = await fetch(`/api/soal/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Soal berhasil dihapus.');
                fetchData();
            } else {
                const data = await res.json();
                setMessage(`Gagal menghapus: ${data.message || 'Terjadi kesalahan.'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg font-semibold text-blue-600 animate-pulse">Memuat soal dan data master...</div>
        </div>
    );

    if (kriteria.length === 0 || jurusan.length === 0) {
        return (
            <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Data Master Belum Lengkap</h1>
                <p className="mb-2">Silakan lengkapi data kriteria di <Link href="/admin/data-master/kriteria" className="text-blue-600 underline font-semibold">Halaman Kelola Kriteria</Link> dan jurusan di <Link href="/admin/data-master/jurusan" className="text-blue-600 underline font-semibold">Halaman Kelola Jurusan</Link>.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center drop-shadow-sm">{isEdit ? 'Edit Soal Assessment' : 'Tambah Soal Assessment Baru'}</h1>
            <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col gap-4">
                <textarea
                    name="pertanyaan"
                    placeholder="Masukkan teks pertanyaan di sini..."
                    onChange={handleInputChange}
                    value={formData.pertanyaan}
                    required
                    rows="3"
                    className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        name="kriteria_id"
                        onChange={handleInputChange}
                        value={formData.kriteria_id}
                        required
                        className="border border-gray-300 rounded-md p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">-- Pilih Kriteria --</option>
                        {kriteria.map(k => (
                            <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>
                    <select
                        name="jurusan_id"
                        onChange={handleInputChange}
                        value={formData.jurusan_id}
                        className="border border-gray-300 rounded-md p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">-- Pilih Jurusan (Opsional) --</option>
                        {jurusan.map(j => (
                            <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                    </select>
                    <select
                        name="tipe"
                        onChange={handleInputChange}
                        value={formData.tipe}
                        required
                        className="border border-gray-300 rounded-md p-3 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="skala">Skala 1-5 (Likert)</option>
                        <option value="pilihan">Pilihan Ganda</option>
                        <option value="isian">Isian Singkat</option>
                    </select>
                </div>
                <div className="flex gap-3 mt-2">
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow transition"
                    >
                        {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH SOAL'}
                    </button>
                    {isEdit && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEdit(false);
                                setFormData({ pertanyaan: '', kriteria_id: kriteria[0]?.id || '', jurusan_id: jurusan[0]?.id || '', tipe: 'skala' });
                                setCurrentId(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md shadow transition"
                        >
                            Batal Edit
                        </button>
                    )}
                </div>
                {message && (
                    <p className={`mt-2 font-medium ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </form>
            <h2 className="text-xl font-bold mb-4 mt-8 border-b pb-2 text-gray-700">Daftar Soal Assessment ({soal.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-blue-100">
                            <th className="py-3 px-2 text-center font-semibold text-gray-700">ID</th>
                            <th className="py-3 px-2 text-left font-semibold text-gray-700">Pertanyaan</th>
                            <th className="py-3 px-2 text-center font-semibold text-gray-700">Kriteria</th>
                            <th className="py-3 px-2 text-center font-semibold text-gray-700">Jurusan</th>
                            <th className="py-3 px-2 text-center font-semibold text-gray-700">Tipe</th>
                            <th className="py-3 px-2 text-center font-semibold text-gray-700">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {soal.map(item => (
                            <tr key={item.id} className="hover:bg-blue-50 transition">
                                <td className="py-2 px-2 text-center">{item.id}</td>
                                <td className="py-2 px-2 text-left">{item.pertanyaan.length > 80 ? item.pertanyaan.substring(0, 80) + '...' : item.pertanyaan}</td>
                                <td className="py-2 px-2 text-center">{item.kriteria_nama}</td>
                                <td className="py-2 px-2 text-center">{item.jurusan_nama || 'Umum'}</td>
                                <td className="py-2 px-2 text-center capitalize">{item.tipe}</td>
                                <td className="py-2 px-2 flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded shadow transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded shadow transition"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {soal.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-4 text-center text-gray-500">Belum ada soal assessment.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

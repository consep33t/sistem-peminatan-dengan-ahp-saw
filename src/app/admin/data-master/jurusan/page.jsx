"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaJurusanPage() {
    const [jurusan, setJurusan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ kode: '', nama: '', deskripsi: '' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchJurusan();
    }, []);

    const fetchJurusan = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jurusan');
            const data = await res.json();
            if (res.ok) {
                setJurusan(data);
            } else {
                setMessage(data.error || 'Gagal memuat data jurusan.');
            }
        } catch (err) {
            setMessage('Gagal memuat data jurusan.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const method = isEdit ? 'PATCH' : 'POST';
        const url = isEdit ? `/api/jurusan/${currentId}` : '/api/jurusan';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Jurusan ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ kode: '', nama: '', deskripsi: '' });
                setIsEdit(false);
                setCurrentId(null);
                fetchJurusan();
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({ kode: item.kode, nama: item.nama, deskripsi: item.deskripsi || '' });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jurusan ini? Ini akan menghapus semua relasi dan hasil perhitungan terkait!')) return;
        try {
            const res = await fetch(`/api/jurusan/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Jurusan berhasil dihapus.');
                fetchJurusan();
            } else {
                const data = await res.json();
                setMessage(`Gagal menghapus: ${data.message || 'Terjadi kesalahan.'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <span className="text-lg text-gray-600">Memuat data master...</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">{isEdit ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}</h1>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow border">
                <input
                    name="kode"
                    type="text"
                    placeholder="Kode (e.g., MPLB)"
                    onChange={handleInputChange}
                    value={formData.kode}
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                />
                <input
                    name="nama"
                    type="text"
                    placeholder="Nama Jurusan Lengkap"
                    onChange={handleInputChange}
                    value={formData.nama}
                    required
                    className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                />
                <textarea
                    name="deskripsi"
                    placeholder="Deskripsi Singkat (Opsional)"
                    onChange={handleInputChange}
                    value={formData.deskripsi}
                    rows="3"
                    className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
                />
                <div className="flex gap-2 flex-wrap">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                        {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH JURUSAN'}
                    </button>
                    {isEdit && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEdit(false);
                                setFormData({ kode: '', nama: '', deskripsi: '' });
                                setCurrentId(null);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                        >
                            Batal Edit
                        </button>
                    )}
                </div>
            </form>
            {message && (
                <p className={`mt-4 text-sm ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
            <h2 className="mt-10 mb-4 text-xl font-semibold border-b pb-2">Daftar Jurusan ({jurusan.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow border">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-medium">ID</th>
                            <th className="px-3 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-medium">Kode</th>
                            <th className="px-3 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-medium">Nama Jurusan</th>
                            <th className="px-3 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-medium">Deskripsi</th>
                            <th className="px-3 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jurusan.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border-b text-center text-xs md:text-sm">{item.id}</td>
                                <td className="px-3 py-2 border-b text-center text-xs md:text-sm">{item.kode}</td>
                                <td className="px-3 py-2 border-b text-left text-xs md:text-sm">{item.nama}</td>
                                <td className="px-3 py-2 border-b text-left text-xs md:text-sm">{item.deskripsi || '-'}</td>
                                <td className="px-3 py-2 border-b flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs md:text-sm transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs md:text-sm transition"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

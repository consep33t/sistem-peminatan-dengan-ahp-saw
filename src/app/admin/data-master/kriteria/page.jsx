"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KelolaKriteriaPage() {
    const [kriteria, setKriteria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ nama: '', tipe: 'benefit' });
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => {
        fetchKriteria();
    }, []);

    const fetchKriteria = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kriteria');
            const data = await res.json();
            if (res.ok) {
                setKriteria(data.map(k => ({
                    ...k,
                    bobot_ahp: parseFloat(k.bobot_ahp)
                })));
            } else {
                setMessage(data.error || 'Gagal memuat data kriteria.');
            }
        } catch (err) {
            setMessage('Gagal memuat data kriteria.');
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
        const url = isEdit ? `/api/kriteria/${currentId}` : '/api/kriteria';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Kriteria ${isEdit ? 'diperbarui' : 'ditambahkan'} berhasil!`);
                setFormData({ nama: '', tipe: 'benefit' });
                setIsEdit(false);
                setCurrentId(null);
                fetchKriteria();
            } else {
                setMessage(`Gagal: ${data.error || data.message || 'Terjadi kesalahan'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    const handleEdit = (item) => {
        setFormData({ nama: item.nama, tipe: item.tipe });
        setIsEdit(true);
        setCurrentId(item.id);
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus kriteria ini? Ini akan menghapus semua perbandingan dan jawaban yang terkait!')) return;
        try {
            const res = await fetch(`/api/kriteria/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Kriteria berhasil dihapus.');
                fetchKriteria();
            } else {
                const data = await res.json();
                setMessage(`Gagal menghapus: ${data.message || 'Terjadi kesalahan.'}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <span className="text-lg font-semibold text-blue-600 animate-pulse">Memuat data master...</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 bg-white rounded-xl shadow-lg mt-8 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6 text-center">
                {isEdit ? 'Edit Kriteria' : 'Tambah Kriteria Baru'}
            </h1>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 bg-blue-50 p-6 rounded-lg shadow">
                <input
                    name="nama"
                    type="text"
                    placeholder="Nama Kriteria (e.g., Minat)"
                    onChange={handleInputChange}
                    value={formData.nama}
                    required
                    className="px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                    name="tipe"
                    onChange={handleInputChange}
                    value={formData.tipe}
                    required
                    className="px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="benefit">Benefit (Semakin besar semakin baik)</option>
                    <option value="cost">Cost (Semakin kecil semakin baik)</option>
                </select>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
                    >
                        {isEdit ? 'SIMPAN PERUBAHAN' : 'TAMBAH KRITERIA'}
                    </button>
                    {isEdit && (
                        <button
                            type="button"
                            onClick={() => { setIsEdit(false); setFormData({ nama: '', tipe: 'benefit' }); setCurrentId(null); }}
                            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded transition"
                        >
                            Batal Edit
                        </button>
                    )}
                </div>
            </form>
            {message && (
                <p className={`mt-4 text-center font-medium ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
            <h2 className="text-xl font-semibold mt-10 mb-4 border-b pb-2 text-gray-700">
                Daftar Kriteria ({kriteria.length})
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg shadow-sm text-sm md:text-base">
                    <thead>
                        <tr className="bg-blue-100">
                            <th className="p-3 font-semibold text-gray-700">ID</th>
                            <th className="p-3 font-semibold text-gray-700">Nama Kriteria</th>
                            <th className="p-3 font-semibold text-gray-700">Tipe</th>
                            <th className="p-3 font-semibold text-gray-700">Bobot AHP</th>
                            <th className="p-3 font-semibold text-gray-700">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kriteria.map(item => (
                            <tr key={item.id} className="hover:bg-blue-50 transition">
                                <td className="p-3 border-t">{item.id}</td>
                                <td className="p-3 border-t">{item.nama}</td>
                                <td className="p-3 border-t">{item.tipe.toUpperCase()}</td>
                                <td className="p-3 border-t">{item.bobot_ahp ? item.bobot_ahp.toFixed(4) : '0.0000'}</td>
                                <td className="p-3 border-t flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow transition"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
                *Bobot AHP dihitung di halaman <span className="font-semibold text-blue-600">Perhitungan AHP</span>.
            </p>
        </div>
    );
}

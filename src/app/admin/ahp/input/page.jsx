"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AHPInputPage() {
    const [kriteria, setKriteria] = useState([]);
    const [matrixValues, setMatrixValues] = useState({}); // { 'id1-id2': value }
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [results, setResults] = useState(null); // Hasil akhir CR, Bobot

    useEffect(() => {
        fetchKriteriaData();
    }, []);

    // Mengambil kriteria dari database
    const fetchKriteriaData = async (keepResults = false) => { // ✅ PERBAIKAN: Tambahkan parameter keepResults
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/kriteria');
            const data = await res.json();
            
            if (res.ok) {
                // Pastikan kriteria adalah array dan bobot diubah ke float
                const parsedKriteria = data.map(k => ({
                    ...k,
                    bobot_ahp: parseFloat(k.bobot_ahp) || 0
                }));
                setKriteria(parsedKriteria);
                initializeMatrix(parsedKriteria, keepResults); // ✅ Teruskan keepResults
            } else {
                setMessage(data.error || 'Gagal memuat kriteria.');
                setKriteria([]); // Pastikan state kriteria kosong jika gagal
            }
        } catch (err) {
            setMessage('Kesalahan jaringan saat memuat kriteria.');
        } finally {
            setLoading(false);
        }
    };
    
    // Menginisialisasi matriks perbandingan dari kriteria yang ada
    const initializeMatrix = (data, keepResults = false) => { 
        const initialMatrix = {};
        
        // --- START: NILAI DEFAULT SESUAI GAMBAR ANDA (n=5) ---
        // Asumsi ID Kriteria berurutan 1, 2, 3, 4, 5 (Minat, Bakat, Akademik, Peluang, Psikotes)
        const defaultValues = [
            [1,   2,   3,   3,   3],     // Minat
            [0.5, 1,   3,   2,   3],     // Bakat
            [1/3, 1/3, 1,   2,   3],     // Nilai Akademik
            [1/3, 0.5, 0.5, 1,   1],     // Peluang Kerja
            [1/3, 1/3, 1/3, 1,   1]      // Psikotes
        ];
        // --- END: NILAI DEFAULT ---
        
        const ids = data.map(k => k.id);
        const n = data.length;

        data.forEach((k1, i) => {
            data.forEach((k2, j) => {
                const key = `${k1.id}-${k2.id}`;
                
                // Gunakan nilai default hanya jika n=5 dan ID kriteria sesuai urutan
                if (n === 5 && ids.every((id, idx) => id === (idx + 1))) {
                    initialMatrix[key] = defaultValues[i][j];
                } else if (k1.id === k2.id) {
                    initialMatrix[key] = 1; // Diagonal
                } else if (!initialMatrix[`${k2.id}-${k1.id}`]) {
                    // Jika n!=5 atau ID tidak berurutan, gunakan nilai 1 sebagai default untuk input utama
                    initialMatrix[key] = 1; 
                }
            });
        });

        setMatrixValues(initialMatrix);
        
        if (!keepResults) {
             setResults(null); 
        }
    };

    const handleMatrixChange = (id1, id2, value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) return; 

        setMatrixValues(prev => ({
            ...prev,
            [`${id1}-${id2}`]: numericValue,
            [`${id2}-${id1}`]: 1 / numericValue // Update nilai reciprocal (kebalikan)
        }));
    };

    // --- Langkah 1: Simpan Matriks Pairwise ---
    const handleSaveMatrix = async () => {
        setMessage('');
        setLoading(true);

        const matrixToSend = [];
        kriteria.forEach(k1 => {
            kriteria.forEach(k2 => {
                const key = `${k1.id}-${k2.id}`;
                // Hanya kirim nilai input utama (termasuk diagonal)
                if (k1.id <= k2.id) { 
                    matrixToSend.push({
                        kriteria_id_1: k1.id,
                        kriteria_id_2: k2.id,
                        nilai: matrixValues[key] || 1
                    });
                }
            });
        });
        
        try {
            const res = await fetch('/api/ahp/pairwise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matrix: matrixToSend }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage(`Berhasil: Matriks perbandingan telah disimpan/diupdate. Total entri: ${data.updatedCount}.`);
            } else {
                setMessage(`Gagal menyimpan matriks: ${data.error || data.message}`);
            }
        } catch (err) {
            setMessage('Kesalahan jaringan saat menyimpan matriks.');
        } finally {
            setLoading(false);
        }
    };

    // --- Langkah 2: Hitung Bobot & CR ---
    const handleCalculateAHP = async () => {
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/ahp/hitung-bobot', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                // Sukses dan Konsisten
                setMessage(`Sukses: ${data.message} Bobot telah diperbarui.`);
                setResults(data);
                fetchKriteriaData(true); // ✅ PERBAIKAN: Kirim TRUE agar hasil tidak hilang
            } else {
                // Gagal (Bisa jadi CR > 0.10 atau Server Error 500)
                const errorMsg = data.message || `Terjadi kesalahan server. Status: ${res.status}.`;
                // Mengakses data.CR dengan aman untuk pesan yang lebih informatif
                const crInfo = data.CR ? ` (CR: ${data.CR})` : '';
                
                setMessage(`Gagal: ${errorMsg}${crInfo}`);
                setResults(data); // Simpan hasil error (untuk ditampilkan di resultsBox)
            }
        } catch (err) {
            setMessage('Kesalahan jaringan saat menghitung AHP.');
            setResults(null); 
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="max-w-5xl mx-auto mt-12 p-6 text-center">Memuat data kriteria...</div>;

    if (kriteria.length < 3) {
        return (
            <div className="max-w-5xl mx-auto mt-12 p-6 text-center text-red-600">
                <h1 className="text-2xl font-semibold">Kriteria Minimal 3</h1>
                <p>Silakan tambah kriteria di <Link href="/admin/data-master/kriteria" className="text-teal-600 hover:underline">Halaman Kelola Kriteria</Link>.</p>
                {message && <p className="mt-2 text-red-600">{message}</p>}
            </div>
        );
    }

    // --- Logic Perhitungan Frontend Tambahan ---
    const n = kriteria.length;
    let CI_value = 0;
    if (results && results.lambdaMax) {
        const lambdaMax = parseFloat(results.lambdaMax);
        CI_value = (lambdaMax - n) / (n - 1);
    }
    // Nilai RI untuk n=5 adalah 1.12
    const RI_value = { 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32 }[n] || 1.49;
    const isNotConsistent = results && parseFloat(results.CR) > 0.10;
    
    // --- Akhir Logic Frontend Tambahan ---


        return (
                <div className="max-w-5xl mx-auto mt-8 p-6">
                        <h1 className="text-2xl text-teal-600 font-semibold">Perhitungan Bobot Kriteria (AHP)</h1>
                        <p className="text-sm text-slate-600 mt-1">Total Kriteria: <span className="font-medium">{kriteria.length}</span> ({kriteria.map(k => k.nama).join(', ')})</p>

                        {message && <p className={`mt-4 p-2 rounded ${message.includes('Sukses') || message.includes('Berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</p>}

                        {/* Matriks Perbandingan */}
                        <section className="mt-6">
                                <h2 className="text-lg font-medium border-b pb-2">1. Input Matriks Perbandingan Berpasangan</h2>

                                <div className="overflow-auto mt-4">
                                    <table className="w-full text-center border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2">Kriteria</th>
                                                {kriteria.map(k => (<th key={k.id} className="p-2">{k.nama}</th>))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kriteria.map((k1) => (
                                                <tr key={k1.id}>
                                                    <td className="p-2 font-semibold bg-gray-50">{k1.nama}</td>
                                                    {kriteria.map((k2) => {
                                                        const key = `${k1.id}-${k2.id}`;
                                                        if (k1.id === k2.id) {
                                                            return <td key={k2.id} className="p-2 bg-gray-200">1</td>;
                                                        } else if (k1.id > k2.id) {
                                                            return <td key={k2.id} className="p-2 text-teal-600">{(1 / (matrixValues[`${k2.id}-${k1.id}`] || 1)).toFixed(4)}</td>;
                                                        } else {
                                                            return (
                                                                <td key={k2.id} className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="9"
                                                                        step="0.0001"
                                                                        value={matrixValues[key] || 1}
                                                                        onChange={(e) => handleMatrixChange(k1.id, k2.id, e.target.value)}
                                                                        className="w-24 px-2 py-1 border rounded text-center"
                                                                    />
                                                                </td>
                                                            );
                                                        }
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <button onClick={handleSaveMatrix} disabled={loading} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-md font-semibold">{loading && message.includes('menyimpan') ? 'Menyimpan...' : '1. Simpan Matriks'}</button>
                                </div>
                        </section>

                        {/* Perhitungan Hasil */}
                        <section className="mt-8">
                                <h2 className="text-lg font-medium border-b pb-2">2. Hitung Bobot Prioritas & Konsistensi</h2>
                                <div className="mt-3">
                                        <button onClick={handleCalculateAHP} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold">{loading && message.includes('menghitung') ? 'Menghitung...' : '2. Hitung Bobot & CR'}</button>
                                </div>

                                {results && (
                                        <div className={`mt-4 p-4 rounded border ${isNotConsistent ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                                                <h3 className="text-lg font-semibold">Hasil Perhitungan AHP</h3>

                                                <h4 className="mt-3 font-medium">Tabel Bobot Akhir:</h4>
                                                <div className="overflow-auto mt-2">
                                                    <table className="w-full text-center border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="p-2">Kriteria</th>
                                                                <th className="p-2">Bobot (Prioritas)</th>
                                                                <th className="p-2">Persentase</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {results.bobot.map((b, i) => {
                                                                const totalBobot = results.bobot.reduce((sum, item) => sum + parseFloat(item.bobot), 0);
                                                                const percentage = (parseFloat(b.bobot) / totalBobot) * 100;

                                                                return (
                                                                    <tr key={i}>
                                                                        <td className="p-2">{b.nama}</td>
                                                                        <td className="p-2">{parseFloat(b.bobot).toFixed(6)}</td>
                                                                        <td className="p-2">{percentage.toFixed(2)}%</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <h4 className="mt-4 font-medium">Cek Konsistensi (CR)</h4>
                                                <div className="mt-2 border-t pt-2">
                                                        <p className="font-mono">CI = ({results.lambdaMax} - {n}) / ({n} - 1) = {CI_value.toFixed(6)}</p>
                                                        <p className="font-mono mt-1">CR = {CI_value.toFixed(6)} / {RI_value.toFixed(2)} = {results.CR}</p>
                                                </div>

                                                <p className="mt-3 font-semibold">Status: <span className={isNotConsistent ? 'text-red-600' : 'text-green-600'}>{parseFloat(results.CR) > 0.10 ? 'TIDAK KONSISTEN' : 'KONSISTEN'}</span></p>
                                                <p className="text-sm text-slate-700 mt-2">{results.message}</p>
                                        </div>
                                )}
                        </section>
                </div>
        );
}

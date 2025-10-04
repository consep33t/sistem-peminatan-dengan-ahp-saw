"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LaporanSiswaPage() {
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        fetchLaporan();
    }, []);

    const fetchLaporan = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/laporan');
            const data = await res.json();

            if (res.ok) {
                setLaporan(data);
            } else {
                setMessage(data.error || 'Gagal memuat laporan siswa.');
            }
        } catch (err) {
            setMessage('Kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger small mount animation for chart bars when detail modal opens
    useEffect(() => {
        if (detailOpen && detailData && detailData.ranking_lengkap && detailData.ranking_lengkap.length) {
            setChartReady(false);
            const t = setTimeout(() => setChartReady(true), 60);
            return () => clearTimeout(t);
        }
        setChartReady(false);
    }, [detailOpen, detailData]);

    // Render a lightweight horizontal bar chart for ranking_lengkap
    const renderRankingChart = (ranking = []) => {
        if (!ranking || !ranking.length) return null;
        const scores = ranking.map(r => Number(r.skor) || 0);
        const maxScore = Math.max(...scores, 0);

        return (
            <div className="space-y-2">
                {ranking.map(r => {
                    const score = Number(r.skor) || 0;
                    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                    return (
                        <div key={r.jurusan} className="flex items-center gap-3">
                            <div className="w-8 text-sm text-slate-600">#{r.ranking}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-sm font-medium text-slate-700">{r.jurusan}</div>
                                    <div className="text-sm text-slate-500">{Number(r.skor).toFixed(6)}</div>
                                </div>
                                <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
                                    <div
                                        className="h-3 bg-emerald-500 rounded transition-all"
                                        style={{ width: chartReady ? `${pct}%` : '0%' }}
                                        title={`${r.jurusan}: ${score}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Memuat laporan...</div>;
    if (message) return <div className="flex justify-center items-center min-h-screen text-red-600">{message}</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">Laporan Rekomendasi Siswa</h1>
            <p className="mb-6 text-base md:text-lg">
                Total Siswa dengan Hasil: <strong>{laporan.length}</strong>
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">NISN</th>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">Nama Siswa</th>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">Kelas</th>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">Rekomendasi Utama (Rank 1)</th>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">Skor SAW</th>
                            <th className="px-4 py-2 border-b bg-gray-100 text-left text-xs md:text-sm font-semibold">Lihat Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laporan.map(item => (
                            <tr key={item.siswa_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b text-xs md:text-sm">{item.nisn}</td>
                                <td className="px-4 py-2 border-b text-xs md:text-sm">{item.nama}</td>
                                <td className="px-4 py-2 border-b text-xs md:text-sm">{item.kelas}</td>
                                <td className="px-4 py-2 border-b font-bold text-green-600 text-xs md:text-sm">
                                    {item.jurusan_rekomendasi || 'Belum Dihitung'}
                                </td>
                                <td className="px-4 py-2 border-b text-xs md:text-sm">
                                    {item.skor_saw ? parseFloat(item.skor_saw).toFixed(6) : '-'}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <button
                                        onClick={async () => {
                                            // Open modal and fetch rekomendasi details for this siswa
                                            setDetailOpen(true);
                                            setDetailLoading(true);
                                            setDetailData(null);
                                            try {
                                                const res = await fetch(`/api/rekomendasi?siswa_id=${item.siswa_id}`);
                                                const data = await res.json();
                                                if (res.ok) setDetailData(data);
                                                else setDetailData({ error: data.error || data.message || 'Gagal memuat detail.' });
                                            } catch (err) {
                                                setDetailData({ error: 'Kesalahan jaringan saat memuat detail.' });
                                            } finally {
                                                setDetailLoading(false);
                                            }
                                        }}
                                        className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs md:text-sm transition"
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for detail */}
            {detailOpen && (
                <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDetailOpen(false)} />
                    <div className="relative z-50 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-auto max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Detail Rekomendasi</h3>
                            <button className="text-slate-600 dark:text-slate-200" onClick={() => setDetailOpen(false)}>Tutup</button>
                        </div>
                        <div className="p-4">
                            {detailLoading ? (
                                <div className="text-center p-6">Memuat detail...</div>
                            ) : detailData ? (
                                detailData.error ? (
                                    <div className="text-red-600">{detailData.error}</div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded">
                                            <p><strong>Siswa:</strong> {detailData.siswa?.nama || item.nama}</p>
                                            <p><strong>NISN:</strong> {detailData.siswa?.nisn || item.nisn}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Rekomendasi Utama</h4>
                                            {detailData.rekomendasi_utama ? (
                                                <div className="p-3 bg-emerald-600 text-white rounded">
                                                    <div className="text-lg font-semibold">{detailData.rekomendasi_utama.jurusan}</div>
                                                    <div>Skor: {detailData.rekomendasi_utama.skor}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-600">Belum ada rekomendasi utama.</div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Ranking Lengkap</h4>
                                            {detailData.ranking_lengkap && detailData.ranking_lengkap.length ? (
                                                <div className="space-y-4">
                                                    {/* Chart visualization */}
                                                    <div className="p-3 bg-white rounded shadow-sm border">
                                                        <h5 className="text-sm font-medium mb-2">Visualisasi Skor per Jurusan</h5>
                                                        {renderRankingChart(detailData.ranking_lengkap)}
                                                    </div>

                                                    {/* Table for precise values */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full table-auto">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="p-2 text-left">Ranking</th>
                                                                    <th className="p-2 text-left">Jurusan</th>
                                                                    <th className="p-2 text-left">Skor</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {detailData.ranking_lengkap.map(r => (
                                                                    <tr key={r.ranking} className={r.ranking === 1 ? 'font-semibold bg-amber-50' : ''}>
                                                                        <td className="p-2">{r.ranking}</td>
                                                                        <td className="p-2">{r.jurusan}</td>
                                                                        <td className="p-2">{r.skor}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-600">Ranking tidak tersedia.</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-sm text-slate-600">Tidak ada data detail.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

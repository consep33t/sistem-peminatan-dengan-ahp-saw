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

    if (loading) return <div style={styles.container}>Memuat data kriteria...</div>;

    if (kriteria.length < 3) {
        return (
            <div style={{ ...styles.container, textAlign: 'center', color: 'red' }}>
                <h1 style={styles.header}>Kriteria Minimal 3</h1>
                <p>Silakan tambah kriteria di <Link href="/admin/data-master/kriteria" style={styles.link}>Halaman Kelola Kriteria</Link>.</p>
                {message && <p style={{ marginTop: '10px', color: 'red' }}>{message}</p>}
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
    
    const dynamicResultsBoxStyle = {
        ...styles.resultsBox,
        borderColor: isNotConsistent ? 'red' : '#28a745',
    };
    // --- Akhir Logic Frontend Tambahan ---


    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Perhitungan Bobot Kriteria (AHP)</h1>
            <p style={styles.info}>**Total Kriteria:** {kriteria.length} ({kriteria.map(k => k.nama).join(', ')})</p>
            
            {message && <p style={{ ...styles.message, color: message.includes('Sukses') || message.includes('Berhasil') ? 'green' : 'red' }}>{message}</p>}

            {/* Matriks Perbandingan */}
            <div style={styles.matrixSection}>
                <h2 style={styles.subHeader}>1. Input Matriks Perbandingan Berpasangan</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Kriteria</th>
                            {kriteria.map(k => (<th key={k.id} style={styles.th}>{k.nama}</th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {kriteria.map((k1) => (
                            <tr key={k1.id}>
                                <td style={{...styles.td, fontWeight: 'bold', backgroundColor: '#f2f2f2'}}>{k1.nama}</td>
                                {kriteria.map((k2) => {
                                    const key = `${k1.id}-${k2.id}`;
                                    // Kasus 1: Diagonal (Selalu 1)
                                    if (k1.id === k2.id) {
                                        return <td key={k2.id} style={{...styles.td, backgroundColor: '#ddd'}}>1</td>;
                                    // Kasus 2: Nilai Kebalikan (Reciprocal, Input di kolom kebalikannya)
                                    } else if (k1.id > k2.id) { 
                                        return <td key={k2.id} style={{...styles.td, color: '#007bff'}}>{(1 / (matrixValues[`${k2.id}-${k1.id}`] || 1)).toFixed(4)}</td>;
                                    // Kasus 3: Input Utama
                                    } else {
                                        return (
                                            <td key={k2.id} style={styles.tdInput}>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max="9" 
                                                    step="0.0001" // Ganti step ke 0.0001 untuk presisi desimal
                                                    value={matrixValues[key] || 1}
                                                    onChange={(e) => handleMatrixChange(k1.id, k2.id, e.target.value)}
                                                    style={styles.input}
                                                />
                                            </td>
                                        );
                                    }
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={handleSaveMatrix} disabled={loading} style={styles.buttonSave}>
                    {loading && message.includes('menyimpan') ? 'Menyimpan...' : '1. Simpan Matriks'}
                </button>
            </div>

            {/* Perhitungan Hasil */}
            <div style={styles.resultsSection}>
                <h2 style={styles.subHeader}>2. Hitung Bobot Prioritas & Konsistensi</h2>
                <button onClick={handleCalculateAHP} disabled={loading} style={styles.buttonCalculate}>
                    {loading && message.includes('menghitung') ? 'Menghitung...' : '2. Hitung Bobot & CR'}
                </button>
                
                {/* Hasil Perhitungan AHP */}
                {results && (
                    <div style={dynamicResultsBoxStyle}> 
                        <h3>Hasil Perhitungan AHP</h3>
                        
                        {/* Tabel Bobot Akhir */}
                        <h4 style={{marginTop: '15px'}}>Tabel Bobot Akhir:</h4>
                        <table style={styles.table}>
                             <thead>
                                <tr>
                                    <th style={styles.th}>Kriteria</th>
                                    <th style={styles.th}>Bobot (Prioritas)</th>
                                    <th style={styles.th}>Persentase</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.bobot.map((b, i) => {
                                    const totalBobot = results.bobot.reduce((sum, item) => sum + parseFloat(item.bobot), 0);
                                    const percentage = (parseFloat(b.bobot) / totalBobot) * 100;

                                    return (
                                        <tr key={i}>
                                            <td style={styles.td}>{b.nama}</td>
                                            <td style={styles.td}>{parseFloat(b.bobot).toFixed(6)}</td>
                                            <td style={styles.td}>{percentage.toFixed(2)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>


                        {/* Perhitungan Konsistensi Detail */}
                        <h4 style={{marginTop: '25px'}}>Cek Konsistensi (CR)</h4>
                        
                        {/* Ganti elemen p terluar dengan div */}
                        <div style={styles.ciFormula}> 
                            <p><strong>CI = ($\lambda$max - n) / (n - 1)</strong></p>
                            <p style={styles.ciValue}>
                                CI = ({results.lambdaMax} - {n}) / ({n} - 1) 
                                = {CI_value.toFixed(6)}
                            </p>
                        </div>

                        <div style={styles.ciFormula}>
                            <p><strong>CR = CI / RI</strong></p>
                            <p style={styles.ciValue}>
                                CR = {CI_value.toFixed(6)} / {RI_value.toFixed(2)} 
                                = {results.CR}
                            </p>
                        </div>
                        

                        <p style={styles.statusMessage}>
                            Status: <span style={{ color: isNotConsistent ? 'red' : 'green', fontWeight: 'bold' }}>
                                {parseFloat(results.CR) > 0.10 ? 'TIDAK KONSISTEN' : 'KONSISTEN'}
                            </span>
                        </p>
                        <p style={{...styles.statusMessage, color: '#333'}}>
                            {results.message}
                        </p>
                        
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1000px', margin: '50px auto', padding: '20px' },
    header: { color: '#007bff', marginBottom: '20px' },
    subHeader: { marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px', fontSize: '1.2em' },
    info: { color: '#555', marginBottom: '20px' },
    link: { color: '#007bff', textDecoration: 'none', fontWeight: 'bold' },
    message: { padding: '10px', border: '1px solid', borderRadius: '4px', marginTop: '10px' },
    
    // Matriks Styling
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '8px', textAlign: 'center' },
    tdInput: { border: '1px solid #ddd', padding: '2px', textAlign: 'center' },
    input: { width: '80%', padding: '5px', border: 'none', textAlign: 'center' },

    // Buttons
    buttonSave: { padding: '10px 20px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' },
    buttonCalculate: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
    
    // Results
    resultsBox: { 
        border: '2px solid', 
        padding: '20px', 
        borderRadius: '6px', 
        marginTop: '15px', 
        backgroundColor: '#f0fff0',
    },
    statusMessage: { marginTop: '10px', fontWeight: 'bold' },
    ciFormula: { marginTop: '15px', borderTop: '1px dashed #ccc', paddingTop: '10px' },
    ciValue: { fontFamily: 'monospace', fontSize: '1em' }
};

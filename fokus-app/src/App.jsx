import { useState, useEffect } from 'react'
import './App.css'
import RencanaBelajar from './RencanaBelajar'
import { useLocalStorage } from './data'

// Daftar mode: nama tampilan dan durasi (menit). Ubah angkanya sesukamu.
const MODES = {
  fokus: { label: 'Fokus', menit: 25 },
  istirahat: { label: 'Istirahat', menit: 5 },
  panjang: { label: 'Istirahat panjang', menit: 15 },
}

// Keliling lingkaran (2 × π × jari-jari 90), dipakai untuk animasi cincin
const KELILING = 2 * Math.PI * 90

// Ubah detik menjadi teks "25:00"
function formatWaktu(detik) {
  const m = String(Math.floor(detik / 60)).padStart(2, '0')
  const s = String(detik % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function App() {
  const [mode, setMode] = useState('fokus')
  const [sisa, setSisa] = useState(MODES.fokus.menit * 60) // sisa waktu, dalam detik
  const [jalan, setJalan] = useState(false) // timer sedang berjalan?

  // Dua data ini tersimpan di browser, jadi tidak hilang saat refresh
  const [topikAktif, setTopikAktif] = useLocalStorage('topik-aktif', 'Web Dev')
  const [sesiPerTopik, setSesiPerTopik] = useLocalStorage('sesi-per-topik', {})

  const total = MODES[mode].menit * 60

  // 1) Hitung mundur: tiap 1 detik kurangi sisa waktu
  useEffect(() => {
    if (!jalan) return
    const id = setInterval(() => setSisa((s) => s - 1), 1000)
    return () => clearInterval(id) // bersihkan saat dijeda
  }, [jalan])

  // 2) Saat waktu habis: hentikan timer, catat sesi fokus untuk topik aktif
  useEffect(() => {
    if (sisa > 0 || !jalan) return
    setJalan(false)
    if (mode === 'fokus') {
      setSesiPerTopik((p) => ({ ...p, [topikAktif]: (p[topikAktif] ?? 0) + 1 }))
    }
  }, [sisa, jalan, mode, topikAktif, setSesiPerTopik])

  // 3) Tampilkan sisa waktu di judul tab browser
  useEffect(() => {
    document.title = `${formatWaktu(sisa)} · ${MODES[mode].label}`
  }, [sisa, mode])

  function ganti(modeBaru) {
    setMode(modeBaru)
    setSisa(MODES[modeBaru].menit * 60)
    setJalan(false)
  }

  function reset() {
    setSisa(total)
    setJalan(false)
  }

  const selesai = sisa === 0

  return (
    <main className="app" data-mode={mode}>
      <nav className="modes" aria-label="Pilih mode">
        {Object.entries(MODES).map(([kunci, m]) => (
          <button
            key={kunci}
            className={kunci === mode ? 'mode aktif' : 'mode'}
            onClick={() => ganti(kunci)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <div className="timer">
        <svg viewBox="0 0 200 200" className="cincin" aria-hidden="true">
          <circle className="jalur" cx="100" cy="100" r="90" />
          <circle
            className="progres"
            cx="100"
            cy="100"
            r="90"
            strokeDasharray={KELILING}
            strokeDashoffset={KELILING * (1 - sisa / total)}
          />
        </svg>
        <div className="waktu" role="timer">
          {formatWaktu(sisa)}
        </div>
      </div>

      <p className="status">
        {selesai
          ? 'Waktu habis. Pilih mode berikutnya.'
          : jalan
            ? `Sedang belajar ${topikAktif}`
            : `Siap belajar ${topikAktif}`}
      </p>

      <div className="kontrol">
        <button
          className="utama"
          onClick={() => setJalan(!jalan)}
          disabled={selesai}
        >
          {jalan ? 'Jeda' : 'Mulai'}
        </button>
        <button className="sekunder" onClick={reset}>
          Reset
        </button>
      </div>

      <RencanaBelajar
        topikAktif={topikAktif}
        setTopikAktif={setTopikAktif}
        sesiPerTopik={sesiPerTopik}
      />
    </main>
  )
}

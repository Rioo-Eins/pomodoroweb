import { useState, useEffect, useRef } from 'react'
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

// Bunyi alarm: tiga nada naik (E5, G5, C6), diulang dua kali.
// Dibuat langsung dengan Web Audio API, jadi tidak perlu file suara.
function mainkanBunyi(ctx) {
  const nada = [659.25, 783.99, 1046.5]
  for (let ulang = 0; ulang < 2; ulang++) {
    nada.forEach((frekuensi, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const mulai = ctx.currentTime + ulang * 1.4 + i * 0.35
      osc.type = 'sine'
      osc.frequency.value = frekuensi
      gain.gain.setValueAtTime(0.0001, mulai)
      gain.gain.exponentialRampToValueAtTime(0.3, mulai + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, mulai + 0.9)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(mulai)
      osc.stop(mulai + 1)
    })
  }
}

export default function App() {
  const [mode, setMode] = useState('fokus')
  const [sisa, setSisa] = useState(MODES.fokus.menit * 60) // sisa waktu, dalam detik
  const [jalan, setJalan] = useState(false) // timer sedang berjalan?

  // Data ini tersimpan di browser, jadi tidak hilang saat refresh
  const [topikAktif, setTopikAktif] = useLocalStorage('topik-aktif', 'Web Dev')
  const [sesiPerTopik, setSesiPerTopik] = useLocalStorage('sesi-per-topik', {})
  const [suaraAktif, setSuaraAktif] = useLocalStorage('suara-aktif', true)

  const akhirRef = useRef(0) // kapan timer harus berakhir (cap waktu, ms)
  const audioRef = useRef(null) // pemutar suara

  const total = MODES[mode].menit * 60

  // Browser hanya mengizinkan suara setelah pengguna mengklik sesuatu,
  // jadi pemutar disiapkan saat tombol Mulai atau Tes suara ditekan.
  function siapkanAudio() {
    if (!audioRef.current) {
      const Konteks = window.AudioContext || window.webkitAudioContext
      audioRef.current = new Konteks()
    }
    if (audioRef.current.state === 'suspended') audioRef.current.resume()
    return audioRef.current
  }

  // 1) Hitung mundur berdasarkan jam sungguhan, bukan menghitung tick.
  //    Dengan begini waktu tetap akurat walau tab sedang di latar belakang.
  useEffect(() => {
    if (!jalan) return
    const id = setInterval(() => {
      const sisaBaru = Math.max(
        0,
        Math.ceil((akhirRef.current - Date.now()) / 1000),
      )
      setSisa(sisaBaru)
    }, 250)
    return () => clearInterval(id) // bersihkan saat dijeda
  }, [jalan])

  // 2) Saat waktu habis: bunyikan alarm, hentikan timer, catat sesi fokus
  useEffect(() => {
    if (sisa > 0 || !jalan) return
    setJalan(false)
    if (suaraAktif && audioRef.current) mainkanBunyi(audioRef.current)
    if (mode === 'fokus') {
      setSesiPerTopik((p) => ({ ...p, [topikAktif]: (p[topikAktif] ?? 0) + 1 }))
    }
  }, [sisa, jalan, mode, topikAktif, suaraAktif, setSesiPerTopik])

  // 3) Tampilkan sisa waktu di judul tab browser
  useEffect(() => {
    document.title = `${formatWaktu(sisa)} · ${MODES[mode].label}`
  }, [sisa, mode])

  function mulaiAtauJeda() {
    if (jalan) {
      setJalan(false)
      return
    }
    siapkanAudio()
    akhirRef.current = Date.now() + sisa * 1000
    setJalan(true)
  }

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
        <button className="utama" onClick={mulaiAtauJeda} disabled={selesai}>
          {jalan ? 'Jeda' : 'Mulai'}
        </button>
        <button className="sekunder" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="opsi">
        <button
          className="kecil"
          aria-pressed={suaraAktif}
          onClick={() => setSuaraAktif(!suaraAktif)}
        >
          Alarm {suaraAktif ? 'aktif' : 'mati'}
        </button>
        <button className="kecil" onClick={() => mainkanBunyi(siapkanAudio())}>
          Tes suara
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

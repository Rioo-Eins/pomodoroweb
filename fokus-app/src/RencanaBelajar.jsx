import { useState } from 'react'
import { TOPIK, TOPIK_WARNA, RENCANA_AWAL, useLocalStorage } from './data'

export default function RencanaBelajar({
  topikAktif,
  setTopikAktif,
  sesiPerTopik,
}) {
  // Semua rencana disimpan di browser dengan kunci 'rencana-belajar'
  const [rencana, setRencana] = useLocalStorage('rencana-belajar', RENCANA_AWAL)
  const [teksBaru, setTeksBaru] = useState('')

  const daftar = rencana[topikAktif] ?? []
  const jumlahSelesai = daftar.filter((item) => item.selesai).length
  const persen = daftar.length
    ? Math.round((jumlahSelesai / daftar.length) * 100)
    : 0
  const sesi = sesiPerTopik[topikAktif] ?? 0

  // Helper: ubah daftar milik topik yang sedang aktif
  function ubahDaftar(fn) {
    setRencana((prev) => ({
      ...prev,
      [topikAktif]: fn(prev[topikAktif] ?? []),
    }))
  }

  function tambah(e) {
    e.preventDefault() // cegah halaman reload saat form dikirim
    const teks = teksBaru.trim()
    if (!teks) return
    ubahDaftar((d) => [...d, { id: Date.now(), teks, selesai: false }])
    setTeksBaru('')
  }

  function centang(id) {
    ubahDaftar((d) =>
      d.map((item) =>
        item.id === id ? { ...item, selesai: !item.selesai } : item,
      ),
    )
  }

  function hapus(id) {
    ubahDaftar((d) => d.filter((item) => item.id !== id))
  }

  return (
    <section
      className="rencana"
      aria-label="Rencana belajar"
      style={{ '--warna': TOPIK_WARNA[topikAktif] }}
    >
      <h2>Rencana belajar</h2>

      <div className="topik">
        {TOPIK.map((t) => (
          <button
            key={t}
            className={t === topikAktif ? 'chip aktif' : 'chip'}
            aria-pressed={t === topikAktif}
            style={{ '--warna': TOPIK_WARNA[t] }}
            onClick={() => setTopikAktif(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="ringkasan">
        <span>
          {jumlahSelesai} dari {daftar.length} materi selesai
        </span>
        <span>{sesi} sesi fokus</span>
      </div>
      <div className="bar">
        <div className="bar-isi" style={{ width: `${persen}%` }} />
      </div>

      {daftar.length === 0 ? (
        <p className="kosong">
          Belum ada materi untuk {topikAktif}. Tambahkan yang pertama di bawah.
        </p>
      ) : (
        <ul className="daftar">
          {daftar.map((item) => (
            <li key={item.id} className={item.selesai ? 'item selesai' : 'item'}>
              <label>
                <input
                  type="checkbox"
                  checked={item.selesai}
                  onChange={() => centang(item.id)}
                />
                <span>{item.teks}</span>
              </label>
              <button
                className="hapus"
                onClick={() => hapus(item.id)}
                aria-label={`Hapus ${item.teks}`}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="tambah" onSubmit={tambah}>
        <input
          type="text"
          value={teksBaru}
          onChange={(e) => setTeksBaru(e.target.value)}
          placeholder={`Tambah materi ${topikAktif}`}
          aria-label="Materi baru"
        />
        <button type="submit">Tambah</button>
      </form>
    </section>
  )
}

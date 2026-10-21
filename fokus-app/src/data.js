import { useState, useEffect } from 'react'

// Daftar topik belajar. Tambah atau ubah namanya di sini.
export const TOPIK = [
  'Web Dev',
  'Cyber Security',
  'Networking',
  'Excel',
  'Elektronika',
]

// Warna tiap topik (dipakai untuk titik chip, bar progres, dan centang)
export const TOPIK_WARNA = {
  'Web Dev': '#38bdf8',
  'Cyber Security': '#fb7185',
  Networking: '#a78bfa',
  Excel: '#34d399',
  Elektronika: '#fbbf24',
}

// Ubah daftar teks menjadi daftar item { id, teks, selesai }
const buat = (daftar) =>
  daftar.map((teks, i) => ({ id: i + 1, teks, selesai: false }))

// Isi awal tiap topik. Bebas kamu ubah, tambah, atau hapus nanti di aplikasi.
export const RENCANA_AWAL = {
  'Web Dev': buat([
    'HTML dan CSS dasar',
    'JavaScript dasar',
    'React dasar (komponen, state, effect)',
    'Selesaikan proyek timer fokus ini',
  ]),
  'Cyber Security': buat([
    'Konsep CIA triad',
    'Keamanan password dan 2FA',
    'Dasar kriptografi (hash, enkripsi)',
    'Latihan di platform belajar seperti TryHackMe',
  ]),
  Networking: buat([
    'Model OSI dan TCP/IP',
    'IP address dan subnetting',
    'DNS dan DHCP',
    'Simulasi jaringan di Cisco Packet Tracer',
  ]),
  Excel: buat([
    'Rumus dasar (SUM, AVERAGE, IF)',
    'VLOOKUP dan XLOOKUP',
    'Pivot Table',
    'Grafik dan dashboard sederhana',
  ]),
  Elektronika: buat([
    'Hukum Ohm',
    'Komponen dasar (resistor, kapasitor, LED)',
    'Rangkaian sederhana di breadboard',
    'Dasar Arduino',
  ]),
}

// Seperti useState, tetapi nilainya tersimpan di browser (localStorage)
// sehingga tidak hilang saat halaman dimuat ulang.
export function useLocalStorage(kunci, awal) {
  const [nilai, setNilai] = useState(() => {
    try {
      const tersimpan = localStorage.getItem(kunci)
      return tersimpan ? JSON.parse(tersimpan) : awal
    } catch {
      return awal
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(kunci, JSON.stringify(nilai))
    } catch {
      /* abaikan jika penyimpanan penuh atau diblokir */
    }
  }, [kunci, nilai])

  return [nilai, setNilai]
}

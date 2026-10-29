Dokumentasi MD Project Kuis Pilgan Interaktif (Kuis Ceria)

1. Deskripsi Project
   Kuis ceria adalah kuis pilgan interaktif buat anak SD kelas 1. Game ini dibuat untuk membantu anak-anak belajar sambil bermain. Didalam game ini ada soal bergambar, tampilan yang warna warni, timer, efek suara dan skor.

2. Teknologi yang digunakan
   HTML untuk membuat struktur halaman.
   CSS untuk mnegatur tampilan seperti bahckround, font, ukuran font.
   JavaScript untuk logika permainan.
   Firebase Firestore untuk menyimpan dan mengambil data soal.
   Apache Cordova untuk mengemas apk menjadi apk android.
   Web Audio API untuk menghasilkan suara saat benar/salah.

3. Struktur File
   www\
    css\
    index.css
   gambar\
    15 gambar
   js\
    index.js
   index.html
   README.md
   script.js
   style.css

4. Fitur Aplikasi
   1. Menampilkan 15 sial pilgan.
   2. Urutan soal yang acak.
   3. Timer 20 detik per soal.
   4. 10 poin untuk jawaban benar.
   5. Menampilkan feedback dan efek suara.
   6. Menampilkan skor akhir, bintang dan predikat.
   7. Fitur bermain lagi.

5. Database Firestore
   Data soal disimpan di koleksi soal. setiap dokumen berisi field dan tipe data:
   1. pertanyaan (string)
   2. pilihanA (string)
   3. pilihanB (string)
   4. pilihanC (string)
   5. pilihanD (string)
   6. jawaban (string)

6. Kesimpulan
   Game Kuis Ceria ini merupakan media belajar interaktif yang menggabungkan soal gambar, timer, fek suara, dan penilaian otomatis untuk membuat kgiatan belajar anak menjadi lebih menarik.

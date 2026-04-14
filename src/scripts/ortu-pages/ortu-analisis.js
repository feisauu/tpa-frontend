import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";

const NILAI_COLOR = {
  A: "#16a34a",
  "B+": "#22c55e",
  B: "#3b82f6",
  "B-": "#6366f1",
  "C+": "#f59e0b",
  C: "#f97316",
  "C-": "#ef4444",
  D: "#b91c1c",
};
const NILAI_BG = {
  A: "#dcfce7",
  "B+": "#dcfce7",
  B: "#dbeafe",
  "B-": "#e0e7ff",
  "C+": "#fef9c3",
  C: "#ffedd5",
  "C-": "#fee2e2",
  D: "#fee2e2",
};
const NILAI_LABEL = {
  A: "Sangat Baik 🌟",
  "B+": "Baik Sekali ✨",
  B: "Baik 👍",
  "B-": "Cukup Baik 🙂",
  "C+": "Cukup 😊",
  C: "Perlu Latihan 📚",
  "C-": "Perlu Bimbingan 🤝",
  D: "Butuh Perhatian ❤️",
};
const SKALA = {
  A: 5.0,
  "B+": 4.5,
  B: 4.0,
  "B-": 3.5,
  "C+": 3.0,
  C: 2.5,
  "C-": 2.0,
  D: 1.5,
};

function toGrade(avg) {
  if (avg >= 4.75) return "A";
  if (avg >= 4.25) return "B+";
  if (avg >= 3.75) return "B";
  if (avg >= 3.25) return "B-";
  if (avg >= 2.75) return "C+";
  if (avg >= 2.25) return "C";
  if (avg >= 1.75) return "C-";
  return "D";
}

function nilaiMatriksArr(nilaiArr, jenis) {
  const rows = nilaiArr.filter((n) => n.jenis === jenis);
  if (rows.length === 0) return 0;
  const avg = rows.reduce((s, n) => s + (SKALA[n.nilai] || 0), 0) / rows.length;
  return SKALA[toGrade(avg)] || 0;
}

export async function renderOrtuAnalisis() {
  const app = document.getElementById("app");

  const namaSiswa = localStorage.getItem("namaSiswa") || "-";
  const kelas = localStorage.getItem("kelas") || "-";
  const siswaId = localStorage.getItem("siswaId");
  const kelasId = localStorage.getItem("kelasId");
  const isAlquran =
    kelas.toLowerCase().includes("qur") || kelas.toLowerCase() === "al-quran";

  const initials = namaSiswa
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const avatarBg = isAlquran ? "#16a34a" : "#3b82f6";

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("ortu-analisis")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Perkembangan Belajar</h2>
            <p class="ag-subtitle">Laporan perkembangan ${namaSiswa}</p>
          </div>
        </div>

        <div class="oa-profil-card">
          <div class="oa-profil-avatar" style="background:${avatarBg}">${initials}</div>
          <div class="oa-profil-info">
            <div class="oa-profil-nama">${namaSiswa}</div>
            <div class="oa-profil-detail">
              <span class="oa-profil-chip">${kelas}</span>
            </div>
          </div>
          <div id="oa-status-badge"></div>
        </div>

        <div id="oga-loading" class="oga-loading-wrap">
          <div class="gn-loading-spinner"></div>
          <p class="oga-loading-text">Memuat perkembangan...</p>
        </div>

        <div id="oga-content" class="oga-hidden">

          <div id="oga-status-card"></div>

          <div class="gn-card oga-section-card">
            <div class="oa-section-title">📝 Nilai Belajar</div>
            <p class="oga-nilai-sub">Nilai dihitung dari rata-rata semua pertemuan belajar</p>
            <div id="oga-nilai-grid" class="oga-nilai-grid"></div>
          </div>

          <div class="gn-card oga-section-card" id="oga-progress-card">
            <div class="oa-section-title">📖 Progress Baca Jilid</div>
            <div id="oga-progress-content"></div>
          </div>

          <div class="gn-card oga-chart-card oga-section-card">
            <div class="oa-section-title">📈 Grafik Perkembangan Nilai</div>
            <div class="oga-chart-legend">
              <span class="oga-chart-leg-item">
                <span class="oga-chart-leg-dot" style="background:#6366f1"></span>Bacaan
              </span>
              <span class="oga-chart-leg-item">
                <span class="oga-chart-leg-dot" style="background:#10b981"></span>Hafalan
              </span>
              <span class="oga-chart-leg-item">
                <span class="oga-chart-leg-dot" style="background:#f59e0b"></span>Menulis
              </span>
            </div>
            <div class="oga-canvas-outer">
              <canvas id="oga-canvas" width="700" height="200"></canvas>
            </div>
            <div id="oga-chart-empty" class="oga-chart-empty oga-hidden">
              Belum cukup data untuk menampilkan grafik
            </div>
            <div class="oga-chart-info">
              <div class="oga-chart-info-title">📌 Cara membaca grafik ini:</div>
              <div class="oga-chart-info-list">
                <div class="oga-chart-info-item">
                  <span class="oga-chart-info-icon">📅</span>
                  <span><strong>Sumbu bawah</strong> — tanggal pertemuan dari yang paling lama sampai terbaru</span>
                </div>
                <div class="oga-chart-info-item">
                  <span class="oga-chart-info-icon">📊</span>
                  <span><strong>Sumbu kiri</strong> — tingkat nilai. Semakin tinggi garisnya, semakin bagus nilainya</span>
                </div>
                <div class="oga-chart-info-item">
                  <span class="oga-chart-info-icon">📈</span>
                  <span><strong>Garis naik</strong> berarti nilai anak <strong class="oga-text-green">semakin baik</strong>. <strong>Garis turun</strong> berarti perlu <strong class="oga-text-amber">lebih banyak latihan</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div class="gn-card oga-section-card">
            <div class="oa-section-title">💡 Saran untuk Orang Tua</div>
            <div id="oga-saran"></div>
          </div>

        </div>

      </main>
    </div>
  `;

  if (!siswaId || !kelasId) {
    document.getElementById("oga-loading").innerHTML =
      `<p class="oga-error-text">Data siswa tidak lengkap. Silakan login ulang.</p>`;
    return;
  }

  try {
    const [nilaiRes, rekapRes] = await Promise.all([
      api.get(`/nilai?siswaId=${siswaId}`),
      api.get(`/nilai/rekap/${siswaId}`),
    ]);

    const allNilai = nilaiRes.data || [];
    const rekap = rekapRes.data?.rekap || {};

    if (allNilai.length === 0) {
      document.getElementById("oga-loading").innerHTML = `
        <div class="oga-empty-wrap">
          <div class="oga-empty-icon">📝</div>
          <p class="oga-empty-title">Belum ada nilai yang dimasukkan</p>
          <p class="oga-empty-sub">Nilai akan muncul setelah guru memasukkan nilai di kelas ini.</p>
        </div>`;
      return;
    }

    const nilaiReguler = allNilai.filter(
      (n) => n.tipeInput === "reguler" || !n.tipeInput,
    );

    const xBacaan = nilaiMatriksArr(nilaiReguler, "bacaan");
    const xHafalan = nilaiMatriksArr(nilaiReguler, "hafalan");
    const xMenulis = nilaiMatriksArr(nilaiReguler, "menulis");
    const gradeB = toGrade(xBacaan);
    const gradeH = toGrade(xHafalan);
    const gradeM = toGrade(xMenulis);

    let skorSAW = 0,
      kategori = "",
      rekomendasi = "",
      layak = false;
    let halamanTertinggi = 0,
      sudahSelesaiJilid = false,
      jumlahSesi = 0;

    if (!isAlquran) {
      try {
        const sawRes = await api.get(`/nilai/analisis-saw/${kelasId}`);
        const sawKelas = sawRes.data || [];
        const dataSAW = sawKelas.find(
          (s) => String(s.siswaId) === String(siswaId),
        );
        if (dataSAW) {
          skorSAW = dataSAW.skorSAW;
          kategori = dataSAW.kategori;
          rekomendasi = dataSAW.rekomendasi;
          layak = dataSAW.layak;
          halamanTertinggi = dataSAW.halamanTertinggi;
          sudahSelesaiJilid = dataSAW.sudahSelesaiJilid;
          jumlahSesi = dataSAW.detailSAW?.jumlahSesi || 0;
        }
      } catch (_) {}
    } else {
      const avgX = [xBacaan, xHafalan, xMenulis].filter((v) => v > 0);
      const avgVal =
        avgX.length > 0 ? avgX.reduce((a, b) => a + b, 0) / avgX.length : 0;
      skorSAW = avgVal / 5.0;
      kategori =
        avgVal >= 4.0 ? "Sangat Baik" : avgVal >= 3.0 ? "Baik" : "Cukup";
      rekomendasi = "";
      layak = false;
      jumlahSesi = nilaiReguler.filter((n) => n.jenis === "bacaan").length;
    }

    // ── STATUS BADGE ──────────────────────────────────────────────
    if (isAlquran) {
      const warnaKat =
        kategori === "Sangat Baik"
          ? "#16a34a"
          : kategori === "Baik"
            ? "#2563eb"
            : "#d97706";
      const bgKat =
        kategori === "Sangat Baik"
          ? "#dcfce7"
          : kategori === "Baik"
            ? "#dbeafe"
            : "#fef9c3";
      const ikonKat =
        kategori === "Sangat Baik" ? "🌟" : kategori === "Baik" ? "👍" : "📚";
      document.getElementById("oa-status-badge").innerHTML = `
        <div class="oga-status-badge-wrap">
          <div class="oga-status-ikon">${ikonKat}</div>
          <div class="oga-status-label"
            style="background:${bgKat};color:${warnaKat}">${kategori}</div>
        </div>`;
    } else {
      const warnaRek = layak
        ? "#16a34a"
        : rekomendasi === "Dipertimbangkan"
          ? "#a16207"
          : "#94a3b8";
      const bgRek = layak
        ? "#dcfce7"
        : rekomendasi === "Dipertimbangkan"
          ? "#fef9c3"
          : "#f1f5f9";
      const ikonRek = layak
        ? "✅"
        : rekomendasi === "Dipertimbangkan"
          ? "🔔"
          : "⏳";
      const teksRek = layak
        ? "Siap Ujian"
        : rekomendasi === "Dipertimbangkan"
          ? "Hampir Siap"
          : "Sedang Belajar";
      document.getElementById("oa-status-badge").innerHTML = `
        <div class="oga-status-badge-wrap">
          <div class="oga-status-ikon">${ikonRek}</div>
          <div class="oga-status-label"
            style="background:${bgRek};color:${warnaRek}">${teksRek}</div>
        </div>`;
    }

    // ── CARD STATUS ───────────────────────────────────────────────
    let statusKonfig;
    if (isAlquran) {
      statusKonfig =
        kategori === "Sangat Baik"
          ? {
              bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
              border: "#86efac",
              ikon: "🌟",
              warnaJudul: "#15803d",
              judul: "MasyaAllah! Nilai Al-Qur'an Sangat Baik",
              pesan: `${namaSiswa} menunjukkan kemampuan yang sangat baik dalam membaca Al-Qur'an. Terus pertahankan dan tingkatkan!`,
            }
          : kategori === "Baik"
            ? {
                bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                border: "#93c5fd",
                ikon: "👍",
                warnaJudul: "#1d4ed8",
                judul: "Perkembangan Al-Qur'an Baik",
                pesan: `${namaSiswa} sudah menunjukkan perkembangan yang baik. Terus semangat berlatih setiap hari!`,
              }
            : {
                bg: "linear-gradient(135deg,#fffbeb,#fef9c3)",
                border: "#fde68a",
                ikon: "📚",
                warnaJudul: "#92400e",
                judul: "Terus Semangat Belajar Al-Qur'an",
                pesan: `${namaSiswa} sedang berproses belajar Al-Qur'an. Dukungan dan semangat dari orang tua sangat berarti.`,
              };
    } else {
      statusKonfig = layak
        ? {
            bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
            border: "#86efac",
            ikon: "🎉",
            warnaJudul: "#15803d",
            judul: "Selamat! Siap Mengikuti Ujian Kenaikan Jilid",
            pesan: `${namaSiswa} sudah menyelesaikan jilid dan nilai belajarnya sangat baik. Guru akan segera menjadwalkan ujian kenaikan jilid.`,
          }
        : rekomendasi === "Dipertimbangkan"
          ? {
              bg: "linear-gradient(135deg,#fffbeb,#fef9c3)",
              border: "#fde68a",
              ikon: "🔔",
              warnaJudul: "#92400e",
              judul: "Hampir Siap — Terus Semangat!",
              pesan: `${namaSiswa} sudah menunjukkan perkembangan yang baik. Terus latihan agar bisa segera mengikuti ujian kenaikan jilid.`,
            }
          : {
              bg: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
              border: "#e2e8f0",
              ikon: "📚",
              warnaJudul: "#475569",
              judul: "Masih Dalam Proses Belajar",
              pesan: `${namaSiswa} sedang giat belajar. Dukungan dan semangat dari orang tua sangat berarti untuk perkembangannya.`,
            };
    }

    const alasanList = [];
    if (!isAlquran) {
      if (!sudahSelesaiJilid)
        alasanList.push(
          `📖 Baru membaca sampai halaman <strong>${halamanTertinggi} dari 40</strong>`,
        );
      if (skorSAW < 0.85 && jumlahSesi > 0)
        alasanList.push(`📝 Nilai rata-rata masih perlu ditingkatkan`);
    }

    document.getElementById("oga-status-card").innerHTML = `
      <div class="oga-status-card" style="background:${statusKonfig.bg};border-color:${statusKonfig.border}">
        <div class="oga-status-inner">
          <div class="oga-status-ikon-lg">${statusKonfig.ikon}</div>
          <div class="oga-status-body">
            <div class="oga-status-judul" style="color:${statusKonfig.warnaJudul}">${statusKonfig.judul}</div>
            <div class="oga-status-pesan ${alasanList.length ? "oga-status-pesan--mb" : ""}">${statusKonfig.pesan}</div>
            ${
              alasanList.length
                ? `
              <div class="oga-alasan-box">${alasanList.join("<br>")}</div>`
                : ""
            }
          </div>
        </div>
      </div>`;

    // ── NILAI PER ASPEK ───────────────────────────────────────────
    const nilaiGrid = document.getElementById("oga-nilai-grid");
    [
      {
        jenis: "bacaan",
        grade: gradeB,
        x: xBacaan,
        icon: "📖",
        label: "Kemampuan Membaca",
      },
      {
        jenis: "hafalan",
        grade: gradeH,
        x: xHafalan,
        icon: "🧠",
        label: "Kemampuan Menghafal",
      },
      {
        jenis: "menulis",
        grade: gradeM,
        x: xMenulis,
        icon: "✏️",
        label: "Kemampuan Menulis",
      },
    ].forEach((row) => {
      const r = rekap[row.jenis];
      const clr = NILAI_COLOR[row.grade] || "#94a3b8";
      const bg = NILAI_BG[row.grade] || "#f1f5f9";
      const lbl = NILAI_LABEL[row.grade] || row.grade;
      const barPct = Math.round((row.x / 5.0) * 100);
      nilaiGrid.innerHTML += `
        <div class="oga-nilai-item">
          <div class="oga-nilai-top">
            <div class="oga-nilai-left">
              <span class="oga-nilai-icon">${row.icon}</span>
              <div>
                <div class="oga-nilai-label">${row.label}</div>
                <div class="oga-nilai-sub">${r ? `${r.jumlah}x pertemuan` : "Belum ada data"}</div>
              </div>
            </div>
            <div class="oga-nilai-right">
              <span class="oga-nilai-lbl-text" style="color:${clr}">${lbl}</span>
              <span class="oga-nilai-grade-chip" style="background:${bg};color:${clr}">${row.grade}</span>
            </div>
          </div>
          <div class="oga-nilai-bar-wrap">
            <div class="oga-nilai-bar" style="width:${barPct}%;background:${clr}"></div>
          </div>
        </div>`;
    });

    // ── PROGRESS HALAMAN ─────────────────────────────────────────
    const progressCard = document.getElementById("oga-progress-card");
    if (isAlquran) {
      progressCard.style.display = "none";
    } else {
      const pct = Math.min(Math.round((halamanTertinggi / 40) * 100), 100);
      const pctClr = sudahSelesaiJilid
        ? "#16a34a"
        : pct >= 50
          ? "#6366f1"
          : "#d97706";
      const barBg = sudahSelesaiJilid
        ? "linear-gradient(90deg,#4ade80,#16a34a)"
        : pct >= 50
          ? "linear-gradient(90deg,#818cf8,#6366f1)"
          : "linear-gradient(90deg,#fcd34d,#f59e0b)";

      document.getElementById("oga-progress-content").innerHTML = `
        <div class="oga-prog-header">
          <div>
            <div class="oga-prog-val" style="color:${pctClr}">${halamanTertinggi}
              <span class="oga-prog-total">dari 40 halaman</span>
            </div>
            ${
              sudahSelesaiJilid
                ? `<div class="oga-prog-note oga-prog-note--green">✅ Sudah selesai satu jilid penuh!</div>`
                : `<div class="oga-prog-note oga-prog-note--gray">Sisa ${40 - halamanTertinggi} halaman lagi</div>`
            }
          </div>
          <div class="oga-prog-pct" style="color:${pctClr}">${pct}%</div>
        </div>
        <div class="oga-prog-track">
          <div class="oga-prog-fill" style="width:${pct}%;background:${barBg}"></div>
        </div>
        <div class="oga-prog-labels">
          <span>Halaman 1</span><span>Halaman 40</span>
        </div>`;
    }

    // ── SARAN ─────────────────────────────────────────────────────
    const saranList = [];
    if (xBacaan < 4.0)
      saranList.push({
        icon: "📖",
        judul: "Latihan Membaca di Rumah",
        isi: "Luangkan 15 menit setiap hari untuk mendampingi anak membaca bersama-sama.",
        bg: "#eff6ff",
        warna: "#1d4ed8",
      });
    if (xHafalan < 4.0)
      saranList.push({
        icon: "🧠",
        judul: "Bantu Mengulang Hafalan",
        isi: "Minta anak mengulang hafalan sebelum tidur dan setelah sholat subuh.",
        bg: "#f0fdf4",
        warna: "#15803d",
      });
    if (xMenulis < 4.0)
      saranList.push({
        icon: "✏️",
        judul: "Latihan Menulis Huruf Hijaiyah",
        isi: "Sediakan buku tulis khusus untuk latihan menulis huruf hijaiyah setiap hari.",
        bg: "#fffbeb",
        warna: "#92400e",
      });
    if (!isAlquran && !sudahSelesaiJilid)
      saranList.push({
        icon: "📚",
        judul: "Semangat Menyelesaikan Jilid",
        isi: `Masih ${40 - halamanTertinggi} halaman lagi. Dukung anak agar rajin hadir ke TPA.`,
        bg: "#f5f3ff",
        warna: "#5b21b6",
      });
    if (!isAlquran && layak)
      saranList.push({
        icon: "🤲",
        judul: "Alhamdulillah, Doakan Ujiannya",
        isi: "Anak sudah siap mengikuti ujian kenaikan jilid. Berikan semangat dan doa terbaik!",
        bg: "#dcfce7",
        warna: "#15803d",
      });
    if (isAlquran)
      saranList.push({
        icon: "📿",
        judul: "Biasakan Tilawah Setiap Hari",
        isi: "Ajak anak membaca Al-Qur'an minimal satu halaman setiap hari di rumah agar bacaannya semakin lancar.",
        bg: "#f0fdf4",
        warna: "#15803d",
      });
    if (saranList.length === 0)
      saranList.push({
        icon: "⭐",
        judul: "Pertahankan Semangatnya!",
        isi: "Perkembangan anak sudah bagus. Terus berikan dukungan dan semangat setiap hari.",
        bg: "#f0fdf4",
        warna: "#15803d",
      });
    saranList.push({
      icon: "🤝",
      judul: "Komunikasi dengan Guru",
      isi: "Jangan ragu untuk bertanya langsung kepada ustadz/ustadzah tentang perkembangan anak.",
      bg: "#f8fafc",
      warna: "#374151",
    });

    document.getElementById("oga-saran").innerHTML = saranList
      .map(
        (s) => `
      <div class="oga-saran-item" style="background:${s.bg}">
        <span class="oga-saran-icon">${s.icon}</span>
        <div>
          <div class="oga-saran-judul" style="color:${s.warna}">${s.judul}</div>
          <div class="oga-saran-isi">${s.isi}</div>
        </div>
      </div>`,
      )
      .join("");

    // ── GRAFIK ────────────────────────────────────────────────────
    const sesiMap = {};
    nilaiReguler.forEach((n) => {
      const key = n.tanggal.slice(0, 10);
      if (!sesiMap[key]) sesiMap[key] = { tanggal: key, data: {}, meta: n };
      sesiMap[key].data[n.jenis] = n;
    });
    const sesiList = Object.values(sesiMap).sort(
      (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
    );
    renderGrafik(sesiList);

    document.getElementById("oga-loading").style.display = "none";
    document.getElementById("oga-content").classList.remove("oga-hidden");
  } catch (err) {
    document.getElementById("oga-loading").innerHTML =
      `<p class="oga-error-text">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderGrafik(sesiList) {
  const canvas = document.getElementById("oga-canvas");
  if (!canvas) return;

  const data = sesiList.slice(-10);
  if (data.length < 2) {
    canvas.style.display = "none";
    document.getElementById("oga-chart-empty").classList.remove("oga-hidden");
    return;
  }

  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const pad = { top: 20, right: 20, bottom: 32, left: 44 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  ctx.clearRect(0, 0, W, H);

  const GRAFIK_Y = {
    A: 5.0,
    "B+": 4.5,
    B: 4.0,
    "B-": 3.5,
    "C+": 3.0,
    C: 2.5,
    "C-": 2.0,
    D: 1.5,
  };
  const Y_TICKS = [
    { v: 5, l: "A" },
    { v: 4.5, l: "B+" },
    { v: 4, l: "B" },
    { v: 3.5, l: "B-" },
    { v: 3, l: "C+" },
  ];
  const Y_MAX = 5.0,
    Y_MIN = 2.5;
  const series = [
    { key: "bacaan", color: "#6366f1" },
    { key: "hafalan", color: "#10b981" },
    { key: "menulis", color: "#f59e0b" },
  ];

  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1;
  Y_TICKS.forEach(({ v, l }) => {
    const y = pad.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * cH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(l, pad.left - 5, y + 3);
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  data.forEach((s, i) => {
    const x = pad.left + (i / (data.length - 1)) * cW;
    const [, m, d] = s.tanggal.split("-");
    ctx.fillText(`${d}/${m}`, x, H - pad.bottom + 14);
  });

  series.forEach((s) => {
    const pts = data.map((n, i) => {
      const val = GRAFIK_Y[n.data[s.key]?.nilai] || 0;
      return {
        x: pad.left + (i / (data.length - 1)) * cW,
        y: val > 0 ? pad.top + ((Y_MAX - val) / (Y_MAX - Y_MIN)) * cH : null,
        ok: val > 0,
      };
    });
    const vp = pts.filter((p) => p.ok);
    if (vp.length < 1) return;
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, s.color + "30");
    grad.addColorStop(1, s.color + "05");
    if (vp.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(vp[0].x, vp[0].y);
      vp.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(vp[vp.length - 1].x, pad.top + cH);
      ctx.lineTo(vp[0].x, pad.top + cH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.moveTo(vp[0].x, vp[0].y);
      vp.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
    vp.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });
}

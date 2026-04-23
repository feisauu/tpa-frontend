import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";

const BULAN_NAMA = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

let kelasList = [];

/* ── Hitung hari aktif Senin–Kamis ── */
function hitungHariAktif(tahun, bulan) {
  const hariDalamBulan = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let i = 1; i <= hariDalamBulan; i++) {
    const hari = new Date(tahun, bulan - 1, i).getDay();
    if (hari >= 1 && hari <= 4) count++;
  }
  return count;
}

/* ── Konversi angka → huruf ── */
function angkaKeHuruf(val) {
  if (!val || val <= 0) return null;
  if (val >= 93) return "A";
  if (val >= 83) return "B+";
  if (val >= 78) return "B";
  if (val >= 73) return "B-";
  if (val >= 68) return "C+";
  if (val >= 63) return "C";
  if (val >= 58) return "C-";
  return "D";
}

/* ── Warna per huruf ── */
const HURUF_COLOR = {
  A: "#16a34a",
  "B+": "#22c55e",
  B: "#3b82f6",
  "B-": "#6366f1",
  "C+": "#f59e0b",
  C: "#f97316",
  "C-": "#ef4444",
  D: "#b91c1c",
};
const HURUF_BG = {
  A: "#dcfce7",
  "B+": "#dcfce7",
  B: "#dbeafe",
  "B-": "#e0e7ff",
  "C+": "#fef9c3",
  C: "#ffedd5",
  "C-": "#fee2e2",
  D: "#fee2e2",
};

function nilaiChip(val) {
  const huruf = angkaKeHuruf(val);
  if (!huruf) return `<span class="lap-nilai-empty">—</span>`;
  return `
    <span class="lap-nilai-chip" style="background:${HURUF_BG[huruf]};color:${HURUF_COLOR[huruf]}">
      ${huruf}
    </span>`;
}

/**
 * Tentukan keterangan berdasarkan kehadiran DAN rata-rata nilai.
 */
function keterangan(pct, avg) {
  const nilaiOk = avg >= 75;
  const kehadiranOk = pct >= 75;

  if (kehadiranOk && nilaiOk)
    return {
      label: "Sangat Baik",
      icon: "✅",
      warna: "#15803d",
      bg: "#dcfce7",
    };
  if (kehadiranOk && !nilaiOk)
    return {
      label: "Perlu Tingkatkan Nilai",
      icon: "📝",
      warna: "#a16207",
      bg: "#fef9c3",
    };
  if (!kehadiranOk && nilaiOk)
    return {
      label: "Perlu Tingkatkan Hadir",
      icon: "📅",
      warna: "#a16207",
      bg: "#fef9c3",
    };
  return {
    label: "Perlu Perhatian Khusus",
    icon: "⚠️",
    warna: "#dc2626",
    bg: "#fee2e2",
  };
}

/* ============================================================
   RENDER HALAMAN
   ============================================================ */
export function renderGuruLaporan() {
  const app = document.getElementById("app");
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-laporan")}
      <main class="content admin-home">

        <!-- Page header -->
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Laporan Perkembangan</h2>
            <p class="ag-subtitle">Laporan kehadiran dan nilai siswa per kelas</p>
          </div>
        </div>

        <!-- Filter -->
        <div class="gn-card lap-filter-card">
          <div class="lap-filter-row">
            <div class="ag-form-group lap-filter-kelas">
              <label class="gn-label">Pilih Kelas</label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="lap-kelas">
                  <option value="">-- Pilih Kelas --</option>
                </select>
              </div>
            </div>
            <div class="ag-form-group lap-filter-bulan">
              <label class="gn-label">Bulan</label>
              <input class="ag-input" type="number" id="lap-bulan"
                value="${bulan}" min="1" max="12" />
            </div>
            <div class="ag-form-group lap-filter-tahun">
              <label class="gn-label">Tahun</label>
              <input class="ag-input" type="number" id="lap-tahun" value="${tahun}" />
            </div>
            <div class="ag-form-group lap-filter-btn">
              <button class="ag-btn-simpan lap-lihat-btn" id="lap-load">
                <i class="fa-solid fa-magnifying-glass"></i> Tampilkan
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div id="lap-loading" class="lap-loading-wrap lap-loading-wrap--hidden">
          <div class="gn-loading-spinner"></div>
          <p class="lap-loading-text">Memuat laporan...</p>
        </div>

        <!-- Hasil -->
        <div id="lap-result" class="lap-result-hidden">

          <!-- Header info -->
          <div class="gn-card lap-info-card">
            <div class="lap-info-inner">
              <div>
                <h3 id="lap-judul" class="lap-judul"></h3>
                <p id="lap-subjudul" class="lap-subjudul"></p>
              </div>
              <div class="lap-aktif-badge">
                📅 <span id="lap-info-aktif"></span>
              </div>
            </div>
          </div>

          <!-- Legenda keterangan -->
          <div class="lap-legend-row">
            ${[
              {
                icon: "✅",
                label: "Sangat Baik",
                warna: "#15803d",
                bg: "#dcfce7",
              },
              {
                icon: "📝",
                label: "Perlu Tingkatkan Nilai",
                warna: "#a16207",
                bg: "#fef9c3",
              },
              {
                icon: "📅",
                label: "Perlu Tingkatkan Hadir",
                warna: "#a16207",
                bg: "#fef9c3",
              },
              {
                icon: "⚠️",
                label: "Perlu Perhatian Khusus",
                warna: "#dc2626",
                bg: "#fee2e2",
              },
            ]
              .map(
                (
                  l,
                ) => `<span class="lap-legend-chip" style="background:${l.bg};color:${l.warna}">
                  ${l.icon} ${l.label}
                </span>`,
              )
              .join("")}
          </div>

          <!-- Tabel -->
          <div class="ag-table-card lap-table-wrap">
            <table class="ag-table lap-table">
              <thead>
                <tr>
                  <th rowspan="2" class="lap-th-mid">No</th>
                  <th rowspan="2" class="lap-th-mid">Nama Siswa</th>
                  <th rowspan="2" class="lap-th-kehadiran">
                    Kehadiran
                    <span id="lap-hari-label" class="lap-hari-label"></span>
                  </th>
                  <th colspan="3" class="lap-th-aspek">Nilai per Aspek</th>
                  <th rowspan="2" class="lap-th-mid">Rata-rata</th>
                  <th rowspan="2" class="lap-th-mid">Keterangan</th>
                </tr>
                <tr>
                  <th class="lap-th-sub">📖 Bacaan</th>
                  <th class="lap-th-sub">🧠 Hafalan</th>
                  <th class="lap-th-sub">✏️ Menulis</th>
                </tr>
              </thead>
              <tbody id="lap-tbody"></tbody>
            </table>
          </div>

        </div>

        <!-- Empty -->
        <div id="lap-empty" class="lap-empty">
          <span class="lap-empty-icon">📄</span>
          <p class="lap-empty-text">Pilih kelas dan periode untuk melihat laporan</p>
        </div>

      </main>
    </div>
  `;

  loadKelas();
  document.getElementById("lap-load")?.addEventListener("click", loadLaporan);
}

/* ============================================================
   LOAD KELAS
   ============================================================ */
async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
    const sel = document.getElementById("lap-kelas");
    if (!sel) return;
    sel.innerHTML =
      `<option value="">-- Pilih Kelas --</option>` +
      kelasList
        .map((k) => `<option value="${k.id}">${k.namaKelas}</option>`)
        .join("");
  } catch (err) {
    console.error("Gagal load kelas:", err);
  }
}

/* ============================================================
   LOAD LAPORAN
   ============================================================ */
async function loadLaporan() {
  const kelasId = document.getElementById("lap-kelas").value;
  const bulan = parseInt(document.getElementById("lap-bulan").value);
  const tahun = parseInt(document.getElementById("lap-tahun").value);

  if (!kelasId) {
    alert("Pilih kelas terlebih dahulu");
    return;
  }

  const btn = document.getElementById("lap-load");
  btn.disabled = true;
  btn.innerHTML = "Memuat...";

  document.getElementById("lap-result").classList.add("lap-result-hidden");
  document.getElementById("lap-empty").classList.add("lap-result-hidden");
  document
    .getElementById("lap-loading")
    .classList.remove("lap-loading-wrap--hidden");

  try {
    const [laporanRes, kehadiranRes] = await Promise.all([
      api.get(`/laporan/kelas/${kelasId}?bulan=${bulan}&tahun=${tahun}`),
      api.get(`/kehadiran?kelasId=${kelasId}&bulan=${bulan}&tahun=${tahun}`),
    ]);
    const d = laporanRes.data;

    // Hitung hari aktif
    const hariAktif = hitungHariAktif(tahun, bulan);
    document.getElementById("lap-hari-label").textContent =
      `(dari ${hariAktif} hari aktif)`;
    document.getElementById("lap-info-aktif").textContent =
      `${hariAktif} hari Senin–Kamis`;

    // Map siswaId → jumlah hadir
    const hadirMap = {};
    (kehadiranRes.data || []).forEach((k) => {
      const tgl = new Date(k.tanggal);
      if (tgl.getMonth() + 1 === bulan && tgl.getFullYear() === tahun) {
        if (!hadirMap[k.siswaId]) hadirMap[k.siswaId] = 0;
        if (k.status === "Hadir") hadirMap[k.siswaId]++;
      }
    });

    document.getElementById("lap-judul").textContent =
      `Laporan Kelas ${d.kelas}`;
    document.getElementById("lap-subjudul").textContent =
      `Guru: ${d.guru || "-"} · Periode: ${BULAN_NAMA[bulan]} ${tahun}`;

    const tbody = document.getElementById("lap-tbody");

    if (!d.siswa.length) {
      tbody.innerHTML = `
        <tr><td colspan="8" class="lap-td-empty">Tidak ada data siswa</td></tr>`;
    } else {
      tbody.innerHTML = d.siswa
        .map((s, i) => {
          const jumlahHadir = hadirMap[s.id] ?? hadirMap[s.siswaId] ?? 0;
          const pct =
            hariAktif > 0 ? Math.round((jumlahHadir / hariAktif) * 100) : 0;
          const warnaHdr =
            pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";

          const bacaan = s.nilaiPerJenis?.bacaan ?? 0;
          const hafalan = s.nilaiPerJenis?.hafalan ?? 0;
          const menulis = s.nilaiPerJenis?.menulis ?? 0;
          const avg = s.rataRataNilai ?? 0;

          const hurufAvg = angkaKeHuruf(avg);
          const warnaAvg = hurufAvg ? HURUF_COLOR[hurufAvg] : "#94a3b8";
          const bgAvg = hurufAvg ? HURUF_BG[hurufAvg] : "#f1f5f9";

          const ket = keterangan(pct, avg);

          return `
          <tr>
            <td class="ag-td ag-td-no">${i + 1}</td>
            <td class="ag-td">
              <div class="lap-nama-wrap">
                <div class="ag-avatar lap-avatar">${getInitials(s.nama)}</div>
                <span class="lap-nama">${s.nama}</span>
              </div>
            </td>
            <td class="lap-td-kehadiran">
              <div class="lap-pct" style="color:${warnaHdr}">${pct}%</div>
              <div class="lap-hadir-count">${jumlahHadir} / ${hariAktif}</div>
              <div class="lap-bar-wrap">
                <div class="lap-bar-fill"
                  style="width:${Math.min(pct, 100)}%;background:${warnaHdr}"></div>
              </div>
            </td>
            <td class="lap-td-aspek">${nilaiChip(bacaan)}</td>
            <td class="lap-td-aspek">${nilaiChip(hafalan)}</td>
            <td class="lap-td-aspek">${nilaiChip(menulis)}</td>
            <td class="lap-td-avg">
              ${
                hurufAvg
                  ? `<span class="lap-avg-chip"
                    style="background:${bgAvg};color:${warnaAvg}">${hurufAvg}</span>`
                  : `<span class="lap-nilai-empty">—</span>`
              }
            </td>
            <td class="lap-td-ket">
              <span class="lap-ket-chip"
                style="background:${ket.bg};color:${ket.warna}">
                ${ket.icon} ${ket.label}
              </span>
            </td>
          </tr>`;
        })
        .join("");
    }

    document
      .getElementById("lap-loading")
      .classList.add("lap-loading-wrap--hidden");
    document.getElementById("lap-result").classList.remove("lap-result-hidden");
  } catch (err) {
    document
      .getElementById("lap-loading")
      .classList.add("lap-loading-wrap--hidden");
    const emptyEl = document.getElementById("lap-empty");
    emptyEl.classList.remove("lap-result-hidden");
    emptyEl.innerHTML = `
      <span class="lap-empty-icon">❌</span>
      <p class="lap-empty-error">Gagal memuat laporan: ${err.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tampilkan';
  }
}

/* ── Helpers ── */
function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

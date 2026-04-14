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
const STATUS_COLOR = {
  Hadir: "#16a34a",
  Sakit: "#2563eb",
  Izin: "#d97706",
  Alpha: "#dc2626",
};
const STATUS_BG = {
  Hadir: "#dcfce7",
  Sakit: "#dbeafe",
  Izin: "#fef9c3",
  Alpha: "#fee2e2",
};
const STATUS_ICON = { Hadir: "✅", Sakit: "🤒", Izin: "📄", Alpha: "❌" };

function hitungHariAktif(tahun, bulan) {
  const akhir = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let i = 1; i <= akhir; i++) {
    const hari = new Date(tahun, bulan - 1, i).getDay();
    if (hari >= 1 && hari <= 4) count++;
  }
  return count;
}

function injectPrintCSS() {
  if (document.getElementById("ol-print-style")) return;
  const style = document.createElement("style");
  style.id = "ol-print-style";
  style.textContent = `
    @media print {
      body * { visibility: hidden !important; }
      #ol-print-area, #ol-print-area * { visibility: visible !important; }
      #ol-print-area {
        position: fixed !important; inset: 0 !important;
        width: 100% !important; padding: 0 !important;
        margin: 0 !important; background: white !important; z-index: 9999 !important;
      }
      @page { size: A4 portrait; margin: 16mm 18mm; }
      #ol-print-area * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .ol-p-stat-box, .ol-p-nilai-chip, .ol-p-status-badge,
      .ol-p-header, .ol-p-section-title, .ol-p-footer {
        -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
      }
      .ol-p-section { page-break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      .ol-p-print-btn { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export async function renderOrtuLaporan() {
  injectPrintCSS();
  const app = document.getElementById("app");
  const namaSiswa = localStorage.getItem("namaSiswa") || "-";
  const kelas = localStorage.getItem("kelas") || "-";
  const siswaId = localStorage.getItem("siswaId");
  const initials = namaSiswa
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const now = new Date();

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("ortu-laporan")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Laporan Perkembangan</h2>
            <p class="ag-subtitle">Laporan lengkap perkembangan ${namaSiswa}</p>
          </div>
        </div>

        <div class="oa-profil-card">
          <div class="oa-profil-avatar ol-profil-avatar-indigo">${initials}</div>
          <div class="oa-profil-info">
            <div class="oa-profil-nama">${namaSiswa}</div>
            <div class="oa-profil-detail">
              <span class="oa-profil-chip">${kelas}</span>
            </div>
          </div>
        </div>

        <div class="gn-card">
          <div class="ol-filter-form">
            <div class="ag-form-group">
              <label class="gn-label">Bulan</label>
              <input class="ag-input" type="number" id="ol-bulan" min="1" max="12" value="${now.getMonth() + 1}"/>
            </div>
            <div class="ag-form-group">
              <label class="gn-label">Tahun</label>
              <input class="ag-input" type="number" id="ol-tahun" value="${now.getFullYear()}"/>
            </div>
            <div class="ag-form-group ol-btn-group">
              <button class="ag-btn-simpan ol-btn-lihat" id="ol-btn-load"><i class="fa-solid fa-magnifying-glass"></i> Tampilkan</button>
            </div>
          </div>
        </div>

        <div id="ol-loading" class="ol-loading-wrap ol-loading-hidden">
          <div class="gn-loading-spinner"></div>
          <p class="ol-loading-text">Memuat laporan...</p>
        </div>

        <div id="ol-print-area" class="ol-hidden"></div>

        <div id="ol-empty" class="ol-empty-wrap">
          <span class="ol-empty-icon">📄</span>
          <p class="ol-empty-text">Pilih periode dan klik Lihat untuk menampilkan laporan</p>
        </div>

      </main>
    </div>
  `;

  document
    .getElementById("ol-btn-load")
    ?.addEventListener("click", () => loadLaporan(siswaId));
}

async function loadLaporan(siswaId) {
  if (!siswaId) return;
  const bulan = document.getElementById("ol-bulan").value;
  const tahun = document.getElementById("ol-tahun").value;
  const kelasId = localStorage.getItem("kelasId");

  const btn = document.getElementById("ol-btn-load");
  const printArea = document.getElementById("ol-print-area");
  const loading = document.getElementById("ol-loading");
  const empty = document.getElementById("ol-empty");

  btn.disabled = true;
  btn.textContent = "Memuat...";
  loading.classList.remove("ol-loading-hidden");
  printArea.classList.add("ol-hidden");
  empty.classList.add("ol-hidden");

  try {
    const requests = [
      api.get(`/laporan/siswa/${siswaId}?bulan=${bulan}&tahun=${tahun}`),
    ];
    if (kelasId) requests.push(api.get(`/nilai/analisis-saw/${kelasId}`));

    const responses = await Promise.all(requests);
    const d = responses[0].data;
    const sawKelas = kelasId ? responses[1].data || [] : [];
    const dataSAW =
      sawKelas.find((s) => String(s.siswaId) === String(siswaId)) || null;

    loading.classList.add("ol-loading-hidden");
    printArea.classList.remove("ol-hidden");
    printArea.innerHTML = buildPrintHTML(d, bulan, tahun, dataSAW);
  } catch (err) {
    loading.innerHTML = `<p class="ol-error-text">Gagal memuat laporan: ${err.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tampilkan';
  }
}

function buildPrintHTML(d, bulan, tahun, dataSAW) {
  const siswa = d.siswa;
  const rekKeh = d.kehadiran?.rekap ?? {};
  const detKeh = d.kehadiran?.detail ?? [];
  const rekNilai = d.nilai?.rekap ?? {};
  const detNilai = d.nilai?.detail ?? [];
  const namaBulan = BULAN_NAMA[parseInt(bulan)];
  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hariAktif = hitungHariAktif(parseInt(tahun), parseInt(bulan));
  const jumlahHadir = rekKeh.Hadir ?? 0;
  const pctKeh =
    hariAktif > 0 ? Math.round((jumlahHadir / hariAktif) * 100) : 0;
  const pctColor =
    pctKeh >= 80 ? "#16a34a" : pctKeh >= 60 ? "#d97706" : "#dc2626";

  let skorSAW = 0,
    layakUjian = false,
    rekomendasiTeks = "Belum Layak";
  let gradeB = "-",
    gradeH = "-",
    gradeM = "-";
  if (dataSAW) {
    skorSAW = dataSAW.skorSAW ?? 0;
    layakUjian = dataSAW.layak ?? false;
    rekomendasiTeks = dataSAW.rekomendasi ?? "Belum Layak";
    gradeB = dataSAW.nilai?.bacaan ?? "-";
    gradeH = dataSAW.nilai?.hafalan ?? "-";
    gradeM = dataSAW.nilai?.menulis ?? "-";
  } else {
    gradeB = rekNilai.bacaan ? gradeFromRata(rekNilai.bacaan.rataRata) : "-";
    gradeH = rekNilai.hafalan ? gradeFromRata(rekNilai.hafalan.rataRata) : "-";
    gradeM = rekNilai.menulis ? gradeFromRata(rekNilai.menulis.rataRata) : "-";
  }

  const skorWarna = layakUjian
    ? "#16a34a"
    : rekomendasiTeks === "Dipertimbangkan"
      ? "#a16207"
      : "#dc2626";
  const skorBg = layakUjian
    ? "#f0fdf4"
    : rekomendasiTeks === "Dipertimbangkan"
      ? "#fefce8"
      : "#fff1f2";
  const skorBorder = layakUjian
    ? "#86efac"
    : rekomendasiTeks === "Dipertimbangkan"
      ? "#fde68a"
      : "#fecaca";
  const rekomenLabel = layakUjian
    ? "✅ Siap Ujian Kenaikan Jilid"
    : rekomendasiTeks === "Dipertimbangkan"
      ? "🤔 Dipertimbangkan Guru"
      : "❌ Belum Siap Ujian";

  const sesiMap = {};
  detNilai.forEach((n) => {
    const key = `${n.tanggal.slice(0, 10)}_${n.tipeInput || "reguler"}`;
    if (!sesiMap[key])
      sesiMap[key] = { tanggal: n.tanggal.slice(0, 10), data: {}, meta: n };
    sesiMap[key].data[n.jenis] = n;
  });
  const sesiList = Object.values(sesiMap).sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );

  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;max-width:800px;margin:0 auto">

    <!-- Tombol cetak -->
    <div class="ol-p-print-btn">
      <button onclick="window.print()" class="ol-p-cetak-btn">
        🖨️ Cetak / Simpan PDF
      </button>
    </div>

    <!-- Header -->
    <div class="ol-p-header">
      <div>
        <div class="ol-p-header-sub">TPA AL-FALAH</div>
        <div class="ol-p-header-title">Laporan Perkembangan Siswa</div>
        <div class="ol-p-header-periode">Periode: ${namaBulan} ${tahun}</div>
      </div>
      <div class="ol-p-header-right">
        <div class="ol-p-header-cetak-lbl">Dicetak pada</div>
        <div class="ol-p-header-cetak-val">${tanggalCetak}</div>
      </div>
    </div>

    <!-- Info siswa -->
    <div class="ol-p-section ol-p-siswa-grid">
      <div>
        <div class="ol-p-field-label">Nama Siswa</div>
        <div class="ol-p-field-val ol-p-field-val--lg">${siswa.nama}</div>
      </div>
      <div>
        <div class="ol-p-field-label">Kelas / Jilid</div>
        <div class="ol-p-field-val">${siswa.kelas ?? "-"} · ${siswa.jilid ?? "-"}</div>
      </div>
    </div>

    <!-- 3 Kolom ringkasan -->
    <div class="ol-p-ringkasan-grid">

      <!-- Kehadiran -->
      <div class="ol-p-section ol-p-stat-box ol-p-box-green">
        <div class="ol-p-box-title ol-p-box-title--green">📅 Kehadiran</div>
        <div class="ol-p-big-val" style="color:${pctColor}">${pctKeh}%</div>
        <div class="ol-p-box-sub">${jumlahHadir} hadir dari ${hariAktif} hari aktif</div>
        <div class="ol-p-box-note">Senin–Kamis ${namaBulan} ${tahun}</div>
        <div class="ol-p-keh-bar-wrap">
          <div class="ol-p-keh-bar" style="width:${Math.min(pctKeh, 100)}%;background:${pctColor}"></div>
        </div>
        <div class="ol-p-keh-pills">
          ${["Sakit", "Izin", "Alpha"]
            .map(
              (s) => `
            <span class="ol-p-keh-pill" style="background:${STATUS_BG[s]};color:${STATUS_COLOR[s]}">
              ${STATUS_ICON[s]} ${s}: ${rekKeh[s] ?? 0}
            </span>`,
            )
            .join("")}
        </div>
      </div>

      <!-- Skor SAW — bg/border/warna dinamis -->
      <div class="ol-p-section ol-p-stat-box"
        style="background:${skorBg};border:1.5px solid ${skorBorder};border-radius:14px;padding:18px 20px">
        <div class="ol-p-box-title" style="color:${skorWarna}">📊 Skor SAW</div>
        <div class="ol-p-big-val" style="color:${skorWarna}">${dataSAW ? skorSAW.toFixed(4) : "—"}</div>
        <div class="ol-p-box-sub">Bobot: Bacaan 45% · Hafalan 35% · Menulis 20%</div>
        <div class="ol-p-box-note">Min. layak ujian: 0.8500</div>
        <div class="ol-p-saw-label" style="
          background:${layakUjian ? "#dcfce7" : rekomendasiTeks === "Dipertimbangkan" ? "#fef9c3" : "#fee2e2"};
          color:${skorWarna}">
          ${rekomenLabel}
        </div>
      </div>

      <!-- Nilai per jenis -->
      <div class="ol-p-section ol-p-stat-box ol-p-box-purple">
        <div class="ol-p-box-title ol-p-box-title--purple">📝 Nilai Per Jenis</div>
        ${[
          ["Bacaan", gradeB],
          ["Hafalan", gradeH],
          ["Menulis", gradeM],
        ]
          .map(
            ([label, g]) => `
          <div class="ol-p-nilai-row">
            <span class="ol-p-nilai-row-lbl">${label}</span>
            ${
              g !== "-"
                ? `<span class="ol-p-nilai-chip" style="background:${NILAI_BG[g] || "#f1f5f9"};color:${NILAI_COLOR[g] || "#64748b"}">${g}</span>`
                : `<span class="ol-p-nilai-empty">—</span>`
            }
          </div>`,
          )
          .join("")}
        ${dataSAW ? "" : `<div class="ol-p-saw-note">*Data SAW tidak tersedia untuk bulan ini</div>`}
      </div>

    </div>

    <!-- Tabel nilai detail -->
    <div class="ol-p-section ol-p-tabel-wrap">
      <div class="ol-p-tabel-title ol-p-tabel-title--indigo">
        📝 Riwayat Nilai Bulan ${namaBulan} ${tahun}
      </div>
      ${
        sesiList.length === 0
          ? `<div class="ol-p-tabel-empty">Belum ada data nilai bulan ini</div>`
          : `<table class="ol-p-table">
            <thead>
              <tr class="ol-p-thead-indigo">
                <th class="ol-p-th">Tanggal</th>
                <th class="ol-p-th">Tipe</th>
                <th class="ol-p-th ol-p-th--center">Bacaan</th>
                <th class="ol-p-th ol-p-th--center">Hafalan</th>
                <th class="ol-p-th ol-p-th--center">Menulis</th>
                <th class="ol-p-th">Hal.</th>
                <th class="ol-p-th">Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${sesiList
                .map((s, i) => {
                  const [y, m, day] = s.tanggal.split("-");
                  const b = s.data.bacaan?.nilai || "-";
                  const h = s.data.hafalan?.nilai || "-";
                  const mw = s.data.menulis?.nilai || "-";
                  const hal = s.meta.halamanMulai
                    ? `${s.meta.halamanMulai}–${s.meta.halamanSelesai ?? s.meta.halamanMulai}`
                    : "-";
                  const isUjian = s.meta.tipeInput === "kenaikan_jilid";
                  const tipe = isUjian ? "Ujian" : "Reguler";
                  const tipeColor = isUjian ? "#d97706" : "#6366f1";
                  const tipeBg = isUjian ? "#fef9c3" : "#ede9fe";
                  return `
                  <tr class="${i % 2 === 0 ? "ol-p-tr-even" : "ol-p-tr-odd"}">
                    <td class="ol-p-td ol-p-td--date">${day} ${BULAN_NAMA[parseInt(m)].slice(0, 3)} ${y}</td>
                    <td class="ol-p-td">
                      <span class="ol-p-tipe-badge" style="background:${tipeBg};color:${tipeColor}">${tipe}</span>
                    </td>
                    <td class="ol-p-td ol-p-td--center">${nilaiChipPrint(b)}</td>
                    <td class="ol-p-td ol-p-td--center">${nilaiChipPrint(h)}</td>
                    <td class="ol-p-td ol-p-td--center">${nilaiChipPrint(mw)}</td>
                    <td class="ol-p-td ol-p-td--gray">${hal}</td>
                    <td class="ol-p-td ol-p-td--gray">${s.meta.catatan || "-"}</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>`
      }
    </div>

    <!-- Tabel kehadiran detail -->
    <div class="ol-p-section ol-p-tabel-wrap ol-p-tabel-wrap--mb">
      <div class="ol-p-tabel-title ol-p-tabel-title--green">
        📅 Detail Kehadiran Bulan ${namaBulan} ${tahun}
        <span class="ol-p-tabel-title-note">
          (${jumlahHadir} hadir dari ${hariAktif} hari Senin–Kamis)
        </span>
      </div>
      ${
        detKeh.length === 0
          ? `<div class="ol-p-tabel-empty">Belum ada data kehadiran bulan ini</div>`
          : `<table class="ol-p-table">
            <thead>
              <tr class="ol-p-thead-green">
                <th class="ol-p-th">Tanggal</th>
                <th class="ol-p-th ol-p-th--center">Status</th>
                <th class="ol-p-th">Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${detKeh
                .map((k, i) => {
                  const tglStr = new Date(k.tanggal).toLocaleDateString(
                    "id-ID",
                    {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  );
                  return `
                  <tr class="${i % 2 === 0 ? "ol-p-tr-even" : "ol-p-tr-odd"}">
                    <td class="ol-p-td ol-p-td--date">${tglStr}</td>
                    <td class="ol-p-td ol-p-td--center">
                      <span class="ol-p-status-badge"
                        style="background:${STATUS_BG[k.status] ?? "#f1f5f9"};color:${STATUS_COLOR[k.status] ?? "#64748b"}">
                        ${STATUS_ICON[k.status] ?? ""} ${k.status}
                      </span>
                    </td>
                    <td class="ol-p-td ol-p-td--gray">${k.catatan || "-"}</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>`
      }
    </div>

    <!-- Footer -->
    <div class="ol-p-footer">
      <div class="ol-p-footer-left">
        <div class="ol-p-footer-sekolah">TPA Al-Falah</div>
        <div>Laporan ini digenerate otomatis oleh sistem</div>
        <div>Dicetak pada: ${tanggalCetak}</div>
      </div>
      <div class="ol-p-footer-right">
        <div class="ol-p-footer-ttd-label">Mengetahui,<br>Wali Kelas</div>
        <div class="ol-p-footer-ttd-line">( _________________ )</div>
      </div>
    </div>

  </div>`;
}

function nilaiChipPrint(nilai) {
  if (!nilai || nilai === "-") return `<span class="ol-p-nilai-empty">—</span>`;
  return `<span class="ol-p-nilai-chip"
    style="background:${NILAI_BG[nilai] || "#f1f5f9"};color:${NILAI_COLOR[nilai] || "#64748b"}">${nilai}</span>`;
}

function gradeFromRata(rata) {
  if (!rata) return "-";
  if (rata >= 90) return "A";
  if (rata >= 75) return "B";
  if (rata >= 60) return "C";
  return "D";
}

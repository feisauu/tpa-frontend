import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";

const STATUS_CONFIG = {
  Hadir: {
    color: "#16a34a",
    bg: "#dcfce7",
    icon: '<i class="fa-solid fa-circle-check"></i>',
    ring: "#86efac",
  },
  Sakit: {
    color: "#2563eb",
    bg: "#dbeafe",
    icon: '<i class="fa-solid fa-notes-medical"></i>',
    ring: "#93c5fd",
  },
  Izin: {
    color: "#d97706",
    bg: "#fef9c3",
    icon: '<i class="fa-solid fa-file-signature"></i>',
    ring: "#fcd34d",
  },
  Alpha: {
    color: "#dc2626",
    bg: "#fee2e2",
    icon: '<i class="fa-solid fa-circle-xmark"></i>',
    ring: "#fca5a5",
  },
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
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

let absensiData = [];

function hitungHariAktif(tahun, bulan) {
  const hariDalamBulan = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let i = 1; i <= hariDalamBulan; i++) {
    const hari = new Date(tahun, bulan - 1, i).getDay();
    if (hari >= 1 && hari <= 4) count++;
  }
  return count;
}

function totalHariAktifDariBulanSet(bulanSet) {
  return bulanSet.reduce((sum, b) => {
    const [y, m] = b.split("-").map(Number);
    return sum + hitungHariAktif(y, m);
  }, 0);
}

export async function renderOrtuKehadiran() {
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

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("ortu-kehadiran")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">
             Absensi Siswa
            </h2>
            <p class="ag-subtitle">Pantau kehadiran ${namaSiswa} di TPA</p>
          </div>
        </div>

        <!-- PROFIL -->
        <div class="oa-profil-card">
          <div class="oa-profil-avatar oa-profil-avatar--blue">${initials}</div>
          <div class="oa-profil-info">
            <div class="oa-profil-nama">${namaSiswa}</div>
            <div class="oa-profil-detail">
              <span class="oa-profil-chip">
                <i class="fa-solid fa-school"></i> ${kelas}
              </span>
            </div>
          </div>
          <div class="oa-profil-right">
            <div class="oa-pct-val" id="oa-total-pct">—</div>
            <div class="oa-pct-label">Total Kehadiran</div>
            <div class="oa-pct-note">dari hari Senin–Kamis</div>
          </div>
        </div>

        <!-- FILTER -->
        <div class="gn-card oa-filter-card">
          <div class="oa-filter-row">
            <div class="ag-form-group oa-filter-group">
              <label class="gn-label">Filter Bulan</label>
              <select class="gn-select" id="oa-filter-bulan">
                <option value="">Semua Bulan</option>
              </select>
            </div>
            <div class="ag-form-group oa-filter-group">
              <label class="gn-label">Filter Status</label>
              <select class="gn-select" id="oa-filter-status">
                <option value="">Semua Status</option>
                <option value="Hadir">✔ Hadir</option>
                <option value="Sakit">+ Sakit</option>
                <option value="Izin">~ Izin</option>
                <option value="Alpha">✕ Alpha</option>
              </select>
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div id="oa-loading" class="oa-loading-wrap">
          <div class="gn-loading-spinner"></div>
          <p class="oa-loading-text">Memuat data kehadiran...</p>
        </div>

        <!-- STAT CARDS -->
        <div class="oa-stat-strip" id="oa-stat-strip" style="display:none"></div>

        <!-- KALENDER -->
        <div class="gn-card oa-cal-card gn-hidden" id="oa-cal-wrap">
          <div class="oa-section-title">
            <i class="fa-solid fa-calendar-week"></i> Kalender Kehadiran
          </div>
          <div class="oa-cal-legend">
            ${Object.entries(STATUS_CONFIG)
              .map(
                ([s, c]) => `
              <span class="oa-cal-leg-item">
                <span class="oa-cal-dot"
                  style="background:${c.bg};border:2px solid ${c.ring}"></span>${s}
              </span>`,
              )
              .join("")}
          </div>
          <div class="oa-calendar" id="oa-calendar"></div>
        </div>

        <!-- TABEL -->
        <div class="gn-card oa-table-card" id="oa-table-card" style="display:none">
          <div class="oa-table-header">
            <span class="oa-section-title oa-section-title--inline" id="oa-table-title">
              <i class="fa-solid fa-clipboard-list"></i> Daftar Absensi
            </span>
            <span class="oa-record-count" id="oa-record-count"></span>
          </div>
          <div class="oa-table-scroll">
          <table class="oa-table">
            <colgroup>
              <col/>
              <col/>
              <col/>
              <col/>
            </colgroup>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Hari</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody id="oa-table-body"></tbody>
          </table>
          </div>
          <div class="ag-empty gn-hidden" id="oa-empty">
            <span><i class="fa-solid fa-calendar-xmark"></i></span>
            <p>Tidak ada data absensi</p>
          </div>
        </div>

        <!-- REKAP BULANAN -->
        <div class="gn-card oa-rekap-wrap gn-hidden" id="oa-rekap-wrap">
          <div class="oa-section-title">
            <i class="fa-solid fa-chart-bar"></i> Rekap per Bulan
          </div>
          <div class="oa-rekap-note">
            Persentase dihitung dari total hari aktif (Senin–Kamis) per bulan
          </div>
          <div class="oa-rekap-grid" id="oa-rekap-grid"></div>
        </div>

      </main>
    </div>
  `;

  if (!siswaId) {
    document.getElementById("oa-loading").innerHTML =
      `<p class="oa-error-text">Siswa tidak ditemukan, silakan login ulang.</p>`;
    return;
  }

  try {
    const res = await api.get(`/kehadiran?siswaId=${siswaId}`);
    absensiData = res.data || [];

    const bulanSet = new Set(absensiData.map((a) => a.tanggal.slice(0, 7)));
    const bulanList = [...bulanSet].sort().reverse();
    const selBulan = document.getElementById("oa-filter-bulan");
    selBulan.innerHTML =
      `<option value="">Semua Bulan</option>` +
      bulanList
        .map((b) => {
          const [y, m] = b.split("-");
          return `<option value="${b}">${BULAN_NAMA[parseInt(m)]} ${y}</option>`;
        })
        .join("");

    document.getElementById("oa-loading").style.display = "none";
    document.getElementById("oa-stat-strip").style.display = "grid";
    document.getElementById("oa-table-card").style.display = "block";

    renderAll();
    bindEvents();
  } catch (err) {
    document.getElementById("oa-loading").innerHTML =
      `<p class="oa-error-text">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderAll() {
  const bulan = document.getElementById("oa-filter-bulan")?.value || "";
  const status = document.getElementById("oa-filter-status")?.value || "";

  const filtered = absensiData.filter(
    (a) =>
      (!bulan || a.tanggal.slice(0, 10).startsWith(bulan)) &&
      (!status || a.status === status),
  );

  renderStats(bulan);
  renderCalendar(bulan);
  renderTable(filtered, bulan);
  renderRekap();
  updateTotalPct();
}

function renderStats(bulan) {
  const data = bulan
    ? absensiData.filter((a) => a.tanggal.slice(0, 10).startsWith(bulan))
    : absensiData;

  const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
  data.forEach((a) => {
    if (counts[a.status] !== undefined) counts[a.status]++;
  });

  let total, pct;
  if (bulan) {
    const [y, m] = bulan.split("-").map(Number);
    total = hitungHariAktif(y, m);
    pct = total > 0 ? Math.round((counts.Hadir / total) * 100) : 0;
  } else {
    const bulanSet = [
      ...new Set(absensiData.map((a) => a.tanggal.slice(0, 7))),
    ];
    total = totalHariAktifDariBulanSet(bulanSet);
    pct = total > 0 ? Math.round((counts.Hadir / total) * 100) : 0;
  }

  document.getElementById("oa-stat-strip").innerHTML = `
    <div class="oa-stat-card oa-stat-pct" style="border-left-color:#16a34a">
      <div class="oa-stat-icon-wrap oa-stat-icon-wrap--green">
        <svg viewBox="0 0 36 36" class="oa-donut-mini">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" stroke-width="4"/>
          <circle cx="18" cy="18" r="14" fill="none" stroke="#22c55e" stroke-width="4"
            stroke-dasharray="${pct * 0.88} 88" stroke-dashoffset="22"
            transform="rotate(-90 18 18)"/>
        </svg>
        <span class="oa-donut-pct" style="color:#16a34a">${pct}%</span>
      </div>
      <div>
        <div class="oa-stat-val" style="color:#16a34a">${pct}%</div>
        <div class="oa-stat-key">Kehadiran</div>
        <div class="oa-stat-subkey">dari ${total} hari aktif</div>
      </div>
    </div>

    ${["Hadir", "Sakit", "Izin", "Alpha"]
      .map(
        (s) => `
      <div class="oa-stat-card" style="border-left-color:${STATUS_CONFIG[s].color};cursor:pointer"
        onclick="filterByStatus('${s}')">
        <div class="oa-stat-icon-wrap" style="background:${STATUS_CONFIG[s].bg}">
          <span class="oa-stat-icon-inner" style="color:${STATUS_CONFIG[s].color}">
            ${STATUS_CONFIG[s].icon}
          </span>
        </div>
        <div>
          <div class="oa-stat-val" style="color:${STATUS_CONFIG[s].color}">
            ${counts[s]}
          </div>
          <div class="oa-stat-key">${s}</div>
        </div>
      </div>`,
      )
      .join("")}
  `;
}

window.filterByStatus = (status) => {
  const sel = document.getElementById("oa-filter-status");
  if (!sel) return;
  sel.value = sel.value === status ? "" : status;
  renderAll();
};

function renderCalendar(bulan) {
  const calWrap = document.getElementById("oa-cal-wrap");
  const cal = document.getElementById("oa-calendar");
  if (!calWrap || !cal) return;

  if (!bulan) {
    calWrap.classList.add("gn-hidden");
    return;
  }
  calWrap.classList.remove("gn-hidden");

  const [year, month] = bulan.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const statusMap = {};
  absensiData
    .filter((a) => a.tanggal.slice(0, 10).startsWith(bulan))
    .forEach((a) => {
      statusMap[a.tanggal.slice(0, 10)] = a.status;
    });

  let html = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    .map((d) => `<div class="oa-cal-dayname">${d}</div>`)
    .join("");

  for (let i = 0; i < firstDay; i++)
    html += `<div class="oa-cal-day oa-cal-empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(year, month - 1, d).getDay();
    const st = statusMap[key];
    const cfg = st ? STATUS_CONFIG[st] : null;
    const isAktif = dow >= 1 && dow <= 4;

    html += `
      <div class="oa-cal-day
        ${st ? "oa-cal-has-data" : ""}
        ${!isAktif ? "oa-cal-nonaktif" : ""}"
        style="${
          cfg
            ? `background:${cfg.bg};border-color:${cfg.ring};color:${cfg.color}`
            : !isAktif
              ? "opacity:0.35"
              : ""
        }">
        <span class="oa-cal-dnum">${d}</span>
        ${st ? `<span class="oa-cal-dicon">${cfg.icon}</span>` : ""}
      </div>`;
  }

  cal.innerHTML = html;
}

function renderTable(data, bulan) {
  const body = document.getElementById("oa-table-body");
  const empty = document.getElementById("oa-empty");
  const count = document.getElementById("oa-record-count");
  const title = document.getElementById("oa-table-title");
  if (!body) return;

  if (bulan) {
    const [y, m] = bulan.split("-");
    title.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> Absensi ${BULAN_NAMA[parseInt(m)]} ${y}`;
  } else {
    title.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> Daftar Absensi`;
  }

  if (count) count.textContent = `${data.length} data`;

  if (data.length === 0) {
    body.innerHTML = "";
    empty.classList.remove("gn-hidden");
    return;
  }
  empty.classList.add("gn-hidden");

  body.innerHTML = data
    .map((a) => {
      const tgl = a.tanggal.slice(0, 10);
      const [y, m, d] = tgl.split("-");
      const dow = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getDay();
      const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.Alpha;

      return `
      <tr class="ag-tr">
        <td class="ag-td oa-td-date">
          <div class="oa-date-wrap">
            <div class="oa-date-day"
              style="background:${cfg.bg};color:${cfg.color}">${d}</div>
            <div class="oa-date-info">
              <div class="oa-date-bln">${BULAN_NAMA[parseInt(m)]} ${y}</div>
              <div class="oa-date-hari">${HARI[dow]}</div>
            </div>
          </div>
        </td>
        <td class="ag-td oa-td-hari">${HARI[dow]}</td>
        <td class="ag-td">
          <span class="oa-status-badge"
            style="background:${cfg.bg};color:${cfg.color};border:1.5px solid ${cfg.ring}">
            ${cfg.icon} ${a.status}
          </span>
        </td>
        <td class="ag-td oa-td-ket">
          ${
            a.catatan
              ? `<span class="oa-ket-chip">${a.catatan}</span>`
              : `<span class="oa-ket-empty">—</span>`
          }
        </td>
      </tr>`;
    })
    .join("");
}

function renderRekap() {
  const wrap = document.getElementById("oa-rekap-wrap");
  const grid = document.getElementById("oa-rekap-grid");
  if (!wrap || !grid) return;

  const bulanSet = new Set(absensiData.map((a) => a.tanggal.slice(0, 7)));
  const bulanList = [...bulanSet].sort().reverse();

  if (bulanList.length === 0) {
    wrap.classList.add("gn-hidden");
    return;
  }
  wrap.classList.remove("gn-hidden");

  grid.innerHTML = bulanList
    .map((b) => {
      const [y, m] = b.split("-").map(Number);
      const data = absensiData.filter((a) => a.tanggal.slice(0, 7) === b);

      const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
      data.forEach((a) => {
        if (counts[a.status] !== undefined) counts[a.status]++;
      });

      const total = hitungHariAktif(y, m);
      const pct = total > 0 ? Math.round((counts.Hadir / total) * 100) : 0;
      const clr = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
      const clrTxt = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";

      return `
      <div class="oa-rekap-card">
        <div class="oa-rekap-header">
          <span class="oa-rekap-bulan">${BULAN_NAMA[m]} ${y}</span>
          <span class="oa-rekap-pct" style="color:${clrTxt}">${pct}%</span>
        </div>
        <div class="ak-bar-wrap">
          <div class="ak-bar" style="width:${pct}%;background:${clr}"></div>
        </div>
        <div class="oa-rekap-pills">
          ${Object.entries(counts)
            .map(
              ([s, v]) => `
            <div class="oa-rekap-pill"
              style="background:${STATUS_CONFIG[s].bg};color:${STATUS_CONFIG[s].color}">
              ${STATUS_CONFIG[s].icon} ${v}
            </div>`,
            )
            .join("")}
        </div>
        <div class="oa-rekap-total">
          ${counts.Hadir} hadir dari ${total} hari aktif
        </div>
      </div>`;
    })
    .join("");
}

function updateTotalPct() {
  const bulan = document.getElementById("oa-filter-bulan")?.value || "";
  const hadir = bulan
    ? absensiData.filter(
        (a) => a.status === "Hadir" && a.tanggal.slice(0, 10).startsWith(bulan),
      ).length
    : absensiData.filter((a) => a.status === "Hadir").length;

  let total, pct;
  if (bulan) {
    const [y, m] = bulan.split("-").map(Number);
    total = hitungHariAktif(y, m);
    pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
  } else {
    const bulanSet = [
      ...new Set(absensiData.map((a) => a.tanggal.slice(0, 7))),
    ];
    total = totalHariAktifDariBulanSet(bulanSet);
    pct = total > 0 ? Math.round((hadir / total) * 100) : 0;
  }

  const el = document.getElementById("oa-total-pct");
  if (el) {
    el.textContent = pct + "%";
    el.style.color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
  }
}

function bindEvents() {
  document
    .getElementById("oa-filter-bulan")
    ?.addEventListener("change", renderAll);
  document
    .getElementById("oa-filter-status")
    ?.addEventListener("change", renderAll);
}

import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";

const NILAI_MAP = {
  A: 95,
  "B+": 85,
  B: 80,
  "B-": 75,
  "C+": 70,
  C: 65,
  "C-": 60,
  D: 50,
};

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
  A: "Sangat Baik",
  "B+": "Baik Sekali",
  B: "Baik",
  "B-": "Cukup Baik",
  "C+": "Cukup Baik",
  C: "Cukup",
  "C-": "Kurang Cukup",
  D: "Kurang",
};

const NILAI_LIST = ["A", "B+", "B", "B-", "C+", "C", "C-", "D"];

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

let nilaiHarian = [];
let nilaiKenaikan = [];

function scoreToGrade(avg) {
  if (avg >= 93) return "A";
  if (avg >= 83) return "B+";
  if (avg >= 78) return "B";
  if (avg >= 73) return "B-";
  if (avg >= 68) return "C+";
  if (avg >= 63) return "C";
  if (avg >= 58) return "C-";
  return "D";
}

export async function renderOrtuNilai() {
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
      ${renderSidebarOrtu("ortu-nilai")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Laporan Nilai Siswa</h2>
            <p class="ag-subtitle">Pantau perkembangan nilai ${namaSiswa}</p>
          </div>
        </div>

        <!-- PROFIL CARD -->
        <div class="oa-profil-card on-profil">
          <div class="oa-profil-avatar oa-profil-avatar--blue">${initials}</div>
          <div class="oa-profil-info">
            <div class="oa-profil-nama">${namaSiswa}</div>
            <div class="oa-profil-detail">
              <span class="oa-profil-chip">${kelas}</span>
            </div>
          </div>
          <div class="on-profil-right">
            <div class="on-profil-stat">
              <span class="on-ps-val" id="on-avg-val">—</span>
              <span class="on-ps-label">Rata-rata</span>
            </div>
            <div class="on-profil-stat">
              <span class="on-ps-val on-ps-val--purple" id="on-pertemuan">—</span>
              <span class="on-ps-label">Pertemuan</span>
            </div>
            <div class="on-profil-stat">
              <span class="on-ps-val on-ps-val--green" id="on-hal-terakhir">—</span>
              <span class="on-ps-label">Hal. Terakhir</span>
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div id="on-loading" class="on-loading-wrap">
          <div class="gn-loading-spinner"></div>
          <p class="on-loading-text">Memuat data nilai...</p>
        </div>

        <!-- FILTER BAR -->
        <div class="gn-card on-filter-card" id="on-filter-card" style="display:none">
          <div class="on-filter-row">
            <div class="ag-form-group on-filter-group on-filter-group--lg">
              <label class="gn-label">Jenis Nilai</label>
              <select class="gn-select" id="on-jenis">
                <option value="harian">Nilai Harian</option>
                <option value="kenaikan">Kenaikan Jilid</option>
              </select>
            </div>
            <div class="ag-form-group on-filter-group on-filter-group--lg" id="on-wrap-bulan">
              <label class="gn-label">Periode Waktu</label>
              <select class="gn-select" id="on-bulan">
                <option value="">Semua Waktu</option>
              </select>
            </div>
            <div class="ag-form-group on-filter-group" id="on-wrap-filter-nilai">
              <label class="gn-label">Filter Nilai Bacaan</label>
              <select class="gn-select" id="on-filter-nilai">
                <option value="">Semua Nilai</option>
                <option value="A">A — Sangat Baik</option>
                <option value="B+">B+ — Baik Sekali</option>
                <option value="B">B — Baik</option>
                <option value="B-">B- — Cukup Baik</option>
                <option value="C+">C+ — Cukup Baik</option>
                <option value="C">C — Cukup</option>
                <option value="C-">C- — Kurang Cukup</option>
                <option value="D">D — Kurang</option>
              </select>
            </div>
          </div>
        </div>

        <!-- TABLE NILAI HARIAN -->
        <div id="on-harian-wrap" style="display:none">
          <div class="gn-card on-table-card">
            <div class="on-table-header">
              <span class="oa-section-title on-section-title-inline" id="on-table-title">📋 Nilai Harian</span>
              <span class="oa-record-count" id="on-count"></span>
            </div>
            <div class="on-table-scroll">
              <table class="on-table">
                <colgroup>
                  <col class="on-col-tanggal"/>
                  <col class="on-col-bacaan"/>
                  <col class="on-col-halaman"/>
                  <col class="on-col-hafalan"/>
                  <col class="on-col-menulis"/>
                  <col class="on-col-rata"/>
                  <col class="on-col-catatan"/>
                </colgroup>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Bacaan</th>
                    <th>Halaman</th>
                    <th>Hafalan</th>
                    <th>Menulis</th>
                    <th>Rata-rata</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody id="on-table-body"></tbody>
              </table>
            </div>
            <div class="ag-empty gn-hidden" id="on-empty">
              <span>📝</span><p>Tidak ada data nilai</p>
            </div>
          </div>
        </div>

        <!-- TABLE KENAIKAN JILID -->
        <div id="on-kenaikan-wrap" style="display:none">
          <div class="gn-card on-table-card">
            <div class="on-table-header">
              <span class="oa-section-title on-section-title-inline">🏆 Riwayat Kenaikan Jilid</span>
            </div>
            <div class="on-table-scroll">
              <table class="on-table on-table--kenaikan">
                <colgroup>
                  <col class="on-col-tanggal"/>
                  <col class="on-col-kenaikan"/>
                  <col class="on-col-nilai3"/>
                  <col class="on-col-nilai3"/>
                  <col class="on-col-nilai3"/>
                  <col class="on-col-keputusan"/>
                  <col class="on-col-catatan"/>
                </colgroup>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kenaikan</th>
                    <th>Bacaan</th>
                    <th>Hafalan</th>
                    <th>Menulis</th>
                    <th>Keputusan</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody id="on-kenaikan-body"></tbody>
              </table>
            </div>
            <div class="ag-empty gn-hidden" id="on-kenaikan-empty">
              <span>🏆</span><p>Belum ada riwayat kenaikan jilid</p>
            </div>
          </div>
        </div>

        <!-- REKAP BULANAN -->
        <div class="gn-card on-rekap-outer" id="on-rekap-wrap" style="display:none">
          <div class="oa-section-title">📊 Rekap Nilai per Bulan</div>
          <div class="on-rekap-grid" id="on-rekap-grid"></div>
        </div>

        <!-- CATATAN GURU -->
        <div class="gn-card on-catatan-card" id="on-catatan-card" style="display:none">
          <div class="oa-section-title">💬 Catatan Guru Terbaru</div>
          <div id="on-catatan-list"></div>
        </div>

      </main>
    </div>
  `;

  if (!siswaId) {
    document.getElementById("on-loading").innerHTML =
      `<p class="on-error-text">Siswa tidak ditemukan.</p>`;
    return;
  }

  try {
    const res = await api.get(`/nilai?siswaId=${siswaId}`);
    const allNilai = res.data || [];

    // Kelompokkan per sesi
    const sesiMap = {};
    allNilai.forEach((n) => {
      const key = `${n.tanggal.slice(0, 10)}_${n.tipeInput || "reguler"}`;
      if (!sesiMap[key])
        sesiMap[key] = {
          tanggal: n.tanggal.slice(0, 10),
          tipeInput: n.tipeInput || "reguler",
          data: {},
          meta: n,
        };
      sesiMap[key].data[n.jenis] = n;
    });

    const sesiList = Object.values(sesiMap).sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
    );
    nilaiHarian = sesiList.filter((s) => s.tipeInput === "reguler");
    nilaiKenaikan = sesiList.filter((s) => s.tipeInput === "kenaikan_jilid");

    // Isi filter bulan
    const bulanSet = new Set(nilaiHarian.map((s) => s.tanggal.slice(0, 7)));
    const bulanList = [...bulanSet].sort().reverse();
    const selBulan = document.getElementById("on-bulan");
    selBulan.innerHTML =
      `<option value="">Semua Waktu</option>` +
      bulanList
        .map((b) => {
          const [y, m] = b.split("-");
          return `<option value="${b}">${BULAN_NAMA[parseInt(m)]} ${y}</option>`;
        })
        .join("");

    // Update profil
    const halamanTertinggi = allNilai.reduce(
      (max, n) => Math.max(max, n.halamanSelesai || 0),
      0,
    );
    document.getElementById("on-pertemuan").textContent = nilaiHarian.length;
    document.getElementById("on-hal-terakhir").textContent =
      halamanTertinggi > 0 ? `Hal. ${halamanTertinggi}` : "-";

    // Tampilkan konten
    document.getElementById("on-loading").style.display = "none";
    document.getElementById("on-filter-card").style.display = "block";
    document.getElementById("on-harian-wrap").style.display = "block";
    document.getElementById("on-rekap-wrap").style.display = "block";
    document.getElementById("on-catatan-card").style.display = "block";

    renderAll();
    bindEvents();
  } catch (err) {
    document.getElementById("on-loading").innerHTML =
      `<p class="on-error-text">Gagal memuat data: ${err.message}</p>`;
  }
}

function renderAll() {
  const jenis = document.getElementById("on-jenis")?.value || "harian";
  const bulan = document.getElementById("on-bulan")?.value || "";
  const filter = document.getElementById("on-filter-nilai")?.value || "";

  const harianWrap = document.getElementById("on-harian-wrap");
  const kenaikanWrap = document.getElementById("on-kenaikan-wrap");
  const rekapWrap = document.getElementById("on-rekap-wrap");

  if (jenis === "kenaikan") {
    harianWrap.style.display = "none";
    kenaikanWrap.style.display = "block";
    rekapWrap.style.display = "none";
    renderKenaikan();
  } else {
    harianWrap.style.display = "block";
    kenaikanWrap.style.display = "none";
    rekapWrap.style.display = "block";

    const filtered = nilaiHarian.filter((s) => {
      const matchBulan = !bulan || s.tanggal.startsWith(bulan);
      const matchNilai = !filter || s.data.bacaan?.nilai === filter;
      return matchBulan && matchNilai;
    });

    renderTableHarian(filtered, bulan);
    renderRekap();
    renderCatatan();
    updateAvg(filtered);
  }
}

function updateAvg(data) {
  const el = document.getElementById("on-avg-val");
  if (!el || data.length === 0) {
    if (el) el.textContent = "—";
    return;
  }
  const scores = data.map((s) => {
    const vals = ["bacaan", "hafalan", "menulis"].map(
      (j) => NILAI_MAP[s.data[j]?.nilai] || 0,
    );
    return vals.reduce((a, b) => a + b, 0) / 3;
  });
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const grade = scoreToGrade(avg);
  el.textContent = grade;
  el.style.color = NILAI_COLOR[grade];
}

function renderTableHarian(data, bulan) {
  const body = document.getElementById("on-table-body");
  const empty = document.getElementById("on-empty");
  const count = document.getElementById("on-count");
  const title = document.getElementById("on-table-title");
  if (!body) return;

  if (bulan) {
    const [y, m] = bulan.split("-");
    title.textContent = `📋 Nilai Harian — ${BULAN_NAMA[parseInt(m)]} ${y}`;
  } else {
    title.textContent = "📋 Nilai Harian";
  }
  if (count) count.textContent = `${data.length} data`;

  if (data.length === 0) {
    body.innerHTML = "";
    empty.classList.remove("gn-hidden");
    return;
  }
  empty.classList.add("gn-hidden");

  body.innerHTML = data
    .map((s) => {
      const [y, m, d] = s.tanggal.split("-");
      const dow = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getDay();
      const b = s.data.bacaan?.nilai || "-";
      const h = s.data.hafalan?.nilai || "-";
      const mw = s.data.menulis?.nilai || "-";
      const scores = [b, h, mw].map((v) => NILAI_MAP[v] || 0);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / 3);
      const avgGrade = scoreToGrade(avg);
      const halaman = s.meta.halamanMulai
        ? `Hal. ${s.meta.halamanMulai}–${s.meta.halamanSelesai}`
        : "-";
      const catatan = s.meta.catatan || "";
      return `
      <tr class="on-tr">
        <td class="on-td">
          <div class="on-date-cell">
            <div class="on-date-box" style="background:${NILAI_BG[b] || "#f1f5f9"};color:${NILAI_COLOR[b] || "#64748b"}">${d}</div>
            <div>
              <div class="on-date-bln">${BULAN_NAMA[parseInt(m)].slice(0, 3)} ${y}</div>
              <div class="on-date-hari">${HARI[dow]}</div>
            </div>
          </div>
        </td>
        <td class="on-td on-td-center">${nilaiPill(b)}</td>
        <td class="on-td on-td-hal">${halaman}</td>
        <td class="on-td on-td-center">${nilaiPill(h)}</td>
        <td class="on-td on-td-center">${nilaiPill(mw)}</td>
        <td class="on-td on-td-center">
          <div class="on-avg-cell">${nilaiPill(avgGrade)}<span class="on-avg-num">${avg}</span></div>
        </td>
        <td class="on-td on-td-catatan">
          ${
            catatan
              ? `<div class="on-catatan-bubble">${catatan}</div>`
              : `<span class="on-empty-val">—</span>`
          }
        </td>
      </tr>`;
    })
    .join("");
}

function renderKenaikan() {
  const body = document.getElementById("on-kenaikan-body");
  const empty = document.getElementById("on-kenaikan-empty");
  if (!body) return;

  if (nilaiKenaikan.length === 0) {
    body.innerHTML = "";
    empty.classList.remove("gn-hidden");
    return;
  }
  empty.classList.add("gn-hidden");

  body.innerHTML = nilaiKenaikan
    .map((s) => {
      const [y, m, d] = s.tanggal.split("-");
      const b = s.data.bacaan?.nilai || "-";
      const h = s.data.hafalan?.nilai || "-";
      const mw = s.data.menulis?.nilai || "-";
      const kep = s.meta.keputusan || "";
      const isNaik = kep === "naik";
      return `
      <tr class="on-tr ${isNaik ? "on-tr--naik" : "on-tr--tidak"}">
        <td class="on-td on-td-date">${d} ${BULAN_NAMA[parseInt(m)].slice(0, 3)} ${y}</td>
        <td class="on-td">
          <span class="on-kenaikan-chip">📖 Ujian Kenaikan</span>
        </td>
        <td class="on-td on-td-center">${nilaiPill(b)}</td>
        <td class="on-td on-td-center">${nilaiPill(h)}</td>
        <td class="on-td on-td-center">${nilaiPill(mw)}</td>
        <td class="on-td on-td-center">
          <span class="${isNaik ? "on-keputusan-naik" : "on-keputusan-tidak"}">
            ${isNaik ? "🎉 Naik Jilid" : "↩️ Tidak Naik"}
          </span>
        </td>
        <td class="on-td on-td-catatan">
          ${
            s.meta.catatan
              ? `<div class="on-catatan-bubble">${s.meta.catatan}</div>`
              : `<span class="on-empty-val">—</span>`
          }
        </td>
      </tr>`;
    })
    .join("");
}

function renderRekap() {
  const grid = document.getElementById("on-rekap-grid");
  if (!grid) return;

  const bulanSet = new Set(nilaiHarian.map((s) => s.tanggal.slice(0, 7)));
  const bulanList = [...bulanSet].sort().reverse();

  if (bulanList.length === 0) {
    grid.innerHTML = `<p class="on-rekap-empty">Belum ada data</p>`;
    return;
  }

  grid.innerHTML = bulanList
    .map((b) => {
      const [y, m] = b.split("-");
      const data = nilaiHarian.filter((s) => s.tanggal.startsWith(b));

      const cnt = {};
      NILAI_LIST.forEach((v) => (cnt[v] = 0));
      data.forEach((s) => {
        const v = s.data.bacaan?.nilai;
        if (v && cnt[v] !== undefined) cnt[v]++;
      });

      const scores = data.map((s) => NILAI_MAP[s.data.bacaan?.nilai] || 0);
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      const grade = scoreToGrade(avg);

      return `
      <div class="on-rekap-card">
        <div class="on-rekap-top">
          <span class="on-rekap-bulan">${BULAN_NAMA[parseInt(m)].slice(0, 3)} ${y}</span>
          <div class="on-rekap-grade" style="background:${NILAI_BG[grade]};color:${NILAI_COLOR[grade]}">${grade}</div>
        </div>
        <div class="on-rekap-avg">Rata-rata: <strong>${avg}</strong></div>
        <div class="ak-bar-wrap">
          <div class="ak-bar" style="width:${avg}%;background:${NILAI_COLOR[grade]}"></div>
        </div>
        <div class="on-rekap-pills">
          ${NILAI_LIST.filter((v) => cnt[v] > 0)
            .map(
              (v) => `
            <span class="on-rekap-pill" style="background:${NILAI_BG[v]};color:${NILAI_COLOR[v]}">${v}:${cnt[v]}</span>`,
            )
            .join("")}
        </div>
        <div class="on-rekap-total">${data.length} pertemuan</div>
      </div>`;
    })
    .join("");
}

function renderCatatan() {
  const el = document.getElementById("on-catatan-list");
  if (!el) return;
  const berCatatan = nilaiHarian.filter((s) => s.meta.catatan).slice(0, 5);
  if (berCatatan.length === 0) {
    el.innerHTML = `<p class="on-catatan-empty">Belum ada catatan guru</p>`;
    return;
  }
  el.innerHTML = berCatatan
    .map((s) => {
      const [y, m, d] = s.tanggal.split("-");
      const b = s.data.bacaan?.nilai || "-";
      const h = s.data.hafalan?.nilai || "-";
      const mw = s.data.menulis?.nilai || "-";
      return `
      <div class="on-catatan-item">
        <div class="on-cat-left">
          <div class="on-cat-icon">${b === "A" ? "⭐" : "💬"}</div>
        </div>
        <div class="on-cat-body">
          <div class="on-cat-date">${d} ${BULAN_NAMA[parseInt(m)].slice(0, 3)} ${y}</div>
          <div class="on-cat-text">${s.meta.catatan}</div>
          <div class="on-cat-nilai">
            ${nilaiPill(b)} Bacaan &nbsp;
            ${nilaiPill(h)} Hafalan &nbsp;
            ${nilaiPill(mw)} Menulis
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function nilaiPill(v) {
  if (!v || v === "-") return `<span class="on-empty-val">—</span>`;
  return `<span class="on-nilai-pill" style="background:${NILAI_BG[v]};color:${NILAI_COLOR[v]}" title="${NILAI_LABEL[v] || ""}">${v}</span>`;
}

function bindEvents() {
  document.getElementById("on-jenis")?.addEventListener("change", renderAll);
  document.getElementById("on-bulan")?.addEventListener("change", renderAll);
  document
    .getElementById("on-filter-nilai")
    ?.addEventListener("change", renderAll);
}

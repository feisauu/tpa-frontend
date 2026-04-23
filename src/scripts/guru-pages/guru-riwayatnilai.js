import { renderSidebarGuru } from "../../components/sidebar-guru";
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
const TIPE_LABEL = { reguler: "Reguler", kenaikan_jilid: "Ujian Kenaikan" };
const TIPE_COLOR = { reguler: "#6366f1", kenaikan_jilid: "#d97706" };
const TIPE_BG = { reguler: "#ede9fe", kenaikan_jilid: "#fef9c3" };

const SURAT_LIST = [
  "Al-Fatihah",
  "Al-Baqarah",
  "Ali Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Taubah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Asy-Syu'ara",
  "An-Naml",
  "Al-Qasas",
  "Al-Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Asy-Syura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jasiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Az-Zariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadilah",
  "Al-Hasyr",
  "Al-Mumtahanah",
  "As-Saf",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Tagabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddassir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Nazi'at",
  "Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Insyiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Gasyiyah",
  "Al-Fajr",
  "Al-Balad",
  "Asy-Syams",
  "Al-Lail",
  "Ad-Duha",
  "Asy-Syarh",
  "At-Tin",
  "Al-Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-Adiyat",
  "Al-Qari'ah",
  "At-Takasur",
  "Al-Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraisy",
  "Al-Ma'un",
  "Al-Kausar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

const getSurat = (id) => (id ? (SURAT_LIST[id - 1] ?? `Surat ${id}`) : "-");

// ── State ──────────────────────────────────────────────────────
let kelasList = [];
let siswaList = [];
let semuaNilai = [];
let riwayatData = [];
let rekapData = {};
let allKelasRiwayat = [];

let currentKelasId = null;
let currentSiswaId = null;
let currentViewKelasId = null;
let currentJenisKelas = "";

const PAGE_SIZE = 10;
let currentPage = 1;
let currentFilter = "semua";

export function renderGuruRiwayatNilai() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-riwayatnilai")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Riwayat Nilai</h2>
            <p class="ag-subtitle">Lihat histori nilai siswa per kelas</p>
          </div>
        </div>

        <!-- FILTER CARD -->
        <div class="gn-card">
          <div class="ab-form-top">
            <div class="ag-form-group ab-form-tanggal">
              <label class="gn-label">Pilih Kelas</label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="rv-kelas">
                  <option value="">-- Pilih Kelas --</option>
                </select>
              </div>
            </div>
            <div class="ag-form-group ab-form-kelas">
              <label class="gn-label">Pilih Siswa</label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="rv-siswa" disabled>
                  <option value="">-- Pilih Siswa --</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- REKAP CARD -->
        <div class="gn-card gn-hidden" id="rv-rekap-card">
          <div class="rv-rekap-header">
            <div>
              <h3 class="rv-rekap-name" id="rv-rekap-name">-</h3>
              <span class="rv-rekap-kelas" id="rv-rekap-kelas">-</span>
            </div>
            <div class="rv-saw-wrap" id="rv-saw-wrap"></div>
          </div>
          <div class="rv-rekap-grid" id="rv-rekap-grid"></div>
        </div>

        <!-- TABEL RIWAYAT -->
        <div class="gn-card gn-hidden" id="rv-table-card">

          <div id="rv-kelas-pills" style="margin-bottom:16px"></div>

          <div class="rv-tab-bar" id="rv-tab-bar">
            <button class="rv-tab rv-tab-active" data-filter="semua">Semua</button>
            <button class="rv-tab" data-filter="reguler">Reguler</button>
            <button class="rv-tab" data-filter="kenaikan_jilid" id="rv-tab-kenaikan">Ujian Kenaikan</button>
          </div>

          <div id="rv-loading" class="gn-loading-wrap gn-hidden">
            <div class="gn-loading-spinner"></div>
            <p class="gn-loading-text">Memuat riwayat nilai...</p>
          </div>

          <div class="ab-table-scroll" id="rv-table-area">
            <table class="ab-table">
              <thead id="rv-thead"></thead>
              <tbody id="rv-tbody"></tbody>
            </table>
          </div>

          <div class="rv-empty gn-hidden" id="rv-empty">
            <span>📭</span>
            <p>Belum ada data nilai untuk filter ini</p>
          </div>

          <!-- PAGINATION -->
          <div class="ag-pagination" id="rv-pagination" style="display:none">
            <div class="ag-pagination-info" id="rv-pagination-info"></div>
            <div class="ag-pagination-controls" id="rv-pagination-controls"></div>
          </div>

        </div>

      </main>
    </div>
  `;

  loadKelas().then(() => {
    const raw = sessionStorage.getItem("rv_state");
    if (!raw) return;
    sessionStorage.removeItem("rv_state");

    try {
      const state = JSON.parse(raw);
      const selKelas = document.getElementById("rv-kelas");
      selKelas.value = state.kelasId;
      selKelas.dispatchEvent(new Event("change"));

      const interval = setInterval(() => {
        const selSiswa = document.getElementById("rv-siswa");
        if (!selSiswa || selSiswa.disabled || selSiswa.options.length <= 1)
          return;
        clearInterval(interval);
        selSiswa.value = state.siswaId;
        selSiswa.dispatchEvent(new Event("change"));
      }, 150);
    } catch (e) {
      console.error("rv_state parse error:", e);
    }
  });

  bindEvents();
}

function bindEvents() {
  document.getElementById("rv-kelas")?.addEventListener("change", async (e) => {
    currentKelasId = e.target.value;
    currentSiswaId = null;
    semuaNilai = [];
    riwayatData = [];
    allKelasRiwayat = [];

    document.getElementById("rv-rekap-card").classList.add("gn-hidden");
    document.getElementById("rv-table-card").classList.add("gn-hidden");

    const selSiswa = document.getElementById("rv-siswa");
    selSiswa.disabled = true;
    selSiswa.innerHTML = `<option value="">-- Pilih Siswa --</option>`;

    if (!currentKelasId) return;

    const kelas = kelasList.find(
      (k) => String(k.id) === String(currentKelasId),
    );
    currentJenisKelas = kelas?.jenis ?? "jilid";

    await loadSiswa(currentKelasId);
    selSiswa.disabled = false;
  });

  document.getElementById("rv-siswa")?.addEventListener("change", async (e) => {
    currentSiswaId = e.target.value;
    if (!currentSiswaId) {
      document.getElementById("rv-rekap-card").classList.add("gn-hidden");
      document.getElementById("rv-table-card").classList.add("gn-hidden");
      return;
    }
    currentViewKelasId = currentKelasId;
    currentPage = 1;
    currentFilter = "semua";
    await loadRiwayat();
  });

  document.getElementById("rv-tab-bar")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".rv-tab");
    if (!btn) return;
    document
      .querySelectorAll(".rv-tab")
      .forEach((t) => t.classList.remove("rv-tab-active"));
    btn.classList.add("rv-tab-active");
    currentFilter = btn.dataset.filter;
    currentPage = 1;
    renderTabel(currentFilter);
  });

  // Event delegasi pagination
  document
    .getElementById("rv-pagination-controls")
    ?.addEventListener("click", (e) => {
      const btn = e.target.closest(".ag-page-btn");
      if (!btn || btn.disabled) return;
      const page = parseInt(btn.dataset.page);
      if (!isNaN(page)) {
        currentPage = page;
        renderTabel(currentFilter);
        document.getElementById("rv-table-card")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
}

async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
    const sel = document.getElementById("rv-kelas");
    sel.innerHTML =
      `<option value="">-- Pilih Kelas --</option>` +
      kelasList
        .map((k) => `<option value="${k.id}">${k.namaKelas}</option>`)
        .join("");
  } catch (err) {
    console.error("Gagal load kelas:", err);
  }
}

async function loadSiswa(kelasId) {
  try {
    const res = await api.get(`/siswa/kelas/${kelasId}`);
    siswaList = res.data;
    const sel = document.getElementById("rv-siswa");
    sel.innerHTML =
      `<option value="">-- Pilih Siswa --</option>` +
      siswaList
        .map((s) => `<option value="${s.id}">${s.nama}</option>`)
        .join("");
  } catch (err) {
    console.error("Gagal load siswa:", err);
  }
}

async function loadRiwayat() {
  const loading = document.getElementById("rv-loading");
  const tableArea = document.getElementById("rv-table-area");
  const tableCard = document.getElementById("rv-table-card");
  const rekapCard = document.getElementById("rv-rekap-card");

  tableCard.classList.remove("gn-hidden");
  loading.classList.remove("gn-hidden");
  tableArea.style.display = "none";
  rekapCard.classList.add("gn-hidden");

  try {
    const [nilaiRes, rekapRes] = await Promise.all([
      api.get(`/nilai?siswaId=${currentSiswaId}`),
      api.get(`/nilai/rekap/${currentSiswaId}`),
    ]);

    semuaNilai = nilaiRes.data ?? [];
    rekapData = rekapRes.data?.rekap ?? {};

    const kelasIdSet = new Set(
      semuaNilai
        .map((n) => n.kelasId)
        .filter(Boolean)
        .map(Number),
    );
    kelasIdSet.add(Number(currentKelasId));

    allKelasRiwayat = kelasList
      .filter((k) => kelasIdSet.has(k.id))
      .sort((a, b) => (a.urutan ?? 99) - (b.urutan ?? 99));

    riwayatData = semuaNilai.filter(
      (n) => String(n.kelasId) === String(currentViewKelasId),
    );

    const kelasView = kelasList.find(
      (k) => String(k.id) === String(currentViewKelasId),
    );
    currentJenisKelas = kelasView?.jenis ?? "jilid";

    const tabKenaikan = document.getElementById("rv-tab-kenaikan");
    if (tabKenaikan)
      tabKenaikan.style.display = currentJenisKelas === "alquran" ? "none" : "";

    const siswa = siswaList.find(
      (s) => String(s.id) === String(currentSiswaId),
    );
    renderRekap(siswa, kelasView);
    renderKelasPills();

    document
      .querySelectorAll(".rv-tab")
      .forEach((t) => t.classList.remove("rv-tab-active"));
    document
      .querySelector('.rv-tab[data-filter="semua"]')
      ?.classList.add("rv-tab-active");

    currentFilter = "semua";
    currentPage = 1;
    renderTabel("semua");
    rekapCard.classList.remove("gn-hidden");
    tableArea.style.display = "";
  } catch (err) {
    console.error("Gagal load riwayat:", err);
    showToast("Gagal memuat riwayat nilai", "error");
  } finally {
    loading.classList.add("gn-hidden");
  }
}

window.gantiViewKelas = function (kelasId) {
  currentViewKelasId = kelasId;
  riwayatData = semuaNilai.filter((n) => String(n.kelasId) === String(kelasId));

  const kelasView = kelasList.find((k) => k.id === kelasId);
  currentJenisKelas = kelasView?.jenis ?? "jilid";

  const tabKenaikan = document.getElementById("rv-tab-kenaikan");
  if (tabKenaikan)
    tabKenaikan.style.display = currentJenisKelas === "alquran" ? "none" : "";

  const siswa = siswaList.find((s) => String(s.id) === String(currentSiswaId));
  renderRekap(siswa, kelasView);
  renderKelasPills();

  document
    .querySelectorAll(".rv-tab")
    .forEach((t) => t.classList.remove("rv-tab-active"));
  document
    .querySelector('.rv-tab[data-filter="semua"]')
    ?.classList.add("rv-tab-active");

  currentFilter = "semua";
  currentPage = 1;
  renderTabel("semua");

  document
    .getElementById("rv-table-card")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function renderKelasPills() {
  const wrap = document.getElementById("rv-kelas-pills");
  if (!wrap) return;

  if (allKelasRiwayat.length <= 1) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <div class="rv-pills-label">📚 Riwayat Kelas</div>
    <div class="rv-pills-row">
      ${allKelasRiwayat
        .map((k) => {
          const isActive = String(k.id) === String(currentViewKelasId);
          const isSekarang = String(k.id) === String(currentKelasId);
          return `
          <button
            onclick="gantiViewKelas(${k.id})"
            class="rv-pill ${isActive ? "rv-pill-active" : ""}"
          >
            ${k.namaKelas}
            ${isSekarang ? `<span class="rv-pill-aktif">(aktif)</span>` : ""}
          </button>
        `;
        })
        .join("")}
    </div>
  `;
}

function renderRekap(siswa, kelas) {
  document.getElementById("rv-rekap-name").textContent = siswa?.nama ?? "-";
  document.getElementById("rv-rekap-kelas").textContent =
    kelas?.namaKelas ?? "-";

  const NILAI_MAP = { A: 100, B: 75, C: 50, D: 25 };

  const latestPerJenis = {};
  ["bacaan", "hafalan", "menulis"].forEach((jenis) => {
    const found = riwayatData.find(
      (n) => n.jenis === jenis && n.tipeInput === "reguler",
    );
    latestPerJenis[jenis] = found?.nilai ?? "D";
  });

  const halamanMax = riwayatData.reduce((max, n) => {
    const h = n.halamanSelesai || 0;
    return h > max ? h : max;
  }, 0);

  const byJenis = {};
  riwayatData
    .filter((n) => n.tipeInput === "reguler")
    .forEach((n) => {
      if (!byJenis[n.jenis]) byJenis[n.jenis] = [];
      byJenis[n.jenis].push(n.nilai);
    });

  const grid = document.getElementById("rv-rekap-grid");
  grid.innerHTML = ["bacaan", "hafalan", "menulis"]
    .map((jenis) => {
      const vals = byJenis[jenis] ?? [];
      const avg = vals.length
        ? Math.round(
            vals.reduce((s, v) => s + (NILAI_MAP[v] || 0), 0) / vals.length,
          )
        : null;
      const nilaiTerakhir = latestPerJenis[jenis];
      const extraHal =
        jenis === "bacaan" && halamanMax > 0
          ? `<span class="rv-hal-badge">📖 s.d hal ${halamanMax}/40</span>`
          : "";

      return `
      <div class="rv-rekap-item">
        <div class="rv-rekap-icon">
          ${jenis === "bacaan" ? "📖" : jenis === "hafalan" ? "🧠" : "✏️"}
        </div>
        <div class="rv-rekap-info">
          <div class="rv-rekap-jenis">${capitalize(jenis)} ${extraHal}</div>
          <div class="rv-rekap-stat">
            ${
              vals.length > 0
                ? `${vals.length}x pertemuan · rata-rata ${avg}`
                : "Belum ada nilai reguler di kelas ini"
            }
          </div>
        </div>
        <div class="rv-nilai-chip"
          style="background:${NILAI_BG[nilaiTerakhir]};color:${NILAI_COLOR[nilaiTerakhir]}">
          ${nilaiTerakhir}
        </div>
      </div>
    `;
    })
    .join("");
}

function renderTabel(filter = "semua") {
  const tbody = document.getElementById("rv-tbody");
  const thead = document.getElementById("rv-thead");
  const empty = document.getElementById("rv-empty");
  const area = document.getElementById("rv-table-area");
  const pagination = document.getElementById("rv-pagination");

  let filtered = riwayatData;
  if (filter === "reguler")
    filtered = riwayatData.filter(
      (n) => n.tipeInput === "reguler" || !n.tipeInput,
    );
  if (filter === "kenaikan_jilid")
    filtered = riwayatData.filter((n) => n.tipeInput === "kenaikan_jilid");

  const sesiMap = {};
  filtered.forEach((n) => {
    const key = `${n.tanggal}_${n.tipeInput ?? "reguler"}`;
    if (!sesiMap[key])
      sesiMap[key] = {
        tanggal: n.tanggal,
        tipeInput: n.tipeInput,
        data: {},
        meta: n,
      };
    sesiMap[key].data[n.jenis] = n;
  });

  const sesiList = Object.values(sesiMap).sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  );

  if (sesiList.length === 0) {
    area.style.display = "none";
    empty.classList.remove("gn-hidden");
    pagination.style.display = "none";
    return;
  }

  area.style.display = "";
  empty.classList.add("gn-hidden");

  // Pagination
  const totalPages = Math.ceil(sesiList.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, sesiList.length);
  const pageSesi = sesiList.slice(startIdx, endIdx);

  if (currentJenisKelas === "alquran") {
    thead.innerHTML = `
      <tr>
        <th>No</th>
        <th>Tanggal</th>
        <th>Tipe</th>
        <th>Bacaan (Surat · Ayat)</th>
        <th style="text-align:center">Nilai Bacaan</th>
        <th>Hafalan (Surat · Ayat)</th>
        <th style="text-align:center">Nilai Hafalan</th>
        <th style="text-align:center">Nilai Menulis</th>
        <th>Status</th>
        <th>Catatan</th>
      </tr>`;
    tbody.innerHTML = pageSesi
      .map((s, i) => buildRowAlquran(s, startIdx + i + 1))
      .join("");
  } else {
    thead.innerHTML = `
      <tr>
        <th>No</th>
        <th>Tanggal</th>
        <th>Tipe</th>
        <th>Halaman</th>
        <th>Hafalan</th>
        <th style="text-align:center">Bacaan</th>
        <th style="text-align:center">Hafalan</th>
        <th style="text-align:center">Menulis</th>
        <th>Status / Keputusan</th>
        <th>Catatan</th>
      </tr>`;
    tbody.innerHTML = pageSesi
      .map((s, i) => buildRowJilid(s, startIdx + i + 1))
      .join("");
  }

  renderPagination(sesiList.length, totalPages);
}

/* ── Pagination ───────────────────────────────────────────────── */
function renderPagination(totalData, totalPages) {
  const pagination = document.getElementById("rv-pagination");
  const info = document.getElementById("rv-pagination-info");
  const controls = document.getElementById("rv-pagination-controls");

  if (totalPages <= 1) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";

  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, totalData);
  info.textContent = `Menampilkan ${startIdx}–${endIdx} dari ${totalData} sesi`;

  const pages = buildPageNumbers(currentPage, totalPages);

  controls.innerHTML = `
    <button class="ag-page-btn ${currentPage === 1 ? "ag-page-btn--disabled" : ""}"
      data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    ${pages
      .map((p) =>
        p === "..."
          ? `<span class="ag-page-ellipsis">…</span>`
          : `<button class="ag-page-btn ${p === currentPage ? "ag-page-btn--active" : ""}"
               data-page="${p}">${p}</button>`,
      )
      .join("")}
    <button class="ag-page-btn ${currentPage === totalPages ? "ag-page-btn--disabled" : ""}"
      data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

function buildPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

/* ── Row jilid ───────────────────────────────────────────────── */
function buildRowJilid(sesi, no) {
  const meta = sesi.meta;
  const tipe = sesi.tipeInput ?? "reguler";
  const bacaan = sesi.data.bacaan;
  const hafalan = sesi.data.hafalan;
  const menulis = sesi.data.menulis;
  const halaman = meta.halamanMulai
    ? `${meta.halamanMulai} – ${meta.halamanSelesai ?? meta.halamanMulai}`
    : "-";
  const statusHtml =
    tipe === "kenaikan_jilid"
      ? badgeKeputusan(meta.keputusan)
      : badgeStatus(meta.status);

  return `
    <tr>
      <td class="ag-td-no" style="color:#94a3b8;font-weight:600;padding:14px 20px">${no}</td>
      <td class="rv-td-nowrap">${formatTanggal(sesi.tanggal)}</td>
      <td>${badgeTipe(tipe)}</td>
      <td>${halaman}</td>
      <td class="rv-td-hafalan">${meta.hafalanTeks || "-"}</td>
      <td style="text-align:center">${nilaiChip(bacaan?.nilai)}</td>
      <td style="text-align:center">${nilaiChip(hafalan?.nilai)}</td>
      <td style="text-align:center">${nilaiChip(menulis?.nilai)}</td>
      <td>${statusHtml}</td>
      <td class="rv-td-catatan">${meta.catatan || "-"}</td>
    </tr>`;
}

/* ── Row al-qur'an ───────────────────────────────────────────── */
function buildRowAlquran(sesi, no) {
  const meta = sesi.meta;
  const bacaan = sesi.data.bacaan;
  const hafalan = sesi.data.hafalan;
  const menulis = sesi.data.menulis;

  const infoBacaan = bacaan
    ? `${getSurat(bacaan.suratBacaanId)} ${bacaan.ayatBacaanMulai ?? ""}–${bacaan.ayatBacaanSelesai ?? ""}`.trim()
    : "-";
  const infoHafalan = hafalan
    ? `${getSurat(hafalan.suratHafalanId)} ${hafalan.ayatHafalanMulai ?? ""}–${hafalan.ayatHafalanSelesai ?? ""}`.trim()
    : "-";

  return `
    <tr>
      <td class="ag-td-no" style="color:#94a3b8;font-weight:600;padding:14px 20px">${no}</td>
      <td class="rv-td-nowrap">${formatTanggal(sesi.tanggal)}</td>
      <td>${badgeTipe(sesi.tipeInput ?? "reguler")}</td>
      <td class="rv-td-surat">${infoBacaan}</td>
      <td style="text-align:center">${nilaiChip(bacaan?.nilai)}</td>
      <td class="rv-td-surat">${infoHafalan}</td>
      <td style="text-align:center">${nilaiChip(hafalan?.nilai)}</td>
      <td style="text-align:center">${nilaiChip(menulis?.nilai)}</td>
      <td>${badgeStatus(meta.status)}</td>
      <td class="rv-td-catatan">${meta.catatan || "-"}</td>
    </tr>`;
}

function nilaiChip(nilai) {
  if (!nilai) return `<span class="rv-chip-empty">-</span>`;
  return `<span class="rv-chip-nilai"
    style="background:${NILAI_BG[nilai]};color:${NILAI_COLOR[nilai]}">${nilai}</span>`;
}

function badgeTipe(tipe) {
  return `<span class="rv-badge-tipe"
    style="background:${TIPE_BG[tipe] ?? "#ede9fe"};color:${TIPE_COLOR[tipe] ?? "#6366f1"}">
    ${TIPE_LABEL[tipe] ?? tipe}</span>`;
}

function badgeStatus(status) {
  if (!status) return "-";
  const ok = status === "lanjut";
  return `<span class="rv-badge-status"
    style="background:${ok ? "#dcfce7" : "#fee2e2"};color:${ok ? "#15803d" : "#dc2626"}">
    ${ok ? "✅ Lanjut" : "🔁 Ulang"}</span>`;
}

function badgeKeputusan(keputusan) {
  if (!keputusan) return "-";
  const ok = keputusan === "naik";
  return `<span class="rv-badge-status"
    style="background:${ok ? "#dcfce7" : "#fee2e2"};color:${ok ? "#15803d" : "#dc2626"}">
    ${ok ? "🎉 Naik Jilid" : "↩️ Tidak Naik"}</span>`;
}

function formatTanggal(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(msg, type = "success") {
  const old = document.getElementById("ag-toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.id = "ag-toast";
  t.className = `ag-toast ag-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("ag-toast-show"), 10);
  setTimeout(() => {
    t.classList.remove("ag-toast-show");
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

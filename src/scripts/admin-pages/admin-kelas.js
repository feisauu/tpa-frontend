import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

let kelasList = [];

const JENIS_LIST = ["Jilid", "Al-Qur'an"];

const NAMA_OPTIONS = {
  Jilid: [
    "Jilid Pra",
    "Jilid 1",
    "Jilid 2",
    "Jilid 3",
    "Jilid 4",
    "Jilid 5",
    "Jilid 6",
  ],
  "Al-Qur'an": ["Al-Qur'an"],
};

const JILID_COLOR = {
  Jilid: { bg: "#dbeafe", text: "#1d4ed8", bar: "#3b82f6" },
  "Al-Qur'an": { bg: "#dcfce7", text: "#15803d", bar: "#22c55e" },
};

const KAPASITAS = 20;
let editId = null;
let hapusId = null;

function getTahunAjaranDefault() {
  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = now.getMonth() + 1; // 1-12
  return bulan >= 7 ? `${tahun}/${tahun + 1}` : `${tahun - 1}/${tahun}`;
}

function getTahunAjaranList() {
  const now = new Date();
  const tahun = now.getFullYear();
  const bulan = now.getMonth() + 1;
  const base = bulan >= 7 ? tahun : tahun - 1;
  const list = [];
  for (let i = -2; i <= 2; i++) {
    list.push(`${base + i}/${base + i + 1}`);
  }
  return list;
}

const TAHUN_AJARAN_DEFAULT = getTahunAjaranDefault();
const TAHUN_AJARAN_LIST = getTahunAjaranList();

/* ============================================================
   LOAD DATA
   ============================================================ */
async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
    renderGrid(kelasList);
    updateStats();
  } catch (err) {
    showToast("Gagal load data kelas: " + err.message, "error");
  }
}

export function renderAdminKelas() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-kelas")}
      <main class="content admin-home">

        <!-- HEADER -->
        <div class="ag-header">
          <div>
            <h2 class="ag-title">
              Kelola Data Kelas
            </h2>
            <p class="ag-subtitle">Manajemen kelas Jilid dan Al-Qur'an TPA</p>
          </div>
          <button class="ag-tambah-btn" id="btn-tambah-kelas">
            <i class="fa-solid fa-plus"></i> Tambah Kelas
          </button>
        </div>

        <!-- STAT STRIP -->
        <div class="ag-stat-strip">
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#eff6ff">
              <i class="fa-solid fa-school" style="color:#3b82f6"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="sk-total">0</div>
              <div class="ag-stat-key">Total Kelas</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#f0fdf4">
              <i class="fa-solid fa-user-graduate" style="color:#22c55e"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="sk-siswa">0</div>
              <div class="ag-stat-key">Total Siswa</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#faf5ff">
              <i class="fa-solid fa-book" style="color:#8b5cf6"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="sk-jilid">0</div>
              <div class="ag-stat-key">Kelas Jilid</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#dcfce7">
              <i class="fa-solid fa-book-open" style="color:#16a34a"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="sk-quran" style="color:#16a34a">0</div>
              <div class="ag-stat-key">Kelas Al-Qur'an</div>
            </div>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="ag-toolbar">
          <div class="ag-search-wrap">
            <span class="ag-search-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input class="ag-search" id="ak-search" type="text"
              placeholder="Cari nama kelas atau guru..."/>
          </div>
          <select class="ag-filter" id="ak-filter-jenis">
            <option value="">Semua Jenis</option>
            ${JENIS_LIST.map((j) => `<option value="${j}">${j}</option>`).join("")}
          </select>
          <select class="ag-filter" id="ak-filter-tahun">
            <option value="">Semua Tahun</option>
            ${TAHUN_AJARAN_LIST.map(
              (t) =>
                `<option value="${t}" ${t === TAHUN_AJARAN_DEFAULT ? "selected" : ""}>${t}</option>`,
            ).join("")}
          </select>
        </div>

        <!-- KELAS GRID -->
        <div class="ak-grid" id="ak-grid"></div>
        <div class="ag-empty" id="ak-empty" style="display:none">
          <i class="fa-solid fa-magnifying-glass" style="font-size:32px;color:#cbd5e1"></i>
          <p>Tidak ada kelas ditemukan</p>
        </div>

      </main>
    </div>

    <!-- MODAL TAMBAH/EDIT -->
    <div class="ag-overlay" id="ak-overlay" style="display:none">
      <div class="ag-modal" style="max-width:480px">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title" id="ak-modal-title">
            <i class="fa-solid fa-plus" style="color:#6366f1;margin-right:6px"></i>
            Tambah Kelas
          </h3>
          <button class="ag-modal-close" id="ak-close-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-layer-group" style="color:#8b5cf6;margin-right:5px"></i>
              Jenis Kelas <span class="ag-required">*</span>
            </label>
            <select class="ag-input" id="ak-input-jenis">
              <option value="">-- Pilih Jenis --</option>
              ${JENIS_LIST.map((j) => `<option value="${j}">${j}</option>`).join("")}
            </select>
            <span class="ag-error" id="ak-error-jenis"></span>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-door-open" style="color:#3b82f6;margin-right:5px"></i>
              Nama Kelas <span class="ag-required">*</span>
            </label>
            <select class="ag-input" id="ak-input-nama" disabled>
              <option value="">-- Pilih Jenis dulu --</option>
            </select>
            <span class="ag-error" id="ak-error-nama"></span>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-chalkboard-user" style="color:#10b981;margin-right:5px"></i>
              Guru Pengampu
            </label>
            <select class="ag-input" id="ak-input-guru">
              <option value="">-- Pilih Guru --</option>
            </select>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-calendar" style="color:#f59e0b;margin-right:5px"></i>
              Tahun Ajaran <span class="ag-required">*</span>
            </label>
            <select class="ag-input" id="ak-input-tahun">
              ${TAHUN_AJARAN_LIST.map(
                (t) =>
                  `<option value="${t}" ${t === TAHUN_AJARAN_DEFAULT ? "selected" : ""}>${t}</option>`,
              ).join("")}
            </select>
          </div>

        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="ak-btn-batal">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-simpan" id="ak-btn-simpan">
            <i class="fa-solid fa-floppy-disk"></i> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HAPUS -->
    <div class="ag-overlay" id="ak-overlay-hapus" style="display:none">
      <div class="ag-modal ag-modal-sm">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;margin-right:6px"></i>
            Konfirmasi Hapus
          </h3>
          <button class="ag-modal-close" id="ak-close-hapus">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">
          <div class="ag-hapus-info">
            <span class="ag-hapus-icon">
              <i class="fa-solid fa-trash-can"></i>
            </span>
            <p>Apakah Anda yakin ingin menghapus kelas
              <strong id="ak-hapus-nama"></strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="ak-btn-batal-hapus">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-hapus" id="ak-btn-konfirm-hapus">
            <i class="fa-solid fa-trash-can"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  bindEvents();
  loadKelas();
}

function renderGrid(data) {
  const grid = document.getElementById("ak-grid");
  const empty = document.getElementById("ak-empty");
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  const grouped = {};
  data.forEach((k) => {
    const jenis = k.jilid || "Jilid";
    if (!grouped[jenis]) grouped[jenis] = [];
    grouped[jenis].push(k);
  });

  const jenisIcon = {
    Jilid: `<i class="fa-solid fa-book"      style="font-size:18px"></i>`,
    "Al-Qur'an": `<i class="fa-solid fa-book-open" style="font-size:18px"></i>`,
  };

  grid.innerHTML = Object.entries(grouped)
    .map(([jenis, list]) => {
      const c = JILID_COLOR[jenis] || {
        bg: "#f1f5f9",
        text: "#475569",
        bar: "#94a3b8",
      };
      return `
      <div class="ak-group">
        <div class="ak-group-header" style="color:${c.text}">
          <span class="ak-group-dot" style="background:${c.bar}"></span>
          ${jenis}
          <span class="ak-group-count">${list.length} kelas</span>
        </div>
        <div class="ak-cards">
          ${list
            .map((k) => {
              const jumlah = k._count?.siswa ?? 0;
              const pct = Math.min(Math.round((jumlah / KAPASITAS) * 100), 100);
              const penuh = pct >= 90;
              const namaGuru = k.guru?.nama || "Belum ada guru";
              return `
              <div class="ak-card">
                <div class="ak-card-top">
                  <div class="ak-card-icon" style="background:${c.bg};color:${c.text}">
                    ${jenisIcon[jenis] || `<i class="fa-solid fa-book"></i>`}
                  </div>
                  <div class="ak-card-actions">
                    <button class="ag-btn-edit ak-edit" data-id="${k.id}" title="Edit">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="ag-btn-hapus-row ak-del" data-id="${k.id}" data-nama="${k.namaKelas}" title="Hapus">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
                <div class="ak-card-nama">${k.namaKelas}</div>
                <div class="ak-card-guru">
                  <i class="fa-solid fa-chalkboard-user" style="color:#6366f1;margin-right:5px"></i>
                  ${namaGuru}
                </div>
                <div class="ak-card-guru" style="margin-top:4px;color:#b45309">
                  <i class="fa-solid fa-calendar" style="color:#f59e0b;margin-right:5px"></i>
                  ${k.tahunAjaran || TAHUN_AJARAN_DEFAULT}
                </div>
                <div class="ak-card-siswa-row">
                  <span class="ak-siswa-label">
                    <i class="fa-solid fa-users" style="margin-right:3px"></i>Siswa
                  </span>
                  <span class="ak-siswa-val ${penuh ? "ak-penuh" : ""}">${jumlah} / ${KAPASITAS}</span>
                </div>
                <div class="ak-bar-wrap">
                  <div class="ak-bar" style="width:${pct}%;background:${penuh ? "#ef4444" : c.bar}"></div>
                </div>
                <div class="ak-pct ${penuh ? "ak-pct-penuh" : ""}">
                  ${
                    penuh
                      ? `<i class="fa-solid fa-circle-exclamation" style="margin-right:3px"></i>`
                      : `<i class="fa-solid fa-chart-simple" style="margin-right:3px"></i>`
                  }
                  ${pct}% kapasitas${penuh ? " · Hampir penuh" : ""}
                </div>
                <span class="ak-jilid-pill" style="background:${c.bg};color:${c.text}">
                  ${
                    jenis === "Al-Qur'an"
                      ? `<i class="fa-solid fa-book-open" style="margin-right:4px"></i>`
                      : `<i class="fa-solid fa-book"      style="margin-right:4px"></i>`
                  }
                  ${jenis}
                </span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
    })
    .join("");
}

function updateStats() {
  const el = (id) => document.getElementById(id);
  const quranKelas = kelasList.filter((k) => k.jilid === "Al-Qur'an").length;
  const totalSiswa = kelasList.reduce((s, k) => s + (k._count?.siswa ?? 0), 0);
  if (el("sk-total")) el("sk-total").textContent = kelasList.length;
  if (el("sk-siswa")) el("sk-siswa").textContent = totalSiswa;
  if (el("sk-jilid"))
    el("sk-jilid").textContent = kelasList.length - quranKelas;
  if (el("sk-quran")) el("sk-quran").textContent = quranKelas;
}

function getFiltered() {
  const q = document.getElementById("ak-search")?.value.toLowerCase() || "";
  const jenis = document.getElementById("ak-filter-jenis")?.value || "";
  const tahun = document.getElementById("ak-filter-tahun")?.value || "";
  return kelasList.filter(
    (k) =>
      (k.namaKelas.toLowerCase().includes(q) ||
        (k.guru?.nama || "").toLowerCase().includes(q)) &&
      (!jenis || k.jilid === jenis) &&
      (!tahun || (k.tahunAjaran || TAHUN_AJARAN_DEFAULT) === tahun),
  );
}

function updateNamaKelasDropdown(jenisVal, selected = "") {
  const sel = document.getElementById("ak-input-nama");
  if (!jenisVal) {
    sel.innerHTML = `<option value="">-- Pilih Jenis dulu --</option>`;
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML =
    `<option value="">-- Pilih Nama Kelas --</option>` +
    (NAMA_OPTIONS[jenisVal] || [])
      .map(
        (k) =>
          `<option value="${k}" ${k === selected ? "selected" : ""}>${k}</option>`,
      )
      .join("");
}

async function openModal(mode = "tambah", id = null) {
  editId = id;
  clearErrors();
  document.getElementById("ak-overlay").style.display = "flex";

  try {
    const res = await api.get("/guru");
    const guruOptions = res.data
      .filter((g) => g.status === "Aktif")
      .map((g) => `<option value="${g.id}">${g.nama}</option>`)
      .join("");
    document.getElementById("ak-input-guru").innerHTML =
      `<option value="">-- Pilih Guru --</option>` + guruOptions;
  } catch (err) {
    console.error("Gagal load guru:", err);
  }

  const titleEl = document.getElementById("ak-modal-title");
  if (mode === "edit") {
    const k = kelasList.find((x) => x.id === id);
    titleEl.innerHTML = `
      <i class="fa-solid fa-pen-to-square" style="color:#6366f1;margin-right:6px"></i>
      Edit Data Kelas
    `;
    document.getElementById("ak-input-jenis").value = k.jilid || "";
    document.getElementById("ak-input-guru").value = k.guruId || "";
    document.getElementById("ak-input-tahun").value =
      k.tahunAjaran || TAHUN_AJARAN_DEFAULT;
    updateNamaKelasDropdown(k.jilid, k.namaKelas);
  } else {
    titleEl.innerHTML = `
      <i class="fa-solid fa-plus" style="color:#6366f1;margin-right:6px"></i>
      Tambah Kelas
    `;
    document.getElementById("ak-input-jenis").value = "";
    document.getElementById("ak-input-guru").value = "";
    document.getElementById("ak-input-tahun").value = TAHUN_AJARAN_DEFAULT;
    updateNamaKelasDropdown("");
  }
}

function closeModal() {
  document.getElementById("ak-overlay").style.display = "none";
  editId = null;
}

function clearErrors() {
  ["ak-error-jenis", "ak-error-nama"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function validate() {
  let ok = true;
  const set = (id, msg) => {
    document.getElementById(id).textContent = msg;
    ok = false;
  };
  if (!document.getElementById("ak-input-jenis").value)
    set("ak-error-jenis", "Pilih jenis kelas terlebih dahulu");
  if (!document.getElementById("ak-input-nama").value)
    set("ak-error-nama", "Pilih nama kelas terlebih dahulu");
  return ok;
}

async function simpan() {
  if (!validate()) return;
  const data = {
    namaKelas: document.getElementById("ak-input-nama").value,
    jilid: document.getElementById("ak-input-jenis").value,
    guruId: parseInt(document.getElementById("ak-input-guru").value) || null,
    tahunAjaran: document.getElementById("ak-input-tahun").value,
  };
  try {
    if (editId) {
      await api.put(`/kelas/${editId}`, data);
      showToast("Data kelas berhasil diperbarui!", "success");
    } else {
      await api.post("/kelas", data);
      showToast("Kelas baru berhasil ditambahkan!", "success");
    }
    closeModal();
    await loadKelas();
  } catch (err) {
    showToast("Gagal: " + err.message, "error");
  }
}

function openHapus(id, nama) {
  hapusId = id;
  document.getElementById("ak-hapus-nama").textContent = nama;
  document.getElementById("ak-overlay-hapus").style.display = "flex";
}

function closeHapus() {
  document.getElementById("ak-overlay-hapus").style.display = "none";
  hapusId = null;
}

async function konfirmHapus() {
  try {
    await api.delete(`/kelas/${hapusId}`);
    closeHapus();
    await loadKelas();
    showToast("Kelas berhasil dihapus!", "error");
  } catch (err) {
    showToast("Gagal hapus: " + err.message, "error");
  }
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

function bindEvents() {
  const $ = (id) => document.getElementById(id);
  $("btn-tambah-kelas")?.addEventListener("click", () => openModal("tambah"));
  $("ak-close-modal")?.addEventListener("click", closeModal);
  $("ak-btn-batal")?.addEventListener("click", closeModal);
  $("ak-btn-simpan")?.addEventListener("click", simpan);
  $("ak-close-hapus")?.addEventListener("click", closeHapus);
  $("ak-btn-batal-hapus")?.addEventListener("click", closeHapus);
  $("ak-btn-konfirm-hapus")?.addEventListener("click", konfirmHapus);
  $("ak-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "ak-overlay") closeModal();
  });
  $("ak-overlay-hapus")?.addEventListener("click", (e) => {
    if (e.target.id === "ak-overlay-hapus") closeHapus();
  });
  $("ak-search")?.addEventListener("input", () => renderGrid(getFiltered()));
  $("ak-filter-jenis")?.addEventListener("change", () =>
    renderGrid(getFiltered()),
  );
  $("ak-filter-tahun")?.addEventListener("change", () =>
    renderGrid(getFiltered()),
  );
  $("ak-input-jenis")?.addEventListener("change", (e) =>
    updateNamaKelasDropdown(e.target.value),
  );
  $("ak-grid")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".ak-edit");
    const delBtn = e.target.closest(".ak-del");
    if (editBtn) openModal("edit", parseInt(editBtn.dataset.id));
    if (delBtn) openHapus(parseInt(delBtn.dataset.id), delBtn.dataset.nama);
  });
}

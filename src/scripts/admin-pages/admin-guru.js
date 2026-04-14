import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

let guruList = [];
let editId = null;
let hapusId = null;

async function loadGuru() {
  try {
    const res = await api.get("/guru");
    guruList = res.data;
    renderTable(guruList);
  } catch (err) {
    showToast("Gagal load data guru: " + err.message, "error");
  }
}

export function renderAdminGuru() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-guru")}
      <main class="content admin-home">

        <!-- HEADER -->
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Kelola Data Guru</h2>
            <p class="ag-subtitle">Manajemen data seluruh guru pengajar</p>
          </div>
          <button class="ag-tambah-btn" id="btn-tambah-guru">
            <i class="fa-solid fa-plus"></i> Tambah Guru
          </button>
        </div>

        <!-- STAT STRIP -->
        <div class="ag-stat-strip">
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-blue">
              <i class="fa-solid fa-chalkboard-user ag-icon-blue"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-total">0</div>
              <div class="ag-stat-key">Total Guru</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-green">
              <i class="fa-solid fa-circle-check ag-icon-green"></i>
            </span>
            <div>
              <div class="ag-stat-val ag-val-green" id="stat-aktif">0</div>
              <div class="ag-stat-key">Guru Aktif</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-orange">
              <i class="fa-solid fa-circle-pause ag-icon-orange"></i>
            </span>
            <div>
              <div class="ag-stat-val ag-val-orange" id="stat-nonaktif">0</div>
              <div class="ag-stat-key">Nonaktif</div>
            </div>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="ag-toolbar">
          <div class="ag-search-wrap">
            <span class="ag-search-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input class="ag-search" id="ag-search-input" type="text"
              placeholder="Cari nama guru..."/>
          </div>
          <select class="ag-filter" id="ag-filter-status">
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        <!-- TABLE -->
        <div class="ag-table-card">
          <table class="ag-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Guru</th>
                <th>No HP</th>
                <th>Status</th>
                <th class="ag-th-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody id="guru-table-body"></tbody>
          </table>
          <div class="ag-empty" id="ag-empty" style="display:none">
            <i class="fa-solid fa-magnifying-glass ag-empty-icon"></i>
            <p>Tidak ada data guru ditemukan</p>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL TAMBAH/EDIT -->
    <div class="ag-overlay" id="ag-overlay" style="display:none">
      <div class="ag-modal">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title" id="modal-title">
            <i class="fa-solid fa-plus ag-modal-icon-indigo"></i>
            Tambah Guru
          </h3>
          <button class="ag-modal-close" id="btn-close-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">
          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-user ag-icon-indigo"></i>
              Nama Guru <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="input-nama" type="text"
              placeholder="Masukkan nama guru"/>
            <span class="ag-error" id="error-nama"></span>
          </div>
          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-mobile-screen ag-icon-green"></i>
              No HP <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="input-hp" type="text"
              placeholder="Contoh: 08123456789"/>
            <span class="ag-error" id="error-hp"></span>
          </div>
          <div class="ag-form-group ag-field-hidden" id="wrap-username">
            <label class="ag-label">
              <i class="fa-solid fa-at ag-icon-yellow"></i>
              Username <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="input-username" type="text"
              placeholder="Username untuk login"/>
            <span class="ag-error" id="error-username"></span>
          </div>
          <div class="ag-form-group ag-field-hidden" id="wrap-password">
            <label class="ag-label">
              <i class="fa-solid fa-lock ag-icon-purple"></i>
              Password <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="input-password" type="password"
              placeholder="Password"/>
            <span class="ag-error" id="error-password"></span>
          </div>
          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-toggle-on ag-icon-blue"></i>
              Status
            </label>
            <div class="ag-radio-group">
              <label class="ag-radio-label">
                <input type="radio" name="status" value="Aktif" checked/> Aktif
              </label>
              <label class="ag-radio-label">
                <input type="radio" name="status" value="Nonaktif"/> Nonaktif
              </label>
            </div>
          </div>
        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="btn-batal">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-simpan" id="btn-simpan">
            <i class="fa-solid fa-floppy-disk"></i> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HAPUS -->
    <div class="ag-overlay" id="ag-overlay-hapus" style="display:none">
      <div class="ag-modal ag-modal-sm">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-triangle-exclamation ag-modal-icon-red"></i>
            Konfirmasi Hapus
          </h3>
          <button class="ag-modal-close" id="btn-close-hapus">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">
          <div class="ag-hapus-info">
            <span class="ag-hapus-icon">
              <i class="fa-solid fa-trash-can"></i>
            </span>
            <p>Apakah Anda yakin ingin menghapus data guru
              <strong id="hapus-nama"></strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="btn-batal-hapus">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-hapus" id="btn-konfirm-hapus">
            <i class="fa-solid fa-trash-can"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  loadGuru();
  bindEvents();
}

function renderTable(data) {
  const tbody = document.getElementById("guru-table-body");
  const empty = document.getElementById("ag-empty");
  const aktif = guruList.filter((g) => g.status === "Aktif").length;
  const el = (id) => document.getElementById(id);

  if (el("stat-total")) el("stat-total").textContent = guruList.length;
  if (el("stat-aktif")) el("stat-aktif").textContent = aktif;
  if (el("stat-nonaktif"))
    el("stat-nonaktif").textContent = guruList.length - aktif;

  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = data
    .map(
      (guru, i) => `
    <tr class="ag-tr">
      <td class="ag-td ag-td-no">${i + 1}</td>
      <td class="ag-td">
        <div class="ag-guru-name-wrap">
          <div class="ag-avatar">${getInitials(guru.nama)}</div>
          <span class="ag-guru-name">${guru.nama}</span>
        </div>
      </td>
      <td class="ag-td ag-td-hp">
        <span class="ag-hp">
          <i class="fa-solid fa-mobile-screen ag-hp-icon"></i>
          ${guru.noHp}
        </span>
      </td>
      <td class="ag-td">
        <span class="ag-badge ${guru.status === "Aktif" ? "badge-aktif" : "badge-nonaktif"}">
          <i class="fa-solid ${guru.status === "Aktif" ? "fa-circle-check" : "fa-circle-pause"} ag-badge-icon"></i>
          ${guru.status}
        </span>
      </td>
      <td class="ag-td ag-td-aksi">
        <div class="ag-aksi">
          <button class="ag-btn-edit" data-id="${guru.id}" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="ag-btn-hapus-row" data-id="${guru.id}"
            data-nama="${guru.nama}" title="Hapus">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getFilteredData() {
  const search =
    document.getElementById("ag-search-input")?.value.toLowerCase() || "";
  const filter = document.getElementById("ag-filter-status")?.value || "";
  return guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(search) &&
      (filter === "" || g.status === filter),
  );
}

function openModal(mode = "tambah", id = null) {
  editId = id;
  clearErrors();
  document.getElementById("ag-overlay").style.display = "flex";

  const usernameWrap = document.getElementById("wrap-username");
  const passwordWrap = document.getElementById("wrap-password");
  const isTambah = mode === "tambah";

  usernameWrap.classList.toggle("ag-field-hidden", !isTambah);
  passwordWrap.classList.toggle("ag-field-hidden", !isTambah);

  const titleEl = document.getElementById("modal-title");

  if (mode === "edit") {
    const guru = guruList.find((g) => g.id === id);
    titleEl.innerHTML = `
      <i class="fa-solid fa-pen-to-square ag-modal-icon-indigo"></i>
      Edit Data Guru
    `;
    document.getElementById("input-nama").value = guru.nama;
    document.getElementById("input-hp").value = guru.noHp;
    document.querySelectorAll('input[name="status"]').forEach((r) => {
      r.checked = r.value === guru.status;
    });
  } else {
    titleEl.innerHTML = `
      <i class="fa-solid fa-plus ag-modal-icon-indigo"></i>
      Tambah Guru
    `;
    document.getElementById("input-nama").value = "";
    document.getElementById("input-hp").value = "";
    document.getElementById("input-username").value = "";
    document.getElementById("input-password").value = "";
    document.querySelectorAll('input[name="status"]').forEach((r) => {
      r.checked = r.value === "Aktif";
    });
  }
}

function closeModal() {
  document.getElementById("ag-overlay").style.display = "none";
  editId = null;
  clearErrors();
}

function clearErrors() {
  ["error-nama", "error-hp", "error-username", "error-password"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    },
  );
}

async function simpanGuru() {
  const nama = document.getElementById("input-nama").value.trim();
  const noHp = document.getElementById("input-hp").value.trim();
  const status = document.querySelector('input[name="status"]:checked').value;

  if (!nama) {
    document.getElementById("error-nama").textContent = "Nama guru wajib diisi";
    return;
  }
  if (!noHp) {
    document.getElementById("error-hp").textContent = "No HP wajib diisi";
    return;
  }

  try {
    if (editId) {
      await api.put(`/guru/${editId}`, { nama, noHp, status });
      showToast("Data guru berhasil diperbarui!", "success");
    } else {
      const username = document.getElementById("input-username").value.trim();
      const password = document.getElementById("input-password").value.trim();
      if (!username) {
        document.getElementById("error-username").textContent =
          "Username wajib diisi";
        return;
      }
      if (!password) {
        document.getElementById("error-password").textContent =
          "Password wajib diisi";
        return;
      }
      await api.post("/auth/register", {
        username,
        password,
        role: "GURU",
        nama,
        noHp,
      });
      showToast("Guru baru berhasil ditambahkan!", "success");
    }
    closeModal();
    await loadGuru();
  } catch (err) {
    showToast("Gagal: " + err.message, "error");
  }
}

function openHapus(id, nama) {
  hapusId = id;
  document.getElementById("hapus-nama").textContent = nama;
  document.getElementById("ag-overlay-hapus").style.display = "flex";
}

function closeHapus() {
  document.getElementById("ag-overlay-hapus").style.display = "none";
  hapusId = null;
}

async function konfirmHapus() {
  try {
    await api.delete(`/guru/${hapusId}`);
    closeHapus();
    await loadGuru();
    showToast("Data guru berhasil dihapus!", "error");
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

  $("btn-tambah-guru")?.addEventListener("click", () => openModal("tambah"));
  $("btn-close-modal")?.addEventListener("click", closeModal);
  $("btn-batal")?.addEventListener("click", closeModal);
  $("btn-simpan")?.addEventListener("click", simpanGuru);
  $("btn-close-hapus")?.addEventListener("click", closeHapus);
  $("btn-batal-hapus")?.addEventListener("click", closeHapus);
  $("btn-konfirm-hapus")?.addEventListener("click", konfirmHapus);

  $("ag-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "ag-overlay") closeModal();
  });
  $("ag-overlay-hapus")?.addEventListener("click", (e) => {
    if (e.target.id === "ag-overlay-hapus") closeHapus();
  });

  $("ag-search-input")?.addEventListener("input", () =>
    renderTable(getFilteredData()),
  );
  $("ag-filter-status")?.addEventListener("change", () =>
    renderTable(getFilteredData()),
  );

  $("guru-table-body")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".ag-btn-edit");
    const hapusBtn = e.target.closest(".ag-btn-hapus-row");
    if (editBtn) openModal("edit", parseInt(editBtn.dataset.id));
    if (hapusBtn)
      openHapus(parseInt(hapusBtn.dataset.id), hapusBtn.dataset.nama);
  });
}

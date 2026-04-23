import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

let ortuList = [];
let editId = null;
let hapusId = null;

const PAGE_SIZE = 10;
let currentPage = 1;

async function loadOrtu() {
  try {
    const res = await api.get("/ortu");
    ortuList = res.data;
    currentPage = 1;
    renderTable(getFiltered());
    updateStats();
  } catch (err) {
    alert("Gagal load data orang tua: " + err.message);
  }
}

export function renderAdminOrtu() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-ortu")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Kelola Data Orang Tua</h2>
            <p class="ag-subtitle">Manajemen akun dan data orang tua / wali siswa</p>
          </div>
          <button class="ag-tambah-btn" id="btn-tambah-ortu">
            <span>+</span> Tambah Orang Tua
          </button>
        </div>

        <!-- INFO LOGIN -->
        <div class="ortu-info-banner">
          <span class="ortu-info-banner-icon">ℹ️</span>
          <div class="ortu-info-banner-text">
            <strong>Cara login orang tua:</strong> Gunakan
            <code class="ortu-code">username anak</code>
            sebagai username, dan password yang didaftarkan di sini sebagai password.
          </div>
        </div>

        <!-- STAT STRIP -->
        <div class="ag-stat-strip">
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-blue">
              <i class="fa-solid fa-people-roof ag-icon-blue"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-total-ortu">0</div>
              <div class="ag-stat-key">Total Orang Tua</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-green">
              <i class="fa-solid fa-user ag-icon-green2"></i>
            </span>
            <div>
              <div class="ag-stat-val ag-val-green" id="stat-total-anak">0</div>
              <div class="ag-stat-key">Total Anak Terdaftar</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon ag-stat-icon-purple">
              <i class="fa-solid fa-link ag-icon-purple"></i>
            </span>
            <div>
              <div class="ag-stat-val ag-val-purple" id="stat-belum-link">0</div>
              <div class="ag-stat-key">Belum Punya Anak</div>
            </div>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="ag-toolbar">
          <div class="ag-search-wrap">
            <span class="ag-search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input class="ag-search" id="ortu-search" type="text"
              placeholder="Cari nama orang tua atau no HP..."/>
          </div>
        </div>

        <!-- TABLE -->
        <div class="ag-table-card">
          <table class="ag-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Orang Tua</th>
                <th>No HP</th>
                <th>Anak Terdaftar</th>
                <th>Login dengan Username</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="ortu-table-body"></tbody>
          </table>
          <div class="ag-empty" id="ortu-empty" style="display:none">
            <span>👨‍👩‍👧</span>
            <p>Tidak ada data orang tua ditemukan</p>
          </div>

          <!-- PAGINATION -->
          <div class="ag-pagination" id="ortu-pagination" style="display:none">
            <div class="ag-pagination-info" id="ortu-pagination-info"></div>
            <div class="ag-pagination-controls" id="ortu-pagination-controls"></div>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL TAMBAH/EDIT -->
    <div class="ag-overlay" id="ortu-overlay" style="display:none">
      <div class="ag-modal ortu-modal-form">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title" id="ortu-modal-title">Tambah Orang Tua</h3>
          <button class="ag-modal-close" id="ortu-close-modal">✕</button>
        </div>
        <div class="ag-modal-body">

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-user ag-icon-indigo"></i>
              Nama Orang Tua / Wali <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="ortu-input-nama" type="text" placeholder="Nama lengkap"/>
            <span class="ag-error" id="ortu-error-nama"></span>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">
              <i class="fa-solid fa-mobile-screen ag-icon-green"></i>
              No HP
            </label>
            <input class="ag-input" id="ortu-input-hp" type="text" placeholder="Contoh: 08123456789"/>
          </div>

          <div class="ag-form-group" id="ortu-wrap-password">
            <label class="ag-label">
              <i class="fa-solid fa-lock ag-icon-purple"></i>
              Password <span class="ag-required">*</span>
            </label>
            <input class="ag-input" id="ortu-input-password" type="password"
              placeholder="Password untuk login orang tua"/>
            <span class="ag-error" id="ortu-error-password"></span>
          </div>

          <div class="ortu-info-login" id="ortu-info-login">
            <strong>Info Login:</strong><br>
            Setelah orang tua ini ditambahkan dan anaknya didaftarkan,
            login dilakukan menggunakan <strong>username anak</strong> + password ini.
            Jika punya beberapa anak, bisa pilih anak mana yang mau dipantau setelah login.
          </div>

        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="ortu-btn-batal">Batal</button>
          <button class="ag-btn-simpan" id="ortu-btn-simpan">
            <i class="fa-solid fa-floppy-disk"></i> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL ANAK -->
    <div class="ag-overlay" id="ortu-detail-overlay" style="display:none">
      <div class="ag-modal ortu-modal-detail">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title" id="ortu-detail-title">Anak Terdaftar</h3>
          <button class="ag-modal-close" id="ortu-detail-close">✕</button>
        </div>
        <div class="ag-modal-body" id="ortu-detail-body"></div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="ortu-detail-tutup">Tutup</button>
        </div>
      </div>
    </div>

    <!-- MODAL HAPUS -->
    <div class="ag-overlay" id="ortu-hapus-overlay" style="display:none">
      <div class="ag-modal ag-modal-sm">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">Konfirmasi Hapus</h3>
          <button class="ag-modal-close" id="ortu-hapus-close">✕</button>
        </div>
        <div class="ag-modal-body">
          <div class="ag-hapus-info">
            <span class="ag-hapus-icon"><i class="fa-solid fa-trash-can"></i></span>
            <p>Apakah Anda yakin ingin menghapus akun orang tua
              <strong id="ortu-hapus-nama"></strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="ortu-hapus-batal">Batal</button>
          <button class="ag-btn-hapus" id="ortu-hapus-konfirm">
            <i class="fa-solid fa-trash-can"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  loadOrtu();
  bindEvents();
}

/* ── Render tabel ── */
function renderTable(data) {
  const tbody = document.getElementById("ortu-table-body");
  const empty = document.getElementById("ortu-empty");
  const pagination = document.getElementById("ortu-pagination");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "flex";
    pagination.style.display = "none";
    return;
  }
  empty.style.display = "none";

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, data.length);
  const pageData = data.slice(startIdx, endIdx);

  tbody.innerHTML = pageData
    .map((o, i) => {
      const siswa = o.siswa || [];
      const jumlahAnak = siswa.length;

      const usernameLogin =
        siswa.length > 0
          ? siswa
              .map(
                (s) => `<code class="ortu-username-code">${s.username}</code>`,
              )
              .join(", ")
          : `<span class="ortu-belum-anak-text">—belum ada anak—</span>`;

      return `
      <tr class="ag-tr">
        <td class="ag-td ag-td-no">${startIdx + i + 1}</td>
        <td class="ag-td">
          <div class="ag-guru-name-wrap">
            <div class="ag-avatar ortu-avatar">${getInitials(o.nama)}</div>
            <div class="ag-guru-name">${o.nama}</div>
          </div>
        </td>
        <td class="ag-td">
          <span class="ag-hp">
            <i class="fa-solid fa-mobile-screen ag-hp-icon"></i>
            ${o.noHp || "-"}
          </span>
        </td>
        <td class="ag-td">
          ${
            jumlahAnak > 0
              ? `<button class="ortu-anak-btn" data-id="${o.id}" data-nama="${escAttr(o.nama)}">
                ${jumlahAnak} anak
               </button>`
              : `<span class="ortu-belum-anak-text">Belum ada anak</span>`
          }
        </td>
        <td class="ag-td ortu-td-username">${usernameLogin}</td>
        <td class="ag-td">
          <div class="ag-aksi">
            <button class="ag-btn-edit ortu-edit-btn" data-id="${o.id}" title="Edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="ag-btn-hapus-row ortu-hapus-btn"
              data-id="${o.id}" data-nama="${escAttr(o.nama)}" title="Hapus">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  renderPagination(data.length, totalPages);
}

/* ── Render Pagination ── */
function renderPagination(totalData, totalPages) {
  const pagination = document.getElementById("ortu-pagination");
  const info = document.getElementById("ortu-pagination-info");
  const controls = document.getElementById("ortu-pagination-controls");

  if (totalPages <= 1) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";

  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, totalData);
  info.textContent = `Menampilkan ${startIdx}–${endIdx} dari ${totalData} orang tua`;

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

/* ── Stats ── */
function updateStats() {
  const el = (id) => document.getElementById(id);
  const totalAnak = ortuList.reduce(
    (sum, o) => sum + (o.siswa?.length || 0),
    0,
  );
  const belumLink = ortuList.filter(
    (o) => !o.siswa || o.siswa.length === 0,
  ).length;
  if (el("stat-total-ortu"))
    el("stat-total-ortu").textContent = ortuList.length;
  if (el("stat-total-anak")) el("stat-total-anak").textContent = totalAnak;
  if (el("stat-belum-link")) el("stat-belum-link").textContent = belumLink;
}

/* ── Filter ── */
function getFiltered() {
  const q = document.getElementById("ortu-search")?.value.toLowerCase() || "";
  return ortuList.filter(
    (o) =>
      o.nama.toLowerCase().includes(q) ||
      (o.noHp || "").includes(q) ||
      (o.siswa || []).some((s) => s.username?.toLowerCase().includes(q)),
  );
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
function escAttr(str) {
  return (str || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ── Modal tambah/edit ── */
function openModal(mode = "tambah", id = null) {
  editId = id;
  document.getElementById("ortu-overlay").style.display = "flex";
  clearErrors();

  const wrapPass = document.getElementById("ortu-wrap-password");
  const infoLogin = document.getElementById("ortu-info-login");
  const titleEl = document.getElementById("ortu-modal-title");

  if (mode === "edit") {
    const o = ortuList.find((x) => x.id === id);
    titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square ag-modal-icon-indigo"></i> Edit Data Orang Tua`;
    document.getElementById("ortu-input-nama").value = o.nama;
    document.getElementById("ortu-input-hp").value = o.noHp || "";
    wrapPass.style.display = "none";
    infoLogin.style.display = "none";
  } else {
    titleEl.innerHTML = `<i class="fa-solid fa-plus ag-modal-icon-indigo"></i> Tambah Orang Tua`;
    document.getElementById("ortu-input-nama").value = "";
    document.getElementById("ortu-input-hp").value = "";
    document.getElementById("ortu-input-password").value = "";
    wrapPass.style.display = "block";
    infoLogin.style.display = "block";
  }
}

function closeModal() {
  document.getElementById("ortu-overlay").style.display = "none";
  editId = null;
  clearErrors();
}

function clearErrors() {
  ["ortu-error-nama", "ortu-error-password"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

/* ── Simpan ── */
async function simpanOrtu() {
  const nama = document.getElementById("ortu-input-nama").value.trim();
  const noHp = document.getElementById("ortu-input-hp").value.trim();
  const password = document.getElementById("ortu-input-password")?.value.trim();

  clearErrors();
  let valid = true;
  if (!nama) {
    document.getElementById("ortu-error-nama").textContent = "Nama wajib diisi";
    valid = false;
  }
  if (!editId && !password) {
    document.getElementById("ortu-error-password").textContent =
      "Password wajib diisi";
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById("ortu-btn-simpan");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    if (editId) {
      await api.put(`/ortu/${editId}`, { nama, noHp });
      showToast("Data orang tua berhasil diperbarui!", "success");
    } else {
      const usernameAuto =
        "ortu_" +
        nama
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") +
        "_" +
        Date.now().toString().slice(-4);
      await api.post("/auth/register", {
        username: usernameAuto,
        password,
        role: "ORTU",
        nama,
        noHp,
      });
      showToast("Akun orang tua berhasil ditambahkan!", "success");
    }
    closeModal();
    await loadOrtu();
  } catch (err) {
    alert("Gagal: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 Simpan";
  }
}

/* ── Detail anak ── */
function openDetail(id, namaOrtu) {
  const ortu = ortuList.find((o) => o.id === id);
  const anak = ortu?.siswa || [];

  document.getElementById("ortu-detail-title").textContent =
    `Anak dari ${namaOrtu}`;
  document.getElementById("ortu-detail-body").innerHTML =
    anak.length === 0
      ? `<div class="ortu-detail-empty">
        <p>Belum ada anak terdaftar.</p>
        <span>Daftarkan siswa dan hubungkan ke orang tua ini.</span>
       </div>`
      : anak
          .map(
            (s) => `
        <div class="ortu-detail-item">
          <div class="ag-avatar ortu-detail-avatar">${getInitials(s.nama)}</div>
          <div class="ortu-detail-info">
            <div class="ortu-detail-nama">${s.nama}</div>
            <div class="ortu-detail-kelas">🏫 ${s.kelas?.namaKelas || "Belum ada kelas"}</div>
          </div>
          <div class="ortu-detail-login">
            <div class="ortu-detail-login-label">Login dengan:</div>
            <code class="ortu-username-code ortu-username-code-lg">${s.username}</code>
          </div>
        </div>
      `,
          )
          .join("");

  document.getElementById("ortu-detail-overlay").style.display = "flex";
}

function closeDetail() {
  document.getElementById("ortu-detail-overlay").style.display = "none";
}

/* ── Hapus ── */
function openHapus(id, nama) {
  hapusId = id;
  document.getElementById("ortu-hapus-nama").textContent = nama;
  document.getElementById("ortu-hapus-overlay").style.display = "flex";
}

function closeHapus() {
  document.getElementById("ortu-hapus-overlay").style.display = "none";
  hapusId = null;
}

async function konfirmHapus() {
  const btn = document.getElementById("ortu-hapus-konfirm");
  btn.disabled = true;
  btn.textContent = "Menghapus...";
  try {
    await api.delete(`/ortu/${hapusId}`);
    closeHapus();
    await loadOrtu();
    showToast("Akun orang tua berhasil dihapus!", "error");
  } catch (err) {
    alert("Gagal menghapus: " + err.message);
  } finally {
    btn.textContent = "🗑️ Hapus";
    btn.disabled = false;
  }
}

/* ── Toast ── */
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

/* ── Bind Events ── */
function bindEvents() {
  const $ = (id) => document.getElementById(id);

  $("btn-tambah-ortu")?.addEventListener("click", () => openModal("tambah"));
  $("ortu-close-modal")?.addEventListener("click", closeModal);
  $("ortu-btn-batal")?.addEventListener("click", closeModal);
  $("ortu-btn-simpan")?.addEventListener("click", simpanOrtu);
  $("ortu-detail-close")?.addEventListener("click", closeDetail);
  $("ortu-detail-tutup")?.addEventListener("click", closeDetail);
  $("ortu-hapus-close")?.addEventListener("click", closeHapus);
  $("ortu-hapus-batal")?.addEventListener("click", closeHapus);
  $("ortu-hapus-konfirm")?.addEventListener("click", konfirmHapus);

  $("ortu-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "ortu-overlay") closeModal();
  });
  $("ortu-detail-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "ortu-detail-overlay") closeDetail();
  });
  $("ortu-hapus-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "ortu-hapus-overlay") closeHapus();
  });

  $("ortu-search")?.addEventListener("input", () => {
    currentPage = 1;
    renderTable(getFiltered());
  });

  $("ortu-table-body")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".ortu-edit-btn");
    const hapusBtn = e.target.closest(".ortu-hapus-btn");
    const anakBtn = e.target.closest(".ortu-anak-btn");
    if (editBtn) openModal("edit", parseInt(editBtn.dataset.id));
    if (hapusBtn)
      openHapus(parseInt(hapusBtn.dataset.id), hapusBtn.dataset.nama);
    if (anakBtn) openDetail(parseInt(anakBtn.dataset.id), anakBtn.dataset.nama);
  });

  // Event delegasi untuk tombol pagination
  $("ortu-pagination-controls")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ag-page-btn");
    if (!btn || btn.disabled) return;
    const page = parseInt(btn.dataset.page);
    if (!isNaN(page)) {
      currentPage = page;
      renderTable(getFiltered());
      document.querySelector(".ag-table-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}

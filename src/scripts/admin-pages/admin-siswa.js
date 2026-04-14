import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

let siswList = [];
let kelasList = [];
let ortuList = [];
let editId = null;
let hapusId = null;

async function loadSiswa() {
  try {
    const res = await api.get("/siswa");
    siswList = res.data;
    renderTable(getFiltered());
    updateStats();
    updateFilterKelas();
  } catch (err) {
    showToast("Gagal load data siswa: " + err.message, "error");
  }
}

async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
  } catch (err) {
    console.error("Gagal load kelas:", err);
  }
}

async function loadOrtu() {
  try {
    const res = await api.get("/ortu");
    ortuList = res.data;
  } catch (err) {
    console.error("Gagal load ortu:", err);
  }
}

export function renderAdminSiswa() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-siswa")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Kelola Data Siswa</h2>
            <p class="ag-subtitle">Manajemen data seluruh siswa TPA</p>
          </div>
          <button class="ag-tambah-btn" id="btn-tambah-siswa">
            <i class="fa-solid fa-plus"></i> Tambah Siswa
          </button>
        </div>

        <!-- STAT STRIP -->
        <div class="ag-stat-strip">
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#eff6ff">
              <i class="fa-solid fa-user-graduate" style="color:#3b82f6"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-total-siswa">0</div>
              <div class="ag-stat-key">Siswa Aktif</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#faf5ff">
              <i class="fa-solid fa-book" style="color:#8b5cf6"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-jilid-siswa">0</div>
              <div class="ag-stat-key">Siswa Jilid</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#f0fdf4">
              <i class="fa-solid fa-book-open" style="color:#16a34a"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-quran-siswa" style="color:#16a34a">0</div>
              <div class="ag-stat-key">Siswa Al-Qur'an</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#fef9c3">
              <i class="fa-solid fa-graduation-cap" style="color:#d97706"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="stat-alumni-count" style="color:#d97706">0</div>
              <div class="ag-stat-key">Alumni</div>
            </div>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="ag-toolbar">
          <div class="ag-search-wrap">
            <span class="ag-search-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input class="ag-search" id="as-search" type="text"
              placeholder="Cari nama siswa atau orang tua..."/>
          </div>
          <select class="ag-filter" id="as-filter-kelas">
            <option value="">Semua Kelas</option>
          </select>
          <select class="ag-filter" id="as-filter-aktif">
            <option value="aktif">Siswa Aktif</option>
            <option value="alumni">Alumni</option>
            <option value="">Semua</option>
          </select>
        </div>

        <!-- TABLE -->
        <div class="ag-table-card">
          <table class="ag-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Username</th>
                <th>Kelas</th>
                <th>Orang Tua</th>
                <th>No HP</th>
                <th style="text-align:center">Aksi</th>
              </tr>
            </thead>
            <tbody id="siswa-table-body"></tbody>
          </table>
          <div class="ag-empty" id="as-empty" style="display:none">
            <i class="fa-solid fa-magnifying-glass"
              style="font-size:32px;color:#cbd5e1"></i>
            <p>Tidak ada siswa ditemukan</p>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL TAMBAH/EDIT -->
    <div class="ag-overlay" id="as-overlay" style="display:none">
      <div class="ag-modal" style="max-width:520px">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title" id="as-modal-title">
            <i class="fa-solid fa-plus" style="color:#6366f1;margin-right:6px"></i>
            Tambah Siswa
          </h3>
          <button class="ag-modal-close" id="as-close-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">

          <div class="as-form-row">
            <div class="ag-form-group">
              <label class="ag-label">
                Nama Siswa <span class="ag-required">*</span>
              </label>
              <input class="ag-input" id="as-input-nama" type="text"
                placeholder="Nama lengkap siswa"/>
              <span class="ag-error" id="as-error-nama"></span>
            </div>
            <div class="ag-form-group">
              <label class="ag-label">
                Username <span class="ag-required">*</span>
                <span style="font-size:10px;color:#94a3b8;font-weight:400;margin-left:4px">
                  (dipakai orang tua untuk login)
                </span>
              </label>
              <input class="ag-input" id="as-input-username" type="text"
                placeholder="Untuk login orang tua"/>
              <span class="ag-error" id="as-error-username"></span>
            </div>
          </div>

          <div class="as-form-row">
            <div class="ag-form-group">
              <label class="ag-label">
                Kelas <span class="ag-required">*</span>
              </label>
              <select class="ag-input" id="as-input-kelas">
                <option value="">-- Pilih Kelas --</option>
              </select>
              <span class="ag-error" id="as-error-kelas"></span>
            </div>
            <div class="ag-form-group">
              <label class="ag-label">Orang Tua / Wali</label>
              <select class="ag-input" id="as-input-ortu">
                <option value="">-- Pilih Orang Tua --</option>
              </select>
              <span style="font-size:11px;color:#94a3b8;margin-top:4px;display:block">
                Opsional. Orang tua harus sudah didaftarkan terlebih dahulu.
              </span>
            </div>
          </div>

          <!-- Toggle alumni — hanya tampil saat mode edit -->
          <div class="ag-form-group" id="as-alumni-wrap" style="display:none">
            <div style="background:#fef9c3;border:1.5px solid #fcd34d;
              border-radius:12px;padding:14px 16px;">
              <div style="font-size:13px;font-weight:700;color:#a16207;margin-bottom:10px">
                <i class="fa-solid fa-graduation-cap" style="margin-right:6px"></i>
                Status Kelulusan
              </div>
              <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer">
                <input type="checkbox" id="as-input-alumni"
                  style="width:18px;height:18px;margin-top:2px;
                    accent-color:#d97706;cursor:pointer;flex-shrink:0"/>
                <div>
                  <div style="font-size:13px;font-weight:600;color:#92400e">
                    Tandai sebagai Alumni
                  </div>
                  <div style="font-size:11px;color:#a16207;margin-top:3px;line-height:1.5">
                    Siswa akan dipindah ke daftar alumni. Seluruh riwayat nilai,
                    jilid, dan kehadiran tetap tersimpan dan dapat dilihat.
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="as-btn-batal">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-simpan" id="as-btn-simpan">
            <i class="fa-solid fa-floppy-disk"></i> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HAPUS -->
    <div class="ag-overlay" id="as-overlay-hapus" style="display:none">
      <div class="ag-modal ag-modal-sm">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-triangle-exclamation"
              style="color:#ef4444;margin-right:6px"></i>
            Konfirmasi Hapus
          </h3>
          <button class="ag-modal-close" id="as-close-hapus">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">
          <div class="ag-hapus-info">
            <span class="ag-hapus-icon">
              <i class="fa-solid fa-trash-can"></i>
            </span>
            <p>Apakah Anda yakin ingin menghapus data siswa
              <strong id="as-hapus-nama"></strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="as-btn-batal-hapus">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
          <button class="ag-btn-hapus" id="as-btn-konfirm-hapus">
            <i class="fa-solid fa-trash-can"></i> Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  bindEvents();
  Promise.all([loadKelas(), loadOrtu()]).then(() => loadSiswa());
}

function renderTable(data) {
  const tbody = document.getElementById("siswa-table-body");
  const empty = document.getElementById("as-empty");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = data
    .map(
      (s, i) => `
    <tr class="ag-tr" style="${s.isAlumni ? "background:#fafafa" : ""}">
      <td class="ag-td ag-td-no">${i + 1}</td>
      <td class="ag-td">
        <div class="ag-guru-name-wrap">
          <div class="ag-avatar"
            style="${
              s.isAlumni
                ? "background:linear-gradient(135deg,#94a3b8,#64748b)"
                : ""
            }">
            ${getInitials(s.nama)}
          </div>
          <div>
            <span class="ag-guru-name" style="${s.isAlumni ? "color:#64748b" : ""}">
              ${s.nama}
            </span>
            ${
              s.isAlumni
                ? `
              <span style="font-size:10px;background:#fef9c3;color:#a16207;
                padding:1px 7px;border-radius:4px;margin-left:6px;font-weight:700;
                border:1px solid #fcd34d">
                <i class="fa-solid fa-graduation-cap"
                  style="font-size:9px;margin-right:2px"></i>
                ALUMNI
              </span>`
                : ""
            }
          </div>
        </div>
      </td>
      <td class="ag-td">
        <code style="background:#ede9fe;color:#6366f1;padding:2px 8px;
          border-radius:5px;font-size:12px">${s.username}</code>
      </td>
      <td class="ag-td">
        <span class="as-kelas-badge">
          <i class="fa-solid fa-door-open"
            style="font-size:10px;margin-right:4px"></i>
          ${s.kelas?.namaKelas || "-"}
        </span>
      </td>
      <td class="ag-td as-ortu">
        ${
          s.orangTua
            ? `<div style="font-size:13px;font-weight:500;color:#1e293b">
               ${s.orangTua.nama}
             </div>`
            : `<span style="font-size:12px;color:#94a3b8;font-style:italic">
               Belum ada
             </span>`
        }
      </td>
      <td class="ag-td">
        <span class="ag-hp">
          <i class="fa-solid fa-mobile-screen"
            style="color:#10b981;margin-right:5px;font-size:12px"></i>
          ${s.orangTua?.noHp || "-"}
        </span>
      </td>
      <td class="ag-td">
        <div class="ag-aksi">
          <button class="ag-btn-edit" data-id="${s.id}" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="ag-btn-hapus-row"
            data-id="${s.id}" data-nama="${s.nama}" title="Hapus">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function updateStats() {
  const el = (id) => document.getElementById(id);
  const aktif = siswList.filter((s) => !s.isAlumni);
  const quran = aktif.filter((s) => s.kelas?.jenis === "alquran").length;
  const alumni = siswList.filter((s) => s.isAlumni).length;

  if (el("stat-total-siswa")) el("stat-total-siswa").textContent = aktif.length;
  if (el("stat-jilid-siswa"))
    el("stat-jilid-siswa").textContent = aktif.length - quran;
  if (el("stat-quran-siswa")) el("stat-quran-siswa").textContent = quran;
  if (el("stat-alumni-count")) el("stat-alumni-count").textContent = alumni;
}

/* ============================================================
   FILTER
   ============================================================ */
function getFiltered() {
  const q = document.getElementById("as-search")?.value.toLowerCase() || "";
  const kelas = document.getElementById("as-filter-kelas")?.value || "";
  const aktif = document.getElementById("as-filter-aktif")?.value;

  return siswList.filter((s) => {
    const matchQ =
      s.nama.toLowerCase().includes(q) ||
      (s.orangTua?.nama || "").toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q);
    const matchK = !kelas || s.kelasId === parseInt(kelas);
    const matchA =
      aktif === "" ? true : aktif === "alumni" ? !!s.isAlumni : !s.isAlumni;
    return matchQ && matchK && matchA;
  });
}

function updateFilterKelas() {
  const sel = document.getElementById("as-filter-kelas");
  if (!sel) return;
  sel.innerHTML =
    `<option value="">Semua Kelas</option>` +
    kelasList
      .map((k) => `<option value="${k.id}">${k.namaKelas}</option>`)
      .join("");
}

/* ============================================================
   MODAL TAMBAH / EDIT
   ============================================================ */
function openModal(mode = "tambah", id = null) {
  editId = id;
  clearErrors();
  document.getElementById("as-overlay").style.display = "flex";

  // Isi dropdown kelas
  document.getElementById("as-input-kelas").innerHTML =
    `<option value="">-- Pilih Kelas --</option>` +
    kelasList
      .map((k) => `<option value="${k.id}">${k.namaKelas}</option>`)
      .join("");

  // Isi dropdown ortu
  const ortuSel = document.getElementById("as-input-ortu");
  ortuSel.innerHTML =
    ortuList.length === 0
      ? `<option value="">-- Belum ada orang tua terdaftar --</option>`
      : `<option value="">-- Pilih Orang Tua --</option>` +
        ortuList
          .map((o) => {
            const info = o.siswa?.length > 0 ? ` (${o.siswa.length} anak)` : "";
            return `<option value="${o.id}">${o.nama}${info}</option>`;
          })
          .join("");

  const usernameInput = document.getElementById("as-input-username");
  const alumniWrap = document.getElementById("as-alumni-wrap");
  const alumniCheckbox = document.getElementById("as-input-alumni");
  const titleEl = document.getElementById("as-modal-title");

  if (mode === "edit") {
    const s = siswList.find((x) => x.id === id);
    titleEl.innerHTML = `
      <i class="fa-solid fa-pen-to-square" style="color:#6366f1;margin-right:6px"></i>
      Edit Data Siswa
    `;
    document.getElementById("as-input-nama").value = s.nama;
    usernameInput.value = s.username;
    usernameInput.disabled = true;
    document.getElementById("as-input-kelas").value = s.kelasId || "";
    document.getElementById("as-input-ortu").value = s.orangTuaId || "";
    alumniWrap.style.display = "block";
    alumniCheckbox.checked = !!s.isAlumni;
  } else {
    titleEl.innerHTML = `
      <i class="fa-solid fa-plus" style="color:#6366f1;margin-right:6px"></i>
      Tambah Siswa
    `;
    document.getElementById("as-input-nama").value = "";
    usernameInput.value = "";
    usernameInput.disabled = false;
    document.getElementById("as-input-kelas").value = "";
    document.getElementById("as-input-ortu").value = "";
    alumniWrap.style.display = "none";
    alumniCheckbox.checked = false;
  }
}

function closeModal() {
  document.getElementById("as-overlay").style.display = "none";
  document.getElementById("as-input-username").disabled = false;
  editId = null;
}

function clearErrors() {
  ["as-error-nama", "as-error-username", "as-error-kelas"].forEach((id) => {
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
  if (!document.getElementById("as-input-nama").value.trim())
    set("as-error-nama", "Nama siswa wajib diisi");
  if (!editId && !document.getElementById("as-input-username").value.trim())
    set("as-error-username", "Username wajib diisi");
  if (!document.getElementById("as-input-kelas").value)
    set("as-error-kelas", "Pilih kelas terlebih dahulu");
  return ok;
}

async function simpan() {
  if (!validate()) return;

  const nama = document.getElementById("as-input-nama").value.trim();
  const username = document.getElementById("as-input-username").value.trim();
  const kelasId =
    parseInt(document.getElementById("as-input-kelas").value) || null;
  const orangTuaId =
    parseInt(document.getElementById("as-input-ortu").value) || null;
  const isAlumni = document.getElementById("as-input-alumni")?.checked ?? false;

  const btn = document.getElementById("as-btn-simpan");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    if (editId) {
      await api.put(`/siswa/${editId}`, {
        nama,
        kelasId,
        orangTuaId,
        isAlumni,
      });
      showToast(
        isAlumni
          ? "Siswa berhasil dipindah ke daftar alumni!"
          : "Data siswa berhasil diperbarui!",
        "success",
      );
    } else {
      await api.post("/siswa", { username, nama, kelasId, orangTuaId });
      showToast("Siswa baru berhasil ditambahkan!", "success");
    }
    closeModal();
    await Promise.all([loadSiswa(), loadOrtu()]);

    // Di fungsi simpan(), ganti bagian setelah closeModal()
    closeModal();
    await Promise.all([loadSiswa(), loadOrtu()]);

    if (isAlumni) {
      const filterAktif = document.getElementById("as-filter-aktif");
      if (filterAktif) {
        filterAktif.value = "alumni";
        renderTable(getFiltered());
      }
    }
  } catch (err) {
    showToast("Gagal: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan`;
  }
}

/* ============================================================
   HAPUS
   ============================================================ */
function openHapus(id, nama) {
  hapusId = id;
  document.getElementById("as-hapus-nama").textContent = nama;
  document.getElementById("as-overlay-hapus").style.display = "flex";
}

function closeHapus() {
  document.getElementById("as-overlay-hapus").style.display = "none";
  hapusId = null;
}

async function konfirmHapus() {
  const btn = document.getElementById("as-btn-konfirm-hapus");
  btn.disabled = true;
  btn.textContent = "Menghapus...";
  try {
    await api.delete(`/siswa/${hapusId}`);
    closeHapus();
    await loadSiswa();
    showToast("Data siswa berhasil dihapus!", "error");
  } catch (err) {
    showToast("Gagal hapus: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-trash-can"></i> Hapus`;
  }
}

/* ============================================================
   TOAST
   ============================================================ */
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

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function bindEvents() {
  const $ = (id) => document.getElementById(id);

  $("btn-tambah-siswa")?.addEventListener("click", () => openModal("tambah"));
  $("as-close-modal")?.addEventListener("click", closeModal);
  $("as-btn-batal")?.addEventListener("click", closeModal);
  $("as-btn-simpan")?.addEventListener("click", simpan);
  $("as-close-hapus")?.addEventListener("click", closeHapus);
  $("as-btn-batal-hapus")?.addEventListener("click", closeHapus);
  $("as-btn-konfirm-hapus")?.addEventListener("click", konfirmHapus);

  $("as-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "as-overlay") closeModal();
  });
  $("as-overlay-hapus")?.addEventListener("click", (e) => {
    if (e.target.id === "as-overlay-hapus") closeHapus();
  });

  $("as-search")?.addEventListener("input", () => renderTable(getFiltered()));
  $("as-filter-kelas")?.addEventListener("change", () =>
    renderTable(getFiltered()),
  );
  $("as-filter-aktif")?.addEventListener("change", () =>
    renderTable(getFiltered()),
  );

  $("siswa-table-body")?.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".ag-btn-edit");
    const hapusBtn = e.target.closest(".ag-btn-hapus-row");
    if (editBtn) openModal("edit", parseInt(editBtn.dataset.id));
    if (hapusBtn)
      openHapus(parseInt(hapusBtn.dataset.id), hapusBtn.dataset.nama);
  });
}

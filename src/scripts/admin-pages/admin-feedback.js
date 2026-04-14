import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

let feedbackList = [];
let activeId = null;

async function loadFeedback() {
  try {
    const res = await api.get("/feedback");
    feedbackList = res.data;
    renderTable(getFiltered());
    updateStats();
  } catch (err) {
    showToast("Gagal load feedback: " + err.message, "error");
  }
}

export function renderAdminFeedback() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-feedback")}
      <main class="content admin-home">

        <!-- HEADER -->
        <div class="af-header">
          <div>
            <h2 class="ag-title">
              Feedback dari Orang Tua
            </h2>
            <p class="ag-subtitle">Kelola feedback dan saran dari orang tua siswa</p>
          </div>
        </div>

        <!-- STAT STRIP -->
        <div class="af-stat-strip">
          <div class="af-stat-card af-stat-red">
            <div class="af-stat-icon-wrap af-icon-red">
              <i class="fa-solid fa-envelope" style="color:red;font-size:18px"></i>
            </div>
            <div class="af-stat-info">
              <span class="af-stat-label">Belum Dibaca</span>
              <span class="af-stat-val" id="af-count-belum">0</span>
            </div>
          </div>
          <div class="af-stat-card af-stat-yellow">
            <div class="af-stat-icon-wrap af-icon-yellow">
              <i class="fa-solid fa-envelope-open" style="color:#a16207;font-size:18px"></i>
            </div>
            <div class="af-stat-info">
              <span class="af-stat-label">Dibaca</span>
              <span class="af-stat-val" id="af-count-dibaca">0</span>
            </div>
          </div>
          <div class="af-stat-card af-stat-green">
            <div class="af-stat-icon-wrap af-icon-green">
              <i class="fa-solid fa-reply" style="color:green;font-size:18px"></i>
            </div>
            <div class="af-stat-info">
              <span class="af-stat-label">Dibalas</span>
              <span class="af-stat-val" id="af-count-dibalas">0</span>
            </div>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="ag-toolbar">
          <div class="ag-search-wrap">
            <span class="ag-search-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input class="ag-search" id="af-search" type="text"
              placeholder="Cari pengirim atau nama siswa..."/>
          </div>
          <select class="ag-filter" id="af-filter-status">
            <option value="">Semua Status</option>
            <option value="Belum Dibaca">Belum Dibaca</option>
            <option value="Dibaca">Dibaca</option>
            <option value="Dibalas">Dibalas</option>
          </select>
        </div>

        <!-- TABLE CARD -->
        <div class="ag-table-card">
          <div class="af-table-title">
            <i class="fa-solid fa-list" style="color:#6366f1;margin-right:7px"></i>
            Daftar Feedback
          </div>
          <table class="ag-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pengirim</th>
                <th>Nama Siswa</th>
                <th>Pesan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="af-table-body"></tbody>
          </table>
          <div class="ag-empty" id="af-empty" style="display:none">
            <i class="fa-solid fa-comments"
              style="font-size:32px;color:#cbd5e1"></i>
            <p>Tidak ada feedback ditemukan</p>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL DETAIL -->
    <div class="ag-overlay" id="af-overlay" style="display:none">
      <div class="ag-modal af-modal">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-message" style="color:#6366f1;margin-right:6px"></i>
            Detail Feedback
          </h3>
          <button class="ag-modal-close" id="af-close-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">

          <div class="af-meta-grid">
            <div class="af-meta-item">
              <span class="af-meta-label">
                <i class="fa-solid fa-user"
                  style="color:#6366f1;margin-right:4px;font-size:11px"></i>
                Pengirim
              </span>
              <span class="af-meta-val" id="af-detail-pengirim">—</span>
            </div>
            <div class="af-meta-item">
              <span class="af-meta-label">
                <i class="fa-solid fa-user-graduate"
                  style="color:#10b981;margin-right:4px;font-size:11px"></i>
                Nama Siswa
              </span>
              <span class="af-meta-val" id="af-detail-siswa">—</span>
            </div>
            <div class="af-meta-item">
              <span class="af-meta-label">
                <i class="fa-solid fa-calendar-days"
                  style="color:#f59e0b;margin-right:4px;font-size:11px"></i>
                Tanggal
              </span>
              <span class="af-meta-val" id="af-detail-tanggal">—</span>
            </div>
            <div class="af-meta-item">
              <span class="af-meta-label">
                <i class="fa-solid fa-circle-info"
                  style="color:#3b82f6;margin-right:4px;font-size:11px"></i>
                Status
              </span>
              <span id="af-detail-status">—</span>
            </div>
          </div>

          <div class="af-divider"></div>
          <div class="af-section-label">
            <i class="fa-solid fa-envelope-open-text"
              style="color:#6366f1;margin-right:6px"></i>
            Pesan:
          </div>
          <div class="af-pesan-box" id="af-detail-pesan"></div>

          <div id="af-balasan-lama-wrap" style="display:none">
            <div class="af-divider"></div>
            <div class="af-section-label">
              <i class="fa-solid fa-reply"
                style="color:#16a34a;margin-right:6px"></i>
              Balasan Sebelumnya:
            </div>
            <div class="af-balasan-box" id="af-balasan-lama"></div>
          </div>

          <div class="af-divider"></div>
          <div class="af-section-label">
            <i class="fa-solid fa-pen-to-square"
              style="color:#f59e0b;margin-right:6px"></i>
            Balas Feedback:
          </div>
          <textarea class="af-textarea" id="af-input-balasan"
            placeholder="Tulis balasan untuk orang tua..." rows="4"></textarea>
          <span class="ag-error" id="af-error-balasan"></span>

        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="af-btn-tutup">
            <i class="fa-solid fa-xmark"></i> Tutup
          </button>
          <button class="ag-btn-simpan" id="af-btn-kirim">
            <i class="fa-solid fa-paper-plane"></i> Kirim Balasan
          </button>
        </div>
      </div>
    </div>
  `;

  bindEvents();
  loadFeedback();
}

/* ── Render table ── */
function renderTable(data) {
  const tbody = document.getElementById("af-table-body");
  const empty = document.getElementById("af-empty");
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = "";
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = data
    .map(
      (f) => `
    <tr class="ag-tr af-tr-${statusClass(f.status)}">
      <td class="ag-td af-td-date">
        <i class="fa-solid fa-calendar-days"
          style="color:#94a3b8;margin-right:5px;font-size:11px"></i>
        ${formatDate(f.tanggal)}
      </td>
      <td class="ag-td">
        <div class="af-pengirim-wrap">
          <div class="af-avatar">${getInitials(f.pengirim)}</div>
          <span class="ag-guru-name">${f.pengirim}</span>
        </div>
      </td>
      <td class="ag-td af-siswa-name">
        <i class="fa-solid fa-user-graduate"
          style="color:#10b981;margin-right:5px;font-size:11px"></i>
        ${f.namaSiswa || "-"}
      </td>
      <td class="ag-td af-pesan-preview">${truncate(f.pesan, 55)}</td>
      <td class="ag-td">
        <span class="af-badge af-badge-${statusClass(f.status)}">
          <i class="fa-solid ${statusIcon(f.status)}"
            style="margin-right:4px;font-size:10px"></i>
          ${f.status}
        </span>
      </td>
      <td class="ag-td">
        <button class="af-detail-btn" data-id="${f.id}">
          <i class="fa-solid fa-eye" style="margin-right:5px"></i>
          Detail
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

/* ── Stats ── */
function updateStats() {
  const el = (id) => document.getElementById(id);
  const count = (s) => feedbackList.filter((f) => f.status === s).length;
  if (el("af-count-belum"))
    el("af-count-belum").textContent = count("Belum Dibaca");
  if (el("af-count-dibaca"))
    el("af-count-dibaca").textContent = count("Dibaca");
  if (el("af-count-dibalas"))
    el("af-count-dibalas").textContent = count("Dibalas");
}

/* ── Filter ── */
function getFiltered() {
  const q = document.getElementById("af-search")?.value.toLowerCase() || "";
  const st = document.getElementById("af-filter-status")?.value || "";
  return feedbackList.filter(
    (f) =>
      (f.pengirim.toLowerCase().includes(q) ||
        (f.namaSiswa || "").toLowerCase().includes(q)) &&
      (!st || f.status === st),
  );
}

/* ── Open detail ── */
async function openDetail(id) {
  activeId = id;
  const f = feedbackList.find((x) => x.id === id);
  if (!f) return;

  if (f.status === "Belum Dibaca") {
    try {
      await api.patch(`/feedback/${id}/baca`, {});
      f.status = "Dibaca";
      renderTable(getFiltered());
      updateStats();
    } catch (err) {
      console.error("Gagal mark read:", err);
    }
  }

  document.getElementById("af-detail-pengirim").textContent = f.pengirim;
  document.getElementById("af-detail-siswa").textContent = f.namaSiswa || "-";
  document.getElementById("af-detail-tanggal").textContent = formatDate(
    f.tanggal,
  );
  document.getElementById("af-detail-status").innerHTML =
    `<span class="af-badge af-badge-${statusClass(f.status)}">
       <i class="fa-solid ${statusIcon(f.status)}"
         style="margin-right:4px;font-size:10px"></i>
       ${f.status}
     </span>`;
  document.getElementById("af-detail-pesan").textContent = f.pesan;
  document.getElementById("af-input-balasan").value = "";
  document.getElementById("af-error-balasan").textContent = "";

  const lama = document.getElementById("af-balasan-lama-wrap");
  if (f.balasan) {
    lama.style.display = "block";
    document.getElementById("af-balasan-lama").textContent = f.balasan;
  } else {
    lama.style.display = "none";
  }

  document.getElementById("af-overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("af-overlay").style.display = "none";
  activeId = null;
}

/* ── Kirim balasan ── */
async function kirimBalasan() {
  const val = document.getElementById("af-input-balasan").value.trim();
  if (!val) {
    document.getElementById("af-error-balasan").textContent =
      "Balasan tidak boleh kosong";
    return;
  }
  try {
    await api.patch(`/feedback/${activeId}/balas`, { balasan: val });
    closeModal();
    await loadFeedback();
    showToast("Balasan berhasil dikirim!", "success");
  } catch (err) {
    showToast("Gagal kirim balasan: " + err.message, "error");
  }
}

/* ── Helpers ── */
function statusClass(s) {
  if (s === "Dibalas") return "green";
  if (s === "Dibaca") return "yellow";
  if (s === "Belum Dibaca") return "red";
  return "gray";
}

function statusIcon(s) {
  if (s === "Dibalas") return "fa-reply";
  if (s === "Dibaca") return "fa-envelope-open";
  if (s === "Belum Dibaca") return "fa-envelope";
  return "fa-circle";
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + "..." : str;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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

/* ── Bind events ── */
function bindEvents() {
  const $ = (id) => document.getElementById(id);

  $("af-close-modal")?.addEventListener("click", closeModal);
  $("af-btn-tutup")?.addEventListener("click", closeModal);
  $("af-btn-kirim")?.addEventListener("click", kirimBalasan);
  $("af-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "af-overlay") closeModal();
  });
  $("af-search")?.addEventListener("input", () => renderTable(getFiltered()));
  $("af-filter-status")?.addEventListener("change", () =>
    renderTable(getFiltered()),
  );
  $("af-table-body")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".af-detail-btn");
    if (btn) openDetail(parseInt(btn.dataset.id));
  });
}

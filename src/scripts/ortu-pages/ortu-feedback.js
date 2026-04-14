import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";

let feedbackSaya = [];

export async function renderOrtuFeedback() {
  const app = document.getElementById("app");

  const namaSiswa = localStorage.getItem("namaSiswa") || "-";
  const nama = localStorage.getItem("nama") || "Orang Tua";
  const siswaId = localStorage.getItem("siswaId");

  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("ortu-feedback")}
      <main class="content admin-home">

        <!-- HEADER -->
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Feedback & Saran</h2>
            <p class="ag-subtitle">Sampaikan masukan, saran, atau pertanyaan kepada pengurus TPA</p>
          </div>
          <button class="ag-tambah-btn" id="fb-btn-kirim">
            <i class="fa-solid fa-envelope"></i> Kirim Feedback
          </button>
        </div>

        <!-- INFO BANNER -->
        <div class="af-info-banner">
          <div class="af-info-icon">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div>
            <div class="af-info-title">Sampaikan Aspirasi Anda</div>
            <div class="af-info-desc">
              Feedback Anda sangat berarti untuk kemajuan TPA Al-Falah.
              Tim pengurus akan membaca dan membalas pesan Anda.
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div id="fb-loading" class="af-loading-wrap">
          <div class="gn-loading-spinner"></div>
          <p class="af-loading-text">Memuat riwayat feedback...</p>
        </div>

        <!-- STAT STRIP -->
        <div class="af-stat-strip" id="fb-stat-strip" style="display:none"></div>

        <!-- RIWAYAT FEEDBACK -->
        <div id="fb-riwayat-wrap" style="display:none">
          <div class="af-riwayat-title">
            <i class="fa-solid fa-list-ul"></i> Riwayat Feedback Saya
          </div>
          <div id="fb-riwayat-list"></div>
          <div id="fb-riwayat-empty" class="af-empty-wrap" style="display:none">
            <div class="af-empty-icon">
              <i class="fa-regular fa-comment-dots"></i>
            </div>
            <p class="af-empty-title">Belum ada feedback yang dikirim</p>
            <p class="af-empty-sub">Klik "Kirim Feedback" untuk mulai</p>
          </div>
        </div>

      </main>
    </div>

    <!-- MODAL KIRIM FEEDBACK -->
    <div class="ag-overlay" id="fb-overlay" style="display:none">
      <div class="ag-modal af-modal-wrap">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-envelope"></i> Kirim Feedback
          </h3>
          <button class="ag-modal-close" id="fb-close-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body">

          <!-- Info pengirim -->
          <div class="af-pengirim-box">
            <div class="af-pengirim-avatar">${initials}</div>
            <div>
              <div class="af-pengirim-nama">${nama}</div>
              <div class="af-pengirim-sub">Orang tua dari ${namaSiswa}</div>
            </div>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">Kategori Feedback</label>
            <select class="ag-input" id="fb-kategori">
              <option value="saran">Saran / Masukan</option>
              <option value="pertanyaan">Pertanyaan</option>
              <option value="keluhan">Keluhan</option>
              <option value="apresiasi">Apresiasi</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div class="ag-form-group">
            <label class="ag-label">
              Pesan <span class="ag-required">*</span>
            </label>
            <textarea class="ag-input af-textarea" id="fb-pesan" rows="5"
              placeholder="Tulis feedback, saran, atau pertanyaan Anda di sini..."></textarea>
            <div class="af-char-row">
              <span id="fb-char-count" class="af-char-count">0 / 500 karakter</span>
            </div>
            <span class="ag-error" id="fb-error-pesan"></span>
          </div>

        </div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="fb-btn-batal">Batal</button>
          <button class="ag-btn-simpan" id="fb-btn-submit">
            <i class="fa-solid fa-paper-plane"></i> Kirim Feedback
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL BALASAN -->
    <div class="ag-overlay" id="fb-detail-overlay" style="display:none">
      <div class="ag-modal af-modal-wrap">
        <div class="ag-modal-header">
          <h3 class="ag-modal-title">
            <i class="fa-solid fa-comment-dots"></i> Detail Feedback
          </h3>
          <button class="ag-modal-close" id="fb-detail-close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="ag-modal-body" id="fb-detail-body"></div>
        <div class="ag-modal-footer">
          <button class="ag-btn-batal" id="fb-detail-tutup">Tutup</button>
        </div>
      </div>
    </div>
  `;

  await loadFeedback(nama, namaSiswa);
  bindEvents(nama, namaSiswa);
}

/* ── Load ── */
async function loadFeedback(nama, namaSiswa) {
  try {
    const res = await api.get(`/feedback/saya`);
    feedbackSaya = res.data || [];
    renderStat();
    renderRiwayat();
    document.getElementById("fb-loading").style.display = "none";
    document.getElementById("fb-stat-strip").style.display = "flex";
    document.getElementById("fb-riwayat-wrap").style.display = "block";
  } catch {
    feedbackSaya = [];
    document.getElementById("fb-loading").style.display = "none";
    document.getElementById("fb-stat-strip").style.display = "none";
    document.getElementById("fb-riwayat-wrap").style.display = "block";
    renderRiwayat();
  }
}

/* ── Stat strip ── */
function renderStat() {
  const strip = document.getElementById("fb-stat-strip");
  const dibalas = feedbackSaya.filter((f) => f.status === "Dibalas").length;
  const dibaca = feedbackSaya.filter((f) => f.status === "Dibaca").length;
  const belum = feedbackSaya.filter((f) => f.status === "Belum Dibaca").length;

  strip.innerHTML = `
    <div class="af-stat-card af-stat-green">
      <div class="af-stat-icon-wrap af-icon-green">
        <i class="fa-solid fa-reply af-icon-green-clr"></i>
      </div>
      <div class="af-stat-info">
        <span class="af-stat-label">Dibalas</span>
        <span class="af-stat-val">${dibalas}</span>
      </div>
    </div>
    <div class="af-stat-card af-stat-yellow">
      <div class="af-stat-icon-wrap af-icon-yellow">
        <i class="fa-solid fa-envelope-open af-icon-yellow-clr"></i>
      </div>
      <div class="af-stat-info">
        <span class="af-stat-label">Dibaca</span>
        <span class="af-stat-val">${dibaca}</span>
      </div>
    </div>
    <div class="af-stat-card af-stat-red">
      <div class="af-stat-icon-wrap af-icon-red">
        <i class="fa-solid fa-envelope af-icon-red-clr"></i>
      </div>
      <div class="af-stat-info">
        <span class="af-stat-label">Menunggu</span>
        <span class="af-stat-val">${belum}</span>
      </div>
    </div>
  `;
}

/* ── Riwayat ── */
const KATEGORI_ICON = {
  saran: "fa-lightbulb",
  pertanyaan: "fa-circle-question",
  keluhan: "fa-triangle-exclamation",
  apresiasi: "fa-star",
  lainnya: "fa-file-lines",
};
const KATEGORI_LABEL = {
  saran: "Saran / Masukan",
  pertanyaan: "Pertanyaan",
  keluhan: "Keluhan",
  apresiasi: "Apresiasi",
  lainnya: "Lainnya",
};
const STATUS_CFG = {
  Dibalas: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: "fa-check-circle",
    label: "Dibalas",
  },
  Dibaca: { bg: "#fef9c3", color: "#a16207", icon: "fa-eye", label: "Dibaca" },
  "Belum Dibaca": {
    bg: "#fee2e2",
    color: "#dc2626",
    icon: "fa-paper-plane",
    label: "Terkirim",
  },
};

function renderRiwayat() {
  const list = document.getElementById("fb-riwayat-list");
  const empty = document.getElementById("fb-riwayat-empty");
  if (!list) return;

  if (feedbackSaya.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  list.innerHTML = feedbackSaya
    .map((f) => {
      const cfg = STATUS_CFG[f.status] || STATUS_CFG["Belum Dibaca"];
      const tgl = new Date(f.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const faIcon = KATEGORI_ICON[f.kategori] || "fa-file-lines";
      const label = KATEGORI_LABEL[f.kategori] || "Feedback";

      return `
      <div class="af-card">
        <!-- Header -->
        <div class="af-card-header">
          <div class="af-card-kat">
            <div class="af-kat-icon">
              <i class="fa-solid ${faIcon}"></i>
            </div>
            <div>
              <div class="af-kat-label">${label}</div>
              <div class="af-kat-date">${tgl}</div>
            </div>
          </div>
          <span class="af-status-badge"
            style="background:${cfg.bg};color:${cfg.color}">
            <i class="fa-solid ${cfg.icon}"></i> ${cfg.label}
          </span>
        </div>

        <!-- Pesan -->
        <div class="af-pesan-box">${f.pesan}</div>

        <!-- Balasan -->
        ${
          f.balasan
            ? `
          <div class="af-balasan-box">
            <div class="af-balasan-label">
              <i class="fa-solid fa-reply"></i> Balasan Pengurus
            </div>
            <div class="af-balasan-text">${f.balasan}</div>
          </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="af-card-footer">
          <button class="af-detail-btn fb-detail-btn" data-id="${f.id}">
            Lihat Detail <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>`;
    })
    .join("");
}

/* ── Modal kirim ── */
function openModal() {
  document.getElementById("fb-overlay").style.display = "flex";
  document.getElementById("fb-pesan").value = "";
  document.getElementById("fb-error-pesan").textContent = "";
  document.getElementById("fb-char-count").textContent = "0 / 500 karakter";
  document.getElementById("fb-char-count").style.color = "";
  document.getElementById("fb-kategori").value = "saran";
}
function closeModal() {
  document.getElementById("fb-overlay").style.display = "none";
}

/* ── Modal detail ── */
function openDetail(id) {
  const f = feedbackSaya.find((x) => x.id === id);
  if (!f) return;

  const tgl = new Date(f.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const cfg = STATUS_CFG[f.status] || STATUS_CFG["Belum Dibaca"];
  const label = KATEGORI_LABEL[f.kategori] || "Feedback";

  document.getElementById("fb-detail-body").innerHTML = `
    <div class="af-detail-meta">
      <div class="af-detail-kat">
        <i class="fa-solid ${KATEGORI_ICON[f.kategori] || "fa-file-lines"}"></i>
        ${label}
      </div>
      <div class="af-detail-right">
        <span class="af-detail-date">${tgl}</span>
        <span class="af-status-badge"
          style="background:${cfg.bg};color:${cfg.color}">
          <i class="fa-solid ${cfg.icon}"></i> ${cfg.label}
        </span>
      </div>
    </div>
    <div class="af-divider"></div>
    <div class="af-section-label">
      <i class="fa-solid fa-envelope"></i> Pesan Anda
    </div>
    <div class="af-pesan-box af-pesan-box--mb">${f.pesan}</div>
    ${
      f.balasan
        ? `
      <div class="af-divider"></div>
      <div class="af-section-label">
        <i class="fa-solid fa-reply"></i> Balasan Pengurus
      </div>
      <div class="af-balasan-box">${f.balasan}</div>
    `
        : `
      <div class="af-waiting-wrap">
        <i class="fa-regular fa-clock af-waiting-icon"></i>
        <p class="af-waiting-text">Feedback Anda sedang ditinjau oleh pengurus</p>
      </div>
    `
    }
  `;
  document.getElementById("fb-detail-overlay").style.display = "flex";
}
function closeDetail() {
  document.getElementById("fb-detail-overlay").style.display = "none";
}

/* ── Kirim ── */
async function kirimFeedback() {
  const pesan = document.getElementById("fb-pesan").value.trim();
  const kategori = document.getElementById("fb-kategori").value;
  const nama = localStorage.getItem("nama") || "Orang Tua";
  const namaSiswa = localStorage.getItem("namaSiswa") || "-";
  const errEl = document.getElementById("fb-error-pesan");

  errEl.textContent = "";
  if (!pesan) {
    errEl.textContent = "Pesan tidak boleh kosong";
    return;
  }
  if (pesan.length > 500) {
    errEl.textContent = "Pesan maksimal 500 karakter";
    return;
  }

  const btn = document.getElementById("fb-btn-submit");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

  try {
    await api.post("/feedback", { pengirim: nama, namaSiswa, pesan, kategori });
    closeModal();
    showToast("Feedback berhasil dikirim! Terima kasih.", "success");
    await loadFeedback(nama, namaSiswa);
  } catch (err) {
    alert("Gagal kirim feedback: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Feedback';
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

/* ── Bind events ── */
function bindEvents(nama, namaSiswa) {
  const $ = (id) => document.getElementById(id);

  $("fb-btn-kirim")?.addEventListener("click", openModal);
  $("fb-close-modal")?.addEventListener("click", closeModal);
  $("fb-btn-batal")?.addEventListener("click", closeModal);
  $("fb-btn-submit")?.addEventListener("click", kirimFeedback);
  $("fb-detail-close")?.addEventListener("click", closeDetail);
  $("fb-detail-tutup")?.addEventListener("click", closeDetail);

  $("fb-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "fb-overlay") closeModal();
  });
  $("fb-detail-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "fb-detail-overlay") closeDetail();
  });

  $("fb-pesan")?.addEventListener("input", (e) => {
    const len = e.target.value.length;
    const el = $("fb-char-count");
    if (el) {
      el.textContent = `${len} / 500 karakter`;
      el.style.color = len > 450 ? "#ef4444" : "#94a3b8";
    }
  });

  $("fb-riwayat-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".fb-detail-btn");
    if (btn) openDetail(parseInt(btn.dataset.id));
  });
}

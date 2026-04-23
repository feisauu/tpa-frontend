import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";

const STATUS_LIST = ["Hadir", "Sakit", "Izin", "Alpha"];
const STATUS_COLOR = {
  Hadir: { active: "#16a34a", bg: "#dcfce7", ring: "#86efac" },
  Sakit: { active: "#2563eb", bg: "#dbeafe", ring: "#93c5fd" },
  Izin: { active: "#d97706", bg: "#fef9c3", ring: "#fcd34d" },
  Alpha: { active: "#dc2626", bg: "#fee2e2", ring: "#fca5a5" },
};

const STATUS_ICON = {
  Hadir: '<i class="fa-solid fa-circle-check"></i>',
  Sakit: '<i class="fa-solid fa-notes-medical"></i>',
  Izin: '<i class="fa-solid fa-file-signature"></i>',
  Alpha: '<i class="fa-solid fa-circle-xmark"></i>',
};

let kelasList = [];
let siswaList = [];
let statusMap = {};
let catatanMap = {};

export function renderGuruKehadiran() {
  const app = document.getElementById("app");
  const today = new Date().toISOString().split("T")[0];

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-kehadiran")}
      <main class="content admin-home">

        <!-- HEADER -->
        <div class="ag-header">
          <div>
            <h2 class="ag-title">
               Input Absensi
            </h2>
            <p class="ag-subtitle">Catat kehadiran siswa per kelas dan tanggal</p>
          </div>
          <div class="ab-today-chip">
            <i class="fa-solid fa-calendar-days"></i>
            <span id="ab-today-label"></span>
          </div>
        </div>

        <!-- STAT STRIP -->
        <div class="ag-stat-strip" id="ab-stat-strip" style="display:none">
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#dcfce7;color:#16a34a">
              <i class="fa-solid fa-circle-check"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="ab-s-hadir" style="color:#16a34a">0</div>
              <div class="ag-stat-key">Hadir</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#dbeafe;color:#2563eb">
              <i class="fa-solid fa-notes-medical"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="ab-s-sakit" style="color:#2563eb">0</div>
              <div class="ag-stat-key">Sakit</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#fef9c3;color:#d97706">
              <i class="fa-solid fa-file-signature"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="ab-s-izin" style="color:#d97706">0</div>
              <div class="ag-stat-key">Izin</div>
            </div>
          </div>
          <div class="ag-stat-divider"></div>
          <div class="ag-stat-item">
            <span class="ag-stat-icon" style="background:#fee2e2;color:#dc2626">
              <i class="fa-solid fa-circle-xmark"></i>
            </span>
            <div>
              <div class="ag-stat-val" id="ab-s-alpha" style="color:#dc2626">0</div>
              <div class="ag-stat-key">Alpha</div>
            </div>
          </div>
        </div>

        <!-- FORM CARD -->
        <div class="gn-card">
          <div class="ab-form-top">
            <div class="ag-form-group ab-form-tanggal">
              <label class="gn-label">Tanggal</label>
              <input class="ag-input" type="date" id="ab-tanggal" value="${today}"/>
            </div>
            <div class="ag-form-group ab-form-kelas">
              <label class="gn-label">Pilih Kelas</label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="ab-kelas">
                  <option value="">-- Pilih Kelas --</option>
                </select>
              </div>
            </div>
          </div>

          <div id="ab-table-wrap" class="gn-hidden">
            <!-- Bulk action -->
            <div class="ab-bulk-row">
              <span class="ab-bulk-label">Tandai semua sebagai:</span>
              <div class="ab-bulk-btns">
                ${STATUS_LIST.map(
                  (s) => `
                  <button class="ab-bulk-btn" data-status="${s}"
                    style="color:${STATUS_COLOR[s].active};background:${STATUS_COLOR[s].bg};border-color:${STATUS_COLOR[s].ring}">
                    ${STATUS_ICON[s]} ${s}
                  </button>
                `,
                ).join("")}
              </div>
            </div>

            <!-- Tabel -->
            <div class="ab-table-scroll">
              <table class="ab-table">
                <thead>
                  <tr>
                    <th style="width:40px">No</th>
                    <th>Nama Siswa</th>
                    ${STATUS_LIST.map(
                      (s) => `
                      <th style="text-align:center;color:${STATUS_COLOR[s].active}">
                        ${STATUS_ICON[s]} ${s}
                      </th>`,
                    ).join("")}
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody id="ab-tbody"></tbody>
              </table>
            </div>

            <!-- Submit -->
            <div class="ab-submit-row">
              <button class="ag-btn-simpan" id="ab-submit">
                <i class="fa-solid fa-floppy-disk"></i> Simpan Absensi
              </button>
            </div>
          </div>

          <div id="ab-loading" style="display:none;text-align:center;padding:20px;color:#94a3b8">
            Memuat data siswa...
          </div>
        </div>

      </main>
    </div>
  `;

  const todayLabel = document.getElementById("ab-today-label");
  if (todayLabel) {
    todayLabel.textContent = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  loadKelas();
  bindEvents();
}

async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
    const sel = document.getElementById("ab-kelas");
    if (!sel) return;
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
  const wrap = document.getElementById("ab-table-wrap");
  const loading = document.getElementById("ab-loading");
  wrap.classList.add("gn-hidden");
  loading.style.display = "block";
  statusMap = {};
  catatanMap = {};

  try {
    const res = await api.get(`/siswa/kelas/${kelasId}`);
    siswaList = res.data;
    siswaList.forEach((s) => {
      statusMap[s.id] = "Hadir";
      catatanMap[s.id] = "";
    });
    renderAbsensiTable();
    updateStats();
    wrap.classList.remove("gn-hidden");
    document.getElementById("ab-stat-strip").style.display = "flex";
  } catch (err) {
    alert("Gagal load siswa: " + err.message);
  } finally {
    loading.style.display = "none";
  }
}

function renderAbsensiTable() {
  const tbody = document.getElementById("ab-tbody");
  if (!tbody) return;
  tbody.innerHTML = siswaList
    .map((s, i) => {
      const status = statusMap[s.id] || "Hadir";
      const perluCatatan = status === "Izin";
      const inputStyle = perluCatatan
        ? `border-color:${STATUS_COLOR[status].ring};background:${STATUS_COLOR[status].bg}`
        : "";
      return `
        <tr id="row-${s.id}">
          <td class="ab-no">${i + 1}</td>
          <td class="ab-nama">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="ag-avatar" style="width:32px;height:32px;font-size:12px">${getInitials(s.nama)}</div>
              ${s.nama}
            </div>
          </td>
          ${STATUS_LIST.map(
            (st) => `
            <td style="text-align:center">
              <input type="radio" name="status-${s.id}" value="${st}"
                ${status === st ? "checked" : ""}
                onchange="updateStatus(${s.id}, '${st}')"
                style="accent-color:${STATUS_COLOR[st].active};width:18px;height:18px;cursor:pointer"/>
            </td>
          `,
          ).join("")}
          <td style="min-width:160px">
            <input
              type="text"
              id="catatan-${s.id}"
              class="ag-input"
              placeholder="${perluCatatan ? "Wajib diisi..." : "Opsional"}"
              value="${catatanMap[s.id] || ""}"
              oninput="updateCatatan(${s.id}, this.value)"
              style="font-size:12px;padding:6px 10px;${inputStyle}"/>
          </td>
        </tr>
      `;
    })
    .join("");
}

window.updateStatus = function (siswaId, status) {
  statusMap[siswaId] = status;
  updateStats();

  const input = document.getElementById(`catatan-${siswaId}`);
  if (input) {
    const perluCatatan = status === "Izin";
    input.placeholder = perluCatatan ? "Wajib diisi..." : "Opsional";
    if (perluCatatan) {
      input.style.borderColor = STATUS_COLOR[status].ring;
      input.style.background = STATUS_COLOR[status].bg;
    } else {
      input.style.borderColor = "";
      input.style.background = "";
    }
  }
};

window.updateCatatan = function (siswaId, value) {
  catatanMap[siswaId] = value;
};

function updateStats() {
  const values = Object.values(statusMap);
  const el = (id) => document.getElementById(id);
  if (el("ab-s-hadir"))
    el("ab-s-hadir").textContent = values.filter((v) => v === "Hadir").length;
  if (el("ab-s-sakit"))
    el("ab-s-sakit").textContent = values.filter((v) => v === "Sakit").length;
  if (el("ab-s-izin"))
    el("ab-s-izin").textContent = values.filter((v) => v === "Izin").length;
  if (el("ab-s-alpha"))
    el("ab-s-alpha").textContent = values.filter((v) => v === "Alpha").length;
}

async function submitAbsensi() {
  const tanggal = document.getElementById("ab-tanggal").value;
  const kelasId = document.getElementById("ab-kelas").value;

  if (!tanggal || !kelasId) {
    alert("Pilih tanggal dan kelas terlebih dahulu");
    return;
  }
  if (siswaList.length === 0) {
    alert("Tidak ada siswa di kelas ini");
    return;
  }

  const kurangCatatan = siswaList.filter(
    (s) => statusMap[s.id] === "Izin" && !catatanMap[s.id]?.trim(),
  );
  if (kurangCatatan.length > 0) {
    alert(
      `Keterangan wajib diisi untuk siswa yang Izin:\n` +
        kurangCatatan.map((s) => `• ${s.nama}`).join("\n"),
    );
    document.getElementById(`catatan-${kurangCatatan[0].id}`)?.focus();
    return;
  }

  const data = siswaList.map((s) => ({
    siswaId: s.id,
    status: statusMap[s.id] || "Hadir",
    catatan: catatanMap[s.id]?.trim() || null,
  }));

  try {
    await api.post("/kehadiran/batch", { tanggal, data });
    const namaKelasStr =
      document.getElementById("ab-kelas")?.selectedOptions[0]?.text || "";
    const bulanIni = new Date().toISOString().slice(0, 7);
    sessionStorage.setItem(
      "rk_state",
      JSON.stringify({
        kelasId: document.getElementById("ab-kelas")?.value,
        bulan: bulanIni,
        namaKelas: namaKelasStr,
      }),
    );
    window.location.hash = "#/guru-riwayatkehadiran";
  } catch (err) {
    alert("Gagal simpan absensi: " + err.message);
  }
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
  document.getElementById("ab-kelas")?.addEventListener("change", (e) => {
    if (e.target.value) loadSiswa(e.target.value);
  });
  document
    .getElementById("ab-submit")
    ?.addEventListener("click", submitAbsensi);
  document.querySelector(".ab-bulk-btns")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ab-bulk-btn");
    if (!btn) return;
    const status = btn.dataset.status;
    siswaList.forEach((s) => {
      statusMap[s.id] = status;
    });
    renderAbsensiTable();
    updateStats();
  });
}

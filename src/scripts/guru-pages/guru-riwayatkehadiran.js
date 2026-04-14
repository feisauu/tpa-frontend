import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";

const STATUS_COLOR = {
  Hadir: { text: "#16a34a", bg: "#dcfce7" },
  Sakit: { text: "#2563eb", bg: "#dbeafe" },
  Izin: { text: "#d97706", bg: "#fef9c3" },
  Alpha: { text: "#dc2626", bg: "#fee2e2" },
};
const STATUS_ICON = {
  Hadir: '<i class="fa-solid fa-circle-check"></i>',
  Sakit: '<i class="fa-solid fa-notes-medical"></i>',
  Izin: '<i class="fa-solid fa-file-signature"></i>',
  Alpha: '<i class="fa-solid fa-circle-xmark"></i>',
};
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function hitungHariAktif(tahun, bulan) {
  const akhir = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let i = 1; i <= akhir; i++) {
    const hari = new Date(tahun, bulan - 1, i).getDay();
    if (hari >= 1 && hari <= 4) count++;
  }
  return count;
}

let kelasList = [];
let siswaList = [];
let currentKelasId = null;
let currentSiswaId = null;
let lastData = [];

export function renderGuruRiwayatKehadiran() {
  const app = document.getElementById("app");
  const now = new Date();
  const bulanIni = now.toISOString().slice(0, 7);

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-riwayatkehadiran")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">
               Riwayat Kehadiran
            </h2>
            <p class="ag-subtitle">Lihat dan rekap kehadiran siswa per kelas</p>
          </div>
        </div>

        <!-- FILTER CARD -->
        <div class="gn-card">
          <div class="rk-filter-row">
            <div class="ag-form-group rk-filter-item">
              <label class="gn-label">Pilih Kelas</label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="rk-kelas">
                  <option value="">-- Pilih Kelas --</option>
                </select>
              </div>
            </div>
            <div class="ag-form-group rk-filter-item">
              <label class="gn-label">
                Pilih Siswa
                <span style="font-size:11px;color:#94a3b8;font-weight:400">(opsional)</span>
              </label>
              <div class="gn-select-wrap">
                <select class="gn-select" id="rk-siswa" disabled>
                  <option value="">-- Semua Siswa --</option>
                </select>
              </div>
            </div>
            <div class="ag-form-group rk-filter-item rk-filter-bulan">
              <label class="gn-label">Bulan</label>
              <input class="ag-input" type="month" id="rk-bulan" value="${bulanIni}"/>
            </div>
            <div class="ag-form-group rk-filter-btn-wrap">
              <button class="ag-btn-simpan" id="rk-cari" style="white-space:nowrap;width:100%">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span class="rk-btn-label"> Tampilkan</span>
              </button>
            </div>
          </div>

          <div class="rk-info-banner">
            <i class="fa-solid fa-circle-info"></i>
            Persentase dihitung dari <strong>hari aktif (Senin–Kamis)</strong>
          </div>
        </div>

        <!-- REKAP STRIP -->
        <div class="gn-card gn-hidden" id="rk-rekap-card">
          <div class="rk-rekap-header">
            <div>
              <div class="rk-rekap-title" id="rk-rekap-title">-</div>
              <div class="rk-rekap-sub" id="rk-rekap-sub">-</div>
            </div>
            <div class="rk-persentase" id="rk-persentase"></div>
          </div>
          <div class="rk-stat-row" id="rk-stat-row"></div>
        </div>

        <!-- TABEL -->
        <div class="gn-card gn-hidden" id="rk-table-card">
          <div id="rk-loading" style="display:none;text-align:center;padding:24px;color:#94a3b8">
            Memuat data kehadiran...
          </div>
          <div class="ab-table-scroll" id="rk-table-area">
            <table class="ab-table rk-table">
              <thead id="rk-thead"></thead>
              <tbody id="rk-tbody"></tbody>
            </table>
          </div>
          <div class="rv-empty gn-hidden" id="rk-empty">
            <span><i class="fa-solid fa-calendar-xmark" style="font-size:24px;color:#94a3b8"></i></span>
            <p>Belum ada data kehadiran untuk periode ini</p>
          </div>
        </div>

      </main>
    </div>

    <!-- ══════ MODAL DETAIL ══════ -->
    <div id="rk-modal-overlay" class="rk-overlay">
      <div id="rk-modal" class="rk-modal">

        <div class="rk-modal-header">
          <div class="rk-modal-avatar" id="rk-modal-avatar"></div>
          <div class="rk-modal-hinfo">
            <div class="rk-modal-nama" id="rk-modal-nama"></div>
            <div class="rk-modal-msub" id="rk-modal-sub"></div>
          </div>
          <button onclick="tutupModal()" class="rk-close-btn">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div id="rk-modal-stats" class="rk-modal-stats"></div>

        <div class="rk-modal-filters" id="rk-modal-filter-wrap">
          <button class="rk-flt-btn rk-flt-active" data-filter=""
            onclick="filterModal(this, '')">Semua</button>
          ${["Hadir", "Sakit", "Izin", "Alpha"]
            .map(
              (s) => `
            <button class="rk-flt-btn" data-filter="${s}"
              onclick="filterModal(this,'${s}')"
              style="color:${STATUS_COLOR[s].text};background:${STATUS_COLOR[s].bg}">
              ${STATUS_ICON[s]} ${s}
            </button>`,
            )
            .join("")}
        </div>

        <div id="rk-modal-body" class="rk-modal-body"></div>

        <div class="rk-modal-footer">
          <button onclick="tutupModal()" class="rk-close-btn2">Tutup</button>
        </div>
      </div>
    </div>
  `;

  loadKelas().then(() => {
    const raw = sessionStorage.getItem("rk_state");
    if (!raw) return;
    sessionStorage.removeItem("rk_state");
    try {
      const state = JSON.parse(raw);
      if (state.bulan) {
        const el = document.getElementById("rk-bulan");
        if (el) el.value = state.bulan;
      }
      const selKelas = document.getElementById("rk-kelas");
      if (state.kelasId && selKelas) {
        selKelas.value = state.kelasId;
        selKelas.dispatchEvent(new Event("change"));
        const interval = setInterval(() => {
          const selSiswa = document.getElementById("rk-siswa");
          if (!selSiswa || selSiswa.disabled || selSiswa.options.length <= 1)
            return;
          clearInterval(interval);
          if (state.siswaId) {
            selSiswa.value = state.siswaId;
            currentSiswaId = state.siswaId;
          }
          document.getElementById("rk-cari")?.click();
        }, 150);
      }
    } catch (e) {
      console.error("rk_state parse error:", e);
    }
  });

  bindEvents();

  document
    .getElementById("rk-modal-overlay")
    ?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("rk-modal-overlay"))
        tutupModal();
    });
}

/* ── Modal ── */
window.bukaModalDetail = function (siswaId, namaBulan) {
  const siswa = siswaList.find((s) => String(s.id) === String(siswaId));
  const kelas = kelasList.find((k) => String(k.id) === String(currentKelasId));
  if (!siswa) return;

  const rekorSiswa = lastData.filter(
    (d) => String(d.siswaId) === String(siswaId),
  );
  const initials = siswa.nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const cnt = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
  rekorSiswa.forEach((d) => {
    if (cnt[d.status] !== undefined) cnt[d.status]++;
  });

  document.getElementById("rk-modal-avatar").textContent = initials;
  document.getElementById("rk-modal-nama").textContent = siswa.nama;
  document.getElementById("rk-modal-sub").textContent =
    `${kelas?.namaKelas ?? "-"} · ${namaBulan}`;

  document.getElementById("rk-modal-stats").innerHTML = [
    "Hadir",
    "Sakit",
    "Izin",
    "Alpha",
  ]
    .map(
      (s) => `
    <div>
      <div style="font-size:18px;font-weight:800;color:${STATUS_COLOR[s].text}">${cnt[s]}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:2px;font-weight:600">${s}</div>
    </div>`,
    )
    .join("");

  document.getElementById("rk-modal-body").dataset.siswaId = siswaId;
  document
    .querySelectorAll(".rk-flt-btn")
    .forEach((b) => b.classList.remove("rk-flt-active"));
  document
    .querySelector(".rk-flt-btn[data-filter='']")
    ?.classList.add("rk-flt-active");
  renderModalList(rekorSiswa, "");

  const overlay = document.getElementById("rk-modal-overlay");
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
};

window.tutupModal = function () {
  document.getElementById("rk-modal-overlay").style.display = "none";
  document.body.style.overflow = "";
};

window.filterModal = function (btn, status) {
  document
    .querySelectorAll(".rk-flt-btn")
    .forEach((b) => b.classList.remove("rk-flt-active"));
  btn.classList.add("rk-flt-active");
  const siswaId = document.getElementById("rk-modal-body").dataset.siswaId;
  const rekorSiswa = lastData.filter(
    (d) => String(d.siswaId) === String(siswaId),
  );
  renderModalList(
    status ? rekorSiswa.filter((d) => d.status === status) : rekorSiswa,
    status,
  );
};

function renderModalList(data, filterStatus) {
  const body = document.getElementById("rk-modal-body");
  if (data.length === 0) {
    body.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#94a3b8">
      <i class="fa-solid fa-calendar-xmark" style="font-size:28px;margin-bottom:10px;display:block"></i>
      <div style="font-size:13px">
        ${filterStatus ? `Tidak ada data <strong>${filterStatus}</strong>` : "Tidak ada data kehadiran"}
      </div></div>`;
    return;
  }

  const sorted = [...data].sort(
    (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
  );
  const perBulan = {};
  sorted.forEach((d) => {
    const bln = d.tanggal.slice(0, 7);
    if (!perBulan[bln]) perBulan[bln] = [];
    perBulan[bln].push(d);
  });

  body.innerHTML = Object.entries(perBulan)
    .map(([bln, items]) => {
      const [y, m] = bln.split("-");
      const namaBln = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(
        "id-ID",
        { month: "long", year: "numeric" },
      );
      const rows = items
        .map((d) => {
          const tgl = new Date(d.tanggal);
          const day = String(tgl.getDate()).padStart(2, "0");
          const cfg = STATUS_COLOR[d.status] ?? {
            text: "#64748b",
            bg: "#f1f5f9",
          };
          return `
        <div class="rk-day-item">
          <div style="width:40px;height:40px;border-radius:10px;flex-shrink:0;
            background:${cfg.bg};display:flex;flex-direction:column;
            align-items:center;justify-content:center;gap:1px">
            <span style="font-size:15px;font-weight:800;color:${cfg.text};line-height:1">${day}</span>
            <span style="font-size:9px;font-weight:700;color:${cfg.text};opacity:0.7">
              ${HARI[tgl.getDay()].slice(0, 3).toUpperCase()}
            </span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#1e293b">
              ${HARI[tgl.getDay()]}, ${day} ${new Date(
                parseInt(y),
                parseInt(m) - 1,
              ).toLocaleDateString("id-ID", { month: "long" })} ${y}
            </div>
            ${
              d.catatan
                ? `
              <div style="font-size:12px;color:${cfg.text};margin-top:2px;
                display:flex;align-items:center;gap:4px">
                <i class="fa-solid fa-message" style="font-size:10px"></i>${d.catatan}
              </div>`
                : ""
            }
          </div>
          <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;
            font-weight:700;white-space:nowrap;background:${cfg.bg};color:${cfg.text};
            padding:4px 10px;border-radius:999px;flex-shrink:0">
            ${STATUS_ICON[d.status] ?? ""} ${d.status}
          </span>
        </div>`;
        })
        .join("");

      return `
      <div style="padding:8px 20px 4px">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;
          text-transform:uppercase;letter-spacing:0.05em">${namaBln}</div>
      </div>${rows}`;
    })
    .join("");
}

/* ── Events ── */
function bindEvents() {
  document.getElementById("rk-kelas")?.addEventListener("change", async (e) => {
    currentKelasId = e.target.value;
    currentSiswaId = null;
    const selSiswa = document.getElementById("rk-siswa");
    selSiswa.disabled = true;
    selSiswa.innerHTML = `<option value="">-- Semua Siswa --</option>`;
    document.getElementById("rk-rekap-card").classList.add("gn-hidden");
    document.getElementById("rk-table-card").classList.add("gn-hidden");
    if (!currentKelasId) return;
    await loadSiswa(currentKelasId);
    selSiswa.disabled = false;
  });

  document.getElementById("rk-siswa")?.addEventListener("change", (e) => {
    currentSiswaId = e.target.value || null;
  });

  document.getElementById("rk-cari")?.addEventListener("click", () => {
    if (!currentKelasId) {
      alert("Pilih kelas terlebih dahulu");
      return;
    }
    tampilkanRiwayat();
  });
}

async function loadKelas() {
  try {
    const res = await api.get("/kelas");
    kelasList = res.data;
    const sel = document.getElementById("rk-kelas");
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
    const sel = document.getElementById("rk-siswa");
    sel.innerHTML =
      `<option value="">-- Semua Siswa --</option>` +
      siswaList
        .map((s) => `<option value="${s.id}">${s.nama}</option>`)
        .join("");
  } catch (err) {
    console.error("Gagal load siswa:", err);
  }
}

async function tampilkanRiwayat() {
  const bulanVal = document.getElementById("rk-bulan")?.value;
  if (!bulanVal) {
    alert("Pilih bulan terlebih dahulu");
    return;
  }

  const [tahun, bulan] = bulanVal.split("-");
  const tanggalMulai = `${tahun}-${bulan}-01`;
  const hariAkhir = new Date(parseInt(tahun), parseInt(bulan), 0).getDate();
  const tanggalAkhir = `${tahun}-${bulan}-${String(hariAkhir).padStart(2, "0")}`;
  const hariAktif = hitungHariAktif(parseInt(tahun), parseInt(bulan));

  const loading = document.getElementById("rk-loading");
  const tableArea = document.getElementById("rk-table-area");
  const tableCard = document.getElementById("rk-table-card");
  const rekapCard = document.getElementById("rk-rekap-card");

  tableCard.classList.remove("gn-hidden");
  rekapCard.classList.add("gn-hidden");
  loading.style.display = "block";
  tableArea.style.display = "none";

  try {
    let params = `kelasId=${currentKelasId}&tanggalMulai=${tanggalMulai}&tanggalAkhir=${tanggalAkhir}`;
    if (currentSiswaId) params += `&siswaId=${currentSiswaId}`;

    const res = await api.get(`/kehadiran?${params}`);
    const data = res.data ?? [];
    lastData = data;

    const namaBulan = new Date(
      parseInt(tahun),
      parseInt(bulan) - 1,
    ).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    if (currentSiswaId) {
      const rekorSiswa = data.filter(
        (d) => String(d.siswaId) === String(currentSiswaId),
      );
      const rekap = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
      rekorSiswa.forEach((d) => {
        if (rekap[d.status] !== undefined) rekap[d.status]++;
      });
      renderRekapSatu(rekap, bulanVal, hariAktif);
      renderTabelSatuSiswa(data);
    } else {
      renderRekapKelas(data, bulanVal, hariAktif);
      renderTabelSemuaSiswa(data, hariAktif, namaBulan);
    }

    rekapCard.classList.remove("gn-hidden");
    tableArea.style.display = "";
  } catch (err) {
    console.error("Gagal load kehadiran:", err);
    alert("Gagal memuat data kehadiran: " + err.message);
  } finally {
    loading.style.display = "none";
  }
}

function renderRekapSatu(rekap, bulanVal, hariAktif) {
  const siswa = siswaList.find((s) => String(s.id) === String(currentSiswaId));
  const kelas = kelasList.find((k) => String(k.id) === String(currentKelasId));
  const [tahun, bulan] = bulanVal.split("-");
  const namaBulan = new Date(
    parseInt(tahun),
    parseInt(bulan) - 1,
  ).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const pct = hariAktif > 0 ? Math.round((rekap.Hadir / hariAktif) * 100) : 0;

  document.getElementById("rk-rekap-title").textContent = siswa?.nama ?? "-";
  document.getElementById("rk-rekap-sub").textContent =
    `${kelas?.namaKelas ?? "-"} · ${namaBulan}`;
  document.getElementById("rk-persentase").innerHTML =
    `<i class="fa-solid fa-bullseye"></i> Kehadiran: <strong>${pct}%</strong> ` +
    `(${rekap.Hadir}/${hariAktif} hari aktif Senin–Kamis)`;

  document.getElementById("rk-stat-row").innerHTML = [
    "Hadir",
    "Sakit",
    "Izin",
    "Alpha",
  ]
    .map(
      (s) => `
    <div style="display:flex;align-items:center;gap:10px;background:${STATUS_COLOR[s].bg};
      border-radius:12px;padding:10px 14px">
      <span style="font-size:20px;color:${STATUS_COLOR[s].text}">${STATUS_ICON[s]}</span>
      <div>
        <div style="font-size:20px;font-weight:800;color:${STATUS_COLOR[s].text}">${rekap[s] ?? 0}</div>
        <div style="font-size:12px;color:#64748b;font-weight:600">${s}</div>
      </div>
    </div>`,
    )
    .join("");
}

function renderRekapKelas(data, bulanVal, hariAktif) {
  const kelas = kelasList.find((k) => String(k.id) === String(currentKelasId));
  const [tahun, bulan] = bulanVal.split("-");
  const namaBulan = new Date(
    parseInt(tahun),
    parseInt(bulan) - 1,
  ).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  document.getElementById("rk-rekap-title").textContent =
    kelas?.namaKelas ?? "-";
  document.getElementById("rk-rekap-sub").textContent = namaBulan;

  const totalHadir = data.filter((d) => d.status === "Hadir").length;
  const totalKapasitas = siswaList.length * hariAktif;
  const pct =
    totalKapasitas > 0 ? Math.round((totalHadir / totalKapasitas) * 100) : 0;

  document.getElementById("rk-persentase").innerHTML =
    `<i class="fa-solid fa-bullseye"></i> Rata-rata kelas: <strong>${pct}%</strong> ` +
    `(${hariAktif} hari aktif · ${siswaList.length} siswa)`;

  document.getElementById("rk-stat-row").innerHTML = [
    "Hadir",
    "Sakit",
    "Izin",
    "Alpha",
  ]
    .map((s) => {
      const count = data.filter((d) => d.status === s).length;
      return `
      <div style="display:flex;align-items:center;gap:10px;background:${STATUS_COLOR[s].bg};
        border-radius:12px;padding:10px 14px">
        <span style="font-size:20px;color:${STATUS_COLOR[s].text}">${STATUS_ICON[s]}</span>
        <div>
          <div style="font-size:20px;font-weight:800;color:${STATUS_COLOR[s].text}">${count}</div>
          <div style="font-size:12px;color:#64748b;font-weight:600">${s}</div>
        </div>
      </div>`;
    })
    .join("");
}

function renderTabelSatuSiswa(data) {
  const thead = document.getElementById("rk-thead");
  const tbody = document.getElementById("rk-tbody");
  const empty = document.getElementById("rk-empty");

  thead.innerHTML = `<tr>
    <th>Tanggal</th>
    <th style="text-align:center">Status</th>
    <th>Keterangan</th>
  </tr>`;

  if (data.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("gn-hidden");
    return;
  }
  empty.classList.add("gn-hidden");

  tbody.innerHTML = [...data]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .map(
      (d) => `
    <tr>
      <td style="white-space:nowrap">${formatTanggal(d.tanggal)}</td>
      <td style="text-align:center">${badgeStatus(d.status)}</td>
      <td style="font-size:13px">
        ${
          d.catatan
            ? `<span style="display:inline-flex;align-items:center;gap:5px;
              color:${STATUS_COLOR[d.status]?.text || "#64748b"};font-weight:500">
              <i class="fa-solid fa-message" style="font-size:11px"></i>${d.catatan}
            </span>`
            : `<span style="color:#cbd5e1;font-size:12px">—</span>`
        }
      </td>
    </tr>`,
    )
    .join("");
}

function renderTabelSemuaSiswa(data, hariAktif, namaBulan) {
  const thead = document.getElementById("rk-thead");
  const tbody = document.getElementById("rk-tbody");
  const empty = document.getElementById("rk-empty");

  thead.innerHTML = `<tr>
    <th>No</th>
    <th>Nama Siswa</th>
    <th style="text-align:center;color:#16a34a">${STATUS_ICON.Hadir} Hadir</th>
    <th style="text-align:center;color:#2563eb">${STATUS_ICON.Sakit} Sakit</th>
    <th style="text-align:center;color:#d97706">${STATUS_ICON.Izin} Izin</th>
    <th style="text-align:center;color:#dc2626">${STATUS_ICON.Alpha} Alpha</th>
    <th class="rk-col-hariaktif" style="text-align:center">Hari Aktif</th>
    <th style="text-align:center">% Hadir</th>
    <th class="rk-col-ket">Keterangan Terbaru</th>
    <th style="text-align:center">Detail</th>
  </tr>`;

  if (siswaList.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("gn-hidden");
    return;
  }
  empty.classList.add("gn-hidden");

  tbody.innerHTML = siswaList
    .map((s, i) => {
      const rekorSiswa = data.filter((d) => d.siswaId === s.id);
      const hadir = rekorSiswa.filter((d) => d.status === "Hadir").length;
      const sakit = rekorSiswa.filter((d) => d.status === "Sakit").length;
      const izin = rekorSiswa.filter((d) => d.status === "Izin").length;
      const alpha = rekorSiswa.filter((d) => d.status === "Alpha").length;
      const pct = hariAktif > 0 ? Math.round((hadir / hariAktif) * 100) : 0;
      const pctColor =
        pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
      const pctBg = pct >= 80 ? "#dcfce7" : pct >= 60 ? "#fef9c3" : "#fee2e2";
      const catatanTerbaru = [...rekorSiswa]
        .filter(
          (d) => (d.status === "Sakit" || d.status === "Izin") && d.catatan,
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))[0];

      return `
      <tr>
        <td class="ab-no">${i + 1}</td>
        <td class="ab-nama">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="ag-avatar" style="width:32px;height:32px;font-size:12px">${getInitials(s.nama)}</div>
            <span style="font-weight:600;color:#1e293b">${s.nama}</span>
          </div>
        </td>
        <td style="text-align:center;font-weight:700;color:#16a34a">${hadir}</td>
        <td style="text-align:center;font-weight:700;color:#2563eb">${sakit}</td>
        <td style="text-align:center;font-weight:700;color:#d97706">${izin}</td>
        <td style="text-align:center;font-weight:700;color:#dc2626">${alpha}</td>
        <td class="rk-col-hariaktif" style="text-align:center;color:#64748b;font-size:12px">${hadir}/${hariAktif}</td>
        <td style="text-align:center">
          <span style="font-weight:700;font-size:13px;color:${pctColor};
            background:${pctBg};padding:3px 10px;border-radius:999px">${pct}%</span>
        </td>
        <td class="rk-col-ket" style="font-size:12px;max-width:180px">
          ${
            catatanTerbaru
              ? `<div style="display:flex;align-items:flex-start;gap:5px">
                ${badgeStatus(catatanTerbaru.status)}
                <span style="color:${STATUS_COLOR[catatanTerbaru.status]?.text};
                  font-weight:500;line-height:1.4;margin-top:2px">
                  ${catatanTerbaru.catatan}
                </span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:3px">
                ${formatTanggal(catatanTerbaru.tanggal)}
              </div>`
              : `<span style="color:#cbd5e1">—</span>`
          }
        </td>
        <td style="text-align:center">
          <button onclick="bukaModalDetail(${s.id}, '${namaBulan}')"
            class="rk-detail-btn">
            <i class="fa-solid fa-calendar-days"></i>
            <span class="rk-detail-label"> Detail</span>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

function badgeStatus(status) {
  if (!status) return "-";
  const c = STATUS_COLOR[status] ?? { text: "#64748b", bg: "#f1f5f9" };
  return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;
    font-weight:700;background:${c.bg};color:${c.text};
    padding:4px 12px;border-radius:999px;white-space:nowrap">
    ${STATUS_ICON[status] ?? ""} ${status}
  </span>`;
}

function formatTanggal(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
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

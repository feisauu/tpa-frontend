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

let kelasList = [];
let hasilSAW = [];

export function renderGuruAnalisis() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-analisis")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Analisis SAW</h2>
            <p class="ag-subtitle">Rekomendasi kenaikan jilid — Simple Additive Weighting</p>
          </div>
        </div>

        <!-- Pilih kelas + ringkasan metodologi -->
        <div class="gn-card ag-form-group--mb">
          <div class="ag-form-group ag-form-group--mb">
            <label class="gn-label">Pilih Kelas untuk Dianalisis</label>
            <div class="gn-select-wrap">
              <select class="gn-select" id="saw-kelas">
                <option value="">-- Pilih Kelas --</option>
              </select>
            </div>
          </div>

          <!-- Kartu bobot + kategori -->
          <div class="ag-bobot-strip">
            <div class="ag-bobot-card">
              <div class="ag-bobot-card__criteria">C1</div>
              <div class="ag-bobot-card__name">📖 Bacaan</div>
              <div class="ag-bobot-card__weight">w = 0.45</div>
            </div>
            <div class="ag-bobot-card">
              <div class="ag-bobot-card__criteria">C2</div>
              <div class="ag-bobot-card__name">🧠 Hafalan</div>
              <div class="ag-bobot-card__weight">w = 0.35</div>
            </div>
            <div class="ag-bobot-card">
              <div class="ag-bobot-card__criteria">C3</div>
              <div class="ag-bobot-card__name">✏️ Menulis</div>
              <div class="ag-bobot-card__weight">w = 0.20</div>
            </div>
            <div class="ag-threshold-card">
              ✅ <strong>V ≥ 0.85</strong> — Sangat Baik — Layak Ujian<br>
              🤔 <strong>0.75 – 0.84</strong> — Baik — Dipertimbangkan<br>
              ❌ <strong>V &lt; 0.75</strong> — Cukup — Belum Layak
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div id="saw-loading" class="ag-saw-loading gn-hidden">
          <div class="gn-loading-spinner"></div>
          <p class="ag-saw-loading__text">Menghitung analisis SAW...</p>
        </div>

        <!-- Hasil -->
        <div id="saw-result-wrap" class="gn-hidden">

          <!-- Stat strip -->
          <div class="ag-stat-strip" style="margin-bottom:16px">
            <div class="ag-stat-item">
              <span class="ag-stat-icon" style="background:#dcfce7">✅</span>
              <div><div class="ag-stat-val" id="saw-layak" style="color:#16a34a">0</div><div class="ag-stat-key">Layak Ujian</div></div>
            </div>
            <div class="ag-stat-divider"></div>
            <div class="ag-stat-item">
              <span class="ag-stat-icon" style="background:#fef9c3">🤔</span>
              <div><div class="ag-stat-val" id="saw-pertimbangkan" style="color:#a16207">0</div><div class="ag-stat-key">Dipertimbangkan</div></div>
            </div>
            <div class="ag-stat-divider"></div>
            <div class="ag-stat-item">
              <span class="ag-stat-icon" style="background:#fee2e2">❌</span>
              <div><div class="ag-stat-val" id="saw-belum" style="color:#dc2626">0</div><div class="ag-stat-key">Belum Layak</div></div>
            </div>
            <div class="ag-stat-divider"></div>
            <div class="ag-stat-item">
              <span class="ag-stat-icon" style="background:#eff6ff">👥</span>
              <div><div class="ag-stat-val" id="saw-total">0</div><div class="ag-stat-key">Total Siswa</div></div>
            </div>
          </div>

          <!-- Tabel SAW -->
          <div class="ag-table-card">
            <table class="ag-table">
              <thead>
                <tr>
                  <th class="ag-th--center">#</th>
                  <th>ALTERNATIF</th>
                  <!-- Matriks X -->
                  <th class="ag-th--matrix">C1 (x)</th>
                  <th class="ag-th--matrix">C2 (x)</th>
                  <th class="ag-th--matrix">C3 (x)</th>
                  <!-- Normalisasi -->
                  <th class="ag-th--norm">R C1</th>
                  <th class="ag-th--norm">R C2</th>
                  <th class="ag-th--norm">R C3</th>
                  <!-- Skor & hasil -->
                  <th class="ag-th--center">V<sub>i</sub></th>
                  <th class="ag-th--center">PERFORMA</th>
                  <th class="ag-th--rekomendasi">
                    REKOMENDASI KELAYAKAN UJIAN KENAIKAN
                    <span class="ag-th__rekomendasi-sub">
                      (Berdasarkan hasil performa &amp; jumlah bacaan jilid)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody id="saw-tbody"></tbody>
              <!-- Baris Max di footer tabel -->
              <tfoot id="saw-tfoot"></tfoot>
            </table>
          </div>

          <!-- Formula -->
          <div class="ag-formula-bar">
            <strong>Konversi:</strong> A=5 · B+=4.5 · B=4 · B−=3.5 · C+=3 · C=2.5 · C-=2 · D=1.5 &nbsp;|&nbsp;
            <strong>r<sub>ij</sub></strong> = x<sub>ij</sub> / Max(X<sub>j</sub>) &nbsp;|&nbsp;
            <strong>V<sub>i</sub></strong> = 0.45·r<sub>C1</sub> + 0.35·r<sub>C2</sub> + 0.20·r<sub>C3</sub>
          </div>
        </div>

        <!-- Empty -->
        <div id="saw-empty" class="ag-saw-empty">
          <span class="ag-saw-empty__icon">📊</span>
          <p class="ag-saw-empty__text">Pilih kelas untuk melihat hasil analisis SAW</p>
        </div>

      </main>
    </div>
  `;

  loadKelas();
  document.getElementById("saw-kelas")?.addEventListener("change", (e) => {
    if (e.target.value) loadAnalisis(e.target.value);
    else {
      document.getElementById("saw-result-wrap").classList.add("gn-hidden");
      document.getElementById("saw-empty").classList.remove("gn-hidden");
    }
  });
}

/* ── Load kelas ── */
async function loadKelas() {
  try {
    const res = await api.get("/kelas?jenis=jilid");
    kelasList = res.data;
    const sel = document.getElementById("saw-kelas");
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

/* ── Load & render ── */
async function loadAnalisis(kelasId) {
  document.getElementById("saw-result-wrap").classList.add("gn-hidden");
  document.getElementById("saw-empty").classList.add("gn-hidden");
  document.getElementById("saw-loading").classList.remove("gn-hidden");
  try {
    const res = await api.get(`/nilai/analisis-saw/${kelasId}`);
    hasilSAW = res.data;

    document.getElementById("saw-layak").textContent = hasilSAW.filter(
      (s) => s.rekomendasi === "Layak Ujian",
    ).length;
    document.getElementById("saw-pertimbangkan").textContent = hasilSAW.filter(
      (s) => s.rekomendasi === "Dipertimbangkan",
    ).length;
    document.getElementById("saw-belum").textContent = hasilSAW.filter(
      (s) => s.rekomendasi === "Belum Layak",
    ).length;
    document.getElementById("saw-total").textContent = hasilSAW.length;

    renderTabel();
    document.getElementById("saw-loading").classList.add("gn-hidden");
    document.getElementById("saw-result-wrap").classList.remove("gn-hidden");
  } catch (err) {
    document.getElementById("saw-loading").classList.add("gn-hidden");
    const empty = document.getElementById("saw-empty");
    empty.classList.remove("gn-hidden");
    empty.innerHTML = `
      <span class="ag-saw-empty__icon">❌</span>
      <p class="ag-saw-empty__text" style="color:#ef4444">Gagal memuat analisis: ${err.message}</p>`;
  }
}

/* ── Render tabel ── */
function renderTabel() {
  const tbody = document.getElementById("saw-tbody");
  const tfoot = document.getElementById("saw-tfoot");
  if (!tbody) return;

  if (hasilSAW.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="ag-saw-empty__text" style="text-align:center;padding:32px">
      Belum ada data nilai untuk kelas ini
    </td></tr>`;
    tfoot.innerHTML = "";
    return;
  }

  // Ambil Max per kriteria dari siswa pertama (semua siswa punya Max yang sama)
  const d0 = hasilSAW[0]?.detailSAW;
  const maxB = d0?.maxPerKriteria?.bacaan ?? 0;
  const maxH = d0?.maxPerKriteria?.hafalan ?? 0;
  const maxM = d0?.maxPerKriteria?.menulis ?? 0;

  // Baris data siswa
  tbody.innerHTML = hasilSAW
    .map((s, idx) => {
      const d = s.detailSAW;

      const rowClass =
        s.rekomendasi === "Layak Ujian"
          ? "ag-tr--layak"
          : s.rekomendasi === "Dipertimbangkan"
            ? "ag-tr--pertimbangkan"
            : "";

      const warnaSkor =
        s.rekomendasi === "Layak Ujian"
          ? "#16a34a"
          : s.rekomendasi === "Dipertimbangkan"
            ? "#a16207"
            : "#dc2626";

      // Badge performa
      const perfBadge =
        s.kategori === "Sangat Baik"
          ? `<span class="ag-badge ag-badge--sangat-baik">Sangat Baik</span>`
          : s.kategori === "Baik"
            ? `<span class="ag-badge ag-badge--baik">Baik</span>`
            : `<span class="ag-badge ag-badge--cukup">Cukup</span>`;

      // Badge rekomendasi
      const alasanHtml = s.alasan
        ? `<div class="ag-rek__alasan">
            ${s.alasan
              .split(" · ")
              .map((a) => `<span class="ag-rek__alasan-item">• ${a}</span>`)
              .join("")}
           </div>`
        : "";

      const rekBadge =
        s.rekomendasi === "Layak Ujian"
          ? `<span class="ag-badge ag-badge--layak">✅ Layak Ujian</span>`
          : s.rekomendasi === "Dipertimbangkan"
            ? `<div>
                <span class="ag-badge ag-badge--pertimbangkan">🤔 Dipertimbangkan</span>
                ${alasanHtml}
               </div>`
            : `<div>
                <span class="ag-badge ag-badge--belum">❌ Belum Layak</span>
                ${alasanHtml}
               </div>`;

      return `
      <tr class="${rowClass}">
        <!-- Nomor alternatif -->
        <td class="ag-td--alt-no">A${idx + 1}</td>

        <!-- Nama siswa -->
        <td class="ag-td--nama">
          <div class="ag-td-nama__wrap">
            <div class="ag-avatar" style="width:30px;height:30px;font-size:11px;flex-shrink:0">
              ${getInitials(s.nama)}
            </div>
            <span style="font-weight:600;color:#1e293b;font-size:13px">${s.nama}</span>
          </div>
        </td>

        <!-- Matriks X (nilai numerik rata-rata) -->
        ${["bacaan", "hafalan", "menulis"]
          .map((j) => {
            const x = d?.matriks?.[j] ?? 0;
            const grade = s.nilai[j] || "C";
            return `
          <td class="ag-td--matrix">
            <div class="ag-td-matrix__inner">
              <span class="ag-td-matrix__grade"
                style="background:${NILAI_BG[grade] || "#f1f5f9"};color:${NILAI_COLOR[grade] || "#64748b"}">${grade}</span>
              <span class="ag-td-matrix__num">${x.toFixed(2)}</span>
            </div>
          </td>`;
          })
          .join("")}

        <!-- Normalisasi r_ij = x_ij / Max(X_j) -->
        ${["rBacaan", "rHafalan", "rMenulis"]
          .map((k) => {
            const r = d?.normalisasi?.[k] ?? 0;
            return `<td class="ag-td--norm">${r.toFixed(4)}</td>`;
          })
          .join("")}

        <!-- V_i (desimal 4 angka) -->
        <td class="ag-td--score">
          <span style="font-size:15px;font-weight:800;color:${warnaSkor}">${s.skorSAW.toFixed(4)}</span>
        </td>

        <!-- Performa -->
        <td class="ag-td--performa">${perfBadge}</td>

        <!-- Rekomendasi -->
        <td class="ag-td--rekomendasi">${rekBadge}</td>
      </tr>`;
    })
    .join("");

  // Baris Max(X_j) di footer tabel
  tfoot.innerHTML = `
    <tr class="ag-tfoot-maxrow">
      <td colspan="2" class="ag-tfoot-label">
        Max(X<sub>j</sub>)
      </td>
      <td class="ag-tfoot-val">${maxB.toFixed(2)}</td>
      <td class="ag-tfoot-val">${maxH.toFixed(2)}</td>
      <td class="ag-tfoot-val">${maxM.toFixed(2)}</td>
      <td colspan="6" class="ag-tfoot-formula">
        r<sub>ij</sub> = x<sub>ij</sub> / Max(X<sub>j</sub>) &nbsp;·&nbsp;
        V<sub>i</sub> = 0.45·r<sub>C1</sub> + 0.35·r<sub>C2</sub> + 0.20·r<sub>C3</sub>
      </td>
    </tr>`;
}

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

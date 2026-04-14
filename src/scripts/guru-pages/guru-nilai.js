import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";

const NILAI_OPTS = ["A", "B+", "B", "B-", "C+", "C", "C-", "D"];
const NILAI_LABEL = {
  A: "A — Sangat Baik",
  "B+": "B+ — Baik Sekali",
  B: "B — Baik",
  "B-": "B- — Cukup Baik",
  "C+": "C+ — Cukup",
  C: "C — Cukup",
  "C-": "C- — Kurang",
  D: "D — Kurang Sekali",
};
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

let kelasList = [];
let siswaList = [];
let currentKelasId = null;
let currentJenisKelas = "";
let currentJenisInput = "reguler";
let siswaRekomendasi = [];
let _sawData = [];
let _riwayatState = null;

export function renderGuruNilai() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-nilai")}
      <main class="content admin-home">

        <div class="ag-header">
          <div>
            <h2 class="ag-title">Input Nilai</h2>
            <p class="ag-subtitle">Masukkan nilai siswa berdasarkan kelas</p>
          </div>
        </div>

        <div class="gn-card">
          <h3 class="gn-section-title">Input Nilai</h3>

          <div class="gn-section">
            <label class="gn-label">Pilih Jenis Kelas</label>
            <div class="gn-select-wrap">
              <select class="gn-select" id="gn-jenis-kelas">
                <option value="">-- Pilih Jenis Kelas --</option>
                <option value="jilid">Kelas Jilid</option>
                <option value="alquran">Kelas Al-Qur'an</option>
              </select>
            </div>
          </div>

          <div class="gn-section gn-hidden" id="gn-jenis-input-wrap">
            <label class="gn-label">Jenis Input</label>
            <div class="gn-select-wrap">
              <select class="gn-select" id="gn-jenis-input">
                <option value="reguler">Nilai Reguler</option>
                <option value="kenaikan">Nilai Kenaikan Jilid</option>
              </select>
            </div>
          </div>

          <div class="gn-section gn-hidden" id="gn-kelas-wrap">
            <label class="gn-label">Pilih Kelas</label>
            <div class="gn-select-wrap">
              <select class="gn-select" id="gn-kelas">
                <option value="">-- Pilih Kelas --</option>
              </select>
            </div>
          </div>

          <div class="gn-hidden" id="gn-siswa-wrap">

            <div class="gn-hidden gn-saw-info" id="gn-saw-info">
              <div class="gn-saw-info-inner">
                <span class="gn-saw-icon">📊</span>
                <div>
                  <div class="gn-saw-title">Syarat Ujian Kenaikan Jilid</div>
                  <div class="gn-saw-desc">
                    Siswa harus sudah membaca sampai <strong>halaman 40</strong>
                    dan memiliki <strong>skor SAW ≥ 0.8500</strong>
                    (Bacaan 45% · Hafalan 35% · Menulis 20%)
                  </div>
                </div>
              </div>
            </div>

            <div class="gn-siswa-header">
              <span class="gn-siswa-title" id="gn-siswa-title">Daftar Siswa</span>
              <span class="gn-siswa-count" id="gn-siswa-count"></span>
            </div>

            <div id="gn-loading" class="gn-loading-wrap gn-hidden">
              <div class="gn-loading-spinner"></div>
              <p class="gn-loading-text">Memuat data siswa...</p>
            </div>

            <div class="ab-table-scroll" id="gn-table-area">
              <table class="ab-table" id="gn-siswa-table">
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    <th id="gn-th-status" class="gn-hidden" style="text-align:center">Status SAW</th>
                    <th style="text-align:right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="gn-siswa-tbody"></tbody>
              </table>
            </div>

          </div>
        </div>

        <div class="gn-overlay gn-hidden" id="gn-modal-overlay">
          <div class="gn-modal" id="gn-modal"></div>
        </div>

      </main>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.getElementById("gn-jenis-kelas")?.addEventListener("change", (e) => {
    currentJenisKelas = e.target.value;
    currentJenisInput = "reguler";
    _sawData = [];
    siswaRekomendasi = [];

    const jenisInputWrap = document.getElementById("gn-jenis-input-wrap");
    const kelasWrap = document.getElementById("gn-kelas-wrap");
    const siswaWrap = document.getElementById("gn-siswa-wrap");

    document.getElementById("gn-kelas").value = "";
    document.getElementById("gn-siswa-tbody").innerHTML = "";
    siswaWrap.classList.add("gn-hidden");
    kelasWrap.classList.add("gn-hidden");

    if (!currentJenisKelas) {
      jenisInputWrap.classList.add("gn-hidden");
      return;
    }

    if (currentJenisKelas === "jilid") {
      jenisInputWrap.classList.remove("gn-hidden");
      document.getElementById("gn-jenis-input").value = "reguler";
    } else {
      jenisInputWrap.classList.add("gn-hidden");
    }

    loadKelas(currentJenisKelas);
    kelasWrap.classList.remove("gn-hidden");
  });

  document.getElementById("gn-jenis-input")?.addEventListener("change", (e) => {
    currentJenisInput = e.target.value;
    const kelasId = document.getElementById("gn-kelas").value;
    if (kelasId) loadSiswa(kelasId);
  });

  document.getElementById("gn-kelas")?.addEventListener("change", (e) => {
    currentKelasId = e.target.value;
    if (currentKelasId) loadSiswa(currentKelasId);
    else document.getElementById("gn-siswa-wrap").classList.add("gn-hidden");
  });

  document
    .getElementById("gn-modal-overlay")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "gn-modal-overlay") closeModal();
    });
}

async function loadKelas(jenisKelas) {
  try {
    const res = await api.get(`/kelas?jenis=${jenisKelas}`);
    kelasList = res.data;
    const sel = document.getElementById("gn-kelas");
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
  const siswaWrap = document.getElementById("gn-siswa-wrap");
  const loading = document.getElementById("gn-loading");
  const tableArea = document.getElementById("gn-table-area");
  const sawInfo = document.getElementById("gn-saw-info");
  const thStatus = document.getElementById("gn-th-status");

  siswaWrap.classList.remove("gn-hidden");
  loading.classList.remove("gn-hidden");
  tableArea.style.display = "none";
  _sawData = [];
  siswaRekomendasi = [];

  const isKenaikan = currentJenisInput === "kenaikan";
  sawInfo.classList.toggle("gn-hidden", !isKenaikan);
  thStatus.classList.toggle("gn-hidden", !isKenaikan);

  try {
    const res = await api.get(`/siswa/kelas/${kelasId}`);
    siswaList = res.data;

    if (isKenaikan) {
      try {
        const rekRes = await api.get(`/nilai/analisis-saw/${kelasId}`);
        _sawData = rekRes.data || [];
        siswaRekomendasi = _sawData
          .filter((s) => s.layak === true)
          .map((s) => s.siswaId);
      } catch {
        _sawData = [];
        siswaRekomendasi = [];
      }
    }

    const countEl = document.getElementById("gn-siswa-count");
    if (countEl) {
      if (isKenaikan) {
        countEl.textContent = `${siswaRekomendasi.length} dari ${siswaList.length} siswa siap ujian`;
        countEl.style.color = "#16a34a";
      } else {
        countEl.textContent = `${siswaList.length} siswa`;
        countEl.style.color = "#64748b";
      }
    }

    renderSiswaList();
    tableArea.style.display = "";
  } catch (err) {
    alert("Gagal load siswa: " + err.message);
  } finally {
    loading.classList.add("gn-hidden");
  }
}

function renderSiswaList() {
  const tbody = document.getElementById("gn-siswa-tbody");
  if (!tbody) return;

  const isKenaikan = currentJenisInput === "kenaikan";

  if (siswaList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="gn-empty-cell">
          Tidak ada siswa di kelas ini
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = siswaList
    .map((s) => {
      const bolehKenaikan = !isKenaikan || siswaRekomendasi.includes(s.id);
      const sawInfo = isKenaikan
        ? _sawData.find((d) => d.siswaId === s.id) || null
        : null;

      const avatarClass =
        bolehKenaikan || !isKenaikan
          ? "ag-avatar"
          : "ag-avatar ag-avatar-muted";

      let statusCell = "";
      if (isKenaikan) {
        if (bolehKenaikan) {
          statusCell = `
          <td class="gn-status-cell">
            <div class="gn-status-inner">
              <span class="gn-sudah-badge">✅ Siap Ujian</span>
              <span class="gn-saw-detail gn-saw-siap">
                Skor ${(sawInfo?.skorSAW || 0).toFixed(4)} · Hal ${sawInfo?.halamanTertinggi || 0}/40
              </span>
            </div>
          </td>`;
        } else {
          statusCell = `
          <td class="gn-status-cell">
            <div class="gn-status-inner">
              <span class="gn-belum-badge">⏳ Belum Siap</span>
              <span class="gn-saw-detail gn-saw-belum">
                ${sawInfo?.alasan || "Belum memenuhi syarat"}
              </span>
            </div>
          </td>`;
        }
      }

      const rowClass = !bolehKenaikan && isKenaikan ? "gn-row-disabled" : "";
      const btnClass =
        !bolehKenaikan && isKenaikan
          ? "gn-input-btn ag-btn-simpan ag-btn-disabled"
          : "gn-input-btn ag-btn-simpan";

      return `
      <tr class="${rowClass}">
        <td class="ab-nama">
          <div class="gn-nama-wrap">
            <div class="${avatarClass}" style="width:36px;height:36px;font-size:13px">
              ${getInitials(s.nama)}
            </div>
            <div class="gn-nama">${s.nama}</div>
          </div>
        </td>
        ${isKenaikan ? statusCell : ""}
        <td class="gn-aksi">
          <button
            class="${btnClass}"
            style="padding:8px 18px;font-size:13px"
            ${!bolehKenaikan && isKenaikan ? "disabled" : ""}
            onclick="openModalNilai(${s.id}, '${escapeAttr(s.nama)}')"
          >
            ${isKenaikan ? "🏆 Ujian" : "📝 Input"}
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

window.openModalNilai = async function (siswaId, namaSiswa) {
  const overlay = document.getElementById("gn-modal-overlay");
  const modal = document.getElementById("gn-modal");
  const today = new Date().toISOString().split("T")[0];

  if (currentJenisKelas === "alquran") {
    modal.innerHTML = buildModalAlquran(siswaId, namaSiswa, today);
  } else if (currentJenisInput === "kenaikan") {
    modal.innerHTML = buildModalKenaikanJilid(siswaId, namaSiswa, today);
  } else {
    modal.innerHTML = buildModalJilidReguler(siswaId, namaSiswa, today);

    try {
      const res = await api.get(
        `/nilai?siswaId=${siswaId}&kelasId=${currentKelasId}&tipeInput=reguler`,
      );
      const nilaiList = res.data || [];
      const sesiLanjut = nilaiList
        .filter(
          (n) =>
            n.jenis === "bacaan" && n.status === "lanjut" && n.halamanSelesai,
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      if (sesiLanjut.length > 0) {
        const hTerakhir = sesiLanjut[0].halamanSelesai;
        const hBerikutnya = hTerakhir + 1;

        const infoEl = document.getElementById("gn-halaman-info");
        if (infoEl) {
          infoEl.innerHTML = `
            <div class="gn-halaman-info-box">
              Sudah membaca sampai halaman <strong>${hTerakhir}</strong>.
              Lanjut di halaman <strong>${hBerikutnya}</strong>.
            </div>`;
          infoEl.style.display = "block";
        }

        const hMulaiInput = document.getElementById("m-hal-mulai");
        if (hMulaiInput && !hMulaiInput.value) hMulaiInput.value = hBerikutnya;
      }
    } catch (err) {
      console.error("Gagal ambil halaman terakhir:", err);
    }
  }

  overlay.classList.remove("gn-hidden");
};

function closeModal() {
  document.getElementById("gn-modal-overlay").classList.add("gn-hidden");
  document.getElementById("gn-modal").innerHTML = "";
}
window.closeModal = closeModal;

function buildNilaiDropdown(groupId) {
  return `
    <select
      id="${groupId}"
      class="ag-input gn-nilai-select"
      onchange="updateDropdownColor('${groupId}', this)"
    >
      <option value="">-- Pilih Nilai --</option>
      ${NILAI_OPTS.map((n) => `<option value="${n}">${NILAI_LABEL[n]}</option>`).join("")}
    </select>
  `;
}

window.updateDropdownColor = function (groupId, el) {
  const nilai = el.value;
  if (nilai && NILAI_COLOR[nilai]) {
    el.style.color = NILAI_COLOR[nilai];
    el.style.background = NILAI_BG[nilai];
    el.style.borderColor = NILAI_COLOR[nilai];
    el.style.fontWeight = "700";
  } else {
    el.style.color = "";
    el.style.background = "";
    el.style.borderColor = "";
    el.style.fontWeight = "";
  }
};

function buildModalJilidReguler(siswaId, namaSiswa, today) {
  const namaKelas =
    document.getElementById("gn-kelas").selectedOptions[0]?.text || "";
  return `
    <div class="gn-modal-header">
      <div>
        <h3 class="gn-modal-title">📝 Input Nilai Reguler</h3>
        <p class="gn-modal-sub">${namaSiswa} · ${namaKelas}</p>
      </div>
      <button class="gn-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="gn-modal-body">
      <div id="gn-halaman-info" style="display:none"></div>

      <div class="gn-form-group">
        <label class="gn-label">Tanggal</label>
        <input class="ag-input" type="date" id="m-tanggal" value="${today}"/>
      </div>

      <div class="gn-form-row">
        <div class="gn-form-group">
          <label class="gn-label">Halaman Mulai</label>
          <input class="ag-input" type="number" id="m-hal-mulai" min="1" max="40" placeholder="1"/>
        </div>
        <div class="gn-form-group">
          <label class="gn-label">Halaman Selesai
            <span class="gn-hint-label">(maks 40)</span>
          </label>
          <input class="ag-input" type="number" id="m-hal-selesai" min="1" max="40" placeholder="5"/>
        </div>
      </div>

      <div class="gn-divider"></div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Bacaan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-bacaan")}
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Hafalan
          <span class="gn-hint-label">(apa yang dihafalkan)</span>
        </label>
        <input class="ag-input" type="text" id="m-hafalan-text"
          placeholder="Contoh: Surat Al-Ikhlas, ayat 1-4"/>
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Hafalan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-hafalan")}
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Menulis <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-menulis")}
      </div>

      <div class="gn-divider"></div>

      <div class="gn-form-group">
        <label class="gn-label">Status</label>
        <div class="gn-status-radio-group">
          <label class="gn-radio-lanjut gn-radio-card gn-radio-card-active" id="gn-radio-lanjut-label">
            <input type="radio" name="m-status" value="lanjut" checked onchange="toggleRadioCard()"/>
            <span>✅ Lanjut</span>
          </label>
          <label class="gn-radio-ulang gn-radio-card" id="gn-radio-ulang-label">
            <input type="radio" name="m-status" value="ulang" onchange="toggleRadioCard()"/>
            <span>🔁 Ulang</span>
          </label>
        </div>
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Catatan
          <span class="gn-hint-label">(opsional)</span>
        </label>
        <textarea class="ag-input" id="m-catatan" rows="2"
          placeholder="Catatan tambahan..." style="resize:vertical"></textarea>
      </div>

    </div>
    <div class="gn-modal-footer">
      <button class="ag-btn-batal" onclick="closeModal()">Batal</button>
      <button class="ag-btn-simpan" id="gn-btn-simpan-reguler"
        onclick="submitJilidReguler(${siswaId})">
        💾 Simpan Nilai
      </button>
    </div>
  `;
}

function buildModalKenaikanJilid(siswaId, namaSiswa, today) {
  const namaKelas =
    document.getElementById("gn-kelas").selectedOptions[0]?.text || "";
  const sawInfo = _sawData.find((d) => d.siswaId === siswaId);

  return `
    <div class="gn-modal-header">
      <div>
        <h3 class="gn-modal-title">🏆 Ujian Kenaikan Jilid</h3>
        <p class="gn-modal-sub">${namaSiswa} · ${namaKelas}</p>
      </div>
      <button class="gn-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="gn-modal-body">

      <div class="gn-kenaikan-badge">
        <div class="gn-kenaikan-badge-inner">
          <span>🎯 Siswa direkomendasikan SAW untuk ujian kenaikan jilid</span>
          ${
            sawInfo
              ? `
            <div class="gn-kenaikan-badge-stats">
              <span>📖 Hal ${sawInfo.halamanTertinggi}/40</span>
              <span>📊 Skor ${(sawInfo.skorSAW || 0).toFixed(4)}</span>
            </div>`
              : ""
          }
        </div>
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Tanggal Ujian</label>
        <input class="ag-input" type="date" id="m-tanggal" value="${today}"/>
      </div>

      <div class="gn-divider"></div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Bacaan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-bacaan")}
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Hafalan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-hafalan")}
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Nilai Menulis <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-menulis")}
      </div>

      <div class="gn-divider"></div>

      <div class="gn-form-group">
        <label class="gn-label">Keputusan Akhir</label>
        <div class="gn-status-radio-group">
          <label class="gn-radio-lanjut gn-radio-card gn-radio-card-active" id="gn-radio-naik-label">
            <input type="radio" name="m-keputusan" value="naik" checked onchange="toggleRadioCard2()"/>
            <span>🎉 Naik Jilid</span>
          </label>
          <label class="gn-radio-ulang gn-radio-card" id="gn-radio-tidak-label">
            <input type="radio" name="m-keputusan" value="tidak_naik" onchange="toggleRadioCard2()"/>
            <span>🔁 Tidak Naik</span>
          </label>
        </div>
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Catatan
          <span class="gn-hint-label">(opsional)</span>
        </label>
        <textarea class="ag-input" id="m-catatan" rows="2"
          placeholder="Catatan hasil ujian..." style="resize:vertical"></textarea>
      </div>

    </div>
    <div class="gn-modal-footer">
      <button class="ag-btn-batal" onclick="closeModal()">Batal</button>
      <button class="ag-btn-simpan" id="gn-btn-simpan-kenaikan"
        onclick="submitKenaikanJilid(${siswaId})">
        💾 Simpan Hasil Ujian
      </button>
    </div>
  `;
}

function buildModalAlquran(siswaId, namaSiswa, today) {
  const namaKelas =
    document.getElementById("gn-kelas").selectedOptions[0]?.text || "";
  const suratOptions = SURAT_LIST.map(
    (s, i) => `<option value="${i + 1}">${s}</option>`,
  ).join("");

  return `
    <div class="gn-modal-header">
      <div>
        <h3 class="gn-modal-title">📖 Input Nilai Al-Qur'an</h3>
        <p class="gn-modal-sub">${namaSiswa} · ${namaKelas}</p>
      </div>
      <button class="gn-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="gn-modal-body">

      <div class="gn-form-group">
        <label class="gn-label">Tanggal</label>
        <input class="ag-input" type="date" id="m-tanggal" value="${today}"/>
      </div>

      <div class="gn-divider-title">📖 Bacaan</div>
      <div class="gn-form-group">
        <label class="gn-label">Surat Bacaan</label>
        <select class="gn-select" id="m-surat-bacaan">
          <option value="">-- Pilih Surat --</option>
          ${suratOptions}
        </select>
      </div>
      <div class="gn-form-row">
        <div class="gn-form-group">
          <label class="gn-label">Ayat Mulai</label>
          <input class="ag-input" type="number" id="m-ayat-bacaan-mulai" min="1" value="1"/>
        </div>
        <div class="gn-form-group">
          <label class="gn-label">Ayat Selesai</label>
          <input class="ag-input" type="number" id="m-ayat-bacaan-selesai" min="1" value="10"/>
        </div>
      </div>
      <div class="gn-form-group">
        <label class="gn-label">Nilai Bacaan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-bacaan")}
      </div>

      <div class="gn-divider-title">🎙️ Hafalan</div>
      <div class="gn-form-group">
        <label class="gn-label">Surat Hafalan</label>
        <select class="gn-select" id="m-surat-hafalan">
          <option value="">-- Pilih Surat --</option>
          ${suratOptions}
        </select>
      </div>
      <div class="gn-form-row">
        <div class="gn-form-group">
          <label class="gn-label">Ayat Mulai</label>
          <input class="ag-input" type="number" id="m-ayat-hafalan-mulai" min="1" value="1"/>
        </div>
        <div class="gn-form-group">
          <label class="gn-label">Ayat Selesai</label>
          <input class="ag-input" type="number" id="m-ayat-hafalan-selesai" min="1" value="10"/>
        </div>
      </div>
      <div class="gn-form-group">
        <label class="gn-label">Nilai Hafalan <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-hafalan")}
      </div>

      <div class="gn-divider-title">✏️ Menulis</div>
      <div class="gn-form-group">
        <label class="gn-label">Nilai Menulis <span class="ag-required">*</span></label>
        ${buildNilaiDropdown("m-nilai-menulis")}
      </div>

      <div class="gn-divider"></div>

      <div class="gn-form-group">
        <label class="gn-label">Status</label>
        <div class="gn-status-radio-group">
          <label class="gn-radio-lanjut gn-radio-card gn-radio-card-active" id="gn-radio-lanjut-label">
            <input type="radio" name="m-status" value="lanjut" checked onchange="toggleRadioCard()"/>
            <span>✅ Lanjut</span>
          </label>
          <label class="gn-radio-ulang gn-radio-card" id="gn-radio-ulang-label">
            <input type="radio" name="m-status" value="ulang" onchange="toggleRadioCard()"/>
            <span>🔁 Ulang</span>
          </label>
        </div>
      </div>

      <div class="gn-form-group">
        <label class="gn-label">Catatan
          <span class="gn-hint-label">(opsional)</span>
        </label>
        <textarea class="ag-input" id="m-catatan" rows="2"
          placeholder="Catatan tambahan..." style="resize:vertical"></textarea>
      </div>

    </div>
    <div class="gn-modal-footer">
      <button class="ag-btn-batal" onclick="closeModal()">Batal</button>
      <button class="ag-btn-simpan" onclick="submitAlquran(${siswaId})">
        💾 Simpan Nilai
      </button>
    </div>
  `;
}

window.toggleRadioCard = function () {
  const lanjut = document.querySelector(
    'input[name="m-status"][value="lanjut"]',
  )?.checked;
  document
    .getElementById("gn-radio-lanjut-label")
    ?.classList.toggle("gn-radio-card-active", !!lanjut);
  document
    .getElementById("gn-radio-ulang-label")
    ?.classList.toggle("gn-radio-card-active", !lanjut);
};

window.toggleRadioCard2 = function () {
  const naik = document.querySelector(
    'input[name="m-keputusan"][value="naik"]',
  )?.checked;
  document
    .getElementById("gn-radio-naik-label")
    ?.classList.toggle("gn-radio-card-active", !!naik);
  document
    .getElementById("gn-radio-tidak-label")
    ?.classList.toggle("gn-radio-card-active", !naik);
};

window.submitJilidReguler = async function (siswaId) {
  const tanggal = document.getElementById("m-tanggal")?.value;
  const halamanMulai = document.getElementById("m-hal-mulai")?.value;
  const halamanSelesai = document.getElementById("m-hal-selesai")?.value;
  const nilaiBacaan = document.getElementById("m-nilai-bacaan")?.value;
  const hafalanText = document.getElementById("m-hafalan-text")?.value;
  const nilaiHafalan = document.getElementById("m-nilai-hafalan")?.value;
  const nilaiMenulis = document.getElementById("m-nilai-menulis")?.value;
  const status =
    document.querySelector('input[name="m-status"]:checked')?.value || "lanjut";
  const catatan = document.getElementById("m-catatan")?.value || "";

  if (!tanggal || !nilaiBacaan || !nilaiHafalan || !nilaiMenulis) {
    alert(
      "Harap lengkapi semua nilai (Bacaan, Hafalan, Menulis) terlebih dahulu",
    );
    return;
  }

  const hMulai = parseInt(halamanMulai) || 0;
  const hSelesai = parseInt(halamanSelesai) || 0;
  if (hMulai > 0 && hSelesai > 0 && hMulai > hSelesai) {
    alert("Halaman mulai tidak boleh lebih besar dari halaman selesai");
    return;
  }
  if (hSelesai > 40) {
    alert("Halaman selesai maksimal 40");
    return;
  }

  const btn = document.getElementById("gn-btn-simpan-reguler");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
  }

  const payload = {
    siswaId,
    kelasId: currentKelasId,
    tanggal,
    halamanMulai: hMulai || null,
    halamanSelesai: hSelesai || null,
    hafalan: hafalanText || "",
    status,
    catatan,
    nilai: [
      { jenis: "bacaan", nilai: nilaiBacaan },
      { jenis: "hafalan", nilai: nilaiHafalan },
      { jenis: "menulis", nilai: nilaiMenulis },
    ],
  };

  try {
    await api.post("/nilai/jilid", payload);
    closeModal();
    const namaKelasStr =
      document.getElementById("gn-kelas")?.selectedOptions[0]?.text || "";
    const namaSiswaStr = siswaList.find((s) => s.id === siswaId)?.nama || "";
    navigasiKeRiwayat(siswaId, currentKelasId, namaSiswaStr, namaKelasStr);
    if (currentJenisInput === "kenaikan") loadSiswa(currentKelasId);
  } catch (err) {
    alert("Gagal simpan nilai: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 Simpan Nilai";
    }
  }
};

window.submitKenaikanJilid = async function (siswaId) {
  const tanggal = document.getElementById("m-tanggal")?.value;
  const nilaiBacaan = document.getElementById("m-nilai-bacaan")?.value;
  const nilaiHafalan = document.getElementById("m-nilai-hafalan")?.value;
  const nilaiMenulis = document.getElementById("m-nilai-menulis")?.value;
  const keputusan =
    document.querySelector('input[name="m-keputusan"]:checked')?.value ||
    "naik";
  const catatan = document.getElementById("m-catatan")?.value || "";

  if (!tanggal || !nilaiBacaan || !nilaiHafalan || !nilaiMenulis) {
    alert(
      "Harap lengkapi semua nilai ujian (Bacaan, Hafalan, Menulis) terlebih dahulu",
    );
    return;
  }

  const namaSiswa =
    document
      .getElementById("gn-modal")
      ?.querySelector(".gn-modal-sub")
      ?.textContent?.split(" · ")[0] || "";
  const namaKelasLama =
    document.getElementById("gn-kelas")?.selectedOptions[0]?.text || "";

  const btn = document.getElementById("gn-btn-simpan-kenaikan");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Menyimpan...";
  }

  const payload = {
    siswaId,
    kelasId: currentKelasId,
    tanggal,
    keputusan,
    catatan,
    nilai: [
      { jenis: "bacaan", nilai: nilaiBacaan },
      { jenis: "hafalan", nilai: nilaiHafalan },
      { jenis: "menulis", nilai: nilaiMenulis },
    ],
  };

  try {
    const res = await api.post("/nilai/kenaikan-jilid", payload);
    const pesanBackend = res?.message || res?.data?.message || "";
    closeModal();

    if (keputusan === "naik") {
      _riwayatState = {
        siswaId,
        kelasId: currentKelasId,
        namaSiswa,
        namaKelas: namaKelasLama,
      };
      tampilModalSuksesNaik(namaSiswa, namaKelasLama, pesanBackend);
      siswaList = siswaList.filter((s) => s.id !== siswaId);
      _sawData = _sawData.filter((d) => d.siswaId !== siswaId);
      siswaRekomendasi = siswaRekomendasi.filter((id) => id !== siswaId);
      renderSiswaList();
      if (siswaList.length === 0) {
        document.getElementById("gn-siswa-tbody").innerHTML = `
          <tr><td colspan="3" class="gn-empty-cell">
            🎉 Semua siswa telah selesai ujian kenaikan jilid
          </td></tr>`;
      }
    } else {
      showToast(
        "Hasil ujian disimpan. Siswa tetap di jilid saat ini.",
        "success",
      );
      loadSiswa(currentKelasId);
    }
  } catch (err) {
    alert(
      "Gagal simpan hasil ujian: " + (err.message || "Error tidak diketahui"),
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 Simpan Hasil Ujian";
    }
  }
};

function tampilModalSuksesNaik(namaSiswa, namaKelasLama, pesanBackend) {
  let namaKelasBaru = "";
  const match = pesanBackend.match(/naik ke (.+)$/i);
  if (match) namaKelasBaru = match[1];

  const overlay = document.getElementById("gn-modal-overlay");
  const modal = document.getElementById("gn-modal");

  modal.innerHTML = `
    <div class="gn-modal-header gn-modal-header-borderless">
      <div></div>
      <button class="gn-close-btn" onclick="closeModal()">×</button>
    </div>
    <div class="gn-modal-body gn-sukses-body">
      <div class="gn-sukses-icon">🎉</div>
      <h3 class="gn-sukses-title">Selamat! Naik Jilid</h3>
      <p class="gn-sukses-sub">
        <strong>${namaSiswa}</strong> berhasil lulus ujian kenaikan jilid
      </p>

      <div class="gn-naik-visual">
        <div class="gn-naik-col">
          <div class="gn-naik-col-label">Kelas Sebelumnya</div>
          <div class="gn-naik-chip gn-naik-chip-lama">${namaKelasLama}</div>
        </div>
        <div class="gn-naik-arrow">→</div>
        <div class="gn-naik-col">
          <div class="gn-naik-col-label">Kelas Baru</div>
          <div class="gn-naik-chip gn-naik-chip-baru">
            ${namaKelasBaru || "Kelas Berikutnya"}
          </div>
        </div>
      </div>

      ${
        !namaKelasBaru
          ? `
        <div class="gn-naik-warning">
          ⚠️ Tidak ada kelas jilid berikutnya. Siswa mungkin telah menyelesaikan semua jilid.
        </div>`
          : ""
      }
    </div>
    <div class="gn-modal-footer gn-sukses-footer">
      <button class="ag-btn-batal" onclick="closeModal()">Tutup</button>
      <button class="ag-btn-simpan" onclick="navigasiDariModalSukses()">
        📋 Lihat Riwayat
      </button>
    </div>
  `;

  overlay.classList.remove("gn-hidden");
}

window.navigasiDariModalSukses = function () {
  if (!_riwayatState) return;
  navigasiKeRiwayat(
    _riwayatState.siswaId,
    _riwayatState.kelasId,
    _riwayatState.namaSiswa,
    _riwayatState.namaKelas,
  );
};

window.submitAlquran = async function (siswaId) {
  const tanggal = document.getElementById("m-tanggal")?.value;
  const suratBacaan = document.getElementById("m-surat-bacaan")?.value;
  const ayatBacaanMulai = document.getElementById("m-ayat-bacaan-mulai")?.value;
  const ayatBacaanSelesai = document.getElementById(
    "m-ayat-bacaan-selesai",
  )?.value;
  const nilaiBacaan = document.getElementById("m-nilai-bacaan")?.value;
  const suratHafalan = document.getElementById("m-surat-hafalan")?.value;
  const ayatHafalanMulai = document.getElementById(
    "m-ayat-hafalan-mulai",
  )?.value;
  const ayatHafalanSelesai = document.getElementById(
    "m-ayat-hafalan-selesai",
  )?.value;
  const nilaiHafalan = document.getElementById("m-nilai-hafalan")?.value;
  const nilaiMenulis = document.getElementById("m-nilai-menulis")?.value;
  const status =
    document.querySelector('input[name="m-status"]:checked')?.value || "lanjut";
  const catatan = document.getElementById("m-catatan")?.value || "";

  if (!tanggal || !nilaiBacaan || !nilaiHafalan || !nilaiMenulis) {
    alert("Harap lengkapi semua nilai terlebih dahulu");
    return;
  }

  const payload = {
    siswaId,
    kelasId: currentKelasId,
    tanggal,
    bacaan: {
      suratId: suratBacaan || null,
      ayatMulai: ayatBacaanMulai || null,
      ayatSelesai: ayatBacaanSelesai || null,
    },
    hafalan: {
      suratId: suratHafalan || null,
      ayatMulai: ayatHafalanMulai || null,
      ayatSelesai: ayatHafalanSelesai || null,
    },
    status,
    catatan,
    nilai: [
      { jenis: "bacaan", nilai: nilaiBacaan },
      { jenis: "hafalan", nilai: nilaiHafalan },
      { jenis: "menulis", nilai: nilaiMenulis },
    ],
  };

  try {
    await api.post("/nilai/alquran", payload);
    closeModal();
    const namaKelasStr =
      document.getElementById("gn-kelas")?.selectedOptions[0]?.text || "";
    const namaSiswaStr = siswaList.find((s) => s.id === siswaId)?.nama || "";
    navigasiKeRiwayat(siswaId, currentKelasId, namaSiswaStr, namaKelasStr);
    if (currentJenisInput === "kenaikan") loadSiswa(currentKelasId);
  } catch (err) {
    alert("Gagal simpan nilai: " + err.message);
  }
};

function getInitials(nama) {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function navigasiKeRiwayat(siswaId, kelasId, namaSiswa, namaKelas) {
  sessionStorage.setItem(
    "rv_state",
    JSON.stringify({
      siswaId: String(siswaId),
      kelasId: String(kelasId),
      namaSiswa,
      namaKelas,
    }),
  );
  window.location.hash = "#/guru-riwayatnilai";
}
window.navigasiKeRiwayat = navigasiKeRiwayat;

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

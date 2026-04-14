import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";

function hitungHariAktif(tahun, bulan) {
  const akhir = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let i = 1; i <= akhir; i++) {
    const hari = new Date(tahun, bulan - 1, i).getDay();
    if (hari >= 1 && hari <= 4) count++;
  }
  return count;
}

export async function renderOrtuHome() {
  const app = document.getElementById("app");

  const nama = localStorage.getItem("nama") || "Orang Tua";
  const namaSiswa = localStorage.getItem("namaSiswa") || "-";
  const kelas = localStorage.getItem("kelas") || "-";
  const siswaId = localStorage.getItem("siswaId");
  const kelasId = localStorage.getItem("kelasId");
  const semuaAnak = JSON.parse(localStorage.getItem("semuaAnak") || "[]");

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("dashboard")}
      <main class="content ortu-home">

        <!-- HEADER WELCOME -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <span class="welcome-greeting">Selamat Datang <i class="fa-solid fa-hand-wave"></i>,</span>
            <h2 class="welcome-name">${nama}</h2>
            <p class="welcome-sub">Pantau perkembangan belajar <strong>${namaSiswa}</strong> hari ini</p>
          </div>
          <div class="welcome-date">
            <i class="fa-solid fa-calendar-days date-icon"></i>
            <span id="current-date"></span>
          </div>
        </div>

        <!-- PILIH ANAK (kalau lebih dari 1) -->
        ${
          semuaAnak.length > 1
            ? `
        <div class="ortu-switch-card">
          <div class="ortu-switch-title">
            <i class="fa-solid fa-user-graduate"></i> Pilih Anak
          </div>
          <div class="ortu-switch-list">
            ${semuaAnak
              .map((a) => {
                const aktif = String(a.id) === String(siswaId);
                return `
              <button
                class="ortu-switch-btn ${aktif ? "ortu-switch-aktif" : ""}"
                data-id="${a.id}"
                data-nama="${(a.nama || "").replace(/"/g, "&quot;")}"
                data-kelas="${(a.kelas || "-").replace(/"/g, "&quot;")}"
                data-kelasid="${a.kelasId || ""}"
                onclick="window.switchAnakBtn(this)"
              >
                <div class="ortu-switch-avatar">
                  ${a.nama
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div class="ortu-switch-info">
                  <div class="ortu-switch-nama">${a.nama}</div>
                  <div class="ortu-switch-kelas">
                    <i class="fa-solid fa-door-open" style="font-size:10px"></i>
                    ${a.kelas || "-"}
                  </div>
                </div>
                ${aktif ? `<i class="fa-solid fa-circle-check ortu-switch-check"></i>` : ""}
              </button>`;
              })
              .join("")}
          </div>
        </div>`
            : ""
        }

        <!-- INFO SISWA -->
        <div class="student-cards">
          <div class="student-card card-name">
            <div class="card-icon"><i class="fa-solid fa-user-graduate" style="color:#3b82f6"></i></div>
            <div class="card-info">
              <span class="card-label">Nama Siswa</span>
              <span class="card-value">${namaSiswa}</span>
            </div>
          </div>
          <div class="student-card card-class">
            <div class="card-icon"><i class="fa-solid fa-school" style="color:#8b5cf6"></i></div>
            <div class="card-info">
              <span class="card-label">Kelas</span>
              <span class="card-value">${kelas}</span>
            </div>
          </div>
          <div class="student-card card-attend">
            <div class="card-icon"><i class="fa-solid fa-circle-check" style="color:#22c55e"></i></div>
            <div class="card-info">
              <span class="card-label">Kehadiran Bulan Ini</span>
              <span class="card-value" id="kehadiran-pct">...</span>
            </div>
          </div>
          <div class="student-card card-rank">
            <div class="card-icon"><i class="fa-solid fa-file-pen" style="color:#f59e0b"></i></div>
            <div class="card-info">
              <span class="card-label">Total Nilai</span>
              <span class="card-value" id="total-nilai">...</span>
            </div>
          </div>
        </div>

        <!-- NILAI & KEHADIRAN -->
        <div class="dashboard-grid">
          <div class="dash-card nilai-card">
            <div class="dash-card-header">
              <span class="dash-card-title"><i class="fa-solid fa-chart-bar" style="color:#f59e0b"></i> Nilai Terbaru</span>
              <a href="#/ortu-nilai" class="dash-card-link">Lihat Semua <i class="fa-solid fa-arrow-right"></i></a>
            </div>
            <div id="nilai-list" class="nilai-list">
              <div style="text-align:center;padding:20px;color:#94a3b8">Memuat data...</div>
            </div>
          </div>
          <div class="dash-card catatan-card">
            <div class="dash-card-header">
              <span class="dash-card-title"><i class="fa-solid fa-clipboard-list" style="color:#f59e0b"></i> Kehadiran Bulan Ini</span>
              <a href="#/ortu-kehadiran" class="dash-card-link">Detail <i class="fa-solid fa-arrow-right"></i></a>
            </div>
            <div id="kehadiran-rekap" style="padding:10px">
              <div style="text-align:center;padding:20px;color:#94a3b8">Memuat data...</div>
            </div>
          </div>
        </div>

        <!-- AKSI CEPAT -->
        <div class="section-title"><i class="fa-solid fa-bolt" style="color:#f59e0b"></i> Aksi Cepat</div>
        <div class="quick-actions">
          <button class="quick-btn quick-blue" onclick="window.location.hash='#/ortu-kehadiran'">
            <span class="quick-icon"><i class="fa-solid fa-clipboard-list" style="color:white"></i></span>
            <span class="quick-label">Kehadiran</span>
          </button>
          <button class="quick-btn quick-green" onclick="window.location.hash='#/ortu-nilai'">
            <span class="quick-icon"><i class="fa-solid fa-file-pen" style="color:white"></i></span>
            <span class="quick-label">Nilai</span>
          </button>
          <button class="quick-btn quick-purple" onclick="window.location.hash='#/ortu-analisis'">
            <span class="quick-icon"><i class="fa-solid fa-chart-pie" style="color:white"></i></span>
            <span class="quick-label">Analisis</span>
          </button>
          <button class="quick-btn quick-orange" onclick="window.location.hash='#/ortu-laporan'">
            <span class="quick-icon"><i class="fa-solid fa-file-lines" style="color:white"></i></span>
            <span class="quick-label">Laporan</span>
          </button>
        </div>

      </main>
    </div>
  `;

  // Set tanggal
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (!siswaId) return;

  const WARNA = { bacaan: "#3b82f6", hafalan: "#16a34a", menulis: "#9333ea" };
  const SKOR_MAP = {
    A: 100,
    "B+": 90,
    B: 80,
    "B-": 70,
    "C+": 65,
    C: 60,
    "C-": 50,
    D: 40,
  };

  try {
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();

    const [nilaiRes, kehadiranRes] = await Promise.all([
      api.get(`/nilai?siswaId=${siswaId}&tipeInput=reguler`),
      api.get(`/kehadiran?siswaId=${siswaId}&bulan=${bulan}&tahun=${tahun}`),
    ]);

    // ── NILAI TERBARU ──────────────────────────────────────────────
    const semuaNilai = nilaiRes.data || [];
    const latestPerJenis = {};
    semuaNilai.forEach((n) => {
      if (!latestPerJenis[n.jenis]) latestPerJenis[n.jenis] = n;
    });

    document.getElementById("total-nilai").textContent =
      semuaNilai.length + " entri";

    const nilaiList = document.getElementById("nilai-list");
    if (!Object.keys(latestPerJenis).length) {
      nilaiList.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">Belum ada nilai</div>`;
    } else {
      nilaiList.innerHTML = ["bacaan", "hafalan", "menulis"]
        .map((jenis) => {
          const n = latestPerJenis[jenis];
          if (!n) return "";
          const clr = WARNA[jenis] || "#64748b";
          const pct = SKOR_MAP[n.nilai] || 50;
          return `
          <div class="nilai-item">
            <div class="nilai-subject">
              <span class="subject-dot" style="background:${clr}"></span>
              ${jenis.charAt(0).toUpperCase() + jenis.slice(1)}
            </div>
            <div class="nilai-bar-wrap">
              <div class="nilai-bar" style="width:${pct}%;background:${clr}"></div>
            </div>
            <span class="nilai-score" style="color:${clr}">${n.nilai}</span>
          </div>`;
        })
        .join("");
    }

    const semuaKehadiran = kehadiranRes.data || [];
    const kehadiran = semuaKehadiran.filter((k) => {
      const tgl = new Date(k.tanggal);
      return tgl.getMonth() + 1 === bulan && tgl.getFullYear() === tahun;
    });
    const rek = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
    kehadiran.forEach((k) => {
      if (rek[k.status] !== undefined) rek[k.status]++;
    });

    const hariAktif = hitungHariAktif(tahun, bulan);
    const pctHadir =
      hariAktif > 0 ? Math.round((rek.Hadir / hariAktif) * 100) : 0;
    document.getElementById("kehadiran-pct").textContent = pctHadir + "%";

    document.getElementById("kehadiran-rekap").innerHTML = `
      <div class="rekap-grid">
        <div class="rekap-item">
          <span class="rekap-icon"><i class="fa-solid fa-circle-check" style="color:#16a34a"></i></span>
          <span class="rekap-val" style="color:#16a34a">${rek.Hadir}</span>
          <span class="rekap-key">Hadir</span>
        </div>
        <div class="rekap-item">
          <span class="rekap-icon"><i class="fa-solid fa-notes-medical" style="color:#2563eb"></i></span>
          <span class="rekap-val" style="color:#2563eb">${rek.Sakit}</span>
          <span class="rekap-key">Sakit</span>
        </div>
        <div class="rekap-item">
          <span class="rekap-icon"><i class="fa-solid fa-file-signature" style="color:#d97706"></i></span>
          <span class="rekap-val" style="color:#d97706">${rek.Izin}</span>
          <span class="rekap-key">Izin</span>
        </div>
        <div class="rekap-item">
          <span class="rekap-icon"><i class="fa-solid fa-circle-xmark" style="color:#dc2626"></i></span>
          <span class="rekap-val" style="color:#dc2626">${rek.Alpha}</span>
          <span class="rekap-key">Alpha</span>
        </div>
      </div>
      <div style="font-size:11px;color:#94a3b8;text-align:center;margin-top:8px">
        ${rek.Hadir} hadir dari ${hariAktif} hari aktif (Senin–Kamis)
      </div>`;
  } catch (err) {
    console.error("Gagal load dashboard ortu:", err);
    document.getElementById("nilai-list").innerHTML =
      `<div style="text-align:center;padding:20px;color:#ef4444">Gagal memuat data</div>`;
  }

  window.switchAnakBtn = async function (btn) {
    const id = btn.dataset.id;
    const nama = btn.dataset.nama;
    const kelas = btn.dataset.kelas;
    const kelasId = btn.dataset.kelasid;
    await window.switchAnak(id, nama, kelas, kelasId);
  };

  window.switchAnak = async function (id, nama, kelas, kelasId) {
    localStorage.setItem("siswaId", String(id));
    localStorage.setItem("namaSiswa", nama);
    localStorage.setItem("kelas", kelas);
    if (kelasId) localStorage.setItem("kelasId", String(kelasId));
    await renderOrtuHome();
  };
}

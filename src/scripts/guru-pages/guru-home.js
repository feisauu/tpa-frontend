import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";

export async function renderGuruHome() {
  const app = document.getElementById("app");
  const nama = localStorage.getItem("nama") || "Ustadz/Ustadzah";

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("dashboard")}
      <main class="content ortu-home">

        <!-- HEADER WELCOME -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <span class="welcome-greeting">Assalamu'alaikum <i class="fa-solid fa-hand-wave"></i>,</span>
            <h2 class="welcome-name">${nama}</h2>
            <p class="welcome-sub">Semoga hari Anda penuh berkah dalam mendidik generasi Qur'ani</p>
          </div>
          <div class="welcome-date">
            <i class="fa-solid fa-calendar-days date-icon"></i>
            <span id="current-date"></span>
          </div>
        </div>

        <!-- GRID DASHBOARD -->
        <div class="dashboard-grid">

          <!-- KELAS DIAMPU -->
          <div class="dash-card">
            <div class="dash-card-header">
              <span class="dash-card-title">
                <i class="fa-solid fa-book-open" style="color:#f59e0b"></i> Kelas yang Diampu
              </span>
            </div>
            <div class="kelas-list" id="kelas-list">
              <div style="text-align:center;padding:20px;color:#94a3b8">Memuat data...</div>
            </div>
          </div>

          <!-- STATISTIK -->
          <div class="dash-card">
            <div class="dash-card-header">
              <span class="dash-card-title">
                <i class="fa-solid fa-chart-bar" style="color:#f59e0b"></i> Statistik Minggu Ini
              </span>
            </div>
            <div class="stat-list">
              <div class="stat-item guru-stat-blue">
                <div class="stat-top">
                  <span class="stat-label">Nilai Diinput</span>
                  <span class="stat-value blue-val" id="stat-nilai">...</span>
                </div>
                <div class="stat-bar">
                  <div class="stat-fill blue-fill" id="stat-nilai-bar" style="width:0%"></div>
                </div>
              </div>
              <div class="stat-item guru-stat-green">
                <div class="stat-top">
                  <span class="stat-label">Total Siswa</span>
                  <span class="stat-value green-val" id="stat-siswa">...</span>
                </div>
                <div class="stat-bar">
                  <div class="stat-fill green-fill" id="stat-siswa-bar" style="width:0%"></div>
                </div>
              </div>
              <div class="stat-item guru-stat-orange">
                <div class="stat-top">
                  <span class="stat-label">Total Kelas</span>
                  <span class="stat-value orange-val" id="stat-kelas">...</span>
                </div>
                <div class="stat-bar">
                  <div class="stat-fill orange-fill" id="stat-kelas-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- NOTIFIKASI -->
          <div class="dash-card">
            <div class="dash-card-header">
              <span class="dash-card-title">
                <i class="fa-solid fa-bell" style="color:#f59e0b"></i> Info
              </span>
            </div>
            <div class="notif-list">
              <div class="notif-item notif-blue">
                <div class="notif-title">Input nilai siswa hari ini</div>
                <div class="notif-time">Segera</div>
              </div>
              <div class="notif-item notif-yellow">
                <div class="notif-title">Cek kehadiran kelas</div>
                <div class="notif-time">Hari ini</div>
              </div>
              <div class="notif-item notif-green">
                <div class="notif-title">Lihat analisis SAW siswa</div>
                <div class="notif-time">Rekomendasi</div>
              </div>
            </div>
          </div>

        </div>

        <!-- AKSI CEPAT -->
        <div class="section-title"><i class="fa-solid fa-bolt" style="color:#f59e0b"></i> Aksi Cepat</div>
        <div class="quick-actions">
          <button class="quick-btn quick-blue" onclick="window.location.hash='#/guru-nilai'">
            <span class="quick-icon"><i class="fa-solid fa-file-pen" style="color:white"></i></span>
            <span class="quick-label">Input Nilai</span>
          </button>
          <button class="quick-btn quick-green" onclick="window.location.hash='#/guru-kehadiran'">
            <span class="quick-icon"><i class="fa-solid fa-clipboard-list" style="color:white"></i></span>
            <span class="quick-label">Absensi</span>
          </button>
          <button class="quick-btn quick-purple" onclick="window.location.hash='#/guru-laporan'">
            <span class="quick-icon"><i class="fa-solid fa-book" style="color:white"></i></span>
            <span class="quick-label">Laporan</span>
          </button>
          <button class="quick-btn quick-orange" onclick="window.location.hash='#/guru-analisis'">
            <span class="quick-icon"><i class="fa-solid fa-chart-pie" style="color:white"></i></span>
            <span class="quick-label">Analisis SAW</span>
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

  // load data dari api
  try {
    const res = await api.get("/dashboard/guru");
    const d = res.data;

    // kelas yang diampu
    const kelasList = document.getElementById("kelas-list");
    const warna = ["kelas-blue", "kelas-green", "kelas-purple", "kelas-orange"];
    if (d.kelasDiampu.length === 0) {
      kelasList.innerHTML = `<div style="text-align:center;padding:20px;color:#94a3b8">Belum ada kelas</div>`;
    } else {
      kelasList.innerHTML = d.kelasDiampu
        .map(
          (k, i) => `
        <div class="kelas-item ${warna[i % warna.length]}">
          <div>
            <div class="kelas-name">${k.namaKelas}</div>
            <div class="kelas-sub">${k.jumlahSiswa} Siswa Aktif</div>
          </div>
        </div>
      `,
        )
        .join("");
    }

    // statistik
    const totalSiswa = d.kelasDiampu.reduce((s, k) => s + k.jumlahSiswa, 0);
    const totalKelas = d.kelasDiampu.length;

    document.getElementById("stat-nilai").textContent = d.nilaiDiinputMingguIni;
    document.getElementById("stat-siswa").textContent = totalSiswa;
    document.getElementById("stat-kelas").textContent = totalKelas;
    document.getElementById("stat-nilai-bar").style.width =
      Math.min(d.nilaiDiinputMingguIni * 2, 100) + "%";
    document.getElementById("stat-siswa-bar").style.width =
      Math.min(totalSiswa, 100) + "%";
    document.getElementById("stat-kelas-bar").style.width =
      Math.min(totalKelas * 20, 100) + "%";
  } catch (err) {
    console.error("Gagal load dashboard guru:", err);
  }
}

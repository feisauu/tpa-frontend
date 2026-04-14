import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

export async function renderAdminHome() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("dashboard")}
      <main class="content admin-home">

        <!-- WELCOME BANNER -->
        <div class="admin-welcome-banner">
          <div class="admin-welcome-left">
            <span class="admin-welcome-greeting">Selamat Datang,</span>
            <h2 class="admin-welcome-name">Administrator</h2>
            <p class="admin-welcome-sub">Kelola seluruh data dan aktivitas sistem dari sini</p>
          </div>
          <div class="admin-welcome-right">
            <div class="admin-welcome-date">
              <i class="fa-solid fa-calendar-days"></i>
              <span id="admin-current-date"></span>
            </div>
            <div class="admin-system-status">
              <span class="status-dot"></span> Sistem Aktif
            </div>
          </div>
        </div>

        <!-- STAT CARDS -->
        <div class="admin-stat-cards">
          <div class="admin-stat-card stat-blue">
            <span class="ag-stat-icon" style="background:#eff6ff">
              <i class="fa-solid fa-chalkboard-user" style="color:#3b82f6"></i>
            </span>
            <div class="stat-info">
              <span class="stat-label">Total Guru</span>
              <span class="stat-number" id="stat-guru">...</span>
            </div>
          </div>
          <div class="admin-stat-card stat-green">
            <span class="ag-stat-icon" style="background:#f0fdf4">
              <i class="fa-solid fa-user-graduate" style="color:#22c55e"></i>
            </span>
            <div class="stat-info">
              <span class="stat-label">Total Siswa</span>
              <span class="stat-number" id="stat-siswa">...</span>
            </div>
          </div>
          <div class="admin-stat-card stat-purple">
            <span class="ag-stat-icon" style="background:#faf5ff">
               <i class="fa-solid fa-school" style="color:#8b5cf6"></i>
            </span>
            <div class="stat-info">
              <span class="stat-label">Total Kelas</span>
              <span class="stat-number" id="stat-kelas">...</span>
              <span class="stat-trend trend-neutral">Stabil</span>
            </div>
          </div>
          <div class="admin-stat-card stat-orange">
            <span class="ag-stat-icon" style="background:#fff4e6">
               <i class="fa-solid fa-comment-dots" style="color:#f59e0b;"></i>
             </span>
            <div class="stat-info">
              <span class="stat-label">Feedback Baru</span>
              <span class="stat-number" id="stat-feedback">...</span>
              <span class="stat-trend trend-up">Belum dibaca</span>
            </div>
          </div>
        </div>

        <!-- MAIN GRID -->
        <div class="admin-main-grid">

          <!-- DISTRIBUSI KELAS -->
          <div class="admin-card distribusi-card">
            <div class="admin-card-header">
              <span class="admin-card-title">
              <i class="fa-solid fa-chart-pie" style="color:#f59e0b; margin-right:8px"></i>
              Distribusi Siswa per Kelas
            </span>
            </div>
            <div class="distribusi-list" id="distribusi-list">
              <div style="text-align:center;padding:20px;color:#94a3b8">Memuat data...</div>
            </div>
          </div>

          <!-- REKAP CEPAT -->
          <div class="admin-right-col">
            <div class="admin-card rekap-card">
              <div class="admin-card-header">
                <span class="admin-card-title">
                  <i class="fa-solid fa-layer-group" style="color:#f59e0b; margin-right:8px;"></i>
                  Ringkasan Sistem
                </span>
              </div>
              <div class="rekap-grid">
                <div class="rekap-item">
                  <span class="rekap-icon">
                    <i class="fa-solid fa-chalkboard-user" style="color:#3b82f6"></i>
                  </span>
                  <span class="rekap-val" id="rekap-guru">...</span>
                  <span class="rekap-key">Guru Aktif</span>
                </div>
                <div class="rekap-item">
                  <span class="rekap-icon">
                  <i class="fa-solid fa-user-graduate" style="color:#22c55e"></i>
                  </span>
                  <span class="rekap-val" id="rekap-siswa">...</span>
                  <span class="rekap-key">Total Siswa</span>
                </div>
                <div class="rekap-item">
                  <span class="rekap-icon">
                   <i class="fa-solid fa-school" style="color:#8b5cf6"></i>
                   </span>
                  <span class="rekap-val" id="rekap-kelas">...</span>
                  <span class="rekap-key">Total Kelas</span>
                </div>
                <div class="rekap-item">
                  <span class="rekap-icon">
                    <i class="fa-solid fa-comment-dots" style="color:#f59e0b;"></i>
                  </span>
                  <span class="rekap-val" id="rekap-feedback">...</span>
                  <span class="rekap-key">Feedback Baru</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- AKSI CEPAT -->
        <div class="section-title">
          <i class="fa-solid fa-bolt" style="color:#f59e0b; margin-right:8px;"></i>
          Aksi Cepat
        </div>
        <div class="quick-actions">
          <button class="quick-btn quick-blue" onclick="window.location.hash='#/admin-guru'">
            <span class="quick-icon"><i class="fa-solid fa-chalkboard-user" style="color:#ffffff"></i></span>
            <span class="quick-label">Kelola Guru</span>
          </button>
          <button class="quick-btn quick-green" onclick="window.location.hash='#/admin-siswa'">
            <span class="quick-icon"><i class="fa-solid fa-user-graduate" style="color:#ffffff"></i></span>
            <span class="quick-label">Kelola Siswa</span>
          </button>
          <button class="quick-btn quick-purple" onclick="window.location.hash='#/admin-kelas'">
            <span class="quick-icon"><i class="fa-solid fa-school" style="color:#ffffff"></i></span>
            <span class="quick-label">Kelola Kelas</span>
          </button>
          <button class="quick-btn quick-orange" onclick="window.location.hash='#/admin-feedback'">
            <span class="quick-icon"> <i class="fa-solid fa-comment-dots" style="color:#ffffff;"></i></span>
            <span class="quick-label">Lihat Feedback</span>
          </button>
        </div>

      </main>
    </div>
  `;

  const dateEl = document.getElementById("admin-current-date");
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
    const res = await api.get("/dashboard/admin");
    const d = res.data;

    // stat cards
    document.getElementById("stat-guru").textContent = d.totalGuru;
    document.getElementById("stat-siswa").textContent = d.totalSiswa;
    document.getElementById("stat-kelas").textContent = d.totalKelas;
    document.getElementById("stat-feedback").textContent =
      d.feedbackBelumDibaca;

    // rekap
    document.getElementById("rekap-guru").textContent = d.totalGuru;
    document.getElementById("rekap-siswa").textContent = d.totalSiswa;
    document.getElementById("rekap-kelas").textContent = d.totalKelas;
    document.getElementById("rekap-feedback").textContent =
      d.feedbackBelumDibaca;

    // distribusi kelas
    const distribusiList = document.getElementById("distribusi-list");
    const maxSiswa = Math.max(
      ...d.distribusiKelas.map((k) => k.jumlahSiswa),
      1,
    );
    distribusiList.innerHTML =
      d.distribusiKelas
        .map((k) => {
          const pct = Math.round((k.jumlahSiswa / maxSiswa) * 100);
          return `
        <div class="distribusi-item">
          <span class="dist-label">${k.namaKelas}</span>
          <div class="dist-bar-wrap">
            <div class="dist-bar" style="width:${pct}%;background:linear-gradient(90deg,#60a5fa,#3b82f6)"></div>
          </div>
          <span class="dist-count">${k.jumlahSiswa}</span>
        </div>
      `;
        })
        .join("") ||
      "<div style='text-align:center;color:#94a3b8'>Belum ada data kelas</div>";
  } catch (err) {
    console.error("Gagal load dashboard:", err);
  }
}

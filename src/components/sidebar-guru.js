/* ===== SIDEBAR GURU ===== */
export function renderSidebarGuru(active = "dashboard") {
  const menus = [
    {
      key: "dashboard",
      href: "#/guru",
      label: "Dashboard",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
             <i class="fa-solid fa-house"></i>
           </span>`,
    },
    {
      key: "guru-kehadiran",
      href: "#/guru-kehadiran",
      label: "Kehadiran Siswa",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#059669, #10b981)">
             <i class="fa-solid fa-clipboard-user"></i>
           </span>`,
    },
    {
      key: "guru-riwayatkehadiran",
      href: "#/guru-riwayatkehadiran",
      label: "Riwayat Kehadiran",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#22c55e,#86efac)">
             <i class="fa-solid fa-clock-rotate-left"></i>
           </span>`,
    },
    {
      key: "guru-nilai",
      href: "#/guru-nilai",
      label: "Nilai Siswa",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">
             <i class="fa-solid fa-pen-to-square"></i>
           </span>`,
    },
    {
      key: "guru-riwayatnilai",
      href: "#/guru-riwayatnilai",
      label: "Riwayat Nilai Siswa",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#f97316,#fdba74)">
             <i class="fa-solid fa-file-lines"></i>
           </span>`,
    },
    {
      key: "guru-laporan",
      href: "#/guru-laporan",
      label: "Laporan Perkembangan",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#0ea5e9,#38bdf8)">
             <i class="fa-solid fa-chart-bar"></i>
           </span>`,
    },
    {
      key: "guru-analisis",
      href: "#/guru-analisis",
      label: "Rekomendasi & Analisis",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#ec4899,#f472b6)">
             <i class="fa-solid fa-brain"></i>
           </span>`,
    },
    {
      key: "guru-notif",
      href: "#/guru-notif",
      label: "Notifikasi",
      badge: "3",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#334155,#64748b)">
             <i class="fa-solid fa-bell"></i>
           </span>`,
    },
  ];

  return `
    <button class="hamburger-btn" id="hamburgerBtn">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <aside class="sidebar" id="adminSidebar">

      <!-- HEADER -->
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
            <i class="fa-solid fa-book-open-reader"></i>
          </div>
          <div>
            <h2>TPA Al-Falah</h2>
            <span class="subtitle">Portal Guru</span>
          </div>
        </div>
      </div>

      <!-- PROFIL -->
      <div class="profile-card" style="background:linear-gradient(135deg,#fffbeb,#fef9c3);border-color:#fde68a">
        <div class="avatar" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>
        <div class="profile-info">
          <strong>Ustadz Ahmad</strong>
          <small style="color:#b45309">
            <i class="fa-solid fa-circle-dot" style="color:#22c55e;font-size:9px"></i>
            Pengajar
          </small>
        </div>
      </div>

      <!-- LABEL -->
      <div class="menu-label">MENU UTAMA</div>

      <!-- MENU -->
      <ul class="sidebar-menu">
        ${menus
          .map(
            (m) => `
          <li class="${active === m.key ? "active" : ""}">
            <a href="${m.href}">
              ${m.icon}
              <span class="menu-text">${m.label}</span>
              ${m.badge ? `<span class="badge">${m.badge}</span>` : ""}
            </a>
          </li>
        `,
          )
          .join("")}
      </ul>

      <!-- LOGOUT -->
      <div class="sidebar-bottom">
        <button id="logoutGuru" class="logout-btn">
          <span class="menu-icon" style="background:linear-gradient(135deg,#ef4444,#f87171)">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>
          <span class="menu-text">Logout</span>
        </button>
      </div>

    </aside>
  `;
}

export function renderSidebarOrtu(active = "dashboard") {
  const menus = [
    {
      key: "dashboard",
      href: "#/ortu",
      label: "Dashboard",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
               <i class="fa-solid fa-house"></i>
             </span>`,
    },
    {
      key: "ortu-kehadiran",
      href: "#/ortu-kehadiran",
      label: "Kehadiran Anak",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8)">
               <i class="fa-solid fa-calendar-check"></i>
             </span>`,
    },
    {
      key: "ortu-nilai",
      href: "#/ortu-nilai",
      label: "Nilai Anak",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#0ea5e9,#38bdf8)">
               <i class="fa-solid fa-star"></i>
             </span>`,
    },
    {
      key: "ortu-analisis",
      href: "#/ortu-analisis",
      label: "Grafik Perkembangan",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#10b981,#34d399)">
               <i class="fa-solid fa-chart-line"></i>
             </span>`,
    },
    {
      key: "ortu-laporan",
      href: "#/ortu-laporan",
      label: "Laporan",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">
               <i class="fa-solid fa-file-lines"></i>
             </span>`,
    },
    {
      key: "ortu-feedback",
      href: "#/ortu-feedback",
      label: "Feedback",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#ec4899,#f472b6">
           <i class="fa-solid fa-comments"></i>
         </span>`,
    },
    {
      key: "ortu-notif",
      href: "#/ortu-notif",
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
          <div class="sidebar-logo-icon" style="background:linear-gradient(135deg,#10b981,#059669)">
            <i class="fa-solid fa-people-roof"></i>
          </div>
          <div>
            <h2>TPA Al-Falah</h2>
            <span class="subtitle">Portal Orang Tua</span>
          </div>
        </div>
      </div>

      <!-- PROFIL -->
      <div class="profile-card" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0">
        <div class="avatar" style="background:linear-gradient(135deg,#10b981,#059669)">
          <i class="fa-solid fa-user"></i>
        </div>
        <div class="profile-info">
          <strong>Orang Tua</strong>
          <small style="color:#059669">
            <i class="fa-solid fa-circle-dot" style="color:#22c55e;font-size:9px"></i>
            Wali Murid
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
        <button id="logoutOrtu" class="logout-btn">
          <span class="menu-icon" style="background:linear-gradient(135deg,#ef4444,#f87171)">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>
          <span class="menu-text">Logout</span>
        </button>
      </div>

    </aside>
  `;
}

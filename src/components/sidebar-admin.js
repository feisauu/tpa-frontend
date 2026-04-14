export function renderSidebarAdmin(active = "dashboard") {
  const menus = [
    {
      key: "dashboard",
      href: "#/admin",
      label: "Dashboard",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
               <i class="fa-solid fa-chart-pie"></i>
             </span>`,
    },
    {
      key: "admin-guru",
      href: "#/admin-guru",
      label: "Kelola Data Guru",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8)">
           <i class="fa-solid fa-chalkboard-user"></i>
         </span>`,
    },
    {
      key: "admin-ortu",
      href: "#/admin-ortu",
      label: "Kelola Data Orang Tua",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#0ea5e9,#38bdf8)">
           <i class="fa-solid fa-people-roof"></i>
         </span>`,
    },
    {
      key: "admin-kelas",
      href: "#/admin-kelas",
      label: "Kelola Data Kelas",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#10b981,#34d399)">
               <i class="fa-solid fa-door-open"></i>
             </span>`,
    },
    {
      key: "admin-siswa",
      href: "#/admin-siswa",
      label: "Kelola Data Siswa",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">
               <i class="fa-solid fa-user-graduate"></i>
             </span>`,
    },
    {
      key: "admin-feedback",
      href: "#/admin-feedback",
      label: "Kelola Feedback",
      icon: `<span class="menu-icon" style="background:linear-gradient(135deg,#ec4899,#f472b6)">
               <i class="fa-solid fa-comments"></i>
             </span>`,
    },
    {
      key: "admin-notif",
      href: "#/admin-notif",
      label: "Notifikasi",
      badge: "3",
      icon: `<span class="menu-icon"  style="background:linear-gradient(135deg,#334155,#64748b)">
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
          <div class="sidebar-logo-icon">
            <i class="fa-solid fa-mosque"></i>
          </div>
          <div>
            <h2>TPA Al-Falah</h2>
            <span class="subtitle">Panel Admin</span>
          </div>
        </div>
      </div>

      <!-- PROFIL -->
      <div class="profile-card">
        <div class="avatar">
          <i class="fa-solid fa-user-shield"></i>
        </div>
        <div class="profile-info">
          <strong>Admin</strong>
          <small><i class="fa-solid fa-circle-dot" style="color:#22c55e;font-size:9px"></i> Pengelola</small>
        </div>
      </div>

      <!-- LABEL MENU -->
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
        <button id="logoutAdmin" class="logout-btn">
          <span class="menu-icon" style="background:linear-gradient(135deg,#ef4444,#f87171)">
            <i class="fa-solid fa-right-from-bracket"></i>
          </span>
          <span class="menu-text">Logout</span>
        </button>
      </div>

    </aside>
  `;
}

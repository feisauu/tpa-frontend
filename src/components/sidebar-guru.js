import { api } from "../utils/api";

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

let _cachedProfile = null;

async function fetchProfile() {
  if (_cachedProfile) return _cachedProfile;
  try {
    const res = await api.get("/auth/me");
    _cachedProfile = res.data;
    return _cachedProfile;
  } catch (err) {
    console.error("Gagal fetch profil guru:", err);
    return null;
  }
}

function getInitials(nama = "") {
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const TITLE_PREFIX = ["guru", "ustadz", "ustadzah", "ustad"];

function formatNamaGuru(raw = "") {
  const clean = raw
    .replace(/[_\-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const firstWord = clean.split(" ")[0].toLowerCase();
  const hasTitle = TITLE_PREFIX.includes(firstWord);

  return hasTitle ? clean : `Guru ${clean}`;
}

export function renderSidebarGuru(active = "dashboard") {
  const html = `
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
        <div class="avatar" id="sidebar-guru-avatar"
          style="background:linear-gradient(135deg,#f59e0b,#d97706);
            font-size:14px;font-weight:700;color:white;
            display:flex;align-items:center;justify-content:center">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>
        <div class="profile-info">
          <strong id="sidebar-guru-nama">Memuat...</strong>
          <small id="sidebar-guru-sub" style="color:#b45309">
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

  // Fetch dan isi profil setelah elemen ada di DOM
  requestAnimationFrame(() => {
    fetchProfile().then((profil) => {
      if (!profil) return;

      const namaEl = document.getElementById("sidebar-guru-nama");
      const avatarEl = document.getElementById("sidebar-guru-avatar");
      const subEl = document.getElementById("sidebar-guru-sub");

      const namaFormatted = formatNamaGuru(
        profil.nama || profil.username || "Guru",
      );

      if (namaEl) namaEl.textContent = namaFormatted;

      if (avatarEl) {
        avatarEl.innerHTML = getInitials(namaFormatted);
      }

      if (subEl) {
        const jabatan = profil.jabatan || profil.role || "Pengajar";
        const label =
          jabatan === "GURU" || jabatan === "guru" ? "Pengajar" : jabatan;
        subEl.innerHTML = `
          <i class="fa-solid fa-circle-dot" style="color:#22c55e;font-size:9px"></i>
          ${label}
        `;
      }
    });
  });

  return html;
}

export function clearSidebarGuruCache() {
  _cachedProfile = null;
}

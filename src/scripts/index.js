import "../styles/style.css";
import "../styles/style-admin.css";
import "../styles/style-guru.css";
import "../styles/style-ortu.css";
import { renderLogin } from "./pages/login";

// admin
import { renderAdminHome } from "./admin-pages/admin-home";
import { renderAdminGuru } from "./admin-pages/admin-guru";
import { renderAdminOrtu } from "./admin-pages/admin-ortu";
import { renderAdminKelas } from "./admin-pages/admin-kelas";
import { renderAdminSiswa } from "./admin-pages/admin-siswa";
import { renderAdminFeedback } from "./admin-pages/admin-feedback";
import { renderAdminNotif } from "./admin-pages/admin-notif";

// guru
import { renderGuruHome } from "./guru-pages/guru-home";
import { renderGuruNilai } from "./guru-pages/guru-nilai";
import { renderGuruRiwayatNilai } from "./guru-pages/guru-riwayatnilai";
import { renderGuruKehadiran } from "./guru-pages/guru-kehadiran";
import { renderGuruRiwayatKehadiran } from "./guru-pages/guru-riwayatkehadiran";
import { renderGuruAnalisis } from "./guru-pages/guru-analisis";
import { renderGuruLaporan } from "./guru-pages/guru-laporan";
import { renderGuruNotif } from "./guru-pages/guru-notif";

// orang tua
import { renderOrtuHome } from "./ortu-pages/ortu-home";
import { renderOrtuKehadiran } from "./ortu-pages/ortu-kehadiran";
import { renderOrtuNilai } from "./ortu-pages/ortu-nilai";
import { renderOrtuLaporan } from "./ortu-pages/ortu-laporan";
import { renderOrtuAnalisis } from "./ortu-pages/ortu-analisis";
import { renderOrtuFeedback } from "./ortu-pages/ortu-feedback";
import { renderOrtuNotif } from "./ortu-pages/ortu-notif";

// sidebar
function initSidebarToggle() {
  const btn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  btn?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("open");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
  });
}

// logout sweetalert
function initLogout() {
  const handler = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Aplikasi?",
      text: "Kamu akan diarahkan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#94a3b8",
      borderRadius: "16px",
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Sampai jumpa!",
        text: "Kamu berhasil keluar.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#6366f1",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
        },
      });
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 1500);
    }
  };

  document.getElementById("logoutAdmin")?.addEventListener("click", handler);
  document.getElementById("logoutGuru")?.addEventListener("click", handler);
  document.getElementById("logoutOrtu")?.addEventListener("click", handler);
}

// router
function router() {
  const hash = window.location.hash;

  // login
  if (!hash || hash === "#/login") {
    renderLogin();
    // admin
  } else if (hash === "#/admin") {
    renderAdminHome();
  } else if (hash === "#/admin-guru") {
    renderAdminGuru();
  } else if (hash === "#/admin-ortu") {
    renderAdminOrtu();
  } else if (hash === "#/admin-kelas") {
    renderAdminKelas();
  } else if (hash === "#/admin-siswa") {
    renderAdminSiswa();
  } else if (hash === "#/admin-feedback") {
    renderAdminFeedback();
  } else if (hash === "#/admin-notif") {
    renderAdminNotif();
    // guru
  } else if (hash === "#/guru") {
    renderGuruHome();
  } else if (hash === "#/guru-nilai") {
    renderGuruNilai();
  } else if (hash === "#/guru-riwayatnilai") {
    renderGuruRiwayatNilai();
  } else if (hash === "#/guru-kehadiran") {
    renderGuruKehadiran();
  } else if (hash === "#/guru-riwayatkehadiran") {
    renderGuruRiwayatKehadiran();
  } else if (hash === "#/guru-analisis") {
    renderGuruAnalisis();
  } else if (hash === "#/guru-laporan") {
    renderGuruLaporan();
  } else if (hash === "#/guru-notif") {
    renderGuruNotif();
  } else if (hash === "#/ortu") {
    // orang tua
    renderOrtuHome();
  } else if (hash === "#/ortu-kehadiran") {
    renderOrtuKehadiran();
  } else if (hash === "#/ortu-nilai") {
    renderOrtuNilai();
  } else if (hash === "#/ortu-laporan") {
    renderOrtuLaporan();
  } else if (hash === "#/ortu-analisis") {
    renderOrtuAnalisis();
  } else if (hash === "#/ortu-feedback") {
    renderOrtuFeedback();
  } else if (hash === "#/ortu-notif") {
    renderOrtuNotif();
  } else {
    // 404
    document.getElementById("app").innerHTML = `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        justify-content:center; height:100vh; gap:12px;
        background:#f8f7ff; font-family:sans-serif;
      ">
        <div style="font-size:64px">🔍</div>
        <h2 style="color:#1e293b;margin:0">Halaman tidak ditemukan</h2>
        <p style="color:#94a3b8;margin:0">Hash: <code>${hash}</code></p>
        <a href="#/login" style="
          margin-top:8px; padding:10px 24px; border-radius:12px;
          background:#6366f1; color:white; text-decoration:none;
          font-weight:700; font-size:14px;
        ">← Kembali ke Login</a>
      </div>
    `;
    return;
  }

  initSidebarToggle();
  initLogout();
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

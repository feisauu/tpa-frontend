import { api } from "../../utils/api";

export function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="login-page">

      <!-- KIRI -->
      <div class="login-left">
        <div class="login-left-overlay"></div>
        <div class="login-left-content">
          <div class="login-illustration">
            <img src="/public/images/ilustrasi.png" alt="Ilustrasi TPA" class="illustration-img">
          </div>
          <h1 class="login-brand-title">Selamat Datang!</h1>
          <p class="login-brand-desc">
            Platform digital untuk memantau perkembangan siswa
            Taman Pendidikan Al-Qur'an Al-Falah Ponorogo.
          </p>
          <div class="login-left-badges">
              <span class="login-left-badge">
                <i class="fa-solid fa-user-graduate"></i> Manajemen Siswa
              </span>
              <span class="login-left-badge">
                <i class="fa-solid fa-chart-line"></i> Laporan Digital
              </span>
              <span class="login-left-badge">
                <i class="fa-solid fa-people-roof"></i> Portal Ortu
              </span>
          </div>
        </div>
      </div>

      <!-- KANAN -->
      <div class="login-right">
        <div class="login-card">
          <div class="login-logo">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
          <div class="login-title">Masuk ke Sistem</div>
          <div class="login-subtitle">Silakan masuk untuk melanjutkan</div>

          <form class="login-form" id="loginForm">

            <label>Username</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-user login-input-icon"></i>
              <input id="username" type="text" placeholder="Masukkan username">
            </div>

            <label>Password</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-lock login-input-icon"></i>
              <input id="password" type="password" placeholder="Masukkan password">
            </div>

            <div id="login-error"></div>

            <button class="login-btn" type="submit" id="login-btn">
              Masuk ke Sistem
            </button>
          </form>

          <div class="login-footer">
            © 2026 TPA Al-Falah Ponorogo · All rights reserved
          </div>
        </div>
      </div>

    </div>
  `;

  const form = document.getElementById("loginForm");
  const errEl = document.getElementById("login-error");
  const btnEl = document.getElementById("login-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      errEl.textContent = "Username dan password wajib diisi";
      errEl.style.display = "block";
      return;
    }

    btnEl.textContent = "Memuat...";
    btnEl.disabled = true;
    errEl.style.display = "none";

    try {
      const res = await api.post("/auth/login", { username, password });
      const semuaAnak = res.data.semuaAnak || [];

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("nama", res.data.nama || "");
      localStorage.setItem(
        "namaSiswa",
        res.data.namaSiswa || semuaAnak[0]?.nama || "",
      );
      localStorage.setItem(
        "kelas",
        res.data.kelas || semuaAnak[0]?.kelas || "",
      );
      localStorage.setItem(
        "siswaId",
        res.data.siswaId || semuaAnak[0]?.id || "",
      );
      localStorage.setItem(
        "kelasId",
        res.data.kelasId || semuaAnak[0]?.kelasId || "",
      );
      localStorage.setItem("semuaAnak", JSON.stringify(semuaAnak));

      if (res.data.role === "ADMIN") window.location.hash = "#/admin";
      else if (res.data.role === "GURU") window.location.hash = "#/guru";
      else if (res.data.role === "ORTU") window.location.hash = "#/ortu";
    } catch (err) {
      errEl.textContent = err.message || "Login gagal, coba lagi";
      errEl.style.display = "block";
      btnEl.textContent = "Masuk ke Sistem";
      btnEl.disabled = false;
    }
  });
}

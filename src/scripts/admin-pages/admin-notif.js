import { renderSidebarAdmin } from "../../components/sidebar-admin";
import { api } from "../../utils/api";

export function formatWaktu(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const menit = Math.floor((now - d) / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function renderAdminNotif() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarAdmin("admin-notif")}
      <main class="content admin-home">
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Notifikasi</h2>
            <p class="ag-subtitle">Aktivitas terbaru sistem TPA Al-Falah</p>
          </div>
          <button id="notif-tandai-semua" class="an-tandai-btn">
            <i class="fa fa-check-double an-tandai-btn__icon"></i>Tandai Semua Dibaca
          </button>
        </div>
        <div id="notif-loading" class="an-loading">
          <div class="gn-loading-spinner"></div>
          <p class="an-loading__text">Memuat notifikasi...</p>
        </div>
        <div id="notif-list" class="an-list" style="display:none"></div>
        <div id="notif-empty" class="an-empty" style="display:none">
          <div class="an-empty__icon">🔔</div>
          <p class="an-empty__text">Tidak ada notifikasi baru</p>
        </div>
      </main>
    </div>
  `;

  await loadNotifAdmin();

  document
    .getElementById("notif-tandai-semua")
    ?.addEventListener("click", () => {
      const semua = JSON.parse(localStorage.getItem("notif_all_admin") || "[]");
      localStorage.setItem("notif_read_admin", JSON.stringify(semua));
      renderAdminNotif();
    });
}

async function loadNotifAdmin() {
  const notifs = [];
  const dibaca = JSON.parse(localStorage.getItem("notif_read_admin") || "[]");

  try {
    // ── 1. Feedback masuk dari ortu (belum ada balasan) ─────────────
    const feedbackRes = await api.get("/feedback");
    const feedbacks = (feedbackRes.data || []).filter((f) => !f.balasan);
    feedbacks.slice(0, 5).forEach((f) => {
      notifs.push({
        id: `feedback-${f.id}`,
        icon: "💬",
        warna: "#6366f1",
        bg: "#f5f3ff",
        judul: "Feedback masuk dari orang tua",
        isi: `${f.namaOrtu || f.siswa?.ortu?.nama || "Orang tua"} mengirim pesan: "${(f.pesan || "").slice(0, 80)}${(f.pesan || "").length > 80 ? "..." : ""}"`,
        waktu: f.createdAt,
        link: "#/admin-feedback",
      });
    });

    // ── 2. Kenaikan jilid siswa ──────────────────────────────────────
    const nilaiRes = await api.get("/nilai?tipeInput=kenaikan_jilid");
    const kenaikan = nilaiRes.data || [];
    const seen = new Set();
    kenaikan
      .filter((n) => {
        const selisih =
          (Date.now() - new Date(n.tanggal)) / (1000 * 60 * 60 * 24);
        return n.keputusan === "naik" && selisih <= 7;
      })
      .forEach((n) => {
        const key = `${n.siswaId}-${n.tanggal?.slice(0, 10)}`;
        if (seen.has(key)) return;
        seen.add(key);
        notifs.push({
          id: `naik-${key}`,
          icon: "🎉",
          warna: "#16a34a",
          bg: "#f0fdf4",
          judul: "Siswa naik jilid",
          isi: `${n.siswa?.nama || "Siswa"} berhasil naik ke jilid berikutnya pada ${formatTanggal(n.tanggal?.slice(0, 10))}`,
          waktu: n.tanggal,
          link: "#/admin-siswa",
        });
      });
  } catch (err) {
    console.error("Gagal load notifikasi admin:", err);
  }

  notifs.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
  localStorage.setItem(
    "notif_all_admin",
    JSON.stringify(notifs.map((n) => n.id)),
  );
  renderNotifList(notifs, dibaca, "admin");
}

export function renderNotifList(notifs, dibaca, role) {
  document.getElementById("notif-loading").style.display = "none";
  const list = document.getElementById("notif-list");
  const empty = document.getElementById("notif-empty");

  if (notifs.length === 0) {
    empty.style.display = "block";
    return;
  }

  list.style.display = "flex";
  list.innerHTML = notifs
    .map((n) => {
      const sudahDibaca = dibaca.includes(n.id);
      return `
      <div onclick="window.tandaiDanNav('${n.id}','${role}','${n.link}')"
        class="an-item ${sudahDibaca ? "an-item--dibaca" : ""}"
        style="background:${sudahDibaca ? "#f8fafc" : n.bg};border-color:${sudahDibaca ? "#f1f5f9" : n.warna + "30"}"
        onmouseover="this.style.transform='translateX(4px)'"
        onmouseout="this.style.transform='translateX(0)'">
        <div class="an-item__icon-wrap"
          style="background:${n.bg};border-color:${n.warna}20">${n.icon}</div>
        <div class="an-item__body">
          <div class="an-item__top">
            <span class="an-item__judul" style="font-weight:${sudahDibaca ? 500 : 700}">
              ${n.judul}
              ${
                !sudahDibaca
                  ? `<span class="an-item__dot" style="background:${n.warna}"></span>`
                  : ""
              }
            </span>
            <span class="an-item__waktu">${formatWaktu(n.waktu)}</span>
          </div>
          <div class="an-item__isi">${n.isi}</div>
        </div>
      </div>`;
    })
    .join("");

  updateBadge(notifs.filter((n) => !dibaca.includes(n.id)).length);
}

export function updateBadge(count) {
  document.querySelectorAll(".sidebar-menu .badge").forEach((b) => {
    b.textContent = count > 0 ? count : "";
    b.style.display = count > 0 ? "inline-block" : "none";
  });
}

window.tandaiDanNav = function (id, role, link) {
  const key = `notif_read_${role}`;
  const dibaca = JSON.parse(localStorage.getItem(key) || "[]");
  if (!dibaca.includes(id)) {
    dibaca.push(id);
    localStorage.setItem(key, JSON.stringify(dibaca));
  }
  window.location.hash = link;
};

function formatTanggal(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const bulan = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${parseInt(d)} ${bulan[parseInt(m)]} ${y}`;
}

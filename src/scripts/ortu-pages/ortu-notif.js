import { renderSidebarOrtu } from "../../components/sidebar-ortu";
import { api } from "../../utils/api";
import {
  formatWaktu,
  renderNotifList,
  updateBadge,
} from "../admin-pages/admin-notif";

export async function renderOrtuNotif() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarOrtu("ortu-notif")}
      <main class="content admin-home">
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Notifikasi</h2>
            <p class="ag-subtitle">Info perkembangan belajar anak Anda</p>
          </div>
          <button id="notif-tandai-semua" class="an-tandai-btn">
            <i class="fa fa-check-double an-tandai-btn__icon"></i>Tandai Semua Dibaca
          </button>
        </div>
        <div id="notif-loading" style="text-align:center;padding:48px;color:#94a3b8">
          <div class="gn-loading-spinner"></div>
          <p style="margin-top:10px">Memuat notifikasi...</p>
        </div>
        <div id="notif-list" style="display:none;flex-direction:column;gap:10px"></div>
        <div id="notif-empty" style="display:none;text-align:center;padding:64px;color:#94a3b8">
          <div style="font-size:48px;margin-bottom:12px">🔔</div>
          <p style="font-weight:600">Tidak ada notifikasi baru</p>
        </div>
      </main>
    </div>
  `;

  await loadNotifOrtu();

  document
    .getElementById("notif-tandai-semua")
    ?.addEventListener("click", () => {
      const semua = JSON.parse(localStorage.getItem("notif_all_ortu") || "[]");
      localStorage.setItem("notif_read_ortu", JSON.stringify(semua));
      renderOrtuNotif();
    });
}

async function loadNotifOrtu() {
  const notifs = [];
  const dibaca = JSON.parse(localStorage.getItem("notif_read_ortu") || "[]");
  const siswaId = localStorage.getItem("siswaId");
  const kelasId = localStorage.getItem("kelasId");
  const namaSiswa = localStorage.getItem("namaSiswa") || "Anak";
  const ortuId = localStorage.getItem("ortuId");

  if (!siswaId) {
    document.getElementById("notif-loading").innerHTML =
      `<p style="color:#ef4444">Siswa tidak ditemukan. Silakan login ulang.</p>`;
    return;
  }

  try {
    const nilaiRes = await api.get(
      `/nilai?siswaId=${siswaId}&tipeInput=reguler`,
    );
    const nilaiList = nilaiRes.data || [];
    // Group per tanggal sesi
    const sesiMap = {};
    nilaiList
      .filter((n) => {
        const selisih =
          (Date.now() - new Date(n.tanggal)) / (1000 * 60 * 60 * 24);
        return selisih <= 7;
      })
      .forEach((n) => {
        const tgl = n.tanggal.slice(0, 10);
        if (!sesiMap[tgl]) sesiMap[tgl] = [];
        sesiMap[tgl].push(n);
      });

    Object.entries(sesiMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 5)
      .forEach(([tgl, items]) => {
        const ringkasan = items
          .map((n) => `${capitalize(n.jenis)}: ${n.nilai}`)
          .join(" · ");
        notifs.push({
          id: `nilai-${siswaId}-${tgl}`,
          icon: "📝",
          warna: "#3b82f6",
          bg: "#eff6ff",
          judul: `Nilai baru dari guru — ${formatTanggal(tgl)}`,
          isi: `${namaSiswa} mendapat nilai: ${ringkasan}`,
          waktu: tgl + "T08:00:00",
          link: "#/ortu-nilai",
        });
      });

    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();
    const hadirRes = await api.get(
      `/kehadiran?siswaId=${siswaId}&bulan=${bulan}&tahun=${tahun}`,
    );
    const alphaList = (hadirRes.data || []).filter((h) => h.status === "Alpha");
    alphaList
      .slice(0, 3) // maks 3 notif alpha
      .forEach((h) => {
        const tgl = h.tanggal.slice(0, 10);
        notifs.push({
          id: `alpha-${siswaId}-${tgl}`,
          icon: "⚠️",
          warna: "#dc2626",
          bg: "#fee2e2",
          judul: `${namaSiswa} tidak hadir tanpa keterangan`,
          isi: `Tercatat alpha pada ${formatTanggal(tgl)}. Mohon informasikan ke guru jika ada keterangan.`,
          waktu: h.tanggal,
          link: "#/ortu-kehadiran",
        });
      });

    if (kelasId) {
      const sawRes = await api.get(`/nilai/analisis-saw/${kelasId}`);
      const dataSAW = (sawRes.data || []).find(
        (s) => String(s.siswaId) === String(siswaId),
      );

      if (dataSAW?.rekomendasi === "Layak Ujian") {
        notifs.push({
          id: `layak-ujian-${siswaId}`,
          icon: "🎉",
          warna: "#16a34a",
          bg: "#f0fdf4",
          judul: `Selamat! ${namaSiswa} siap ujian kenaikan jilid`,
          isi: `Alhamdulillah! ${namaSiswa} telah memenuhi syarat nilai dan halaman. Guru akan segera menjadwalkan ujian.`,
          waktu: new Date().toISOString(),
          link: "#/ortu-analisis",
        });
      } else if (dataSAW?.rekomendasi === "Dipertimbangkan") {
        notifs.push({
          id: `hampir-layak-${siswaId}`,
          icon: "🔔",
          warna: "#a16207",
          bg: "#fffbeb",
          judul: `${namaSiswa} hampir siap ujian!`,
          isi: "Perkembangan sudah baik. Terus dampingi belajar agar segera memenuhi semua syarat.",
          waktu: new Date().toISOString(),
          link: "#/ortu-analisis",
        });
      }
    }

    const feedbackRes = await api.get("/feedback/saya");
    const feedbackDibalas = (feedbackRes.data || []).filter((f) => f.balasan);
    feedbackDibalas.slice(0, 3).forEach((f) => {
      notifs.push({
        id: `feedback-dibalas-${f.id}`,
        icon: "💬",
        warna: "#6366f1",
        bg: "#f5f3ff",
        judul: "Guru membalas pesan Anda",
        isi: `Balasan: "${(f.balasan || "").slice(0, 80)}${(f.balasan || "").length > 80 ? "..." : ""}"`,
        waktu: f.updatedAt || f.createdAt,
        link: "#/ortu-feedback",
      });
    });
  } catch (err) {
    console.error("Gagal load notifikasi ortu:", err);
  }

  notifs.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
  localStorage.setItem(
    "notif_all_ortu",
    JSON.stringify(notifs.map((n) => n.id)),
  );
  renderNotifList(notifs, dibaca, "ortu");
}

function formatTanggal(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const bln = [
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
  return `${parseInt(d)} ${bln[parseInt(m)]} ${y}`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

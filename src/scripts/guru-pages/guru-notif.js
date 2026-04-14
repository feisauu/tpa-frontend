import { renderSidebarGuru } from "../../components/sidebar-guru";
import { api } from "../../utils/api";
import { formatWaktu, renderNotifList } from "../admin-pages/admin-notif";

export async function renderGuruNotif() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="layout">
      ${renderSidebarGuru("guru-notif")}
      <main class="content admin-home">
        <div class="ag-header">
          <div>
            <h2 class="ag-title">Notifikasi</h2>
            <p class="ag-subtitle">Pengingat dan info terbaru untuk Anda</p>
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
          <p style="font-weight:600">Tidak ada notifikasi</p>
        </div>
      </main>
    </div>
  `;

  await loadNotifGuru();

  document
    .getElementById("notif-tandai-semua")
    ?.addEventListener("click", () => {
      const semua = JSON.parse(localStorage.getItem("notif_all_guru") || "[]");
      localStorage.setItem("notif_read_guru", JSON.stringify(semua));
      renderGuruNotif();
    });
}

async function loadNotifGuru() {
  const notifs = [];
  const today = new Date().toISOString().slice(0, 10);
  const dibaca = JSON.parse(localStorage.getItem("notif_read_guru") || "[]");
  const guruId = localStorage.getItem("guruId");

  let kelasDiampu = [];
  try {
    const raw = JSON.parse(localStorage.getItem("kelasDiampu") || "[]");
    kelasDiampu = raw.map((k) => {
      if (typeof k === "object" && k !== null) return k;
      return { id: k, namaKelas: `Kelas ${k}` };
    });
  } catch (_) {
    kelasDiampu = [];
  }

  if (kelasDiampu.length === 0 && guruId) {
    try {
      const res = await api.get(`/kelas?guruId=${guruId}`);
      kelasDiampu = (res.data || []).map((k) => ({
        id: k.id,
        namaKelas: k.namaKelas || `Kelas ${k.id}`,
      }));
      localStorage.setItem("kelasDiampu", JSON.stringify(kelasDiampu));
    } catch (_) {}
  }

  const hariIni = new Date().getDay();
  const isHariAktif = hariIni >= 1 && hariIni <= 4;
  const namaHari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ][hariIni];
  const tanggalLabel = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });

  try {
    if (isHariAktif) {
      let sudahInputKehadiran = false;
      let sudahInputNilai = false;

      if (kelasDiampu.length > 0) {
        // Cek kehadiran
        for (const k of kelasDiampu.slice(0, 5)) {
          const kelasId = k.id;
          try {
            const res = await api.get(
              `/kehadiran?kelasId=${kelasId}&tanggalMulai=${today}&tanggalAkhir=${today}`,
            );
            if ((res.data || []).length > 0) {
              sudahInputKehadiran = true;
              break;
            }
          } catch (_) {}
        }

        // Cek nilai
        for (const k of kelasDiampu.slice(0, 5)) {
          const kelasId = k.id;
          try {
            const res = await api.get(
              `/nilai?kelasId=${kelasId}&tanggal=${today}`,
            );
            const data = res.data || [];
            const dariGuru = guruId
              ? data.some((n) => String(n.guruId) === String(guruId))
              : data.length > 0;
            if (dariGuru) {
              sudahInputNilai = true;
              break;
            }
          } catch (_) {
            try {
              const res2 = await api.get(
                `/nilai?kelasId=${kelasId}&tipeInput=reguler`,
              );
              const data2 = res2.data || [];
              if (data2.some((n) => n.tanggal?.slice(0, 10) === today)) {
                sudahInputNilai = true;
                break;
              }
            } catch (_2) {}
          }
        }
      }

      notifs.push({
        id: `kehadiran-${today}`,
        icon: sudahInputKehadiran ? "✅" : "📋",
        warna: sudahInputKehadiran ? "#16a34a" : "#6366f1",
        bg: sudahInputKehadiran ? "#f0fdf4" : "#eff6ff",
        judul: sudahInputKehadiran
          ? `Kehadiran ${namaHari} sudah diinput`
          : `Jangan lupa input kehadiran hari ini`,
        isi: sudahInputKehadiran
          ? `Absensi siswa untuk ${namaHari}, ${tanggalLabel} sudah tercatat. Terima kasih!`
          : `Hari ini ${namaHari}, ${tanggalLabel} — Segera input kehadiran siswa sebelum sesi selesai.`,
        waktu: new Date().toISOString(),
        link: "#/guru-kehadiran",
        prioritas: !sudahInputKehadiran,
      });

      notifs.push({
        id: `nilai-${today}`,
        icon: sudahInputNilai ? "✅" : "📝",
        warna: sudahInputNilai ? "#16a34a" : "#d97706",
        bg: sudahInputNilai ? "#f0fdf4" : "#fffbeb",
        judul: sudahInputNilai
          ? `Nilai ${namaHari} sudah diinput`
          : `Jangan lupa input nilai siswa hari ini`,
        isi: sudahInputNilai
          ? `Nilai siswa untuk ${namaHari}, ${tanggalLabel} sudah tercatat.`
          : `Hari ini ${namaHari}, ${tanggalLabel} — Masukkan nilai bacaan, hafalan, dan menulis setelah sesi selesai.`,
        waktu: new Date(Date.now() - 1000).toISOString(),
        link: "#/guru-nilai",
        prioritas: !sudahInputNilai,
      });
    } else {
      notifs.push({
        id: `libur-${today}`,
        icon: "🌙",
        warna: "#6366f1",
        bg: "#f5f3ff",
        judul: `Hari ini tidak ada sesi TPA`,
        isi: `TPA aktif Senin–Kamis. Gunakan waktu ini untuk memeriksa catatan siswa atau laporan perkembangan.`,
        waktu: new Date().toISOString(),
        link: "#/guru-laporan",
        prioritas: false,
      });
    }

    for (const k of kelasDiampu.slice(0, 5)) {
      const kelasId = k.id;
      const namaKelas = k.namaKelas || `Kelas ${kelasId}`;
      try {
        const sawRes = await api.get(`/nilai/analisis-saw/${kelasId}`);
        const semua = sawRes.data || [];
        const layak = semua.filter(
          (s) => s.rekomendasi?.trim().toLowerCase() === "layak ujian",
        );

        console.log(
          `[Notif] Kelas ${namaKelas}: ${semua.length} siswa, ${layak.length} layak ujian`,
        );

        if (layak.length > 0) {
          notifs.push({
            id: `layak-ujian-${kelasId}`,
            icon: "🎓",
            warna: "#16a34a",
            bg: "#f0fdf4",
            judul: `${layak.length} siswa siap ujian — ${namaKelas}`,
            isi:
              layak.map((s) => s.nama || s.namaSiswa || "Siswa").join(", ") +
              " telah memenuhi syarat nilai & halaman.",
            waktu: new Date(Date.now() - 60000).toISOString(),
            link: "#/guru-analisis",
            prioritas: false,
          });
        }
      } catch (err) {
        console.error(
          `[Notif] Gagal fetch analisis-saw kelas ${kelasId}:`,
          err,
        );
      }
    }

    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();

    for (const k of kelasDiampu.slice(0, 3)) {
      const kelasId = k.id;
      try {
        const siswaRes = await api.get(`/siswa?kelasId=${kelasId}`);
        const siswas = siswaRes.data || [];
        for (const s of siswas.slice(0, 20)) {
          try {
            const hadirRes = await api.get(
              `/kehadiran?siswaId=${s.id}&bulan=${bulan}&tahun=${tahun}`,
            );
            // ── FIX #5: case-insensitive status alpha ──
            const alphaList = (hadirRes.data || []).filter(
              (h) => h.status?.trim().toLowerCase() === "alpha",
            );
            if (alphaList.length >= 3) {
              notifs.push({
                id: `alpha-${s.id}-${bulan}`,
                icon: "⚠️",
                warna: "#dc2626",
                bg: "#fee2e2",
                judul: `${s.nama} sering tidak hadir`,
                isi: `${s.nama} sudah ${alphaList.length}× alpha bulan ini. Perlu perhatian khusus.`,
                waktu:
                  alphaList[alphaList.length - 1]?.tanggal ||
                  new Date().toISOString(),
                link: "#/guru-riwayatkehadiran",
                prioritas: false,
              });
            }
          } catch (_) {}
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("Gagal load notifikasi guru:", err);
  }

  notifs.sort((a, b) => {
    if (a.prioritas && !b.prioritas) return -1;
    if (!a.prioritas && b.prioritas) return 1;
    return new Date(b.waktu) - new Date(a.waktu);
  });

  localStorage.setItem(
    "notif_all_guru",
    JSON.stringify(notifs.map((n) => n.id)),
  );
  renderNotifList(notifs, dibaca, "guru");
}

/**
 * Helper pembuat tautan WhatsApp langsung dengan template pesan otomatis
 * sesuai tahapan seleksi kandidat pelamar.
 */

export function formatWhatsAppUrl(
  phone: string | null | undefined,
  applicantName: string,
  companyName: string,
  jobTitle: string,
  status?: string,
  interviewAt?: string | null,
  interviewPlace?: string | null
): string | null {
  if (!phone) return null;
  const raw = phone.replace(/[\s-]/g, "").trim();
  if (!raw) return null;

  const clean = raw.startsWith("+")
    ? raw.slice(1)
    : raw.startsWith("0")
    ? "62" + raw.slice(1)
    : raw;

  let message = `Halo ${applicantName}, kami dari tim rekrutmen ${companyName}. Kami telah menerima berkas lamaran Anda untuk posisi ${jobTitle} melalui JobConnect.`;

  if (status === "wawancara") {
    const detailJadwal = interviewAt
      ? `\nJadwal: ${interviewAt}\nMedia / Tempat: ${interviewPlace || "Daring (Online)"}\n`
      : "\n";
    message = `Halo ${applicantName}, kami dari ${companyName}. Berdasarkan peninjauan berkas, kami mengundang Anda untuk mengikuti tahap wawancara posisi ${jobTitle}.${detailJadwal}Mohon konfirmasikan kesediaan jadwal Anda dengan membalas pesan ini. Terima kasih.`;
  } else if (status === "diterima") {
    message = `Halo ${applicantName}, selamat! Kami dari ${companyName} menyampaikan bahwa Anda dinyatakan DITERIMA untuk posisi ${jobTitle}. Tim HR kami akan segera mengoordinasikan proses penerbitan surat penawaran dan jadwal orientasi. Selamat bergabung!`;
  } else if (status === "ditawari") {
    message = `Halo ${applicantName}, kami dari ${companyName} telah mengirimkan rincian penawaran kerja resmi (offering) untuk posisi ${jobTitle}. Mohon periksa email Anda dan beritahu kami bila ada yang ingin dikonfirmasi. Terima kasih.`;
  } else if (status === "shortlist") {
    message = `Halo ${applicantName}, kami dari ${companyName} mengabarkan bahwa profil Anda masuk dalam daftar kandidat unggulan (shortlist) untuk posisi ${jobTitle}. Kami akan segera mengabari Anda untuk jadwal seleksi berikutnya.`;
  }

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

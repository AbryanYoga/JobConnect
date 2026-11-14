/**
 * Utilitas Deteksi Kata Kasar, Umpatan, dan Konten Toksik (Profanity Filter)
 * Digunakan untuk memvalidasi nama pengguna, nama perusahaan, dan bio agar platform
 * tetap profesional, aman, dan bebas dari pelecehan atau konten tidak senonoh.
 */

// Daftar kata dasar terlarang (Indonesia & Inggris)
const TOXIC_WORD_LIST = [
  // Makian & Umpatan Hewan / Kasar ID
  "anjing",
  "anjir",
  "anjrit",
  "babi",
  "monyet",
  "bangsat",
  "bajingan",
  "keparat",
  "brengsek",
  "kontol",
  "memek",
  "pantek",
  "pepek",
  "perek",
  "itil",
  "jembut",
  "ngentot",
  "ngewe",
  "titit",
  "pler",
  "peler",
  "bego",
  "tolol",
  "goblok",
  "idiot",
  "kampret",
  "tai",
  "taek",
  "asu",
  "jablay",
  "lonte",
  "cuki",
  "cukimai",
  "kimak",
  "puki",
  "jancok",
  "dancok",
  "jancuk",

  // Profanity & Slurs EN
  "fuck",
  "fucking",
  "fucker",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "cunt",
  "pussy",
  "bastard",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "cock",
  "motherfucker",
];

/**
 * Normalisasi leetspeak dan karakter repetitif.
 * Contoh: "k0nt01" -> "kontol", "aaannjjiiing" -> "anjing"
 */
function normalizeText(text: string): string {
  if (!text) return "";

  let cleaned = text.toLowerCase();

  // Substitusi leetspeak umum
  cleaned = cleaned
    .replace(/[@4]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b");

  // Hilangkan karakter non-alfanumerik kecuali spasi
  cleaned = cleaned.replace(/[^a-z0-9\s]/g, " ");

  // Rapatkan karakter berulang lebih dari 2 kali: "annnjjjiiing" -> "anjiing"
  cleaned = cleaned.replace(/(.)\1{2,}/g, "$1$1");

  return cleaned.trim();
}

/**
 * Memeriksa apakah teks mengandung kata yang kasar atau terlarang.
 */
export function hasProfanity(text: string | null | undefined): boolean {
  if (!text) return false;

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(Boolean);

  for (const word of words) {
    for (const toxic of TOXIC_WORD_LIST) {
      if (word === toxic) {
        return true;
      }
      // Jika kata toksik cukup panjang (>= 5 huruf) dan terkandung di dalam kata
      if (toxic.length >= 5 && word.includes(toxic)) {
        return true;
      }
    }
  }

  // Cek jika teks secara keseluruhan menggabungkan kata toksik tanpa spasi
  const compactText = normalized.replace(/\s+/g, "");
  for (const toxic of TOXIC_WORD_LIST) {
    if (toxic.length >= 4 && compactText.includes(toxic)) {
      return true;
    }
  }

  return false;
}

/**
 * Mengembalikan pesan peringatan jika teks terdeteksi mengandung konten toksik.
 */
export function getProfanityWarning(text: string | null | undefined): string | null {
  if (hasProfanity(text)) {
    return "Nama terdeteksi mengandung kata yang tidak pantas atau dilarang. Harap gunakan nama asli yang sopan dan profesional.";
  }
  return null;
}

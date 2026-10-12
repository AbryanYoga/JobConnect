/**
 * Modul deteksi dan proteksi prompt injection untuk screening CV berbasis AI.
 * Sesuai PRD 7.3, 7.4, dan 9.2:
 * Isi dokumen CV wajib diperlakukan semata-mata sebagai data teks pasif yang tidak tepercaya (untrusted data).
 * Jika terdeteksi instruksi yang berupaya memengaruhi sistem penilaian (seperti perintah ubah skor,
 * abaikan instruksi sebelumnya, dsb.), teks dinetralisir dan ditandai suspicious = true.
 */

export interface InjectionDetectionResult {
  isSuspicious: boolean;
  flags: string[];
  sanitizedText: string;
}

/**
 * Daftar pola regex untuk mendeteksi upaya manipulasi prompt (prompt injection & jailbreak)
 * dalam bahasa Indonesia maupun bahasa Inggris.
 */
export const PROMPT_INJECTION_PATTERNS: { name: string; pattern: RegExp }[] = [
  // Upaya override instruksi sistem
  {
    name: "ignore_previous",
    pattern: /(?:abaikan|lupakan|hiraukan|override|ignore|disregard|forget)\s+(?:semua\s+|seluruh\s+)?(?:instruksi|perintah|aturan|prompt|directions|instructions)/i,
  },
  {
    name: "system_prompt_override",
    pattern: /(?:system\s*prompt|prompt\s*sistem|mode\s*developer|jailbreak|developer\s*mode|dan\s*mode)/i,
  },
  {
    name: "new_identity",
    pattern: /(?:mulai\s+sekarang\s+kamu|sekarang\s+kamu\s+adalah|you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)\s+(?:bukan|sebuah|asisten|evaluator|admin)/i,
  },

  // Upaya manipulasi skor dan level
  {
    name: "score_manipulation",
    pattern: /(?:beri\s+(?:kandidat\s+ini\s+)?(?:nilai|skor)|give\s+(?:this\s+candidate\s+)?(?:score|rating))\s*(?:sempurna|maksimal|100|9\d|tinggi|perfect)/i,
  },
  {
    name: "score_instruction",
    pattern: /(?:wajib|harus|must|always)\s+(?:beri|hasilkan|menghasilkan|set|output)\s+(?:skor|score|level)\s*(?:=|:|\s)\s*(?:100|tinggi|high)/i,
  },

  // Upaya membajak format JSON respons
  {
    name: "json_hijack",
    pattern: /(?:output\s+(?:hanya|only)\s+json|format\s+json\s+berikut|return\s+(?:only\s+)?json)\s*:\s*\{[^}]*\"score\"\s*:\s*(?:100|9\d)/i,
  },
  {
    name: "suspicious_bypass",
    pattern: /(?:set\s+suspicious\s*(?:=|:)\s*false|jangan\s+tandai\s+suspicious|never\s+flag\s+suspicious)/i,
  },

  // Tag XML / delimiter breakout
  {
    name: "tag_breakout",
    pattern: /<\/?(?:untrusted_cv_content|system|instruction|prompt|evaluation)[^>]*>/i,
  },
];

/**
 * Memeriksa apakah suatu teks mengandung indikasi prompt injection.
 */
export function detectPromptInjection(text: string): {
  isSuspicious: boolean;
  flags: string[];
} {
  if (!text || typeof text !== "string") {
    return { isSuspicious: false, flags: [] };
  }

  const flags: string[] = [];

  for (const { name, pattern } of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      flags.push(name);
    }
  }

  return {
    isSuspicious: flags.length > 0,
    flags,
  };
}

/**
 * Membersihkan teks CV dan menetralkan potensi upaya prompt injection:
 * 1. Mengubah karakter kurung sudut tag XML agar tidak dapat menutup tag pembatas secara paksa.
 * 2. Menetralkan pola manipulasi yang terdeteksi dengan placeholder penjelas.
 * 3. Membungkus konten dalam delimiter data pasif <untrusted_cv_data>.
 */
export function sanitizeCvText(rawText: string): InjectionDetectionResult {
  if (!rawText || typeof rawText !== "string") {
    return {
      isSuspicious: false,
      flags: [],
      sanitizedText: "",
    };
  }

  const detection = detectPromptInjection(rawText);
  let cleaned = rawText;

  // 1. Escape kurung sudut XML untuk mencegah delimiter breakout
  cleaned = cleaned
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Netralkan pola instruksi manipulasi jika ditemukan
  if (detection.isSuspicious) {
    for (const { pattern } of PROMPT_INJECTION_PATTERNS) {
      cleaned = cleaned.replace(pattern, "[instruksi manipulasi diabaikan]");
    }
  }

  // 3. Batasi panjang teks maksimal untuk efisiensi token dan keamanan (maks 40.000 karakter ~ 8000 kata)
  const MAX_CV_TEXT_CHARS = 40000;
  if (cleaned.length > MAX_CV_TEXT_CHARS) {
    cleaned = cleaned.slice(0, MAX_CV_TEXT_CHARS) + "\n\n[... sisa dokumen teks dipotong untuk keamanan ...]";
  }

  // 4. Bungkus dalam tag pembatas data pasif
  const defensiveWrapped = `<untrusted_cv_data>\n${cleaned.trim()}\n</untrusted_cv_data>`;

  return {
    isSuspicious: detection.isSuspicious,
    flags: detection.flags,
    sanitizedText: defensiveWrapped,
  };
}

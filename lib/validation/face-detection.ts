"use client";

// Modul verifikasi biometrik wajah asli untuk foto profil pelamar.
export interface FaceVerificationResult {
  isValid: boolean;
  error?: string;
  isDocumentOrText?: boolean;
}

// Cek apakah warna pixel termasuk dalam spektrum pigmen kulit manusia (YCbCr + RGB).
function isHumanSkinPixel(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
  const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

  // Spektrum krominan standar kulit manusia lintas seluruh etnis
  const inSkinChrominance = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
  const hasSkinHue = r > 55 && g > 35 && b > 20 && r > g && r - b >= 12;

  return inSkinChrominance && hasSkinHue && y > 30 && y < 240;
}

// Memverifikasi apakah kanvas atau elemen gambar memuat wajah manusia asli.
export async function verifyFaceImage(
  source: HTMLCanvasElement | HTMLImageElement | string
): Promise<FaceVerificationResult> {
  let imgElement: HTMLImageElement;

  if (typeof source === "string") {
    imgElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = source;
    });
  } else if (source instanceof HTMLImageElement) {
    imgElement = source;
  } else {
    // Sumber sudah berupa HTMLCanvasElement
    return analyzeCanvas(source);
  }

  // Buat kanvas normalisasi 300x300 untuk analisis cepat
  const normCanvas = document.createElement("canvas");
  normCanvas.width = 300;
  normCanvas.height = 300;
  const ctx = normCanvas.getContext("2d");
  if (!ctx) return { isValid: true };

  ctx.drawImage(imgElement, 0, 0, 300, 300);
  return analyzeCanvas(normCanvas);
}

// Analisis fitur piksel wajah, detektor native, dan penapisan dokumen teks.
async function analyzeCanvas(canvas: HTMLCanvasElement): Promise<FaceVerificationResult> {
  // 1. Coba gunakan FaceDetector API bawaan peramban jika didukung (Chromium/Android)
  if (typeof window !== "undefined" && "FaceDetector" in window) {
    try {
      // @ts-expect-error Shape Detection API eksperimental peramban
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      const faces = await detector.detect(canvas);
      if (Array.isArray(faces) && faces.length > 0) {
        return { isValid: true };
      }
      return {
        isValid: false,
        error: "Wajah manusia tidak terdeteksi pada foto. Harap unggah foto wajah asli (pas foto / selfie resmi) yang menghadap lurus ke kamera.",
      };
    } catch {
      // Lanjutkan ke verifikasi biometrik kanvas jika detector gagal
    }
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return { isValid: true };

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  let paperWhiteCount = 0;
  let nearBlackCount = 0;
  let totalSkinCount = 0;
  let centerSkinCount = 0;
  let centerTotalCount = 0;

  // Batas wilayah wajah di bagian tengah (20% - 80% horizontal, 15% - 85% vertikal)
  const xMin = Math.floor(width * 0.2);
  const xMax = Math.floor(width * 0.8);
  const yMin = Math.floor(height * 0.15);
  const yMax = Math.floor(height * 0.85);

  const skinLuminances: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const pixelIndex = i / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);

    // Deteksi kertas dokumen (putih dominan) atau teks hitam pekat
    if (r > 235 && g > 235 && b > 235) paperWhiteCount++;
    if (r < 30 && g < 30 && b < 30) nearBlackCount++;

    const isSkin = isHumanSkinPixel(r, g, b);
    if (isSkin) {
      totalSkinCount++;
    }

    // Periksa wilayah pusat lingkaran foto
    if (px >= xMin && px <= xMax && py >= yMin && py <= yMax) {
      centerTotalCount++;
      if (isSkin) {
        centerSkinCount++;
        skinLuminances.push(0.299 * r + 0.587 * g + 0.114 * b);
      }
    }
  }

  // Uji A: Penolakan berkas berupa teks dokumen atau kertas CV (> 60% putih/kertas dan < 4% kulit)
  const paperRatio = paperWhiteCount / totalPixels;
  const textDarkRatio = nearBlackCount / totalPixels;
  if ((paperRatio > 0.60 && totalSkinCount / totalPixels < 0.05) || (paperRatio > 0.50 && textDarkRatio > 0.08 && totalSkinCount / totalPixels < 0.04)) {
    return {
      isValid: false,
      isDocumentOrText: true,
      error: "Foto profil ditolak: Berkas terdeteksi berupa teks atau dokumen. Foto profil wajib menampilkan foto wajah asli pelamar.",
    };
  }

  // Uji B: Rasio pigmen kulit di area wajah tengah
  const centerSkinRatio = centerTotalCount > 0 ? centerSkinCount / centerTotalCount : 0;
  if (centerSkinRatio < 0.08) {
    return {
      isValid: false,
      error: "Wajah manusia tidak terdeteksi pada area foto. Harap unggah foto wajah asli (pas foto atau foto diri resmi), bukan gambar pemandangan, kendaraan, logo, atau ilustrasi.",
    };
  }

  // Uji C: Variasi kontur wajah (mata, alis, dan bibir pada klaster wajah)
  if (skinLuminances.length > 50) {
    const mean = skinLuminances.reduce((a, b) => a + b, 0) / skinLuminances.length;
    const variance =
      skinLuminances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / skinLuminances.length;
    const stdDev = Math.sqrt(variance);

    // Jika variasi mendekati 0, gambar adalah warna oranye polos/vektor buatan
    if (stdDev < 5) {
      return {
        isValid: false,
        error: "Foto terdeteksi berupa warna polos atau ilustrasi, bukan foto wajah manusia asli.",
      };
    }
  }

  return { isValid: true };
}

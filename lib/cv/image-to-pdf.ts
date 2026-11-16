// Modul utilitas konversi berkas gambar CV (JPG, PNG, WEBP) menjadi dokumen PDF resmi.
// Membantu pelamar yang mengunggah CV berupa foto atau tangkapan layar dari ponsel.

export const SUPPORTED_CV_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const SUPPORTED_CV_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const CV_FORMAT_HELPER_TEXT = "Format didukung: PDF, JPG, PNG, atau WEBP (maksimal 2 MB)";

// Cek apakah berkas merupakan tipe dokumen atau gambar yang didukung
export function isSupportedCvFile(file: File): boolean {
  if (!file) return false;
  if (file.type === "application/pdf") return true;
  if (file.type.startsWith("image/")) {
    return (
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp"
    );
  }
  // Fallback berdasarkan ekstensi berkas
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "pdf" || ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
}

// Merakit struktur berkas PDF 1.4 murni yang memuat citra JPEG
function buildPdfFromJpeg(
  widthPt: number,
  heightPt: number,
  imgWidth: number,
  imgHeight: number,
  jpegBytes: Uint8Array
): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  let currentOffset = 0;
  const offsets: number[] = [];

  function addString(str: string) {
    const bytes = enc.encode(str);
    parts.push(bytes);
    currentOffset += bytes.length;
  }

  function addBytes(bytes: Uint8Array) {
    parts.push(bytes);
    currentOffset += bytes.length;
  }

  // 1. Header berkas PDF standar
  addString("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // 2. Object 1: Catalog
  offsets.push(currentOffset);
  addString("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // 3. Object 2: Pages
  offsets.push(currentOffset);
  addString("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // 4. Object 3: Page Definition
  offsets.push(currentOffset);
  addString(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // 5. Object 4: Image XObject
  offsets.push(currentOffset);
  addString(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  addBytes(jpegBytes);
  addString("\nendstream\nendobj\n");

  // 6. Object 5: Contents Stream
  offsets.push(currentOffset);
  const contentStream = `q\n${widthPt.toFixed(2)} 0 0 ${heightPt.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
  const contentBytes = enc.encode(contentStream);
  addString(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  addBytes(contentBytes);
  addString("endstream\nendobj\n");

  // 7. Tabel Cross-Reference (xref)
  const startXref = currentOffset;
  addString("xref\n0 6\n0000000000 65535 f \n");
  for (let i = 0; i < 5; i++) {
    const offStr = String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    addString(offStr);
  }

  // 8. Trailer dan penutup EOF
  addString(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

  // Gabungkan seluruh potongan Uint8Array menjadi satu berkas binary
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    result.set(part, pos);
    pos += part.length;
  }

  return result;
}

// Konversi berkas gambar menjadi berkas PDF standar di sisi peramban
export async function convertCvImageToPdf(file: File): Promise<File> {
  // Jika berkas sudah berformat PDF, langsung kembalikan berkas asli
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return file;
  }

  // Muat berkas gambar ke elemen Image peramban
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gagal membaca berkas gambar CV."));
      el.src = objectUrl;
    });

    let { naturalWidth: width, naturalHeight: height } = img;
    if (!width || !height) {
      throw new Error("Dimensi gambar CV tidak valid.");
    }

    // Batasi resolusi maksimal 2200px agar tajam namun ukuran berkas tetap di bawah 2 MB
    const maxDim = 2200;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    // Gambar ulang ke HTML5 Canvas untuk normalisasi format ke JPEG
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Gagal menginisialisasi kanvas gambar.");
    }

    // Isi latar belakang kanvas dengan warna putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // Dapatkan data binary JPEG dari kanvas
    const jpegBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88);
    });

    if (!jpegBlob) {
      throw new Error("Gagal mengompresi gambar CV ke format dokumen.");
    }

    const jpegBuffer = await jpegBlob.arrayBuffer();
    const jpegBytes = new Uint8Array(jpegBuffer);

    // Hitung dimensi halaman dalam satuan PDF point (A4 standar lebar 595.28 pt)
    const baseWidthPt = 595.28;
    const baseHeightPt = (baseWidthPt * height) / width;

    const pdfBytes = buildPdfFromJpeg(baseWidthPt, baseHeightPt, width, height, jpegBytes);

    // Beri nama berkas baru berakhiran .pdf
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const cleanFileName = `${baseName || "cv-pelamar"}.pdf`;

    return new File([pdfBytes.buffer as ArrayBuffer], cleanFileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

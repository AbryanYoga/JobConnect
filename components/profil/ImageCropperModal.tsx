"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, Check, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { verifyFaceImage } from "@/lib/validation/face-detection";

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => Promise<void>;
}

export function ImageCropperModal({
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard escape listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isProcessing]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch pan handlers (untuk HP & tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFaceError(null);
  };

  // Proses crop menggunakan HTML5 Canvas
  const handleApply = async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);
    setFaceError(null);

    try {
      const img = imageRef.current;
      const cropSize = 400; // Ukuran target kanvas (resolusi tajam 400x400)
      const canvas = document.createElement("canvas");
      canvas.width = cropSize;
      canvas.height = cropSize;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Gagal menginisialisasi canvas.");
      }

      // Ukuran wadah lingkaran di layar
      const viewportSize = 260;
      const scaleFactor = cropSize / viewportSize;

      // Hitung koordinat crop
      const centerX = viewportSize / 2;
      const centerY = viewportSize / 2;

      // Bersihkan kanvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cropSize, cropSize);

      // Gambar area yang dicrop
      ctx.save();
      ctx.translate(centerX * scaleFactor, centerY * scaleFactor);
      ctx.scale(scaleFactor, scaleFactor);
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      ctx.restore();

      // Validasi mutlak: pastikan area lingkaran hasil crop memuat wajah asli bukan teks
      const verification = await verifyFaceImage(canvas);
      if (!verification.isValid) {
        setFaceError(
          verification.error ||
            "Wajah manusia tidak terdeteksi pada area foto. Pastikan posisi lingkaran tepat pada wajah Anda."
        );
        setIsProcessing(false);
        return;
      }

      // Konversi ke Blob JPEG terkompresi (kualitas 0.88 menghasilkan berkas ~40-60 KB)
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const croppedFile = new File([blob], "avatar.jpg", {
            type: "image/jpeg",
          });
          await onCropComplete(croppedFile);
          setIsProcessing(false);
        },
        "image/jpeg",
        0.88
      );
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Posisikan dan potong foto profil"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-black/[0.08] shadow-card w-full max-w-md overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-black tracking-tight">
              Posisikan Foto Profil
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Geser gambar dan atur zoom agar pas di dalam lingkaran.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Tutup pemotong foto"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Crop */}
        <div className="p-6 bg-[#FAF8F0] flex flex-col items-center justify-center select-none">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`w-[260px] h-[260px] rounded-full overflow-hidden relative border-4 border-white shadow-card cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
          >
            {/* Lingkaran Panduan Overlay */}
            <div className="absolute inset-0 rounded-full border border-black/20 pointer-events-none z-10" />

            {/* Gambar yang diatur */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Foto yang akan dipotong"
              onLoad={() => setImageLoaded(true)}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
              className="absolute inset-0 m-auto"
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium mt-3 flex items-center gap-1">
            <span>Sentuh atau klik lalu geser untuk memposisikan foto.</span>
          </p>

          {/* Indikator Verifikasi Mutlak Wajah Asli */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/[0.08] text-[11px] font-semibold text-slate-700 mt-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Verifikasi Wajah Asli Aktif</span>
          </div>
        </div>

        {/* Peringatan Error Verifikasi Wajah Asli */}
        {faceError && (
          <div
            role="alert"
            className="mx-5 my-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <p className="font-bold text-red-900">Verifikasi Wajah Tidak Lolos</p>
              <p className="leading-relaxed">{faceError}</p>
            </div>
          </div>
        )}

        {/* Kontrol Zoom & Reset */}
        <div className="p-5 border-t border-black/[0.06] space-y-4 bg-white">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#0D0C23] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              aria-label="Atur perbesaran foto"
            />
            <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <button
              type="button"
              onClick={handleReset}
              title="Kembalikan posisi semula"
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || !imageLoaded}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-xs transition shadow-2xs hover:shadow min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Memproses & Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Terapkan & Simpan Foto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

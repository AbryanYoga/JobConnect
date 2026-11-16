"use client";

import { useSyncExternalStore } from "react";

// Daftarkan pendengar event perubahan foto profil peramban
function subscribeAvatar(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("jobconnect:avatar-changed", callback);
  return () => window.removeEventListener("jobconnect:avatar-changed", callback);
}

// Ambil nilai foto profil tersimpan dari penyimpanan lokal
function getAvatarSnapshot() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("jobconnect_user_avatar") || "";
  } catch {
    return "";
  }
}

// Nilai cadangan saat proses render di sisi server
function getAvatarServerSnapshot() {
  return "";
}

// Hook sinkronisasi foto profil aktif secara langsung
export function useSyncedAvatar(fallbackUrl?: string | null): string | null {
  const synced = useSyncExternalStore(
    subscribeAvatar,
    getAvatarSnapshot,
    getAvatarServerSnapshot
  );
  return synced || fallbackUrl || null;
}

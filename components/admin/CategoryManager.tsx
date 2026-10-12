"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderTree,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/admin";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  jobCount: number;
}

interface CategoryManagerProps {
  categories: CategoryItem[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();

  // State Modal Tambah
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // State Modal Edit
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");

  // State Modal Hapus
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  // Status loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetModals = () => {
    setIsAddOpen(false);
    setNewName("");
    setEditingCategory(null);
    setEditName("");
    setDeletingCategory(null);
    setErrorMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await createCategoryAction(newName);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal membuat kategori baru.");
      } else {
        setSuccessMessage("Kategori baru berhasil ditambahkan.");
        resetModals();
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat membuat kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await updateCategoryAction(editingCategory.id, editName);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui kategori.");
      } else {
        setSuccessMessage("Kategori berhasil diperbarui.");
        resetModals();
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat memperbarui kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal menghapus kategori.");
      } else {
        setSuccessMessage("Kategori berhasil dihapus.");
        resetModals();
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat menghapus kategori.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Tambah & Notifikasi Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-black tracking-tight">
            Daftar Kategori ({categories.length})
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kategori pekerjaan yang tersedia untuk penyaringan lowongan di portal publik.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetModals();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs shadow-2xs transition min-h-[44px] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabel Kategori Responsif */}
      <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F0] border-b border-black/[0.06] text-slate-500 font-bold uppercase tracking-wider">
                <th scope="col" className="px-6 py-4">Nama Kategori</th>
                <th scope="col" className="px-6 py-4">Slug Tautan</th>
                <th scope="col" className="px-6 py-4 text-center">Lowongan Terkait</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-black/[0.01] transition">
                  <td className="px-6 py-4 font-black text-black text-sm">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                    /kategori/{cat.slug}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        cat.jobCount > 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Briefcase className="w-3 h-3" aria-hidden="true" />
                      <span>{cat.jobCount} lowongan</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          resetModals();
                          setEditingCategory(cat);
                          setEditName(cat.name);
                        }}
                        className="p-2 rounded-xl hover:bg-black/[0.05] text-slate-700 hover:text-black transition cursor-pointer min-h-[36px]"
                        aria-label={`Edit kategori ${cat.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetModals();
                          setDeletingCategory(cat);
                        }}
                        disabled={cat.jobCount > 0}
                        title={
                          cat.jobCount > 0
                            ? "Kategori tidak dapat dihapus karena masih digunakan lowongan aktif."
                            : `Hapus kategori ${cat.name}`
                        }
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer min-h-[36px]"
                        aria-label={`Hapus kategori ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tambah Kategori */}
      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetModals();
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-md w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shrink-0">
                <FolderTree className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={resetModals}
                className="w-9 h-9 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer min-h-[36px]"
                aria-label="Tutup modal tambah"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 id="modal-add-title" className="text-lg font-black text-black tracking-tight">
                Tambah Kategori Pekerjaan
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Kategori baru akan langsung dapat dipilih saat perusahaan memasang lowongan.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="category-name-new" className="block text-xs font-bold text-slate-700">
                  Nama Kategori <span className="text-red-600">*</span>
                </label>
                <input
                  id="category-name-new"
                  type="text"
                  required
                  maxLength={50}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Logistik dan Pergudangan"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[44px]"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetModals}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full hover:bg-black/[0.05] text-black text-xs font-bold transition min-h-[44px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newName.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black text-xs font-black shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Kategori */}
      {editingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetModals();
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-md w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shrink-0">
                <Edit2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={resetModals}
                className="w-9 h-9 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer min-h-[36px]"
                aria-label="Tutup modal edit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 id="modal-edit-title" className="text-lg font-black text-black tracking-tight">
                Edit Nama Kategori
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Perubahan nama akan otomatis memperbarui slug tautan kategori terkait.
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="category-name-edit" className="block text-xs font-bold text-slate-700">
                  Nama Kategori <span className="text-red-600">*</span>
                </label>
                <input
                  id="category-name-edit"
                  type="text"
                  required
                  maxLength={50}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[44px]"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetModals}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full hover:bg-black/[0.05] text-black text-xs font-bold transition min-h-[44px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !editName.trim()}
                  className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Menyimpan..." : "Perbarui Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Hapus Kategori */}
      {deletingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") resetModals();
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-md w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={resetModals}
                className="w-9 h-9 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer min-h-[36px]"
                aria-label="Tutup dialog hapus"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 id="modal-delete-title" className="text-lg font-black text-black tracking-tight">
                Hapus Kategori
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Apakah Anda yakin ingin menghapus kategori <strong className="text-black">{deletingCategory.name}</strong>?
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Kategori hanya dapat dihapus jika tidak memiliki lowongan kerja terkait.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetModals}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-full hover:bg-black/[0.05] text-black text-xs font-bold transition min-h-[44px] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Menghapus..." : "Ya, Hapus Kategori"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

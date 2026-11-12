"use client";

import React, { useState } from "react";
import {
  FolderGit2,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  X,
  Code2,
  Calendar,
} from "lucide-react";
import type { PortfolioItem } from "@/lib/validation/profil";

interface PortfolioManagerProps {
  items: PortfolioItem[];
  onChange: (items: PortfolioItem[]) => void;
}

export function PortfolioManager({ items, onChange }: PortfolioManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulir state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [year, setYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setSkillsText("");
    setYear("");
    setFormError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (item: PortfolioItem) => {
    setTitle(item.title);
    setDescription(item.description || "");
    setUrl(item.url || "");
    setSkillsText(item.skills ? item.skills.join(", ") : "");
    setYear(item.year || "");
    setFormError(null);
    setIsAdding(false);
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setFormError("Judul proyek minimal 2 karakter.");
      return;
    }

    const trimmedUrl = url.trim();
    let validatedUrl: string | null = null;
    if (trimmedUrl) {
      try {
        const parsed = new URL(
          !/^https?:\/\//i.test(trimmedUrl) ? `https://${trimmedUrl}` : trimmedUrl
        );
        validatedUrl = parsed.toString();
      } catch {
        setFormError("Format URL proyek tidak valid. Contoh: https://myproject.com");
        return;
      }
    }

    const parsedSkills = skillsText
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      // Perbarui item yang sudah ada
      const updated = items.map((item) => {
        if (item.id === editingId) {
          return {
            ...item,
            title: trimmedTitle,
            description: description.trim(),
            url: validatedUrl,
            skills: parsedSkills,
            year: year.trim() || null,
          };
        }
        return item;
      });
      onChange(updated);
    } else {
      // Tambah item baru
      const newItem: PortfolioItem = {
        id: "proj_" + Math.random().toString(36).substring(2, 9),
        title: trimmedTitle,
        description: description.trim(),
        url: validatedUrl,
        skills: parsedSkills,
        year: year.trim() || null,
      };
      onChange([...items, newItem]);
    }

    resetForm();
  };

  return (
    <div className="space-y-4">
      {/* Daftar Item Portofolio yang Sudah Ada */}
      {items.length === 0 && !isAdding && !editingId && (
        <div className="p-6 rounded-2xl bg-[#FAF8F0]/70 border border-black/[0.08] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-amber-800" aria-hidden="true" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Belum ada karya atau proyek portofolio yang ditambahkan
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Menambahkan karya nyata (seperti aplikasi, desain, artikel, atau studi kasus)
            membuat profil akun Anda jauh lebih menarik bagi perusahaan mitra.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-black/[0.08] shadow-2xs hover:border-black/20 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {item.title}
                  </h4>
                  {item.year && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      <span>{item.year}</span>
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.skills && item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F0] text-slate-700 border border-black/[0.06]"
                      >
                        <Code2 className="w-2.5 h-2.5 text-slate-400" aria-hidden="true" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>Lihat Proyek</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Tanpa tautan demo
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    aria-label={`Ubah proyek ${item.title}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Hapus proyek ${item.title}`}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulir Tambah / Ubah Proyek */}
      {(isAdding || editingId) && (
        <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/10 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-black" aria-hidden="true" />
              <span>
                {editingId ? "Ubah Karya Portofolio" : "Tambah Karya / Proyek Portofolio"}
              </span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-slate-400 hover:text-black hover:bg-black/[0.05] transition"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="portfolio-title" className="block text-xs font-bold text-slate-800 mb-1">
                Judul Proyek / Karya <span className="text-red-500">*</span>
              </label>
              <input
                id="portfolio-title"
                type="text"
                placeholder="Contoh: Redesign Aplikasi Kasir Toko, Web Toko Online"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-xs font-medium text-slate-900 focus:border-black focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="portfolio-url" className="block text-xs font-bold text-slate-800 mb-1">
                  Tautan Live Demo / Repositori (Opsional)
                </label>
                <input
                  id="portfolio-url"
                  type="url"
                  placeholder="https://github.com/proyek-anda"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-xs font-medium text-slate-900 focus:border-black focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="portfolio-year" className="block text-xs font-bold text-slate-800 mb-1">
                  Tahun Pembuatan (Opsional)
                </label>
                <input
                  id="portfolio-year"
                  type="text"
                  placeholder="Contoh: 2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-xs font-medium text-slate-900 focus:border-black focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="portfolio-skills" className="block text-xs font-bold text-slate-800 mb-1">
                Keahlian / Teknologi yang Dipakai (Pisahkan dengan koma)
              </label>
              <input
                id="portfolio-skills"
                type="text"
                placeholder="Contoh: React, Next.js, Figma, Tailwind CSS"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-xs font-medium text-slate-900 focus:border-black focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="portfolio-desc" className="block text-xs font-bold text-slate-800 mb-1">
                Deskripsi Singkat Proyek
              </label>
              <textarea
                id="portfolio-desc"
                rows={2}
                placeholder="Ceritakan peran Anda dan tantangan yang diselesaikan dalam proyek ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-xs font-medium text-slate-900 focus:border-black focus:outline-none transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-black hover:bg-black/[0.05] transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D0C23] text-white hover:bg-slate-800 font-bold text-xs shadow-2xs transition"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{editingId ? "Perbarui Proyek" : "Tambahkan ke Portofolio"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tombol Buka Formulir Tambah */}
      {!isAdding && !editingId && (
        <button
          type="button"
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-dashed border-black/20 hover:border-black text-xs font-bold text-slate-800 transition shadow-2xs min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>Tambah Karya / Proyek Portofolio</span>
        </button>
      )}
    </div>
  );
}


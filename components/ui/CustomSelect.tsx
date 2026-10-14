"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  variant?: "default" | "pill" | "hero";
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
}

export function CustomSelect({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  placeholder = "Pilih salah satu",
  icon,
  searchable = false,
  searchPlaceholder = "Cari pilihan...",
  disabled = false,
  variant = "default",
  className = "",
  containerClassName = "",
  dropdownClassName = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const generatedId = useId();
  const selectId = `custom-select-${generatedId}`;

  // Temukan label opsi terpilih
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter opsi berdasarkan pencarian jika fitur searchable aktif
  const filteredOptions = searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : options;

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fokus ke input pencarian saat dropdown terbuka
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Dukungan tombol Escape & navigasi keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown" && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleSelectOption = (optValue: string, isOptDisabled?: boolean) => {
    if (isOptDisabled) return;
    onChange(optValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Gaya pemicu berdasarkan varian
  let triggerClasses = "";
  if (variant === "hero") {
    triggerClasses =
      "flex items-center gap-2 bg-transparent text-xs sm:text-sm font-bold text-slate-800 hover:text-black py-2 px-3 rounded-full cursor-pointer transition select-none focus-visible:outline-2 focus-visible:outline-black";
  } else if (variant === "pill") {
    triggerClasses =
      "flex items-center justify-between gap-2.5 w-full bg-[#FAF8F0] hover:bg-white text-xs sm:text-sm font-semibold text-slate-900 py-2.5 px-4 rounded-full border border-black/[0.08] hover:border-black/20 shadow-2xs transition cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-black";
  } else {
    triggerClasses = `flex items-center justify-between gap-2.5 w-full bg-[#FAF8F0] hover:bg-white text-xs sm:text-sm font-medium text-slate-900 py-3 px-3.5 rounded-xl border border-black/[0.08] hover:border-black/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition cursor-pointer select-none ${
      error ? "border-red-500 focus:ring-red-200" : ""
    }`;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-50" : "z-auto"} ${containerClassName}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5 select-none"
        >
          {label}
        </label>
      )}

      {/* Tombol Pemicu Dropdown */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`${triggerClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`.trim()}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {icon && (
            <span className="shrink-0 text-slate-500" aria-hidden="true">
              {icon}
            </span>
          )}
          <span
            className={`truncate ${
              selectedOption ? "text-slate-900 font-semibold" : "text-slate-500"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-black" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Menu Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 z-50 mt-1.5 bg-white border border-black/10 rounded-[22px] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`.trim()}
          style={{ minWidth: "220px" }}
        >
          {/* Kolom Pencarian Cepat di Dalam Dropdown */}
          {searchable && (
            <div className="p-1.5 pb-2 border-b border-black/[0.06] mb-1">
              <div className="relative flex items-center">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-2 text-xs bg-[#FAF8F0] text-slate-900 placeholder:text-slate-400 rounded-xl border border-black/[0.06] focus:outline-none focus:border-black font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-slate-400 hover:text-black p-0.5"
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Daftar Opsi */}
          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto space-y-1 p-0.5 custom-dropdown-scroll focus:outline-none rounded-xl"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3.5 py-4 text-xs text-center text-slate-500 font-medium">
                Pilihan tidak ditemukan
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectOption(opt.value, opt.disabled)}
                    className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer select-none ${
                      opt.disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#FFDD00] text-black font-bold shadow-2xs"
                        : "text-slate-800 hover:bg-[#FAF8F0] hover:text-black"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-black shrink-0 stroke-[2.5]" aria-hidden="true" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Pesan Error atau Helper */}
      {error && (
        <p role="alert" className="text-xs text-red-600 mt-1.5 font-bold">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          {helperText}
        </p>
      )}
    </div>
  );
}

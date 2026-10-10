"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Generate pagination items (dengan pemotong elipsis jika halaman banyak)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Jumlah halaman sebelum dan sesudah halaman aktif

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems ?? currentPage * pageSize);

  return (
    <nav
      role="navigation"
      aria-label="Navigasi Halaman"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 mt-6"
    >
      {/* Keterangan Halaman & Jumlah Item */}
      <div className="text-xs sm:text-sm text-slate-600">
        {totalItems !== undefined ? (
          <span>
            Menampilkan data ke{" "}
            <strong className="text-navy-950 font-bold">{startItem}</strong> sampai{" "}
            <strong className="text-navy-950 font-bold">{endItem}</strong> dari total{" "}
            <strong className="text-navy-950 font-bold">{totalItems}</strong>
          </span>
        ) : (
          <span>
            Halaman <strong className="text-navy-950 font-bold">{currentPage}</strong> dari{" "}
            <strong className="text-navy-950 font-bold">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Kontrol Tombol Pagination */}
      <ul className="inline-flex items-center gap-1 list-none m-0 p-0">
        {/* Tombol Sebelumnya */}
        <li>
          {hasPrev ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy-900 transition min-h-[44px] min-w-[44px]"
              aria-label="Ke halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-400 cursor-not-allowed select-none min-h-[44px] min-w-[44px]"
              aria-disabled="true"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </span>
          )}
        </li>

        {/* Nomor Halaman */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <li key={`ellipsis-${idx}`} className="px-2 text-slate-400 select-none">
                ...
              </li>
            );
          }

          const pageNum = p as number;
          const isCurrent = pageNum === currentPage;

          return (
            <li key={`page-${pageNum}`}>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-md bg-navy-900 text-white text-xs sm:text-sm font-bold shadow-2xs min-h-[44px] min-w-[44px]"
                >
                  {pageNum}
                </span>
              ) : (
                <Link
                  href={createPageUrl(pageNum)}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-md border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy-900 transition min-h-[44px] min-w-[44px]"
                  aria-label={`Ke halaman ${pageNum}`}
                >
                  {pageNum}
                </Link>
              )}
            </li>
          );
        })}

        {/* Tombol Selanjutnya */}
        <li>
          {hasNext ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy-900 transition min-h-[44px] min-w-[44px]"
              aria-label="Ke halaman selanjutnya"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-400 cursor-not-allowed select-none min-h-[44px] min-w-[44px]"
              aria-disabled="true"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

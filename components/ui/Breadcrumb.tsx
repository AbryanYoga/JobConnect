"use client";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb(_props?: BreadcrumbProps) {
  void _props;
  // Breadcrumb dinonaktifkan sesuai permintaan pengguna demi tata letak yang lebih ringkas dan bersih
  return null;
}

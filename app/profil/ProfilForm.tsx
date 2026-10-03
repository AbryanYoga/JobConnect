"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, Sparkles, Bell, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  profilPelamarSchema,
  HEADLINE_MAX,
  NAME_MIN,
  NAME_MAX,
} from "@/lib/validation/profil";
import { fieldErrors } from "@/lib/validation/helpers";

interface ProfilFormProps {
  initialData: {
    name: string;
    email: string;
    phone: string | null;
    headline: string | null;
    emailNotifications: boolean;
  };
  onSave?: (data: {
    name: string;
    phone: string | null;
    headline: string | null;
    emailNotifications: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function ProfilForm({ initialData, onSave }: ProfilFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone || "");
  const [headline, setHeadline] = useState(initialData.headline || "");
  const [emailNotifications, setEmailNotifications] = useState(
    initialData.emailNotifications
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const validationResult = profilPelamarSchema.safeParse({
      name,
      phone: phone || null,
      headline: headline || null,
      emailNotifications,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});

    if (onSave) {
      setIsSubmitting(true);
      const res = await onSave(validationResult.data);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage("Profil Anda berhasil diperbarui.");
        router.refresh();
      } else if (res.error) {
        setErrors({ general: res.error });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-control bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 shrink-0 text-green-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.general && (
        <div
          role="alert"
          className="p-4 rounded-control bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {errors.general}
        </div>
      )}

      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Informasi Pribadi
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Data ini digunakan saat Anda mengirimkan lamaran ke lowongan pekerjaan.
          </p>
        </div>

        {/* Nama Lengkap */}
        <Input
          id="profil-name"
          label="Nama Lengkap"
          required
          type="text"
          placeholder="Contoh: Budi Santoso"
          leftIcon={<User className="w-4 h-4" />}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          helperText={`Panjang nama antara ${NAME_MIN} sampai ${NAME_MAX} karakter.`}
          error={errors.name}
        />

        {/* Alamat Email (Read-Only) */}
        <div>
          <Input
            id="profil-email"
            label="Alamat Email"
            type="email"
            value={initialData.email}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Email terhubung dengan akun login Anda dan tidak dapat diubah di sini."
          />
        </div>

        {/* Nomor Telepon */}
        <Input
          id="profil-phone"
          label="Nomor Telepon (WhatsApp)"
          type="tel"
          placeholder="Contoh: 081234567890"
          leftIcon={<Phone className="w-4 h-4" />}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
          }}
          helperText="Gunakan nomor Indonesia aktif (format 08xx atau +628xx)."
          error={errors.phone}
        />

        {/* Headline Profesional */}
        <div>
          <Input
            id="profil-headline"
            label="Headline Profesional"
            type="text"
            placeholder="Contoh: Frontend Developer dengan keahlian React dan Next.js"
            leftIcon={<Sparkles className="w-4 h-4" />}
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              if (errors.headline) setErrors((prev) => ({ ...prev, headline: "" }));
            }}
            helperText={`Ringkasan singkat profesi atau minat kerja Anda (maksimal ${HEADLINE_MAX} karakter).`}
            error={errors.headline}
          />
        </div>
      </div>

      {/* Preferensi Pemberitahuan */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Preferensi Notifikasi
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Atur bagaimana platform mengirimkan informasi pembaruan penting kepada Anda.
          </p>
        </div>

        <label
          htmlFor="notifikasi-email"
          className="flex items-start gap-3.5 p-4 rounded-control border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer select-none"
        >
          <input
            id="notifikasi-email"
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded-sm border-slate-300 text-navy-700 focus:ring-navy-600 focus:ring-offset-1 accent-navy-700"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900">
                Notifikasi Email Status Lamaran
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dapatkan pemberitahuan otomatis ke email saat perusahaan memperbarui
              status lamaran Anda (misalnya saat dijadwalkan wawancara atau lolos seleksi).
            </p>
          </div>
        </label>
      </div>

      {/* Tombol Simpan */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="px-6"
        >
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}

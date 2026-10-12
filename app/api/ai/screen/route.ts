import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { screenApplicationCv } from "@/lib/ai/screening";

export const maxDuration = 60; // 60 detik batas waktu eksekusi untuk proses analisis AI
export const dynamic = "force-dynamic";

const ScreenRequestSchema = z.object({
  applicationId: z.number().int().positive("ID lamaran tidak valid."),
});

export async function POST(request: Request) {
  try {
    // 1. Verifikasi autentikasi pengguna
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi login tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    // 2. Parse dan validasi body request
    let bodyJson: unknown;
    try {
      bodyJson = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Format request body harus berupa JSON." },
        { status: 400 }
      );
    }

    const parsedBody = ScreenRequestSchema.safeParse(bodyJson);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || "Input tidak valid." },
        { status: 400 }
      );
    }

    const { applicationId } = parsedBody.data;

    // 3. Panggil proses screening CV dari modul server terisolasi di lib/ai/
    const result = await screenApplicationCv(applicationId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Gagal memproses screening CV." },
        { status: result.statusCode || 500 }
      );
    }

    // Sesuai PRD 7.1: respons klien tidak membocorkan skor langsung ke pelamar
    return NextResponse.json({
      success: true,
      applicationId: result.applicationId,
      status: result.status,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal pada server.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

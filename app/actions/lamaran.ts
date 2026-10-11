"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action untuk menarik lamaran kerja oleh pelamar.
 * Memanggil fungsi PostgreSQL change_application_status dengan status 'ditarik'.
 */
export async function tarikLamaranAction(applicationId: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Sesi login Anda telah berakhir. Silakan masuk kembali.",
      };
    }

    const { error: rpcError } = await supabase.rpc("change_application_status", {
      p_application_id: applicationId,
      p_to_status: "ditarik",
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal menarik berkas lamaran.",
      };
    }

    revalidatePath(`/lamaran-saya/${applicationId}`);
    revalidatePath("/lamaran-saya");

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi gangguan saat memproses penarikan lamaran.";
    return { success: false, error: message };
  }
}

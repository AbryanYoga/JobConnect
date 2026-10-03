import { ZodError, flattenError } from "zod";

/**
 * Mengembalikan objek pesan error pertama untuk tiap field dari ZodError.
 * Memakai API flattenError dari Zod 4 agar format error form seragam.
 */
export function fieldErrors(error: ZodError): Record<string, string> {
  const { fieldErrors: rawFieldErrors } = flattenError(error) as {
    fieldErrors: Record<string, string[] | undefined>;
  };
  const result: Record<string, string> = {};

  for (const [key, messages] of Object.entries(rawFieldErrors)) {
    if (messages && messages.length > 0) {
      result[key] = messages[0];
    }
  }

  return result;
}

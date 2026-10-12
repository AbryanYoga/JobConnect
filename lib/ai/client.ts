import "server-only";

/**
 * Modul klien Claude API untuk screening CV di JobConnect.
 * Berjalan eksklusif pada server-side (Node.js runtime).
 * Mendukung pengiriman berkas dokumen PDF secara langsung via Content Blocks.
 */

export const DEFAULT_AI_MODEL = "claude-3-5-haiku-20241022";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = "2023-06-01";
const DEFAULT_TIMEOUT_MS = 60000; // 60 detik

export interface ClaudeDocumentSource {
  type: "base64";
  media_type: "application/pdf";
  data: string;
}

export type ClaudeContentBlock =
  | { type: "text"; text: string }
  | { type: "document"; source: ClaudeDocumentSource };

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[];
}

export interface CallClaudeOptions {
  systemPrompt?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface ClaudeApiResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export function getClaudeApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Kunci ANTHROPIC_API_KEY belum dikonfigurasi pada variabel lingkungan."
    );
  }
  return apiKey.trim();
}

export function getClaudeModel(): string {
  return process.env.AI_MODEL || DEFAULT_AI_MODEL;
}

/**
 * Memanggil endpoint messages dari Anthropic Claude API.
 */
export async function callClaudeApi(
  options: CallClaudeOptions
): Promise<string> {
  const apiKey = getClaudeApiKey();
  const model = getClaudeModel();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload: {
      model: string;
      max_tokens: number;
      messages: ClaudeMessage[];
      temperature: number;
      system?: string;
    } = {
      model,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature ?? 0.1, // Temperatur rendah untuk penilaian deterministik
      messages: options.messages,
    };

    if (options.systemPrompt) {
      payload.system = options.systemPrompt;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Claude API mengembalikan status error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // Abaikan parse error, gunakan pesan default
      }
      throw new Error(`Gagal memanggil Claude API: ${errorMessage}`);
    }

    const data = (await response.json()) as ClaudeApiResponse;
    const textBlock = data.content?.find((block) => block.type === "text");

    if (!textBlock || !textBlock.text) {
      throw new Error("Respons Claude API tidak memuat blok teks yang valid.");
    }

    return textBlock.text;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Permintaan ke Claude API melampaui batas waktu (${timeoutMs / 1000} detik).`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Helper praktis untuk mengirimkan dokumen PDF dan instruksi teks sekaligus ke Claude API.
 */
export async function callClaudeWithPdf({
  systemPrompt,
  promptText,
  pdfBase64,
  maxTokens,
  timeoutMs,
}: {
  systemPrompt?: string;
  promptText: string;
  pdfBase64: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  const contentBlocks: ClaudeContentBlock[] = [
    {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: pdfBase64,
      },
    },
    {
      type: "text",
      text: promptText,
    },
  ];

  return callClaudeApi({
    systemPrompt,
    messages: [
      {
        role: "user",
        content: contentBlocks,
      },
    ],
    maxTokens,
    timeoutMs,
  });
}

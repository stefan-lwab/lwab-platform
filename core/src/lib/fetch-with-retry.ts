const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface RetryOptions {
  retries?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
}

export function newTraceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  }
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

/** fetch() with timeout, exponential backoff and jitter. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  { retries = 3, timeoutMs = 15_000, baseDelayMs = 400 }: RetryOptions = {},
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      if (!RETRYABLE_STATUS.has(res.status) || attempt === retries) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === retries) break;
    }
    const delay = baseDelayMs * 2 ** attempt + Math.random() * 200;
    await new Promise((r) => setTimeout(r, delay));
  }

  throw lastError instanceof Error ? lastError : new Error("Network error");
}

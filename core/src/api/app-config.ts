import { fetchWithRetry, newTraceId } from "../lib/fetch-with-retry";
import type { ResolvedLwabConfig } from "../config";

/**
 * Calls the JARVIS `app-config` edge function.
 * The gateway needs the anon key; the security gate needs the user's JWT in
 * `x-user-token`. Sending only the anon key returns 401 for sensitive reads.
 */
export async function callAppConfig(
  cfg: ResolvedLwabConfig,
  body: Record<string, unknown>,
  opts: { userToken?: string; traceId?: string } = {},
): Promise<{ data: any; error: string | null; traceId: string }> {
  const traceId = opts.traceId || newTraceId();

  try {
    let token = opts.userToken;
    if (!token) {
      try {
        const {
          data: { session },
        } = await cfg.supabase.auth.getSession();
        token = session?.access_token;
      } catch {
        /* logged out — proceed unauthenticated */
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: cfg.supabaseAnonKey,
      Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      "x-trace-id": traceId,
    };
    if (token) headers["x-user-token"] = token;

    const res = await fetchWithRetry(`${cfg.functionsUrl}/app-config`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: data?.error || data?.message || `HTTP ${res.status}`,
        traceId,
      };
    }
    return { data, error: null, traceId };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      traceId,
    };
  }
}

/** Generic authenticated call to any JARVIS edge function. */
export async function callJarvisFunction(
  cfg: ResolvedLwabConfig,
  fn: string,
  body: Record<string, unknown>,
  opts: { traceId?: string } = {},
): Promise<{ data: any; error: string | null; traceId: string }> {
  const traceId = opts.traceId || newTraceId();
  try {
    const {
      data: { session },
    } = await cfg.supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: cfg.supabaseAnonKey,
      Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      "x-trace-id": traceId,
    };
    if (session?.access_token) headers["x-user-token"] = session.access_token;

    const res = await fetchWithRetry(`${cfg.functionsUrl}/${fn}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        data: null,
        error: data?.error || data?.message || `HTTP ${res.status}`,
        traceId,
      };
    }
    return { data, error: null, traceId };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      traceId,
    };
  }
}

import { callJarvisFunction } from "../api/app-config";
import type { ResolvedLwabConfig } from "../config";

export type NotifySeverity = "info" | "success" | "warning" | "critical";

export interface NotifyInput {
  /** Dotted event key declared in the app's manifest, e.g. "booking.created". */
  event_type: string;
  /** Explicit recipients (auth user ids). */
  target_user_ids?: string[];
  /** Or a JARVIS-resolved group, e.g. a job title or role code. */
  target_group?: string;
  /** Or every member of a project. */
  target_project_id?: string;
  payload?: Record<string, unknown>;
  severity?: NotifySeverity;
  /** Deep link opened from the notification. */
  url?: string;
  title?: string;
  body?: string;
}

/**
 * The ONLY sanctioned way to emit a user-facing event.
 * Never insert into notification tables directly — this routes through
 * send-notification → novu-trigger so severity, digests, channel preferences,
 * quiet hours and the delivery log all apply.
 */
export async function notify(
  cfg: ResolvedLwabConfig,
  input: NotifyInput,
): Promise<{ ok: boolean; error: string | null; traceId: string }> {
  if (!input.target_user_ids?.length && !input.target_group && !input.target_project_id) {
    return {
      ok: false,
      error:
        "notify() refused: no recipients. Pass target_user_ids, target_group or target_project_id — never broadcast implicitly.",
      traceId: "",
    };
  }

  const { error, traceId } = await callJarvisFunction(cfg, "send-notification", {
    app_code: cfg.appCode,
    severity: "info",
    ...input,
  });

  if (error && cfg.debug !== false) {
    console.warn(`[lwab-core] notify(${input.event_type}) failed: ${error}`);
  }

  return { ok: !error, error, traceId };
}

/** Hook form so components don't have to thread the config through. */
import { useCallback } from "react";
import { useLwab } from "../config";

export function useNotify() {
  const cfg = useLwab();
  return useCallback((input: NotifyInput) => notify(cfg, input), [cfg]);
}

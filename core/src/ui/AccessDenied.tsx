import React from "react";
import { useLwab } from "../config";
import { usePermissions } from "../permissions/use-permissions";
import { callJarvisFunction } from "../api/app-config";

export type AccessDeniedVariant = "permission" | "error";

/**
 * The single access-denied surface for the whole ecosystem.
 * `variant="permission"` = the user is missing a grant (fixable in JARVIS).
 * `variant="error"`      = the permission service itself failed (a code/infra bug).
 * Copy is Swedish-primary, matching the UI Message Catalog.
 */
export function AccessDenied({
  module,
  action = "view",
  variant = "permission",
  detail,
}: {
  module: string;
  action?: string;
  variant?: AccessDeniedVariant;
  detail?: string;
}) {
  const cfg = useLwab();
  const { subject } = usePermissions();
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  const requestAccess = async () => {
    setStatus("sending");
    const { error } = await callJarvisFunction(cfg, "app-config", {
      action: "request_access",
      app_code: cfg.appCode,
      module_code: module,
      requested_action: action,
      user_id: subject.user_id ?? undefined,
    });
    setStatus(error ? "failed" : "sent");
  };

  const isPermission = variant === "permission";

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border/50 bg-card/60 p-6 text-center backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">
          {isPermission ? "Åtkomst krävs" : "Tekniskt fel"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPermission
            ? `Du saknar behörighet till ${module} i ${cfg.appName || cfg.appCode.toUpperCase()}.`
            : "Behörigheterna kunde inte läsas in. Detta är inte ett behörighetsfel utan ett tekniskt fel."}
        </p>

        {detail && (
          <p className="mt-2 break-words text-xs text-muted-foreground/70">{detail}</p>
        )}

        {isPermission && (
          <div className="mt-5">
            {status === "sent" ? (
              <p className="text-sm text-primary">
                Din begäran har skickats till administratören.
              </p>
            ) : (
              <button
                type="button"
                onClick={requestAccess}
                disabled={status === "sending"}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "sending" ? "Skickar…" : "Begär åtkomst"}
              </button>
            )}
            {status === "failed" && (
              <p className="mt-2 text-xs text-destructive">
                Begäran kunde inte skickas. Försök igen.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

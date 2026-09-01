import React from "react";
import { usePermissions } from "./use-permissions";
import { useLwab } from "../config";
import { AccessDenied } from "../ui/AccessDenied";

/** Auth-level guard: renders `fallback` while signed out. */
export function ProtectedRoute({
  children,
  fallback,
  onUnauthenticated,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
}) {
  const cfg = useLwab();
  const [state, setState] = React.useState<"loading" | "in" | "out">("loading");

  React.useEffect(() => {
    let active = true;
    const apply = (session: unknown) => {
      if (active) setState(session ? "in" : "out");
    };
    const { data: sub } = cfg.supabase.auth.onAuthStateChange((_e, s) =>
      apply(s),
    );
    cfg.supabase.auth.getSession().then(({ data }) => apply(data.session));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [cfg.supabase]);

  React.useEffect(() => {
    if (state === "out") onUnauthenticated?.();
  }, [state, onUnauthenticated]);

  if (state === "loading") return <LoadingPane />;
  if (state === "out") return <>{fallback ?? null}</>;
  return <>{children}</>;
}

/**
 * Module-level guard. On denial it always renders the shared access-denied
 * state with a Request Access button — never a blank page or silent redirect,
 * so a permission problem is distinguishable from a code error.
 */
export function ModuleGuard({
  module,
  action = "view",
  children,
}: {
  module: string;
  action?: string;
  children: React.ReactNode;
}) {
  const { isLoading, error, can } = usePermissions();

  if (isLoading) return <LoadingPane />;

  if (error) {
    return (
      <AccessDenied
        module={module}
        variant="error"
        detail={error}
      />
    );
  }

  if (!can(module, action)) {
    return <AccessDenied module={module} action={action} variant="permission" />;
  }

  return <>{children}</>;
}

function LoadingPane() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

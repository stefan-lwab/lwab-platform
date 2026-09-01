import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLwab } from "../config";
import { callAppConfig } from "../api/app-config";
import {
  getCached,
  invalidateCache,
  permissionCacheKey,
  setCache,
  uniqueChannelName,
} from "../lib/cache";

export interface VisibleModule {
  module_code: string;
  module_name: string;
  description?: string;
}

export interface PermissionSubject {
  user_id?: string | null;
  profile_id?: string | null;
  employee_id?: string | null;
}

export interface PermissionState {
  isLoading: boolean;
  error: string | null;
  /** module_code -> allowed actions */
  permissions: Record<string, string[]>;
  visibleModules: VisibleModule[];
  isAdmin: boolean;
  canonicalRole: string | null;
  subject: PermissionSubject;
  can: (moduleCode: string, action?: string) => boolean;
  refresh: (opts?: { bypassCache?: boolean }) => Promise<void>;
}

/** Tables whose changes must invalidate a cached permission set. */
const WATCHED_TABLES = [
  "user_roles",
  "app_user_roles",
  "job_title_permissions",
  "user_app_permissions",
  "app_permission_templates",
  "app_modules",
];

const PermissionContext = createContext<PermissionState | null>(null);

export function LwabPermissionProvider({
  children,
  enableRealtime = true,
}: {
  children: React.ReactNode;
  enableRealtime?: boolean;
}) {
  const state = useProvidePermissions(enableRealtime);
  return (
    <PermissionContext.Provider value={state}>
      {children}
    </PermissionContext.Provider>
  );
}

/** Read the ambient permission state. Requires <LwabPermissionProvider>. */
export function usePermissions(): PermissionState {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error(
      "[@lwab/core] usePermissions() requires <LwabPermissionProvider> above it.",
    );
  }
  return ctx;
}

function useProvidePermissions(enableRealtime: boolean): PermissionState {
  const cfg = useLwab();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [visibleModules, setVisibleModules] = useState<VisibleModule[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canonicalRole, setCanonicalRole] = useState<string | null>(null);
  const [subject, setSubject] = useState<PermissionSubject>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const retries = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Track the session — permissions are meaningless without one. */
  useEffect(() => {
    let active = true;

    const apply = (session: any) => {
      if (!active) return;
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? undefined);
      if (!session) setIsLoading(false);
    };

    const { data: sub } = cfg.supabase.auth.onAuthStateChange((_e, session) =>
      apply(session),
    );
    cfg.supabase.auth.getSession().then(({ data }) => apply(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [cfg.supabase]);

  const fetchPermissions = useCallback(
    async ({ bypassCache = false }: { bypassCache?: boolean } = {}) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      const key = permissionCacheKey(cfg.appCode, userId);

      if (!bypassCache) {
        const cached = getCached<any>(key);
        if (cached) {
          applyPayload(cached);
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        const { data, error: fnError } = await callAppConfig(cfg, {
          action: "get_user_permissions",
          app_code: cfg.appCode,
          user_id: userId,
          user_email: userEmail,
        });

        if (fnError) throw new Error(fnError);

        if (data?.success) {
          applyPayload(data);
          setCache(key, data);
          setError(null);
          retries.current = 0;
        } else {
          setError(data?.error || "Failed to fetch permissions");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        if (retries.current < 3) {
          const delay = 2 ** retries.current * 1000;
          retries.current += 1;
          timer.current = setTimeout(
            () => fetchPermissions({ bypassCache: true }),
            delay,
          );
        }
      } finally {
        setIsLoading(false);
      }

      function applyPayload(data: any) {
        setPermissions(data.permissions || {});
        setVisibleModules(data.visible_modules || []);
        // Authoritative: the top-level API field, never an employee column,
        // never a JWT claim, never localStorage.
        setIsAdmin(data.is_admin === true);
        setCanonicalRole(data.canonical_role ?? null);
        setSubject(
          data.permission_subject || {
            user_id: userId,
            profile_id: data.employee?.id ?? null,
            employee_id: data.employee?.id ?? null,
          },
        );
      }
    },
    [cfg, userId, userEmail],
  );

  useEffect(() => {
    fetchPermissions();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fetchPermissions]);

  /* Force-fresh read when the window regains focus. */
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => fetchPermissions({ bypassCache: true });
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId, fetchPermissions]);

  /* Realtime invalidation. All .on() handlers before .subscribe(). */
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const onChange = () => {
      invalidateCache(permissionCacheKey(cfg.appCode, userId));
      fetchPermissions({ bypassCache: true });
    };

    const channel: RealtimeChannel = cfg.supabase.channel(
      uniqueChannelName(`lwab-perms-${userId}`),
    );
    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table },
        onChange,
      );
    }
    channel.subscribe();

    return () => {
      cfg.supabase.removeChannel(channel);
    };
  }, [enableRealtime, userId, cfg, fetchPermissions]);

  const can = useCallback(
    (moduleCode: string, action: string = "view") => {
      if (isAdmin) return true;
      return (permissions[moduleCode] || []).includes(action);
    },
    [isAdmin, permissions],
  );

  return {
    isLoading,
    error,
    permissions,
    visibleModules,
    isAdmin,
    canonicalRole,
    subject,
    can,
    refresh: (opts) => fetchPermissions(opts ?? { bypassCache: true }),
  };
}

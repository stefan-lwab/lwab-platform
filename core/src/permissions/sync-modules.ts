import { callAppConfig } from "../api/app-config";
import type { ResolvedLwabConfig } from "../config";
import { STANDARD_ACTIONS } from "../config";

export interface ModuleManifestEntry {
  module_code: string;
  module_name: string;
  description?: string;
  actions?: readonly string[];
}

/** Fill in the standard 7 actions for entries that don't override them. */
export function normalizeManifest(
  modules: ModuleManifestEntry[],
): ModuleManifestEntry[] {
  return modules.map((m) => ({
    ...m,
    actions: m.actions?.length ? m.actions : [...STANDARD_ACTIONS],
  }));
}

let synced = false;

/**
 * Registers this app's module manifest with JARVIS.
 *
 * Rules baked in:
 *  - never runs without a session (a cold load lands on the login screen and
 *    would 401), and does NOT set the latch in that case;
 *  - re-runs on SIGNED_IN and TOKEN_REFRESHED;
 *  - swallows errors so the app still works if JARVIS is unreachable;
 *  - additive and idempotent — never writes app_modules directly.
 *
 * Wire once: useEffect(() => initModuleSync(cfg, APP_MODULES), []);
 */
export async function syncModulesOnce(
  cfg: ResolvedLwabConfig,
  modules: ModuleManifestEntry[],
): Promise<string | null> {
  if (synced) return null;

  const {
    data: { session },
  } = await cfg.supabase.auth.getSession();
  if (!session) return null; // no latch — retry after sign-in

  synced = true;

  const payload = normalizeManifest(modules);
  const { data, error } = await callAppConfig(cfg, {
    action: "sync_modules",
    app_code: cfg.appCode,
    modules: payload,
  });

  if (error) {
    synced = false; // allow a retry on the next auth event / boot
    if (cfg.debug !== false) {
      console.warn(`[lwab-core] module sync failed: ${error}`);
    }
    return null;
  }

  const revision: string | null = data?.revision ?? null;
  if (cfg.debug !== false) {
    console.log(
      `[lwab-core] ✅ synced ${payload.length} modules for ${cfg.appCode} — revision ${revision}`,
    );
  }
  return revision;
}

/** Returns an unsubscribe function; call from a top-level useEffect. */
export function initModuleSync(
  cfg: ResolvedLwabConfig,
  modules: ModuleManifestEntry[],
): () => void {
  void syncModulesOnce(cfg, modules);

  const { data: sub } = cfg.supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      void syncModulesOnce(cfg, modules);
    }
    if (event === "SIGNED_OUT") synced = false;
  });

  return () => sub.subscription.unsubscribe();
}

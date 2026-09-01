import React, { createContext, useContext, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Every satellite mounts exactly one <LwabProvider>. It carries the app's
 * identity and its Supabase client, so nothing inside @lwab/core has to
 * hardcode credentials or import app-local modules.
 */
export interface LwabConfig {
  /** JARVIS app_code, e.g. "marathon". */
  appCode: string;
  /** Human label used in UI copy and notifications. */
  appName?: string;
  /** The shared JARVIS Supabase client (all apps use the same project). */
  supabase: SupabaseClient;
  /** Base URL for JARVIS edge functions. Defaults to <supabaseUrl>/functions/v1. */
  functionsUrl?: string;
  /** Supabase URL + anon key — required for the edge-function gateway headers. */
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** Where the VINCI chat widget lives, used by @mention deep links. */
  vinciUrl?: string;
  /** Set false to silence console diagnostics in production. */
  debug?: boolean;
}

export type ResolvedLwabConfig = LwabConfig & { functionsUrl: string };

const LwabContext = createContext<ResolvedLwabConfig | null>(null);

const strip = (v: string) => v.replace(/\/+$/, "");

export function LwabProvider({
  config,
  children,
}: {
  config: LwabConfig;
  children: React.ReactNode;
}) {
  const value = useMemo<ResolvedLwabConfig>(
    () => ({
      ...config,
      functionsUrl: strip(
        config.functionsUrl || `${strip(config.supabaseUrl)}/functions/v1`,
      ),
    }),
    [config],
  );

  return <LwabContext.Provider value={value}>{children}</LwabContext.Provider>;
}

export function useLwab(): ResolvedLwabConfig {
  const ctx = useContext(LwabContext);
  if (!ctx) {
    throw new Error(
      "[@lwab/core] Missing <LwabProvider>. Wrap your app root with it before using any LWAB hook or component.",
    );
  }
  return ctx;
}

/** Standard 7 actions, identical in every app. */
export const STANDARD_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "export",
  "approve",
  "manage",
] as const;

export type StandardAction = (typeof STANDARD_ACTIONS)[number];

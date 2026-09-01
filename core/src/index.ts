/**
 * @lwab/core — the shared runtime for every LWAB satellite app.
 *
 * One provider, one package version. Cross-cutting changes (permissions,
 * module sync, notifications, push, presence, Settings/Profile) are made here
 * in JARVIS and rolled out by bumping the dependency in each satellite.
 *
 *   import "@lwab/core";
 *   <LwabProvider config={{ appCode: "marathon", supabase, supabaseUrl, supabaseAnonKey }}>
 *     <LwabPermissionProvider>
 *       <LwabPresenceProvider room={projectId}>…</LwabPresenceProvider>
 *     </LwabPermissionProvider>
 *   </LwabProvider>
 */

/* Config */
export {
  LwabProvider,
  useLwab,
  STANDARD_ACTIONS,
} from "./config";
export type { LwabConfig, ResolvedLwabConfig, StandardAction } from "./config";

/* Transport */
export { callAppConfig, callJarvisFunction } from "./api/app-config";
export { fetchWithRetry, newTraceId } from "./lib/fetch-with-retry";
export {
  getCached,
  setCache,
  invalidateCache,
  invalidateCacheByPrefix,
  clearAllCache,
  permissionCacheKey,
  uniqueChannelName,
} from "./lib/cache";

/* Permissions & module registry */
export {
  LwabPermissionProvider,
  usePermissions,
} from "./permissions/use-permissions";
export type {
  PermissionState,
  PermissionSubject,
  VisibleModule,
} from "./permissions/use-permissions";
export { ModuleGuard, ProtectedRoute } from "./permissions/guards";
export {
  syncModulesOnce,
  initModuleSync,
  normalizeManifest,
} from "./permissions/sync-modules";
export type { ModuleManifestEntry } from "./permissions/sync-modules";
export { AccessDenied } from "./ui/AccessDenied";
export type { AccessDeniedVariant } from "./ui/AccessDenied";

/* Notifications & push */
export { notify, useNotify } from "./notifications/notify";
export type { NotifyInput, NotifySeverity } from "./notifications/notify";
export { usePushNotifications } from "./notifications/use-push";
export type { PushStatus } from "./notifications/use-push";
export { PushPermissionPrompt } from "./notifications/PushPermissionPrompt";

/* Collaboration */
export { LwabPresenceProvider, usePresence } from "./collab/presence";
export type { PresencePeer, MentionPing } from "./collab/presence";
export {
  CollaborationLayer,
  CollaborationCursors,
  PresenceAvatars,
  MentionPings,
} from "./collab/CollaborationLayer";
export { MentionPicker } from "./collab/MentionPicker";
export {
  VinciChatWidget,
  VinciChatButton,
  useVinciChat,
} from "./collab/VinciChat";
export type { VinciChatState, VinciChatWidgetProps } from "./collab/VinciChat";

/* Standard screens */
export { SettingsPage } from "./pages/SettingsPage";
export { ProfilePage } from "./pages/ProfilePage";

export const LWAB_CORE_VERSION = "1.1.0";

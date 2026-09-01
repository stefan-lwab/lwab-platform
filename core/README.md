# @lwab/core

The shared runtime for every LWAB satellite app. Owned by JARVIS, published to
public npm, consumed by all 16 apps.

Anything cross-cutting lives here — so a change is made **once** and rolled out
by bumping a dependency, instead of pasting a prompt into 16 repos.

| Area | What you get |
|---|---|
| Permissions | `LwabPermissionProvider`, `usePermissions`, `ModuleGuard`, `ProtectedRoute` |
| Module registry | `initModuleSync`, `syncModulesOnce`, `normalizeManifest` |
| Notifications | `notify`, `useNotify` |
| Push | `usePushNotifications`, `PushPermissionPrompt` |
| Collaboration | `LwabPresenceProvider`, `CollaborationLayer`, `PresenceAvatars`, `MentionPicker` |
| Standard screens | `SettingsPage`, `ProfilePage` |
| Denial UX | `AccessDenied` (Swedish, with Request Access) |

## Install

```bash
npm i @lwab/core
```

Peer deps: `react >=18`, `react-dom >=18`, `@supabase/supabase-js >=2.39`.

## Mount

```tsx
import {
  LwabProvider, LwabPermissionProvider, LwabPresenceProvider,
  CollaborationLayer, initModuleSync,
} from "@lwab/core";
import { supabase } from "@/integrations/supabase/client";
import { APP_MODULES } from "@/lib/app-modules";

const config = {
  appCode: "marathon",
  appName: "MARATHON",
  supabase,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  vinciUrl: "https://vinci.lwab.app",
};

export default function App() {
  useEffect(() => initModuleSync({ ...config, functionsUrl: `${config.supabaseUrl}/functions/v1` }, APP_MODULES), []);

  return (
    <LwabProvider config={config}>
      <LwabPermissionProvider>
        <LwabPresenceProvider room="global">
          <Routes>…</Routes>
          <CollaborationLayer vinciUrl={config.vinciUrl} />
        </LwabPresenceProvider>
      </LwabPermissionProvider>
    </LwabProvider>
  );
}
```

## Guard a route and a mutation

```tsx
<Route path="/bookings" element={
  <ModuleGuard module="bookings"><Bookings /></ModuleGuard>
} />

const { can } = usePermissions();
{can("bookings", "delete") && <DeleteButton />}
```

## Emit an event

```ts
const notify = useNotify();
await notify({
  event_type: "booking.created",
  target_group: "Logistikansvarig",
  title: "Ny bokning",
  url: `/bookings/${id}`,
});
```

`notify()` refuses to send without an explicit recipient — implicit broadcasts
are impossible by construction.

## Point a colleague at something

```tsx
<MentionPicker anchor="#invoice-42" />
```

Sends a live cursor-level pointer to peers in the same presence room **and** a
durable `mention.received` notification that reaches their VINCI chat, inbox,
email or push if they are away.

## Invariants enforced by this package

1. Roles never read from JWT or localStorage — `is_admin` comes from the
   `app-config` top-level field.
2. Module registry is code; `app_modules` is never written directly.
3. Module sync never runs without a session, and retries on `SIGNED_IN`.
4. All realtime `.on()` handlers register before `.subscribe()`; channel names
   are unique per mount.
5. Notifications go through `send-notification` — never a raw table insert.
6. Push devices are registered per `app_code`, so a centralised Novu event
   cannot fan out to every PWA the user installed.
7. Denial always renders `AccessDenied` — never a blank page or silent redirect.

## Release

Tag `core-v<semver>` → GitHub Actions builds, typechecks and publishes to npm.

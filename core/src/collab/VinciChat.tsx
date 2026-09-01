import React from "react";
import { MessageCircle, X, Minus, ExternalLink } from "lucide-react";
import { Button, Badge, cn } from "@lwab/lwui";
import { useLwab } from "../config";

/**
 * VINCI chat, embedded centrally.
 *
 * VINCI is the ecosystem's helpdesk/chat app. Instead of every satellite
 * shipping its own launcher, the widget lives here: one <VinciChatWidget />
 * mounted next to <LwabProvider> gives every app the same chat, the same
 * SSO handoff and the same @mention deep-link behaviour.
 *
 * SSO: the Supabase session token is handed to the iframe over postMessage
 * (never in the URL, so it cannot leak through history or referrers), and it
 * is re-sent whenever Supabase refreshes the session.
 */

export interface VinciChatState {
  open: boolean;
  unread: number;
  /** Opens the widget, optionally focused on a thread or a specific user. */
  openChat: (opts?: { thread?: string; withUserId?: string }) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const VinciChatContext = React.createContext<VinciChatState | null>(null);

/** Safe to call anywhere — returns null when no widget is mounted. */
export function useVinciChat(): VinciChatState | null {
  return React.useContext(VinciChatContext);
}

export interface VinciChatWidgetProps {
  /** Overrides config.vinciUrl. */
  vinciUrl?: string;
  /** Hide the floating launcher and drive the panel purely through useVinciChat(). */
  hideLauncher?: boolean;
  /** Corner placement of the launcher/panel. */
  position?: "bottom-right" | "bottom-left";
  children?: React.ReactNode;
}

interface Target {
  thread?: string;
  withUserId?: string;
}

export function VinciChatWidget({
  vinciUrl,
  hideLauncher,
  position = "bottom-right",
  children,
}: VinciChatWidgetProps) {
  const cfg = useLwab();
  const base = (vinciUrl ?? cfg.vinciUrl ?? "").replace(/\/+$/, "");

  const [open, setOpen] = React.useState(false);
  const [minimised, setMinimised] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const [target, setTarget] = React.useState<Target>({});
  const [ready, setReady] = React.useState(false);
  const frameRef = React.useRef<HTMLIFrameElement | null>(null);

  const origin = React.useMemo(() => {
    try {
      return new URL(base).origin;
    } catch {
      return "";
    }
  }, [base]);

  /** Push the current session into the iframe. */
  const pushSession = React.useCallback(async () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow || !origin) return;
    const {
      data: { session },
    } = await cfg.supabase.auth.getSession();
    frame.contentWindow.postMessage(
      {
        type: "lwab:session",
        appCode: cfg.appCode,
        appName: cfg.appName ?? cfg.appCode.toUpperCase(),
        accessToken: session?.access_token ?? null,
        refreshToken: session?.refresh_token ?? null,
        target,
      },
      origin,
    );
  }, [cfg, origin, target]);

  /* Messages from the VINCI frame: ready handshake + unread counter. */
  React.useEffect(() => {
    if (!origin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin || !e.data || typeof e.data !== "object") return;
      const { type, count } = e.data as { type?: string; count?: number };
      if (type === "vinci:ready") {
        setReady(true);
        void pushSession();
      }
      if (type === "vinci:unread" && typeof count === "number") setUnread(count);
      if (type === "vinci:close") setOpen(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin, pushSession]);

  /* Re-hand the token whenever Supabase rotates it. */
  React.useEffect(() => {
    const { data } = cfg.supabase.auth.onAuthStateChange(() => {
      if (ready) void pushSession();
    });
    return () => data.subscription.unsubscribe();
  }, [cfg.supabase, ready, pushSession]);

  /* New target while already open → tell the frame to switch thread. */
  React.useEffect(() => {
    if (ready && open) void pushSession();
  }, [ready, open, target, pushSession]);

  const value = React.useMemo<VinciChatState>(
    () => ({
      open,
      unread,
      openChat: (opts) => {
        setTarget(opts ?? {});
        setMinimised(false);
        setOpen(true);
        setUnread(0);
      },
      closeChat: () => setOpen(false),
      toggleChat: () => setOpen((o) => !o),
    }),
    [open, unread],
  );

  const side = position === "bottom-left" ? "left-4" : "right-4";

  return (
    <VinciChatContext.Provider value={value}>
      {children}

      {base && (
        <>
          {!hideLauncher && !open && (
            <button
              type="button"
              onClick={() => value.openChat()}
              aria-label="Öppna VINCI-chatt"
              className={cn(
                "fixed bottom-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full",
                "border border-border/60 bg-card/90 text-foreground shadow-card backdrop-blur-xl",
                "transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/40",
                side,
              )}
            >
              <MessageCircle className="h-5 w-5" />
              {unread > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]"
                  variant="default"
                >
                  {unread > 99 ? "99+" : unread}
                </Badge>
              )}
            </button>
          )}

          {open && (
            <div
              className={cn(
                "fixed bottom-4 z-50 flex flex-col overflow-hidden rounded-2xl",
                "border border-border/60 bg-card/95 shadow-card backdrop-blur-xl",
                "w-[min(24rem,calc(100vw-2rem))]",
                minimised ? "h-12" : "h-[min(34rem,calc(100vh-6rem))]",
                side,
              )}
              role="dialog"
              aria-label="VINCI-chatt"
            >
              <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-3">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">VINCI-chatt</span>
                <span className="text-xs text-muted-foreground">
                  {cfg.appName ?? cfg.appCode.toUpperCase()}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <a
                    href={`${base}/chat`}
                    target="_blank"
                    rel="noreferrer"
                    className="header-icon-btn h-8 w-8"
                    aria-label="Öppna i nytt fönster"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setMinimised((m) => !m)}
                    className="header-icon-btn h-8 w-8"
                    aria-label={minimised ? "Återställ" : "Minimera"}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="header-icon-btn h-8 w-8"
                    aria-label="Stäng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!minimised && (
                <iframe
                  ref={frameRef}
                  title="VINCI-chatt"
                  src={`${base}/chat/embed?app=${encodeURIComponent(cfg.appCode)}`}
                  onLoad={() => void pushSession()}
                  className="h-full w-full flex-1 border-0 bg-background"
                  allow="clipboard-write; microphone"
                />
              )}
            </div>
          )}
        </>
      )}
    </VinciChatContext.Provider>
  );
}

/**
 * Inline "Fråga VINCI" button — for empty states, error surfaces and the
 * AccessDenied screen. Falls back to a plain link when no widget is mounted.
 */
export function VinciChatButton({
  thread,
  withUserId,
  label = "Öppna chatt",
  className,
}: {
  thread?: string;
  withUserId?: string;
  label?: string;
  className?: string;
}) {
  const chat = useVinciChat();
  const cfg = useLwab();
  const base = (cfg.vinciUrl ?? "").replace(/\/+$/, "");

  if (!chat && !base) return null;
  if (!chat) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <a href={`${base}/chat${thread ? `?thread=${encodeURIComponent(thread)}` : ""}`}>
          {label}
        </a>
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => chat.openChat({ thread, withUserId })}
    >
      <MessageCircle className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}

import React from "react";
import { usePresence } from "./presence";
import { useVinciChat } from "./VinciChat";

/** Remote cursors, rendered as a fixed overlay. Pointer-events are never captured. */
export function CollaborationCursors() {
  const { peers } = usePresence();
  const route = typeof location !== "undefined" ? location.pathname : undefined;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {peers
        .filter((p) => p.x != null && p.y != null && (!route || p.route === route))
        .map((p) => (
          <div
            key={p.userId}
            className="absolute -translate-x-1 -translate-y-1 transition-transform duration-75 ease-out"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2l5.5 14 2.2-5.8L16 8.2 2 2z"
                fill={p.color}
                stroke="hsl(var(--background))"
                strokeWidth="1.2"
              />
            </svg>
            <span
              className="ml-3 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium text-background"
              style={{ backgroundColor: p.color }}
            >
              {p.name}
            </span>
          </div>
        ))}
    </div>
  );
}

/** "Chat heads" — who else is on this page right now. */
export function PresenceAvatars({
  max = 5,
  onSelect,
}: {
  max?: number;
  onSelect?: (userId: string) => void;
}) {
  const { peers } = usePresence();
  const shown = peers.slice(0, max);
  const overflow = peers.length - shown.length;

  if (!peers.length) return null;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p) => (
        <button
          key={p.userId}
          type="button"
          title={p.name}
          onClick={() => onSelect?.(p.userId)}
          className="relative h-7 w-7 overflow-hidden rounded-full border-2 text-[10px] font-semibold text-background transition-transform hover:z-10 hover:scale-110"
          style={{ backgroundColor: p.color, borderColor: "hsl(var(--background))" }}
        >
          {p.avatarUrl ? (
            <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <span>{p.name.slice(0, 2).toUpperCase()}</span>
          )}
        </button>
      ))}
      {overflow > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}

/**
 * Incoming @mention pointers. Clicking "Visa" jumps to the exact element the
 * sender was looking at; "Öppna chatt" hands off to the VINCI chat widget.
 */
export function MentionPings({ vinciUrl }: { vinciUrl?: string }) {
  const chat = useVinciChat();
  const { pings, dismissPing } = usePresence();
  if (!pings.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex w-80 flex-col gap-2">
      {pings.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-border/50 bg-popover/95 p-3 shadow-lg backdrop-blur"
        >
          <p className="text-sm font-medium text-foreground">
            {p.fromName} nämnde dig
          </p>
          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
            {p.message}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (p.anchor) {
                  document
                    .querySelector(p.anchor)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                } else if (p.url) {
                  location.href = p.url;
                }
                dismissPing(p.id);
              }}
              className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              Visa
            </button>
            {chat ? (
              <button
                type="button"
                onClick={() => {
                  chat.openChat({ withUserId: p.fromUserId });
                  dismissPing(p.id);
                }}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-border/50 px-3 text-xs text-muted-foreground hover:bg-accent/40"
              >
                Öppna chatt
              </button>
            ) : (
              vinciUrl && (
                <a
                  href={`${vinciUrl.replace(/\/+$/, "")}/chat?thread=${encodeURIComponent(p.fromUserId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border/50 px-3 text-xs text-muted-foreground hover:bg-accent/40"
                >
                  Öppna chatt
                </a>
              )
            )}
            <button
              type="button"
              onClick={() => dismissPing(p.id)}
              className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-xs text-muted-foreground hover:bg-accent/40"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Drop-in: cursors + incoming pings in one mount. */
export function CollaborationLayer({ vinciUrl }: { vinciUrl?: string }) {
  return (
    <>
      <CollaborationCursors />
      <MentionPings vinciUrl={vinciUrl} />
    </>
  );
}

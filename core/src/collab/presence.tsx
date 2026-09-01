import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLwab } from "../config";
import { uniqueChannelName } from "../lib/cache";
import { notify } from "../notifications/notify";

export interface PresencePeer {
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  color: string;
  /** Viewport-relative cursor position in percent, so it maps across screens. */
  x?: number;
  y?: number;
  route?: string;
  lastSeen: number;
}

export interface MentionPing {
  id: string;
  fromUserId: string;
  fromName: string;
  message: string;
  /** Deep link back to what the sender was pointing at. */
  url: string;
  /** CSS selector or element id the sender highlighted, when available. */
  anchor?: string;
  at: number;
}

interface PresenceState {
  peers: PresencePeer[];
  self: PresencePeer | null;
  /** Live pings addressed to me in this session. */
  pings: MentionPing[];
  dismissPing: (id: string) => void;
  /**
   * Point a colleague at whatever is on screen. Sends a live broadcast to a
   * peer who is online right now AND a durable notification through notify(),
   * so it also lands in their VINCI chat / inbox if they are away.
   */
  mention: (input: {
    userId: string;
    message: string;
    anchor?: string;
  }) => Promise<{ ok: boolean; error: string | null }>;
}

const PresenceContext = createContext<PresenceState | null>(null);

const COLORS = [
  "hsl(43 62% 78%)",
  "hsl(199 70% 62%)",
  "hsl(150 45% 58%)",
  "hsl(11 72% 66%)",
  "hsl(268 55% 72%)",
  "hsl(29 80% 64%)",
];

const colorFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
};

/**
 * One presence room per (app, room). Pass a room key such as the project id or
 * document id so cursors only appear to people looking at the same thing.
 */
export function LwabPresenceProvider({
  room = "global",
  trackCursor = true,
  children,
}: {
  room?: string;
  trackCursor?: boolean;
  children: React.ReactNode;
}) {
  const cfg = useLwab();
  const [peers, setPeers] = useState<PresencePeer[]>([]);
  const [self, setSelf] = useState<PresencePeer | null>(null);
  const [pings, setPings] = useState<MentionPing[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const selfRef = useRef<PresencePeer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    (async () => {
      const {
        data: { session },
      } = await cfg.supabase.auth.getSession();
      const user = session?.user;
      if (!user || cancelled) return;

      const me: PresencePeer = {
        userId: user.id,
        name:
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Okänd",
        email: user.email ?? undefined,
        avatarUrl: (user.user_metadata?.avatar_url as string) || undefined,
        color: colorFor(user.id),
        route: typeof location !== "undefined" ? location.pathname : undefined,
        lastSeen: Date.now(),
      };
      selfRef.current = me;
      setSelf(me);

      channel = cfg.supabase.channel(
        uniqueChannelName(`lwab-presence-${cfg.appCode}-${room}`),
        { config: { presence: { key: user.id } } },
      );

      // All handlers registered BEFORE subscribe().
      channel.on("presence", { event: "sync" }, () => {
        const raw = channel!.presenceState() as Record<string, any[]>;
        const list = Object.values(raw)
          .flat()
          .filter((p: any) => p?.userId && p.userId !== user.id)
          .map((p: any) => p as PresencePeer);
        setPeers(list);
      });

      channel.on("broadcast", { event: "cursor" }, ({ payload }) => {
        const p = payload as PresencePeer;
        if (!p?.userId || p.userId === user.id) return;
        setPeers((prev) => {
          const idx = prev.findIndex((x) => x.userId === p.userId);
          if (idx === -1) return [...prev, p];
          const next = prev.slice();
          next[idx] = { ...next[idx], ...p };
          return next;
        });
      });

      channel.on("broadcast", { event: "mention" }, ({ payload }) => {
        const ping = payload as MentionPing & { toUserId: string };
        if (ping.toUserId !== user.id) return;
        setPings((prev) => [...prev, ping]);
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel!.track(me);
      });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      if (channel) cfg.supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [cfg, room]);

  /* Throttled cursor broadcast (~20fps). */
  useEffect(() => {
    if (!trackCursor) return;
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = Date.now();
      if (now - last < 50 || !channelRef.current || !selfRef.current) return;
      last = now;
      channelRef.current.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          ...selfRef.current,
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
          route: location.pathname,
          lastSeen: now,
        },
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [trackCursor]);

  const mention = useCallback<PresenceState["mention"]>(
    async ({ userId, message, anchor }) => {
      const me = selfRef.current;
      if (!me) return { ok: false, error: "No session" };

      const ping: MentionPing & { toUserId: string } = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        toUserId: userId,
        fromUserId: me.userId,
        fromName: me.name,
        message,
        url: typeof location !== "undefined" ? location.href : "",
        anchor,
        at: Date.now(),
      };

      // 1. Live pointer for peers who are online right now.
      channelRef.current?.send({
        type: "broadcast",
        event: "mention",
        payload: ping,
      });

      // 2. Durable delivery — routes to VINCI chat / inbox / email / push
      //    through the sanctioned pipeline. Never a direct table insert.
      const res = await notify(cfg, {
        event_type: "mention.received",
        target_user_ids: [userId],
        severity: "info",
        title: `${me.name} nämnde dig i ${cfg.appName || cfg.appCode.toUpperCase()}`,
        body: message,
        url: ping.url,
        payload: {
          from_user_id: me.userId,
          from_name: me.name,
          message,
          anchor,
          app_code: cfg.appCode,
          room,
          vinci_url: cfg.vinciUrl,
        },
      });

      return { ok: res.ok, error: res.error };
    },
    [cfg, room],
  );

  const dismissPing = useCallback(
    (id: string) => setPings((prev) => prev.filter((p) => p.id !== id)),
    [],
  );

  const value = useMemo<PresenceState>(
    () => ({ peers, self, pings, dismissPing, mention }),
    [peers, self, pings, dismissPing, mention],
  );

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  );
}

export function usePresence(): PresenceState {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error(
      "[@lwab/core] usePresence() requires <LwabPresenceProvider> above it.",
    );
  }
  return ctx;
}

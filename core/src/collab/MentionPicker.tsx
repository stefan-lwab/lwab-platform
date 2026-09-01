import React from "react";
import { usePresence } from "./presence";

/**
 * Small "point a colleague at this" composer. Anchor it to any element:
 *
 *   <MentionPicker anchor="#invoice-42" />
 *
 * It lists who is currently in the room, sends a live pointer to them and a
 * durable notification that lands in their VINCI chat.
 */
export function MentionPicker({
  anchor,
  onSent,
  className = "",
}: {
  anchor?: string;
  onSent?: () => void;
  className?: string;
}) {
  const { peers, mention } = usePresence();
  const [target, setTarget] = React.useState<string>("");
  const [message, setMessage] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  const send = async () => {
    if (!target || !message.trim()) return;
    setState("sending");
    const res = await mention({ userId: target, message: message.trim(), anchor });
    setState(res.ok ? "sent" : "failed");
    if (res.ok) {
      setMessage("");
      onSent?.();
    }
  };

  return (
    <div
      className={`w-72 rounded-xl border border-border/50 bg-popover/95 p-3 backdrop-blur ${className}`}
    >
      <p className="text-xs font-medium text-foreground">Peka en kollega hit</p>

      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="mt-2 h-8 w-full rounded-lg border border-border/50 bg-background px-2 text-xs text-foreground"
      >
        <option value="">Välj person…</option>
        {peers.map((p) => (
          <option key={p.userId} value={p.userId}>
            {p.name}
          </option>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Titta på det här…"
        className="mt-2 w-full resize-none rounded-lg border border-border/50 bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground"
      />

      <button
        type="button"
        onClick={send}
        disabled={state === "sending" || !target || !message.trim()}
        className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? "Skickar…" : state === "sent" ? "Skickat ✓" : "Skicka"}
      </button>

      {state === "failed" && (
        <p className="mt-1 text-[11px] text-destructive">
          Kunde inte skickas. Försök igen.
        </p>
      )}
      {!peers.length && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Ingen annan är inne på den här sidan just nu.
        </p>
      )}
    </div>
  );
}

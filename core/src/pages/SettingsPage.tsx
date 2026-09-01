import React from "react";
import { BellRing, Loader2, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageHeader,
  Separator,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lwab/lwui";
import { useLwab } from "../config";
import { usePermissions } from "../permissions/use-permissions";
import { usePushNotifications } from "../notifications/use-push";
import { callJarvisFunction } from "../api/app-config";
import { useVinciChat } from "../collab/VinciChat";

interface EventPreference {
  event_type: string;
  label: string;
  in_app: boolean;
  email: boolean;
  push: boolean;
}

/**
 * The standard "Inställningar" screen. Every satellite mounts the same one;
 * the content is driven by JARVIS (event catalogue + user preferences), so
 * changing what users can configure is a JARVIS change, not 16 app changes.
 *
 * Built entirely on @lwab/lwui primitives — no local markup, no raw colours.
 */
export function SettingsPage({
  vapidPublicKey,
  extraSections,
}: {
  vapidPublicKey?: string;
  extraSections?: React.ReactNode;
}) {
  const cfg = useLwab();
  const { canonicalRole, isAdmin, visibleModules } = usePermissions();
  const push = usePushNotifications({ vapidPublicKey: vapidPublicKey ?? "" });
  const chat = useVinciChat();

  const [prefs, setPrefs] = React.useState<EventPreference[]>([]);
  const [quietHours, setQuietHours] = React.useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await callJarvisFunction(
        cfg,
        "notification-preferences",
        { action: "get", app_code: cfg.appCode },
      );
      if (!active) return;
      if (!error && data) {
        setPrefs(data.preferences || []);
        setQuietHours({
          start: data.quiet_hours_start || "",
          end: data.quiet_hours_end || "",
        });
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [cfg]);

  const savePrefs = async () => {
    setSaving(true);
    const { error } = await callJarvisFunction(cfg, "notification-preferences", {
      action: "update",
      app_code: cfg.appCode,
      preferences: prefs,
      quiet_hours_start: quietHours.start || null,
      quiet_hours_end: quietHours.end || null,
    });
    setSaving(false);
    setMessage(error ? "Kunde inte spara" : "Sparat");
  };

  const toggle = (idx: number, channel: "in_app" | "email" | "push") =>
    setPrefs((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [channel]: !p[channel] } : p)),
    );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <PageHeader
        title="Inställningar"
        description={`${cfg.appName || cfg.appCode.toUpperCase()} · ${
          isAdmin ? "Administratör" : canonicalRole || "Användare"
        } · ${visibleModules.length} moduler`}
        actions={
          isAdmin ? (
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administratör
            </Badge>
          ) : undefined
        }
      />

      {/* Push */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4 text-primary" />
            Push-notiser
          </CardTitle>
          <CardDescription>
            Notiser levereras endast till enheter som registrerats för den här appen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vapidPublicKey || push.status === "unsupported" ? (
            <p className="text-sm text-muted-foreground">
              Push stöds inte i den här webbläsaren.
            </p>
          ) : push.status === "denied" ? (
            <p className="text-sm text-muted-foreground">
              Blockerat i webbläsaren — tillåt notiser i webbläsarens inställningar.
            </p>
          ) : push.status === "registered" ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline">Aktiv på den här enheten</Badge>
              <Button variant="outline" size="sm" onClick={push.disable}>
                Stäng av
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={push.enable} disabled={push.busy}>
              {push.busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {push.busy ? "Aktiverar…" : "Aktivera push"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Per-event channels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BellRing className="h-4 w-4 text-primary" />
            Notisinställningar
          </CardTitle>
          <CardDescription>
            Välj hur du vill bli aviserad per händelsetyp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Laddar…
            </p>
          ) : !prefs.length ? (
            <p className="text-sm text-muted-foreground">
              Inga händelsetyper registrerade för den här appen ännu.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Händelse</TableHead>
                  <TableHead className="w-24">I appen</TableHead>
                  <TableHead className="w-24">E-post</TableHead>
                  <TableHead className="w-24">Push</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prefs.map((p, i) => (
                  <TableRow key={p.event_type}>
                    <TableCell className="font-medium">
                      {p.label || p.event_type}
                    </TableCell>
                    {(["in_app", "email", "push"] as const).map((c) => (
                      <TableCell key={c}>
                        <Switch
                          checked={p[c]}
                          onCheckedChange={() => toggle(i, c)}
                          aria-label={`${p.label || p.event_type} – ${c}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Separator />

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quiet-start">Tyst från</Label>
              <Input
                id="quiet-start"
                type="time"
                className="w-32"
                value={quietHours.start}
                onChange={(e) =>
                  setQuietHours((q) => ({ ...q, start: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quiet-end">till</Label>
              <Input
                id="quiet-end"
                type="time"
                className="w-32"
                value={quietHours.end}
                onChange={(e) => setQuietHours((q) => ({ ...q, end: e.target.value }))}
              />
            </div>
            <Button onClick={savePrefs} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Sparar…" : "Spara"}
            </Button>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      {chat && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4 text-primary" />
              Support
            </CardTitle>
            <CardDescription>
              Behöver du hjälp? Starta ett ärende direkt i VINCI-chatten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => chat.openChat()}>
              Öppna VINCI-chatt
            </Button>
          </CardContent>
        </Card>
      )}

      {extraSections}
    </div>
  );
}

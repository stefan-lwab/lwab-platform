import React from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
} from "@lwab/lwui";
import { useLwab } from "../config";
import { usePermissions } from "../permissions/use-permissions";

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
}

const initials = (name?: string | null) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/**
 * The standard "Min profil" screen, identical in every satellite.
 * Identity is owned by JARVIS; employment data is owned by ATHENA, so the
 * employment fields here are read-only by design.
 */
export function ProfilePage({
  editableFields = ["full_name", "phone", "avatar_url"],
}: {
  editableFields?: Array<keyof ProfileRow>;
}) {
  const cfg = useLwab();
  const { canonicalRole, isAdmin } = usePermissions();
  const [profile, setProfile] = React.useState<ProfileRow | null>(null);
  const [draft, setDraft] = React.useState<Partial<ProfileRow>>({});
  const [state, setState] = React.useState<"loading" | "ready" | "saving" | "error">(
    "loading",
  );
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await cfg.supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await cfg.supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url, job_title, department")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }
      setProfile((data as ProfileRow) ?? null);
      setDraft({});
      setState("ready");
    })();
    return () => {
      active = false;
    };
  }, [cfg.supabase]);

  const save = async () => {
    if (!profile) return;
    setState("saving");
    const { error } = await cfg.supabase
      .from("profiles")
      .update(draft)
      .eq("id", profile.id);

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }
    setProfile({ ...profile, ...draft } as ProfileRow);
    setDraft({});
    setState("ready");
    setMessage("Sparat");
  };

  if (state === "loading") {
    return (
      <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Laddar profil…
      </p>
    );
  }

  const field = (key: keyof ProfileRow, label: string, ownedByAthena = false) => {
    const editable = editableFields.includes(key);
    const value = (draft[key] ?? profile?.[key] ?? "") as string;
    return (
      <div className="space-y-1.5" key={key}>
        <Label htmlFor={`profile-${key}`} className="flex items-center gap-1.5">
          {label}
          {ownedByAthena && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              ägs av ATHENA
            </span>
          )}
        </Label>
        <Input
          id={`profile-${key}`}
          value={value}
          readOnly={!editable}
          className={editable ? undefined : "opacity-60"}
          onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <PageHeader
        title="Min profil"
        description={`${cfg.appName || cfg.appCode.toUpperCase()} · ${
          isAdmin ? "Administratör" : canonicalRole || "Användare"
        }`}
        actions={
          isAdmin ? (
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administratör
            </Badge>
          ) : undefined
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={(draft.avatar_url ?? profile?.avatar_url) || undefined}
                alt={profile?.full_name || "Profilbild"}
              />
              <AvatarFallback>{initials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {profile?.full_name || "Namnlös användare"}
              </CardTitle>
              <CardDescription>{profile?.email || "—"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("full_name", "Namn")}
            {field("email", "E-post")}
            {field("phone", "Telefon")}
            {field("avatar_url", "Profilbild (URL)")}
            {field("job_title", "Befattning", true)}
            {field("department", "Avdelning", true)}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={save}
              disabled={state === "saving" || !Object.keys(draft).length}
            >
              {state === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {state === "saving" ? "Sparar…" : "Spara"}
            </Button>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

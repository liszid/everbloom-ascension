import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SCOPE_LABEL: Record<string, string> = {
  openid: "Confirm who you are",
  email: "Share your email address",
  profile: "Share your basic profile",
};

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // The session lives in browser storage, so this page only runs in the browser.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Connect an assistant — Thornvale" },
      { name: "description", content: "Approve or deny an assistant's request to read your Thornvale characters." },
      { property: "og:title", content: "Connect an assistant — Thornvale" },
      { property: "og:description", content: "Approve or deny an assistant's request to read your Thornvale characters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing its request id. Start the connection again from your assistant.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login", search: { next: location.pathname + location.searchStr } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const [{ data, error }, { data: user }] = await Promise.all([
      supabase.auth.oauth.getAuthorizationDetails(authorizationId),
      supabase.auth.getUser(),
    ]);
    if (error) throw new Error("This connection request has expired or is no longer valid. Start again from your assistant.");
    const d = data as { client?: { name?: string; uri?: string }; redirect_uri?: string; scope?: string; redirect_url?: string; redirect_to?: string } | null;
    const immediate = d?.redirect_url ?? d?.redirect_to;
    if (immediate && !d?.client) throw redirect({ href: immediate });
    return { details: d, email: user.user?.email ?? "your account" };
  },
  component: Consent,
  pendingComponent: () => <Shell><p className="text-center text-muted-foreground">Loading connection request…</p></Shell>,
  errorComponent: ({ error }) => (
    <Shell>
      <h1 className="font-display text-xl text-primary">Couldn't open this request</h1>
      <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
      <a className="pixel-btn py-2 text-center" href="/">Back to Thornvale</a>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-4">
      <div className="pixel-panel grid gap-3 p-4">{children}</div>
    </main>
  );
}

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = details?.client?.name ?? "An assistant";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);
  let host = "";
  try { host = details?.redirect_uri ? new URL(details.redirect_uri).host : ""; } catch { host = ""; }

  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(approve ? "Couldn't approve the connection. Please try again." : "Couldn't cancel the connection. Please try again."); return; }
    const r = data as { redirect_url?: string; redirect_to?: string } | null;
    const target = r?.redirect_url ?? r?.redirect_to;
    if (!target) { setBusy(false); setError("The sign-in service didn't say where to go next. Start again from your assistant."); return; }
    window.location.href = target;
  }

  async function switchAccount() {
    await supabase.auth.signOut();
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }

  return (
    <Shell>
      <h1 className="font-display text-xl text-primary">Connect {client} to Thornvale</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{email}</span>.{" "}
        <button type="button" className="underline" onClick={switchAccount} disabled={busy}>Switch account</button>
      </p>
      {host && <p className="text-sm text-muted-foreground">Requested by <span className="text-foreground">{host}</span></p>}
      <p>This lets {client} use Thornvale as you. It can read your characters: level, class, stats, equipment, inventory and progress. It can't change your save.</p>
      {scopes.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {scopes.map((sc) => <li key={sc}>• {SCOPE_LABEL[sc] ?? `Additional permission requested: ${sc}`}</li>)}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">This does not bypass the game's own account protections — only your own saves can be read.</p>
      {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      <button className="pixel-btn pixel-btn-primary py-2 text-base" disabled={busy} onClick={() => decide(true)}>Approve</button>
      <button className="pixel-btn py-2" disabled={busy} onClick={() => decide(false)}>Cancel connection</button>
    </Shell>
  );
}

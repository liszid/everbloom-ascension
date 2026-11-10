import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/game/AuthScreen";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ next: oauthReturnPath(s["next"]) }),
  head: () => ({
    meta: [
      { title: "Sign in — Thornvale" },
      { name: "description", content: "Sign in to your Thornvale account to continue your climb or connect an assistant." },
      { property: "og:title", content: "Sign in — Thornvale" },
      { property: "og:description", content: "Sign in to your Thornvale account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <ReturnWhenSignedIn next={next} />
      <AuthScreen next={next} />
    </ClientOnly>
  );
}

function ReturnWhenSignedIn({ next }: { next: string }) {
  useEffect(() => {
    const go = () => window.location.assign(next);
    supabase.auth.getSession().then(({ data }) => { if (data.session) go(); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => { if (sess) go(); });
    return () => sub.subscription.unsubscribe();
  }, [next]);
  return null;
}

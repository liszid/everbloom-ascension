import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/game/AuthScreen";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thornvale — Tower of a Thousand Floors" },
      { name: "description", content: "A pixel RPG: gather materials, craft unique gear from any combination, and climb a 1000-floor dungeon tower." },
      { property: "og:title", content: "Thornvale — Tower of a Thousand Floors" },
      { property: "og:description", content: "Gather, craft one-of-a-kind gear, level skills by doing, and conquer floor 1000." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-screen" />}>
      <App />
    </ClientOnly>
  );
}

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <div className="flex min-h-screen items-center justify-center font-display text-primary">Loading…</div>;
  if (!session) return <AuthScreen />;
  return <Game key={session.user.id} userId={session.user.id} />;
}

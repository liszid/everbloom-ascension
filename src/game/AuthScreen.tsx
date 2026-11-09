import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import hero from "@/assets/tower-hero.jpg";

export function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };
  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg(r.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={hero} alt="A pixel village beneath a towering dark spire" width={768} height={1152} className="absolute inset-0 h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      <div className="hero-fade absolute inset-0" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-end gap-4 p-4 pb-8">
        <div className="text-center">
          <h1 className="title-glow text-4xl text-primary">Thornvale</h1>
          <p className="font-display text-sm text-foreground">The Tower of a Thousand Floors</p>
          <p className="mt-2 text-base text-muted-foreground">Gather. Craft gear no one has ever made. Climb to floor 1000.</p>
        </div>
        <form onSubmit={submit} className="pixel-panel grid gap-2 p-3">
          <input className="rounded-xl border-2 border-input bg-ink px-3 py-1.5 text-lg" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-xl border-2 border-input bg-ink px-3 py-1.5 text-lg" type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button className="pixel-btn pixel-btn-primary py-2 text-base" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
          <button type="button" className="pixel-btn py-2" onClick={google}>Continue with Google</button>
          <button type="button" className="text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "New adventurer? Create an account" : "Already have an account? Sign in"}
          </button>
          {msg && <p className="text-center text-sm text-accent">{msg}</p>}
        </form>
      </div>
    </div>
  );
}

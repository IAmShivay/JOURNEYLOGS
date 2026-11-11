import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DarkSiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Far & Wide" },
      { name: "description", content: "Author sign-in for the Far & Wide travel journal. Access is for the journal's writers only." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign in — Far & Wide" },
      { property: "og:description", content: "Author sign-in for the Far & Wide travel journal." },
      { property: "og:url", content: "https://journeylogs.lovable.app/login" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Author access</p>
          <h1 className="font-display text-5xl mb-3">
            {mode === "signin" ? "Welcome back." : <>Start a <span className="display-italic">journal</span>.</>}
          </h1>
          <p className="text-muted-foreground mb-10">
            {mode === "signin"
              ? "Sign in to add new destinations and edit your stories."
              : "Create an account to begin posting your travels."}
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-accent">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-sm hover:bg-tide transition disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground text-center">
            {mode === "signin" ? "No account yet? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
              className="text-accent hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

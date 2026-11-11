import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribe } from "@/lib/subscribers.functions";

export function Newsletter({ variant = "light" }: { variant?: "light" | "dark" }) {
  const subscribeFn = useServerFn(subscribe);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const dark = variant === "dark";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribeFn({ data: { email } });
      setStatus("ok");
      setMessage("You're on the list. Next postcard ships soon.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className={`flex flex-col sm:flex-row gap-3 ${dark ? "" : ""}`}>
        <input
          type="email"
          required
          aria-label="Email address"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          className={`flex-1 px-5 py-3.5 rounded-sm outline-none transition border ${
            dark
              ? "bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-sand"
              : "bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-accent"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`px-7 py-3.5 rounded-sm font-medium transition disabled:opacity-60 ${
            dark
              ? "bg-sand text-deep hover:bg-sand/90"
              : "bg-primary text-primary-foreground hover:bg-tide"
          }`}
        >
          {status === "loading" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${status === "error" ? "text-destructive" : dark ? "text-sand" : "text-accent"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

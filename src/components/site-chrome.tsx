import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { Newsletter } from "@/components/newsletter";

const navLinks = [
  { to: "/" as const, label: "Journal", exact: true },
  { to: "/destinations" as const, label: "Destinations" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function SiteHeader() {
  const { session } = useSession();
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl text-primary-foreground">Far &amp; Wide</span>
          <span className="display-italic text-sm text-sand">— a travel journal</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-primary-foreground/85">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={l.exact ? { exact: true } : undefined}
              className="hover:text-primary-foreground transition" activeProps={{ className: "text-sand" }}>
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link to="/admin" className="hover:text-primary-foreground transition">Admin</Link>
              <button onClick={() => supabase.auth.signOut()} className="text-primary-foreground/70 hover:text-primary-foreground transition">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-primary-foreground transition">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function DarkSiteHeader() {
  const { session } = useSession();
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl">Far &amp; Wide</span>
          <span className="display-italic text-sm text-muted-foreground hidden sm:inline">— a travel journal</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={l.exact ? { exact: true } : undefined}
              className="hover:text-accent transition hidden sm:inline" activeProps={{ className: "text-accent" }}>
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link to="/admin" className="hover:text-accent transition">Admin</Link>
              <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground hover:text-foreground transition">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-accent transition">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <p className="font-display text-2xl">Far &amp; Wide</p>
          <p className="display-italic text-muted-foreground mt-2">A travel journal.</p>
          <p className="text-sm text-muted-foreground mt-6 max-w-xs">
            Personal stories of places visited, slowly written and rarely edited.
          </p>
        </div>
        <div className="md:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-1">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Newsletter</p>
          <p className="text-sm text-muted-foreground mb-4">New postcards, sent occasionally.</p>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Far &amp; Wide — Made with salt air and curiosity.</p>
          <p>Written from somewhere with a view.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { session } = useSession();
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl text-primary-foreground">Far &amp; Wide</span>
          <span className="display-italic text-sm text-sand">— a travel journal</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-primary-foreground/85">
          <Link to="/" className="hover:text-primary-foreground transition" activeOptions={{ exact: true }}>
            Journal
          </Link>
          {session ? (
            <>
              <Link to="/admin" className="hover:text-primary-foreground transition">Admin</Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-primary-foreground/70 hover:text-primary-foreground transition"
              >
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
          <span className="display-italic text-sm text-muted-foreground">— a travel journal</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-accent transition">Journal</Link>
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
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl">Far &amp; Wide</p>
          <p className="text-sm text-muted-foreground mt-1">A personal journal of places visited and stories collected.</p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} — Made with salt air and curiosity.</p>
      </div>
    </footer>
  );
}

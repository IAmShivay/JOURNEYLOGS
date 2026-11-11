import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { Newsletter } from "@/components/newsletter";

const navLinks = [
  { to: "/" as const, label: "Journal", exact: true },
  { to: "/destinations" as const, label: "Destinations" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

function MobileMenu({
  open,
  onClose,
  tone,
}: {
  open: boolean;
  onClose: () => void;
  tone: "light" | "dark";
}) {
  const { session } = useSession();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden bg-background flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <Link to="/" onClick={onClose} className="font-display text-2xl text-foreground">
          Far &amp; Wide
        </Link>
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="p-2 -mr-2 text-foreground"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 flex flex-col px-6 py-10 gap-6 text-2xl font-display">
        {navLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            onClick={onClose}
            activeOptions={l.exact ? { exact: true } : undefined}
            className="text-foreground hover:text-accent transition"
            activeProps={{ className: "text-accent" }}
          >
            {l.label}
          </Link>
        ))}
        <div className="mt-4 pt-6 border-t border-border space-y-4 text-base">
          {session ? (
            <>
              <Link to="/admin" onClick={onClose} className="block text-foreground hover:text-accent">
                Admin
              </Link>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  onClose();
                }}
                className="text-muted-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={onClose} className="block text-foreground hover:text-accent">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export function SiteHeader() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-5 sm:py-6 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2 group min-w-0">
          <span className="font-display text-xl sm:text-2xl text-primary-foreground truncate">
            Far &amp; Wide
          </span>
          <span className="display-italic text-sm text-sand hidden sm:inline">— a travel journal</span>
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
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden p-2 -mr-2 text-primary-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} tone="light" />
    </header>
  );
}

export function DarkSiteHeader() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2 min-w-0">
          <span className="font-display text-xl sm:text-2xl truncate">Far &amp; Wide</span>
          <span className="display-italic text-sm text-muted-foreground hidden md:inline">— a travel journal</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={l.exact ? { exact: true } : undefined}
              className="hover:text-accent transition" activeProps={{ className: "text-accent" }}>
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
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="md:hidden p-2 -mr-2 text-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} tone="dark" />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
        <div>
          <p className="font-display text-2xl">Far &amp; Wide</p>
          <p className="display-italic text-muted-foreground mt-2">A travel journal.</p>
          <p className="text-sm text-muted-foreground mt-6 max-w-xs">
            Personal stories of places visited, slowly written and rarely edited.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent transition">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Newsletter</p>
          <p className="text-sm text-muted-foreground mb-4">New postcards, sent occasionally.</p>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Far &amp; Wide — Made with salt air and curiosity.</p>
          <p>Written from somewhere with a view.</p>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { DarkSiteHeader, SiteFooter } from "@/components/site-chrome";
import { Newsletter } from "@/components/newsletter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Far & Wide" },
      { name: "description", content: "Get in touch — recommend a place, share a route, or just say hello." },
      { property: "og:title", content: "Contact — Far & Wide" },
      { property: "og:description", content: "Get in touch — recommend a place, share a route, or just say hello." },
      { property: "og:url", content: "https://journeylogs.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://journeylogs.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Contact</p>
        <h1 className="font-display text-5xl md:text-7xl text-balance leading-[0.98]">
          Send a <span className="display-italic">postcard</span> back.
        </h1>
        <p className="display-italic text-2xl text-muted-foreground mt-8 max-w-2xl text-balance">
          Tips, recommendations, collaborations, or just hello — all welcome.
        </p>

        <div className="mt-16 grid md:grid-cols-2 gap-10">
          <div className="border-l-2 border-accent pl-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</p>
            <a href="mailto:hello@farandwide.travel" className="font-display text-2xl hover:text-accent transition">
              hello@farandwide.travel
            </a>
          </div>
          <div className="border-l-2 border-accent pl-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Elsewhere</p>
            <p className="font-display text-2xl">@farandwide</p>
            <p className="text-sm text-muted-foreground mt-1">Instagram · Are.na</p>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-12">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Stay in the loop</p>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Get new stories by email.</h2>
          <Newsletter />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

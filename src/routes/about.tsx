import { createFileRoute, Link } from "@tanstack/react-router";
import { DarkSiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Far & Wide" },
      { name: "description", content: "About the journal, the wanderer, and the way these postcards get written." },
      { property: "og:title", content: "About — Far & Wide" },
      { property: "og:description", content: "About the journal, the wanderer, and the way these postcards get written." },
      { property: "og:url", content: "https://journeylogs.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://journeylogs.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">About</p>
        <h1 className="font-display text-5xl md:text-7xl text-balance leading-[0.98]">
          A slow journal of <span className="display-italic">somewhere</span> else.
        </h1>
        <p className="display-italic text-2xl md:text-3xl text-muted-foreground mt-8 text-balance">
          Notes, photographs, and the small things I keep coming back to.
        </p>

        <div className="mt-14 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Far &amp; Wide is a personal travel journal — a quiet place to keep the postcards I wish I'd
            sent. Every entry begins as a notebook page on a train, a ferry, a hostel balcony, and ends
            here as a story you can read in the time it takes a coffee to cool.
          </p>
          <p>
            I'm drawn to coastlines and long walks, mornings in markets, the small rituals locals
            perform without thinking. I try to write the way the place actually felt, not the way it
            photographs.
          </p>
          <p>
            If something here makes you book a ticket, you can tell me about it on the{" "}
            <Link to="/contact" className="text-accent underline underline-offset-4">contact page</Link>.
          </p>
        </div>

        <div className="mt-20 border-t border-border pt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { k: "Countries", v: "14" },
            { k: "Notebooks filled", v: "7" },
            { k: "Coffees", v: "∞" },
            { k: "Trains missed", v: "3" },
          ].map((s) => (
            <div key={s.k}>
              <p className="font-display text-4xl">{s.v}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">{s.k}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublishedDestinations, type DestinationDTO } from "@/lib/destinations.functions";
import { DarkSiteHeader, SiteFooter } from "@/components/site-chrome";

const q = queryOptions({
  queryKey: ["destinations", "published"],
  queryFn: () => listPublishedDestinations(),
});

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "All Destinations — Far & Wide" },
      { name: "description", content: "Every place written about, from coastlines to mountain towns — an index of all travel entries in the Far & Wide journal." },
      { property: "og:title", content: "All Destinations — Far & Wide" },
      { property: "og:description", content: "Every place written about, from coastlines to mountain towns — an index of all travel entries in the Far & Wide journal." },
      { property: "og:url", content: "https://journeylogs.lovable.app/destinations" },
    ],
    links: [{ rel: "canonical", href: "https://journeylogs.lovable.app/destinations" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All Destinations — Far & Wide",
          url: "https://journeylogs.lovable.app/destinations",
          description: "Every place written about, from coastlines to mountain towns.",
        }),
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: DestinationsPage,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Row({ d, i }: { d: DestinationDTO; i: number }) {
  return (
    <Link
      to="/destination/$slug"
      params={{ slug: d.slug }}
      className="group flex items-center gap-4 sm:gap-6 py-6 sm:py-8 border-b border-border hover:bg-muted/40 transition px-2 -mx-2 rounded-sm"
    >
      <div className="hidden sm:block font-display text-2xl text-muted-foreground w-10 shrink-0">
        {String(i + 1).padStart(2, "0")}
      </div>
      <div className="w-24 sm:w-32 aspect-[4/3] bg-muted overflow-hidden rounded-sm shrink-0">
        {d.cover_image_url ? (
          <img src={d.cover_image_url} alt={d.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-deep" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-accent mb-1.5">
          {d.country || d.location}
        </p>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl group-hover:text-accent transition-colors leading-tight">
          {d.title}
        </h2>
        {d.summary && <p className="text-sm text-muted-foreground line-clamp-1 mt-1.5 hidden sm:block">{d.summary}</p>}
      </div>
      <div className="hidden md:block text-right text-sm text-muted-foreground shrink-0 w-32">
        {formatDate(d.visited_on)}
      </div>
    </Link>
  );
}

function DestinationsPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="flex-1 mx-auto max-w-6xl px-5 sm:px-6 py-16 sm:py-20 md:py-28 w-full">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">The Index</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-balance leading-[0.98]">
          Every <span className="display-italic">destination</span>, in order.
        </h1>
        <p className="display-italic text-lg sm:text-xl text-muted-foreground mt-6 max-w-2xl">
          {data.length} {data.length === 1 ? "entry" : "entries"} and counting.
        </p>

        <div className="mt-12 sm:mt-16">
          {data.length === 0 ? (
            <p className="text-muted-foreground py-12">No destinations yet.</p>
          ) : (
            <div className="border-t border-border">
              {data.map((d, i) => <Row key={d.id} d={d} i={i} />)}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

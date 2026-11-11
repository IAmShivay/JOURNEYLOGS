import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPublishedDestinations, type DestinationDTO } from "@/lib/destinations.functions";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import heroImage from "@/assets/hero-ocean.jpg";
import { Newsletter } from "@/components/newsletter";

const destinationsQuery = queryOptions({
  queryKey: ["destinations", "published"],
  queryFn: () => listPublishedDestinations(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Far & Wide — a travel journal" },
      { name: "description", content: "A personal collection of travel stories, destinations visited, and moments worth remembering." },
      { property: "og:title", content: "Far & Wide — a travel journal" },
      { property: "og:description", content: "A personal collection of travel stories, destinations visited, and moments worth remembering." },
      { property: "og:url", content: "https://journeylogs.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://journeylogs.lovable.app/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(destinationsQuery),
  component: HomePage,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function FeaturedCard({ d }: { d: DestinationDTO }) {
  return (
    <Link to="/destination/$slug" params={{ slug: d.slug }} className="group block">
      <div className="relative overflow-hidden rounded-md aspect-[16/10] bg-muted shadow-card">
        {d.cover_image_url ? (
          <img
            src={d.cover_image_url}
            alt={d.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            width={1600}
            height={1000}
          />
        ) : (
          <div className="w-full h-full bg-gradient-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-primary-foreground">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-sand mb-2 sm:mb-3">
            Featured · {d.country || d.location}
          </p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl text-balance mb-2">{d.title}</h2>
          {d.summary && <p className="text-sm sm:text-base text-primary-foreground/85 max-w-xl text-balance line-clamp-2 sm:line-clamp-none">{d.summary}</p>}
        </div>
      </div>
    </Link>
  );
}

function StoryCard({ d }: { d: DestinationDTO }) {
  return (
    <Link to="/destination/$slug" params={{ slug: d.slug }} className="group block">
      <div className="relative overflow-hidden rounded-md aspect-[4/5] bg-muted mb-4">
        {d.cover_image_url ? (
          <img
            src={d.cover_image_url}
            alt={d.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-deep" />
        )}
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent mb-1.5">
        {d.country || d.location} {d.visited_on && <span className="text-muted-foreground">· {formatDate(d.visited_on)}</span>}
      </p>
      <h3 className="font-display text-2xl leading-tight mb-1 group-hover:text-accent transition-colors">{d.title}</h3>
      {d.summary && <p className="text-sm text-muted-foreground line-clamp-2">{d.summary}</p>}
    </Link>
  );
}

function HomePage() {
  const { data: destinations } = useSuspenseQuery(destinationsQuery);
  const [featured, ...rest] = destinations;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[88vh] sm:min-h-[88vh] flex items-end">
        <img
          src={heroImage}
          alt="Ocean coastline at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/30 to-deep/90" />
        <SiteHeader />
        <div className="relative mx-auto max-w-7xl w-full px-5 sm:px-6 pt-28 pb-16 sm:pb-20 md:pb-28 text-primary-foreground">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-sand mb-4 sm:mb-6">Volume 01 · Ongoing</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-balance max-w-5xl leading-[0.98]">
            Postcards from <span className="display-italic">somewhere</span> far enough to feel changed.
          </h1>
          <p className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg text-primary-foreground/85">
            A slow journal of places I've walked through, the salt I've tasted, and the rooms I keep coming back to in my head.
          </p>
        </div>
      </section>

      {/* Magazine grid */}
      <main className="mx-auto max-w-7xl px-5 sm:px-6 py-16 sm:py-20 md:py-28 w-full">
        {destinations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-end justify-between gap-4 border-b border-border pb-4 mb-10">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">The Journal</p>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">Stories &amp; <span className="display-italic">destinations</span></h2>
              </div>
              <p className="text-sm text-muted-foreground hidden md:block shrink-0">
                {destinations.length} {destinations.length === 1 ? "entry" : "entries"}
              </p>
            </div>

            {featured && <div className="mb-16 sm:mb-20"><FeaturedCard d={featured} /></div>}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-10 gap-y-12 sm:gap-y-16">
                {rest.map((d) => <StoryCard key={d.id} d={d} />)}
              </div>
            )}
          </>
        )}
      </main>

      {/* Newsletter band */}
      <section className="relative overflow-hidden bg-deep text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-deep opacity-90" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, var(--sand) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--surf) 0%, transparent 50%)",
        }} />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 py-20 sm:py-24 md:py-32 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-sand mb-5 sm:mb-6">The mailing list</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl text-balance leading-[0.98] max-w-3xl mx-auto">
            New <span className="display-italic">postcards</span>, sent only when there's something worth telling.
          </h2>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Subscribe to get new destinations, photo essays, and the occasional invite — straight to your inbox.
          </p>
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Newsletter variant="dark" />
          </div>
          <p className="mt-6 text-xs text-primary-foreground/50">
            No spam, ever. Unsubscribe in one click.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">Coming soon</p>
      <h2 className="font-display text-5xl mb-4">The first <span className="display-italic">postcard</span> hasn't arrived yet.</h2>
      <p className="text-muted-foreground mb-8">Sign in to start adding the places you've been and the stories behind them.</p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-tide transition"
      >
        Sign in to add destinations
      </Link>
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getDestinationBySlug } from "@/lib/destinations.functions";
import { DarkSiteHeader, SiteFooter } from "@/components/site-chrome";

const destQuery = (slug: string) =>
  queryOptions({
    queryKey: ["destination", slug],
    queryFn: () => getDestinationBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/destination/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(destQuery(params.slug));
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Far & Wide` },
          { name: "description", content: loaderData.summary || `Travel story from ${loaderData.location}` },
          { property: "og:title", content: `${loaderData.title} — Far & Wide` },
          { property: "og:description", content: loaderData.summary || `Travel story from ${loaderData.location}` },
          ...(loaderData.cover_image_url
            ? [
                { property: "og:image", content: loaderData.cover_image_url },
                { name: "twitter:image", content: loaderData.cover_image_url },
              ]
            : []),
        ]
      : [],
  }),
  component: DestinationPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-6xl mb-4">Not found</p>
          <p className="text-muted-foreground mb-6">This postcard hasn't been written yet.</p>
          <Link to="/" className="text-accent underline">Back to journal</Link>
        </div>
      </div>
    </div>
  ),
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function DestinationPage() {
  const { data: d } = useSuspenseQuery(destQuery(Route.useParams().slug));
  if (!d) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />

      <article className="flex-1">
        {/* Hero cover */}
        {d.cover_image_url && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
            <img src={d.cover_image_url} alt={d.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <Link to="/" className="text-xs uppercase tracking-[0.25em] text-accent hover:underline">
            ← Back to journal
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {d.country ? `${d.location}, ${d.country}` : d.location}
            {d.visited_on && <> · Visited {formatDate(d.visited_on)}</>}
          </p>
          <h1 className="font-display text-5xl md:text-7xl mt-4 text-balance leading-[0.98]">{d.title}</h1>
          {d.summary && (
            <p className="display-italic text-2xl md:text-3xl text-muted-foreground mt-6 text-balance">{d.summary}</p>
          )}

          <div className="mt-12 prose prose-lg max-w-none">
            {d.story.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-foreground/90 mb-6 whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>

          {d.gallery.length > 0 && (
            <div className="mt-16">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-6">Photographs</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {d.gallery.map((url, i) => (
                  <div key={i} className="aspect-[4/5] bg-muted rounded-sm overflow-hidden">
                    <img src={url} alt={`${d.title} photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}

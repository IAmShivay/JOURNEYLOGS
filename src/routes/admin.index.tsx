import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyDestinations, deleteDestination, type DestinationDTO } from "@/lib/destinations.functions";
import { DarkSiteHeader } from "@/components/site-chrome";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Far & Wide" },
      { name: "description", content: "Private admin area for managing destinations in the Far & Wide travel journal." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Far & Wide" },
      { property: "og:description", content: "Private admin area for managing destinations." },
      { property: "og:url", content: "https://journeylogs.lovable.app/admin" },
    ],
  }),
  component: AdminIndex,
});

function AdminIndex() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchMine = useServerFn(listMyDestinations);
  const delFn = useServerFn(deleteDestination);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-destinations"],
    queryFn: () => fetchMine(),
    enabled: !!session,
  });

  const handleDelete = async (d: DestinationDTO) => {
    if (!confirm(`Delete "${d.title}"? This can't be undone.`)) return;
    await delFn({ data: { id: d.id } });
    queryClient.invalidateQueries({ queryKey: ["my-destinations"] });
    queryClient.invalidateQueries({ queryKey: ["destinations", "published"] });
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex flex-col"><DarkSiteHeader /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">Admin</p>
            <h1 className="font-display text-4xl sm:text-5xl">Your <span className="display-italic">destinations</span></h1>
          </div>
          <Link
            to="/admin/edit/$id"
            params={{ id: "new" }}
            className="self-start sm:self-auto px-5 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-tide transition text-sm"
          >
            + New destination
          </Link>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl mb-3">No destinations yet.</p>
            <p className="text-muted-foreground mb-6">Add your first travel story to get started.</p>
            <Link to="/admin/edit/$id" params={{ id: "new" }} className="text-accent underline">
              Create one →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((d) => (
              <li key={d.id} className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm bg-muted overflow-hidden shrink-0">
                    {d.cover_image_url && (
                      <img src={d.cover_image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3 className="font-display text-xl sm:text-2xl truncate">{d.title}</h3>
                      {!d.published && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">Draft</span>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {d.country ? `${d.location}, ${d.country}` : d.location} · /{d.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                  <Link
                    to="/destination/$slug" params={{ slug: d.slug }}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
                  >
                    View
                  </Link>
                  <Link
                    to="/admin/edit/$id" params={{ id: d.id }}
                    className="text-sm px-3 py-2 border border-border rounded-sm hover:bg-muted"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(d)}
                    className="text-sm px-3 py-2 text-destructive hover:bg-destructive/10 rounded-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

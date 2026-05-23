import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyDestinations, upsertDestination, type DestinationDTO } from "@/lib/destinations.functions";
import { supabase } from "@/integrations/supabase/client";
import { DarkSiteHeader } from "@/components/site-chrome";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/admin/edit/$id")({
  head: () => ({ meta: [{ title: "Edit destination — Far & Wide" }] }),
  component: EditPage,
});

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

type FormState = {
  id?: string;
  title: string;
  slug: string;
  location: string;
  country: string;
  summary: string;
  story: string;
  cover_image_url: string;
  gallery: string[];
  visited_on: string;
  published: boolean;
};

const empty: FormState = {
  title: "", slug: "", location: "", country: "",
  summary: "", story: "", cover_image_url: "",
  gallery: [], visited_on: "", published: true,
};

function EditPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading: sessLoading } = useSession();
  const fetchMine = useServerFn(listMyDestinations);
  const saveFn = useServerFn(upsertDestination);

  useEffect(() => {
    if (!sessLoading && !session) navigate({ to: "/login" });
  }, [sessLoading, session, navigate]);

  const { data: all } = useQuery({
    queryKey: ["my-destinations"],
    queryFn: () => fetchMine(),
    enabled: !!session,
  });

  const existing: DestinationDTO | undefined = isNew ? undefined : all?.find((d) => d.id === id);

  const [form, setForm] = useState<FormState>(empty);
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        title: existing.title,
        slug: existing.slug,
        location: existing.location,
        country: existing.country ?? "",
        summary: existing.summary ?? "",
        story: existing.story,
        cover_image_url: existing.cover_image_url ?? "",
        gallery: existing.gallery,
        visited_on: existing.visited_on ?? "",
        published: existing.published,
      });
      setAutoSlug(false);
    }
  }, [existing]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onTitle = (v: string) => {
    setField("title", v);
    if (autoSlug) setField("slug", slugify(v));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!session) return null;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("destination-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) { setError(error.message); return null; }
    const { data } = supabase.storage.from("destination-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setError(null);
    const url = await uploadImage(file);
    if (url) setField("cover_image_url", url);
    setUploading(false);
    e.target.value = "";
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploading(true); setError(null);
    const urls: string[] = [];
    for (const f of files) {
      const u = await uploadImage(f); if (u) urls.push(u);
    }
    setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
    setUploading(false);
    e.target.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await saveFn({
        data: {
          id: form.id,
          slug: form.slug,
          title: form.title,
          location: form.location,
          country: form.country || null,
          summary: form.summary || null,
          story: form.story,
          cover_image_url: form.cover_image_url || null,
          gallery: form.gallery,
          visited_on: form.visited_on || null,
          published: form.published,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["my-destinations"] });
      queryClient.invalidateQueries({ queryKey: ["destinations", "published"] });
      queryClient.invalidateQueries({ queryKey: ["destination", form.slug] });
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (sessLoading || !session) return <div className="min-h-screen"><DarkSiteHeader /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <DarkSiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12 w-full">
        <Link to="/admin" className="text-xs uppercase tracking-[0.25em] text-accent hover:underline">
          ← Back to admin
        </Link>
        <h1 className="font-display text-5xl mt-6 mb-10">
          {isNew ? "New destination" : <>Edit <span className="display-italic">{form.title || "destination"}</span></>}
        </h1>

        <form onSubmit={submit} className="space-y-6">
          <Field label="Title">
            <input required maxLength={200} value={form.title} onChange={(e) => onTitle(e.target.value)} className={inputCls} />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Location">
              <input required maxLength={200} value={form.location} onChange={(e) => setField("location", e.target.value)} className={inputCls} placeholder="e.g. Kyoto" />
            </Field>
            <Field label="Country">
              <input maxLength={100} value={form.country} onChange={(e) => setField("country", e.target.value)} className={inputCls} placeholder="e.g. Japan" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Slug (URL)">
              <input
                required pattern="[a-z0-9-]+" maxLength={200}
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); setField("slug", e.target.value); }}
                className={inputCls}
              />
            </Field>
            <Field label="Visited on">
              <input type="date" value={form.visited_on} onChange={(e) => setField("visited_on", e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Summary (one line)">
            <input maxLength={500} value={form.summary} onChange={(e) => setField("summary", e.target.value)} className={inputCls} placeholder="A short tagline shown on the journal grid." />
          </Field>

          <Field label="Cover image">
            {form.cover_image_url && (
              <div className="mb-3 aspect-[16/9] rounded-sm overflow-hidden bg-muted">
                <img src={form.cover_image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} className="text-sm" />
          </Field>

          <Field label="Story">
            <textarea
              required rows={14} maxLength={20000}
              value={form.story} onChange={(e) => setField("story", e.target.value)}
              className={`${inputCls} font-body leading-relaxed`}
              placeholder="Tell the story. What did you see? Who did you meet? Use blank lines to separate paragraphs."
            />
          </Field>

          <Field label="Photo gallery">
            {form.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.gallery.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-sm overflow-hidden bg-muted group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, j) => j !== i) }))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploading} className="text-sm" />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setField("published", e.target.checked)} />
            Published (visible to everyone)
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:bg-tide transition disabled:opacity-50"
            >
              {saving ? "Saving…" : isNew ? "Publish destination" : "Save changes"}
            </button>
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-card border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}

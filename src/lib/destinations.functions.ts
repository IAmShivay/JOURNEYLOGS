import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DestinationDTO = {
  id: string;
  slug: string;
  title: string;
  location: string;
  country: string | null;
  summary: string | null;
  story: string;
  cover_image_url: string | null;
  gallery: string[];
  visited_on: string | null;
  published: boolean;
  created_at: string;
};

function toDTO(row: any): DestinationDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    country: row.country,
    summary: row.summary,
    story: row.story ?? "",
    cover_image_url: row.cover_image_url,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    visited_on: row.visited_on,
    published: row.published,
    created_at: row.created_at,
  };
}

export const listPublishedDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("destinations")
    .select("id, slug, title, location, country, summary, story, cover_image_url, gallery, visited_on, published, created_at")
    .eq("published", true)
    .order("visited_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toDTO);
});

export const getDestinationBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("destinations")
      .select("id, slug, title, location, country, summary, story, cover_image_url, gallery, visited_on, published, created_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toDTO(row) : null;
  });

export const listMyDestinations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("destinations")
      .select("id, slug, title, location, country, summary, story, cover_image_url, gallery, visited_on, published, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toDTO);
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  country: z.string().max(100).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  story: z.string().max(20000).default(""),
  cover_image_url: z.string().url().max(1000).optional().nullable(),
  gallery: z.array(z.string().url().max(1000)).max(50).default([]),
  visited_on: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

export const upsertDestination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      author_id: context.userId,
      visited_on: data.visited_on || null,
    };
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("destinations")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return toDTO(row);
    }
    const { data: row, error } = await context.supabase
      .from("destinations")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toDTO(row);
  });

export const deleteDestination = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("destinations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

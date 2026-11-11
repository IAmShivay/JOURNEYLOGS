import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("subscribers")
      .insert({ email: data.email });
    if (error) {
      // Treat duplicates as success (idempotent UX)
      if (error.code === "23505") return { ok: true, already: true };
      throw new Error(error.message);
    }
    return { ok: true, already: false };
  });

"use client";

import { supabase } from "@/lib/supabaseClient";
import type { PageKey } from "@/lib/types";

export async function getOrCreatePage(key: PageKey, title: string) {
  const { data: existing, error: selErr } = await supabase
    .from("pages")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (selErr) throw selErr;

  if (existing) return existing;

  const { data: created, error: insErr } = await supabase
    .from("pages")
    .insert({ key, title, content_json: { type: "doc", content: [] } })
    .select("*")
    .single();

  if (insErr) throw insErr;
  return created;
}

export async function updatePageContent(id: string, content_json: any) {
  const { data, error } = await supabase
    .from("pages")
    .update({ content_json })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function savePageVersion(page_id: string, label: string, content_json: any) {
  const { error } = await supabase
    .from("page_versions")
    .insert({ page_id, label, content_json });

  if (error) throw error;
}

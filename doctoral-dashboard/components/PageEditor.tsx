"use client";

import { useEffect, useMemo, useState } from "react";
import RichEditor from "@/components/RichEditor";
import { getOrCreatePage, savePageVersion, updatePageContent } from "@/lib/db";
import type { PageKey } from "@/lib/types";

export default function PageEditor({ pageKey, title }: { pageKey: PageKey; title: string }) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [content, setContent] = useState<any>({ type: "doc", content: [] });
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const p = await getOrCreatePage(pageKey, title);
        setPageId(p.id);
        setContent(p.content_json ?? { type: "doc", content: [] });
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [pageKey, title]);

  async function save() {
    if (!pageId) return;
    setStatus("Saving…");
    setError("");
    try {
      await updatePageContent(pageId, content);
      setStatus("Saved.");
      setTimeout(() => setStatus(""), 1200);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  async function saveVersion() {
    if (!pageId) return;
    const label = prompt("Version label (e.g., 'Pre-professor edits')") || "";
    if (!label.trim()) return;
    setStatus("Saving version…");
    setError("");
    try {
      await savePageVersion(pageId, label.trim(), content);
      setStatus("Version saved.");
      setTimeout(() => setStatus(""), 1400);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setStatus("");
    }
  }

  return (
    <div className="card">
      <div className="topbar">
        <div>
          <div className="h2">{title}</div>
          <div className="small">Everything here is editable + saved to your database.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={saveVersion}>Save Version</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ borderColor: "rgba(255,77,109,0.35)" }}>
          <b>Setup issue:</b>
          <div className="small" style={{ marginTop: 8 }}>
            {error}
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            Make sure you created your Supabase tables (see `supabase/schema.sql`) and set `.env.local`.
          </div>
        </div>
      ) : (
        <RichEditor value={content} onChange={setContent} />
      )}

      <div className="small" style={{ marginTop: 10 }}>
        {status || "Autosave is off in MVP — click Save."}
      </div>
    </div>
  );
}

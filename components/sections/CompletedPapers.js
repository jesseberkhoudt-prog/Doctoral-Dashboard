"use client";
import { useEffect, useState } from "react";

const KEY = "doctoral_dashboard_completed_papers_notes";

export default function CompletedPapers() {
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setText(saved);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(KEY, text);
    }, 500);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Completed Papers</h1>
      <p className="text-sm opacity-70">
        Paste links, abstracts, and notes here for now. We’ll add uploads with Supabase next.
      </p>
      <textarea
        className="w-full min-h-[60vh] border rounded p-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add your completed papers list, links, abstracts, and notes..."
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth";

const items = [
  { href: "/dashboard", label: "Home (Dashboard)" },
  { href: "/bibliography", label: "Bibliography" },
  { href: "/pop", label: "Problem of Practice" },
  { href: "/lit-review", label: "Literature Review Builder" },
  { href: "/conceptual-framework", label: "Conceptual Framework" },
  { href: "/methods", label: "Methods" },
  { href: "/data-evidence", label: "Data & Evidence" },
  { href: "/stakeholders", label: "Stakeholders" },
  { href: "/writing-studio", label: "Writing Studio" },
  { href: "/timeline", label: "Timeline & Milestones" },
  { href: "/tasks", label: "Tasks / Kanban" },
  { href: "/meetings", label: "Meetings & Notes" },
  { href: "/exports", label: "Exports" }
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="navTitle">Doctoral Dashboard</div>
      <div className="small">Editable research cockpit</div>
      <div className="hr" />
      <nav className="navGroup">
        {items.map((it) => (
          <Link
            key={it.href}
            className={"navItem " + (pathname === it.href ? "active" : "")}
            href={it.href}
          >
            {it.label}
          </Link>
        ))}
      </nav>
      <div className="hr" />
      <button className="btn danger" onClick={() => signOut()}>
        Sign out
      </button>
      <div className="small" style={{ marginTop: 10 }}>
        Tip: add keyboard shortcuts later (Cmd+K search)
      </div>
    </aside>
  );
}

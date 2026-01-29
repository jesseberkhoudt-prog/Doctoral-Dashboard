"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("Signing in…");
    const { data, error } = await signIn(email, password);
    if (error) {
      setErr(error.message);
      setMsg("");
      return;
    }
    if (data.session) {
      router.push("/dashboard");
    } else {
      setMsg("Check your email if magic-link is enabled. Otherwise verify credentials.");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 60 }}>
      <div className="card">
        <div className="h1">Doctoral Dashboard</div>
        <div className="small">Sign in to edit your research cockpit.</div>
        <div className="hr" />
        <form onSubmit={onSubmit} className="grid">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn primary" type="submit">Sign in</button>
          {msg ? <div className="small">{msg}</div> : null}
          {err ? <div className="small" style={{ color: "var(--danger)" }}>{err}</div> : null}
          <div className="small">
            If this errors, set `.env.local` and run the SQL in `supabase/schema.sql`.
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await getSession();
      if (error) {
        console.error(error);
        router.replace("/login");
        return;
      }
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  if (!ready) return <div className="container"><div className="card">Checking session…</div></div>;
  return <>{children}</>;
}

import Shell from "@/components/Shell";
import RequireAuth from "@/components/RequireAuth";
import PageEditor from "@/components/PageEditor";

export default function Page() {
  return (
    <RequireAuth>
      <Shell>
        <div className="topbar">
          <h1 className="h1">Bibliography (linked; content managed elsewhere)</h1>
          <div className="small">Editable • Versionable • Export-ready</div>
        </div>
        <PageEditor pageKey="bibliography" title="Bibliography (linked; content managed elsewhere)" />
      </Shell>
    </RequireAuth>
  );
}

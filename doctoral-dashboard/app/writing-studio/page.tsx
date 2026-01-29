import Shell from "@/components/Shell";
import RequireAuth from "@/components/RequireAuth";
import PageEditor from "@/components/PageEditor";

export default function Page() {
  return (
    <RequireAuth>
      <Shell>
        <div className="topbar">
          <h1 className="h1">Writing Studio</h1>
          <div className="small">Editable • Versionable • Export-ready</div>
        </div>
        <PageEditor pageKey="writing-studio" title="Writing Studio" />
      </Shell>
    </RequireAuth>
  );
}

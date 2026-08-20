import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header userName={userName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

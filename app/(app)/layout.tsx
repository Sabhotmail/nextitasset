import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <Providers session={session}>
      <AppShell userName={session?.user?.name}>{children}</AppShell>
    </Providers>
  );
}

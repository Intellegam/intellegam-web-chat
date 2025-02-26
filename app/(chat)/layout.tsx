import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { ViewConfigProvider } from '@/contexts/view-config-context';
import { STANDARD_CONFIG } from '@/contexts/viewConfigPresets';
import Script from 'next/script';
import { auth } from '../(auth)/auth';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <ViewConfigProvider config={STANDARD_CONFIG}>
        <SidebarProvider defaultOpen={!isCollapsed}>
          {session?.user && <AppSidebar user={session?.user} />}
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ViewConfigProvider>
    </>
  );
}

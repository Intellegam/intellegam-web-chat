'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { ViewConfigProvider } from '@/contexts/view-config-context';
import { IFRAME_CONFIG } from '@/contexts/viewConfigPresets';
import Script from 'next/script';

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      {/* We include SidebarProvider but with defaultOpen=false to satisfy the hook requirements,
          but no actual sidebar will be rendered because we don't include the AppSidebar component */}
      <SidebarProvider defaultOpen={false}>
        <ViewConfigProvider config={IFRAME_CONFIG}>
          <div className="size-full">{children}</div>
        </ViewConfigProvider>
      </SidebarProvider>
    </>
  );
}

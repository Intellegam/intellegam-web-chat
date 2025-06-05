'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useChatSettingsContext } from '@/contexts/chat-config-context';
import { useViewConfig } from '@/contexts/view-config-context';
import type { Session } from 'next-auth';
import { memo } from 'react';
import { PlusIcon } from './icons';
import { ModeToggle } from './mode-toggle';
import { ModelSelector } from './model-selector';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilitySelector, type VisibilityType } from './visibility-selector';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session?: UserInfo | NoUserInfo;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const viewConfig = useViewConfig();

  const { width: windowWidth } = useWindowSize();
  const { chatConfig } = useChatSettingsContext();

  return (
    <header className="top-0 sticky flex items-center gap-2 px-2 md:px-2 py-1.5">
      {viewConfig.showSidebar && <SidebarToggle />}
      <ModeToggle className="order-1" />

      {!isReadonly && !viewConfig.isIframe && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1"
        />
      )}

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 ml-auto px-2 md:h-fit"
              onClick={() => {
                if (!viewConfig.isIframe) {
                  router.push('/');
                }
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:hidden block">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent align="end">New Chat</TooltipContent>
        </Tooltip>
      )}
      {!isReadonly && !viewConfig.isIframe && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      <div
        className={`absolute ${open ? 'right-0' : 'right-1/2 translate-x-1/2'} flex justify-between items-center gap-x-3`}
      >
        <img
          src={chatConfig.titleLogo || '/images/intellegam_logo_light.svg'}
          alt="title logo"
          className="w-auto h-9"
        />
        <div
          className={`hidden ${open ? '' : 'sm:block'} font-semibold text-lg`}
        >
          {chatConfig.title}
        </div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return true;
  // return prevProps.selectedModelId === nextProps.selectedModelId;
});

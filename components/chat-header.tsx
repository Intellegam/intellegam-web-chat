'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useViewConfig } from '@/contexts/view-config-context';
import Image from 'next/image';
import { memo } from 'react';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilitySelector, type VisibilityType } from './visibility-selector';
import { useChatSettingsContext } from '@/contexts/chat-config-context';
import { ModeToggle } from './mode-toggle';

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const viewConfig = useViewConfig();

  const { width: windowWidth } = useWindowSize();
  const { chatConfig } = useChatSettingsContext();

  return (
    <header className="top-0 sticky flex items-center gap-2 px-2 md:px-2 py-1.5">
      {viewConfig.showSidebar && <SidebarToggle />}
      <ModeToggle />

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
              <span className="hidden md:block">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && !viewConfig.isIframe && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-2"
        />
      )}
      <div className="right-1/2 absolute flex justify-between items-center gap-x-3 translate-x-1/2">
        <Image
          width={0}
          height={0}
          src={chatConfig.titleLogo || '/images/intellegam_logo_light.svg'}
          alt="title logo"
          className="w-auto h-9"
        />
        <div className="hidden sm:block font-semibold text-lg">
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

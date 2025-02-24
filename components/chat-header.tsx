'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilitySelector, type VisibilityType } from './visibility-selector';
import Image from 'next/image';

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  isIframe,
  titleLogo,
  title,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isIframe: boolean;
  titleLogo?: string;
  title?: string;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 py-1.5 items-center px-2 md:px-2 gap-2">
      {!isIframe && <SidebarToggle />}

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 px-2 md:h-fit ml-auto"
              onClick={() => {
                if (!isIframe) {
                  router.push('/');
                }
                router.refresh();
              }}
            >
              <PlusIcon />
              <span>New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && !isIframe && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-2"
        />
      )}
      <div className="flex absolute right-1/2 translate-x-1/2 items-center justify-between gap-x-3">
        <Image
          //TODO:
          width={36}
          height={36}
          src={titleLogo || '/images/intellegam_logo_light.svg'}
          alt="title logo"
          className="size-9"
        />
        <div className="text-lg font-semibold hidden sm:block">{title}</div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return true;
  // return prevProps.selectedModelId === nextProps.selectedModelId;
});

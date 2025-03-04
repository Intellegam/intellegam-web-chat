/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useState } from 'react';

export default function ImagePopup({
  src,
  alt,
}: { src?: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img src={src || ''} alt={alt || ''} className="cursor-pointer" />
      </DialogTrigger>
      <DialogPortal>
        <DialogContent className="max-w-6xl" onClick={() => setIsOpen(false)}>
          <DialogHeader>
            <DialogTitle asChild>
              <span>{alt}</span>
            </DialogTitle>
          </DialogHeader>
          <VisuallyHidden>
            <DialogDescription>{alt}</DialogDescription>
          </VisuallyHidden>
          <div className="relative w-full">
            <img
              src={src || ''}
              alt={alt || ''}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

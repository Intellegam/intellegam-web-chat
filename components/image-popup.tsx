/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DialogPortal, DialogTitle } from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function ImagePopup({
  src,
  alt,
}: { src?: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  console.log(alt);

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
          <div className="relative w-full">
            <img
              src={src || ''}
              alt={alt || ''}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

import type { Attachment } from 'ai';

import { X } from 'lucide-react';
import { LoaderIcon } from './icons';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  removeAttachmentCallback,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  removeAttachmentCallback?: () => void;
}) => {
  const { name, url, contentType } = attachment;

  return (
    // biome-ignore lint/nursery/noStaticElementInteractions: <explanation>
    <div
      data-testid="input-attachment-preview"
      onClick={removeAttachmentCallback}
      className="flex flex-col gap-2"
    >
      <div className="relative flex flex-col justify-center items-center bg-muted rounded-md w-20 h-16 aspect-video">
        <div className="absolute inset-0 flex justify-center items-center bg-black opacity-0 hover:opacity-60 transition-opacity duration-300">
          <X size={24} />
        </div>
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="absolute text-zinc-500 animate-spin"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="max-w-16 text-zinc-500 text-xs truncate">{name}</div>
    </div>
  );
};

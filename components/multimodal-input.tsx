'use client';

import type { Attachment, Message } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { useChatSettingsContext } from '@/contexts/chat-config-context';
import { useViewConfig } from '@/contexts/view-config-context';
import { processFilesForUpload } from '@/lib/utils/fileUploadUtils';
import type { UseChatHelpers } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PoweredBy } from './powered-by';
import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import WebToggleButton from './web-toggle-button';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const viewConfig = useViewConfig();
  const { chatConfig, adminChatConfig } = useChatSettingsContext();
  const [searchWeb, setSearchWeb] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    if (!viewConfig.isIframe) {
      window.history.replaceState({}, '', `/chat/${chatId}`);
    }

    handleSubmit(undefined, {
      experimental_attachments: attachments,
      body: { enableWebSearch: searchWeb },
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    viewConfig.isIframe,
    handleSubmit,
    attachments,
    searchWeb,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      setUploadQueue(files.map((file) => file.name));

      try {
        // const uploadPromises = files.map((file) => uploadFile(file));
        // const uploadedAttachments = await Promise.all(uploadPromises);
        // const successfullyUploadedAttachments = uploadedAttachments.filter(
        //   (attachment) => attachment !== undefined,
        // );
        const newAttachments = await processFilesForUpload(files, attachments, {
          maxAttachments: MAX_ATTACHMENTS,
          maxFileSize: MAX_FILE_SIZE,
          validTypes: VALID_FILE_TYPES,
          onError: (error) => {
            // Display appropriate error message with toast
            if (error.affectedFiles && error.affectedFiles.length > 0) {
              toast.error(
                `${error.message}: ${error.affectedFiles.join(', ')}`,
              );
            } else {
              toast.error(error.message);
            }
          },
        });
        if (newAttachments.length > 0) {
          setAttachments((currentAttachments) => [
            ...currentAttachments,
            ...newAttachments,
          ]);
        }
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [attachments, setAttachments],
  );

  return (
    <div className="relative flex flex-col gap-4 w-full">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="-top-4 -left-4 fixed opacity-0 size-0.5 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
        accept={VALID_FILE_TYPES.join(',')}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row items-end gap-2 overflow-x-scroll"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
              removeAttachmentCallback={() =>
                setAttachments((currentAttachments) => [
                  ...currentAttachments.filter((f) => f !== attachment),
                ])
              }
            />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder={chatConfig.inputPlaceholder || 'How can i help ?'}
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="bottom-0 absolute flex flex-row justify-start p-2 w-fit">
        <div className="flex items-center gap-x-2">
          {adminChatConfig.showFileUpload && (
            <AttachmentsButton fileInputRef={fileInputRef} status={status} />
          )}
          {adminChatConfig.showWebSearch && (
            <WebToggleButton setSearchWeb={setSearchWeb} />
          )}
        </div>
      </div>

      <div className="bottom-0 left-1/2 absolute p-2 -translate-x-1/2 sm:translate-y-1">
        <PoweredBy poweredByName={adminChatConfig.poweredBy} />
      </div>

      <div className="right-0 bottom-0 absolute flex flex-row justify-end p-2 w-fit">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="hover:bg-zinc-200 hover:dark:bg-zinc-900 p-[7px] dark:border-zinc-700 rounded-md rounded-bl-lg h-fit"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      data-testid="stop-button"
      className="p-1.5 border dark:border-zinc-600 rounded-full h-fit"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="p-1.5 border dark:border-zinc-600 rounded-full h-fit"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

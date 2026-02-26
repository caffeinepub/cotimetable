import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Download, FileText, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGetMessages, useSendMessage } from '../hooks/useQueries';
import type { Message } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import type { UserProfile } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface AttachmentPreview {
  file: File;
  previewUrl: string;
  isImage: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  userTimezone: string;
}

function MessageBubble({ message, isOwn, senderName, userTimezone }: MessageBubbleProps) {
  // Convert nanosecond timestamp (bigint) to Date
  const date = new Date(Number(message.timestamp / 1_000_000n));
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    month: 'short',
    day: 'numeric',
  });

  const fileBlob = message.file;
  const mimeType = message.mimeType ?? '';
  const fileName = message.fileName ?? 'attachment';
  const isImage = mimeType.startsWith('image/');

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'} animate-fade-in`}>
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-medium text-muted-foreground">{senderName}</span>
        <span className="text-xs text-muted-foreground">{dateStr} · {timeStr}</span>
      </div>
      <div
        className="max-w-xs sm:max-w-sm rounded-2xl px-3 py-2"
        style={
          isOwn
            ? {
                background: 'oklch(0.76 0.14 65 / 0.15)',
                border: '1px solid oklch(0.76 0.14 65 / 0.3)',
                borderTopRightRadius: '4px',
              }
            : {
                background: 'oklch(0.22 0.06 270 / 0.8)',
                border: '1px solid oklch(0.38 0.08 270)',
                borderTopLeftRadius: '4px',
              }
        }
      >
        {message.content && (
          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{message.content}</p>
        )}
        {fileBlob && (
          <div className="mt-2">
            {isImage ? (
              <img
                src={fileBlob.getDirectURL()}
                alt={fileName}
                className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(fileBlob.getDirectURL(), '_blank')}
              />
            ) : (
              <a
                href={fileBlob.getDirectURL()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity rounded-lg px-3 py-2"
                style={{
                  color: 'oklch(0.76 0.14 65)',
                  background: 'oklch(0.76 0.14 65 / 0.1)',
                  border: '1px solid oklch(0.76 0.14 65 / 0.2)',
                }}
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  myProfile: UserProfile;
  myPrincipal: Principal;
  partnerProfile: UserProfile | null;
  partnerPrincipal: Principal | null;
}

export default function ChatInterface({
  myProfile,
  myPrincipal,
  partnerProfile,
}: ChatInterfaceProps) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading, refetch, isFetching } = useGetMessages();
  const sendMessage = useSendMessage();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File exceeds 2MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : '';
    setAttachment({ file, previewUrl, isImage });
    e.target.value = '';
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
    setFileError('');
  };

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    setFileError('');
    setUploadProgress(0);

    let externalBlob: ExternalBlob | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;

    if (attachment) {
      try {
        const bytes = new Uint8Array(await attachment.file.arrayBuffer());
        externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        fileName = attachment.file.name;
        mimeType = attachment.file.type || 'application/octet-stream';
      } catch {
        setFileError('Failed to process attachment.');
        return;
      }
    }

    try {
      await sendMessage.mutateAsync({
        content: text.trim(),
        file: externalBlob,
        fileName,
        mimeType,
      });
      setText('');
      removeAttachment();
      setUploadProgress(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFileError(msg || 'Failed to send message.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSenderName = (senderPrincipal: Principal): string => {
    if (senderPrincipal.toString() === myPrincipal.toString()) {
      return myProfile.displayName;
    }
    return partnerProfile?.displayName || 'Partner';
  };

  const isOwn = (senderPrincipal: Principal): boolean => {
    return senderPrincipal.toString() === myPrincipal.toString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid oklch(0.76 0.14 65 / 0.2)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />
          <span className="font-display text-sm font-semibold" style={{ color: 'oklch(0.84 0.14 88)' }}>
            {partnerProfile ? `Chat with ${partnerProfile.displayName}` : 'Chat'}
          </span>
          {isFetching && !isLoading && (
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
              style={{ background: 'oklch(0.76 0.14 65)' }}
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-muted-foreground hover:text-foreground w-7 h-7"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(0.76 0.14 65 / 0.12)', border: '1px solid oklch(0.76 0.14 65 / 0.25)' }}
            >
              <Send className="w-5 h-5" style={{ color: 'oklch(0.76 0.14 65)' }} />
            </div>
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! ✨</p>
          </div>
        ) : (
          messages.map((msg: Message, idx: number) => (
            <MessageBubble
              key={`${msg.sender.toString()}-${msg.timestamp.toString()}-${idx}`}
              message={msg}
              isOwn={isOwn(msg.sender)}
              senderName={getSenderName(msg.sender)}
              userTimezone={myProfile.timeZone}
            />
          ))
        )}
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div
          className="px-4 py-2"
          style={{ borderTop: '1px solid oklch(0.38 0.08 270)' }}
        >
          <div className="flex items-center gap-2">
            {attachment.isImage ? (
              <img
                src={attachment.previewUrl}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'oklch(0.76 0.14 65 / 0.12)' }}
              >
                <FileText className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{attachment.file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachment.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeAttachment}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ background: 'oklch(0.22 0.06 270)' }}
            >
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(90deg, oklch(0.76 0.14 65), oklch(0.84 0.14 88))',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {fileError && (
        <div
          className="px-4 py-2"
          style={{ borderTop: '1px solid oklch(0.62 0.22 25 / 0.3)', background: 'oklch(0.62 0.22 25 / 0.08)' }}
        >
          <p className="text-xs text-destructive">{fileError}</p>
        </div>
      )}

      {/* Input area */}
      <div
        className="px-4 py-3"
        style={{ borderTop: '1px solid oklch(0.76 0.14 65 / 0.15)' }}
      >
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground shrink-0 mb-0.5 transition-colors"
            style={{ '--hover-color': 'oklch(0.76 0.14 65)' } as React.CSSProperties}
            disabled={sendMessage.isPending}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 min-h-[40px] max-h-[120px] resize-none text-foreground placeholder:text-muted-foreground text-sm"
            style={{
              background: 'oklch(0.22 0.06 270)',
              border: '1px solid oklch(0.38 0.08 270)',
            }}
            rows={1}
            disabled={sendMessage.isPending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sendMessage.isPending || (!text.trim() && !attachment)}
            className="shrink-0 mb-0.5 transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
              color: 'oklch(0.12 0.03 270)',
            }}
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

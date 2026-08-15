import * as React from 'react';
import { Button } from '@pdfplatform/ui';
import { IconMic, IconSend, IconStop } from '@/components/icons';

interface ChatInputProps {
  disabled: boolean;
  streaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

interface SpeechResult {
  results: {
    readonly length: number;
    readonly [index: number]: { 0?: { transcript: string }; isFinal: boolean };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechResult) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const globalWindow = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition ?? null;
}

export function ChatInput({
  disabled,
  streaming,
  onSend,
  onStop,
}: ChatInputProps): React.ReactElement {
  const [value, setValue] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);

  const SpeechRecognitionCtor = React.useMemo(getSpeechRecognition, []);
  const supportsVoice = SpeechRecognitionCtor !== null;

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const submit = (): void => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled || streaming) {
      return;
    }
    onSend(trimmed);
    setValue('');
  };

  const toggleListening = (): void => {
    if (!SpeechRecognitionCtor) {
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.[0]?.transcript) {
          transcript += result[0].transcript;
        }
      }
      if (transcript) {
        setValue(transcript);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-white p-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/30 dark:border-slate-700 dark:bg-slate-800">
        <textarea
          ref={textareaRef}
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Ask about this document…"
          aria-label="Message the AI assistant"
          className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {supportsVoice ? (
          <Button
            size="icon-sm"
            variant={listening ? 'primary' : 'ghost'}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={listening}
            onClick={toggleListening}
          >
            <IconMic />
          </Button>
        ) : null}
        {streaming ? (
          <Button size="icon-sm" variant="destructive" aria-label="Stop generating" onClick={onStop}>
            <IconStop />
          </Button>
        ) : (
          <Button
            size="icon-sm"
            aria-label="Send message"
            disabled={disabled || value.trim().length === 0}
            onClick={submit}
          >
            <IconSend />
          </Button>
        )}
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-slate-400 dark:text-slate-500">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  );
}

import * as React from "react";
import { Paperclip, UploadCloud, X } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/utils";

export interface DragDropFileInputProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
  /** Currently attached files, rendered as removable chips. */
  files?: File[];
  onRemoveFile?: (index: number) => void;
  className?: string;
}

/** Unified drop zone (ATLANTIS DragDropFileInput + NAVI DragDropZone). */
export function DragDropFileInput({
  onFilesSelected,
  accept,
  multiple = true,
  maxSizeMb = 25,
  disabled,
  label = "Dra och släpp filer här",
  hint = "eller klicka för att välja",
  files,
  onRemoveFile,
  className,
}: DragDropFileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handle = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.filter((f) => f.size > maxSizeMb * 1024 * 1024);
    if (tooBig.length) {
      setError(`Filen är för stor (max ${maxSizeMb} MB): ${tooBig[0].name}`);
      return;
    }
    setError(null);
    onFilesSelected(multiple ? picked : picked.slice(0, 1));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) handle(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 px-4 py-8 text-center transition-colors",
          over && "border-accent bg-accent/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            handle(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="text-xs text-status-error">{error}</p>}

      {files && files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-1.5 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
              </span>
              {onRemoveFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRemoveFile(i)}
                  aria-label={`Ta bort ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

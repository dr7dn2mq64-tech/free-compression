import { useState, useRef } from "react";
import { Upload, X, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}

export default function FileDropZone({
  files,
  onFilesChange,
  multiple = true,
  accept,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    onFilesChange(multiple ? [...files, ...incoming] : incoming);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const next = [...files];
    next.splice(index, 1);
    onFilesChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer border-2 border-dashed p-8 text-center transition-all duration-200",
          isDragging
            ? "border-[var(--accent)] bg-[var(--surface-raised)] scale-[1.02]"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload
          className={cn(
            "mx-auto mb-3 h-8 w-8 transition-transform duration-200",
            isDragging && "scale-110"
          )}
        />
        <p className="text-sm text-[var(--text)]">
          {isDragging ? "释放文件以上传" : "点击或拖拽文件到此处"}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {multiple ? "支持多个文件" : "仅支持单个文件"}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileArchive className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span className="truncate text-sm">{file.name}</span>
                <span className="shrink-0 text-xs text-[var(--text-muted)]">
                  {file.size.toLocaleString()} B
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                aria-label="移除文件"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

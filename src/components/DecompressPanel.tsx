import { useState } from "react";
import { Loader2, FileDown } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { decompressFile, detectFormat, type DecompressOutput } from "@/utils/decompression";
import { type CompressionFormat } from "@/utils/compression";
import { downloadBlob, formatBytes } from "@/utils/file";

const FORMATS: { value: CompressionFormat; label: string; ext: string }[] = [
  { value: "zip", label: "ZIP", ext: ".zip" },
  { value: "gzip", label: "GZIP", ext: ".gz" },
  { value: "deflate", label: "DEFLATE", ext: ".deflate" },
  { value: "zlib", label: "ZLIB", ext: ".zlib" },
];

interface DecompressPanelProps {
  onError: (message: string) => void;
}

export default function DecompressPanel({ onError }: DecompressPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<CompressionFormat | "auto">("auto");
  const [files, setFiles] = useState<DecompressOutput["files"]>([]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFiles([]);
  };

  const handleFilesChange = (next: File[]) => {
    if (next.length === 0) {
      setFile(null);
      setFormat("auto");
      setFiles([]);
      return;
    }
    const selected = next[0];
    setFile(selected);
    const detected = detectFormat(selected.name);
    if (detected) setFormat(detected);
  };

  const handleDecompress = async () => {
    reset();
    if (!file) {
      onError("请先上传压缩文件");
      return;
    }
    const fmt = format === "auto" ? undefined : format;
    setLoading(true);
    try {
      const output = await decompressFile(file, fmt);
      setFiles(output.files);
    } catch (err) {
      onError(err instanceof Error ? err.message : "解压失败");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (name: string, data: Uint8Array) => {
    downloadBlob(data, name, "application/octet-stream");
  };

  return (
    <div className="space-y-6">
      <section className="border-2 border-[var(--border)] bg-[var(--surface)] p-6">
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          上传压缩文件
        </label>
        <FileDropZone
          files={file ? [file] : []}
          onFilesChange={handleFilesChange}
          multiple={false}
          accept=".zip,.gz,.gzip,.deflate,.zlib"
        />
      </section>

      <section className="flex flex-wrap items-center gap-4 border-2 border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          格式识别
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as CompressionFormat | "auto")}
          className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="auto">自动识别</option>
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label} ({f.ext})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void handleDecompress()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-2 text-sm font-bold uppercase tracking-wider text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          开始解压
        </button>
      </section>

      {files.length > 0 && (
        <section className="animate-fade-in-up border-2 border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            解压结果
          </p>
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center justify-between border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{f.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatBytes(f.data.length)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadFile(f.name, f.data)}
                  className="inline-flex shrink-0 items-center gap-1 border border-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                >
                  <FileDown className="h-3 w-3" />
                  下载
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { Download, Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import StatsCard from "@/components/StatsCard";
import { compressFiles, textToInput, type CompressionFormat } from "@/utils/compression";
import { downloadBlob, formatBytes, readFileAsUint8Array } from "@/utils/file";

const FORMATS: { value: CompressionFormat; label: string; ext: string }[] = [
  { value: "zip", label: "ZIP", ext: ".zip" },
  { value: "gzip", label: "GZIP", ext: ".gz" },
  { value: "deflate", label: "DEFLATE", ext: ".deflate" },
  { value: "zlib", label: "ZLIB", ext: ".zlib" },
];

interface CompressPanelProps {
  onError: (message: string) => void;
}

export default function CompressPanel({ onError }: CompressPanelProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<CompressionFormat>("zip");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [resultFilename, setResultFilename] = useState("");
  const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalOriginalSize = useMemo(() => {
    return files.reduce((sum, f) => sum + f.size, 0) + new TextEncoder().encode(text).length;
  }, [files, text]);

  const reset = () => {
    setResult(null);
    setResultFilename("");
    setStats(null);
  };

  const handleCompress = async () => {
    reset();
    const inputs: { name: string; data: Uint8Array }[] = [];
    for (const file of files) {
      inputs.push({ name: file.name, data: await readFileAsUint8Array(file) });
    }
    if (text.trim()) {
      inputs.push(textToInput(text));
    }
    if (inputs.length === 0) {
      onError("请先输入文本或上传文件");
      return;
    }
    if (format !== "zip" && inputs.length > 1) {
      onError("GZIP / DEFLATE / ZLIB 仅支持单个文件，请使用 ZIP 格式");
      return;
    }
    setLoading(true);
    try {
      const output = await compressFiles(inputs, format);
      setResult(output.data);
      setResultFilename(output.filename);
      setStats({ original: totalOriginalSize, compressed: output.data.length });
    } catch (err) {
      onError(err instanceof Error ? err.message : "压缩失败");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result || !resultFilename) return;
    downloadBlob(result, resultFilename, "application/octet-stream");
  };

  return (
    <div className="space-y-6">
      <section className="border-2 border-[var(--border)] bg-[var(--surface)] p-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          文本输入
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴文本内容…"
          className="min-h-[120px] w-full resize-y border border-[var(--border)] bg-[var(--bg)] p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </section>

      <section className="border-2 border-[var(--border)] bg-[var(--surface)] p-6">
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          文件上传
        </label>
        <FileDropZone files={files} onFilesChange={setFiles} multiple />
      </section>

      <section className="flex flex-wrap items-center gap-4 border-2 border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          压缩格式
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as CompressionFormat)}
          className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
        >
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label} ({f.ext})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void handleCompress()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-2 border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-2 text-sm font-bold uppercase tracking-wider text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          开始压缩
        </button>
      </section>

      {stats && (
        <section className="animate-fade-in-up">
          <StatsCard originalSize={stats.original} compressedSize={stats.compressed} />
        </section>
      )}

      {result && (
        <section className="animate-fade-in-up border-2 border-[var(--accent)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)]">输出文件</p>
              <p className="text-sm font-bold text-[var(--text)]">{resultFilename}</p>
              <p className="text-xs text-[var(--text-muted)]">{formatBytes(result.length)}</p>
            </div>
            <button
              type="button"
              onClick={downloadResult}
              className="inline-flex items-center gap-2 border-2 border-[var(--accent)] px-5 py-2 text-sm font-bold uppercase tracking-wider text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
            >
              <Download className="h-4 w-4" />
              下载
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

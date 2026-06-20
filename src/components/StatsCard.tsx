import { formatBytes } from "@/utils/file";

interface StatsCardProps {
  originalSize: number;
  compressedSize: number;
}

export default function StatsCard({ originalSize, compressedSize }: StatsCardProps) {
  const ratio = originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0;
  const isSaving = ratio > 0;

  return (
    <div className="grid grid-cols-3 gap-4 border-2 border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">原始大小</p>
        <p className="mt-1 text-lg font-bold text-[var(--text)]">{formatBytes(originalSize)}</p>
      </div>
      <div className="text-center border-l border-r border-[var(--border)]">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">压缩后</p>
        <p className="mt-1 text-lg font-bold text-[var(--accent)]">{formatBytes(compressedSize)}</p>
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
          {isSaving ? "节省" : "膨胀"}
        </p>
        <p
          className={`mt-1 text-lg font-bold ${
            isSaving ? "text-[var(--accent)]" : "text-red-400"
          }`}
        >
          {isSaving ? `${ratio.toFixed(1)}%` : `${(-ratio).toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}

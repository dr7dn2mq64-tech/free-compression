import { cn } from "@/lib/utils";

interface ModeTabsProps {
  mode: "compress" | "decompress";
  onChange: (mode: "compress" | "decompress") => void;
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex border-2 border-[var(--border)]">
      <button
        type="button"
        onClick={() => onChange("compress")}
        className={cn(
          "flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200",
          mode === "compress"
            ? "bg-[var(--accent)] text-[var(--bg)]"
            : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
        )}
      >
        压缩
      </button>
      <button
        type="button"
        onClick={() => onChange("decompress")}
        className={cn(
          "flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200",
          mode === "decompress"
            ? "bg-[var(--accent)] text-[var(--bg)]"
            : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
        )}
      >
        解压
      </button>
    </div>
  );
}

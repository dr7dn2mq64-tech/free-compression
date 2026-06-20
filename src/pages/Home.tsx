import { useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import ModeTabs from "@/components/ModeTabs";
import CompressPanel from "@/components/CompressPanel";
import DecompressPanel from "@/components/DecompressPanel";

export default function Home() {
  const [mode, setMode] = useState<"compress" | "decompress">("compress");
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = useCallback((next: "compress" | "decompress") => {
    setMode(next);
    setError(null);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-12">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-10 animate-fade-in-up">
          <h1
            className="text-5xl font-extrabold tracking-tight text-[var(--text)]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            FREE COMPRESSION
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            本地压缩 / 解压工具 · ZIP · GZIP · DEFLATE · ZLIB
          </p>
        </header>

        <div className="animate-fade-in-up animate-delay-1">
          <ModeTabs mode={mode} onChange={handleModeChange} />
        </div>

        <main className="mt-8 animate-fade-in-up animate-delay-2">
          {mode === "compress" ? (
            <CompressPanel onError={handleError} />
          ) : (
            <DecompressPanel onError={handleError} />
          )}

          {error && (
            <div className="mt-6 flex items-center gap-3 border-2 border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200 animate-fade-in-up">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-xs text-[var(--text-muted)] animate-fade-in-up animate-delay-3">
          所有处理均在浏览器本地完成，文件不会被上传到服务器。
        </footer>
      </div>
    </div>
  );
}

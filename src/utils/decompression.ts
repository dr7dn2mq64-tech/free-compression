import { unzip, gunzip, inflate, unzlib } from "fflate";
import type { CompressionFormat } from "./compression";

export interface DecompressOutput {
  files: { name: string; data: Uint8Array }[];
  filename?: string;
}

const EXT_FORMAT_MAP: Record<string, CompressionFormat | undefined> = {
  ".zip": "zip",
  ".gz": "gzip",
  ".gzip": "gzip",
  ".deflate": "deflate",
  ".zlib": "zlib",
};

export function detectFormat(filename: string): CompressionFormat | null {
  const lower = filename.toLowerCase();
  for (const [ext, format] of Object.entries(EXT_FORMAT_MAP)) {
    if (lower.endsWith(ext)) return format;
  }
  return null;
}

function fflatePromise<T>(
  fn: (cb: (err: Error | null, data: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function decompressZip(data: Uint8Array): Promise<DecompressOutput> {
  return fflatePromise<Record<string, Uint8Array>>((cb) => unzip(data, cb)).then(
    (record) => ({
      files: Object.entries(record).map(([name, buf]) => ({ name, data: buf })),
    })
  );
}

function decompressGzip(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => gunzip(data, cb));
}

function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => inflate(data, cb));
}

function decompressZlib(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => unzlib(data, cb));
}

function getBaseName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export async function decompressFile(
  file: File,
  formatOverride?: CompressionFormat
): Promise<DecompressOutput> {
  const data = await file.arrayBuffer().then((buf) => new Uint8Array(buf));
  const format = formatOverride ?? detectFormat(file.name);

  if (!format) {
    throw new Error("无法识别压缩格式，请手动选择");
  }

  if (format === "zip") {
    return decompressZip(data);
  }

  let result: Uint8Array;
  if (format === "gzip") {
    result = await decompressGzip(data);
  } else if (format === "deflate") {
    result = await decompressDeflate(data);
  } else {
    result = await decompressZlib(data);
  }

  const baseName = getBaseName(file.name);
  const outputName = format === "gzip" ? baseName : `${baseName}.out`;
  return { files: [{ name: outputName, data: result }], filename: outputName };
}

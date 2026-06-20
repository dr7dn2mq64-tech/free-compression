import { zip, gzip, deflate, zlib, strToU8 } from "fflate";

export type CompressionFormat = "zip" | "gzip" | "deflate" | "zlib";

export interface CompressInput {
  name: string;
  data: Uint8Array;
}

export interface CompressOutput {
  data: Uint8Array;
  filename: string;
  ext: string;
}

const EXT_MAP: Record<CompressionFormat, string> = {
  zip: ".zip",
  gzip: ".gz",
  deflate: ".deflate",
  zlib: ".zlib",
};

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

function compressZip(files: CompressInput[]): Promise<Uint8Array> {
  const record: Record<string, Uint8Array> = {};
  for (const file of files) {
    record[file.name] = file.data;
  }
  return fflatePromise((cb) => zip(record, { level: 6 }, cb));
}

function compressGzip(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => gzip(data, { level: 6 }, cb));
}

function compressDeflate(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => deflate(data, { level: 6 }, cb));
}

function compressZlib(data: Uint8Array): Promise<Uint8Array> {
  return fflatePromise((cb) => zlib(data, { level: 6 }, cb));
}

function getBaseName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

export async function compressFiles(
  inputs: CompressInput[],
  format: CompressionFormat
): Promise<CompressOutput> {
  if (inputs.length === 0) {
    throw new Error("请先输入文本或上传文件");
  }

  let data: Uint8Array;
  let filename: string;

  if (format === "zip") {
    data = await compressZip(inputs);
    filename = inputs.length === 1 ? `${getBaseName(inputs[0].name)}.zip` : "archive.zip";
  } else {
    if (inputs.length > 1) {
      throw new Error("GZIP / DEFLATE / ZLIB 仅支持单个文件，请使用 ZIP 格式打包多个文件");
    }
    const [input] = inputs;
    if (format === "gzip") {
      data = await compressGzip(input.data);
    } else if (format === "deflate") {
      data = await compressDeflate(input.data);
    } else {
      data = await compressZlib(input.data);
    }
    filename = `${getBaseName(input.name)}${EXT_MAP[format]}`;
  }

  return { data, filename, ext: EXT_MAP[format] };
}

export function textToInput(text: string, filename = "input.txt"): CompressInput {
  return { name: filename, data: strToU8(text) };
}

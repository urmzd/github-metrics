import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

// Bump when AI request/response shapes change so stale entries are discarded.
const CACHE_VERSION = 1;

interface CacheEntry {
  hash: string;
  value: unknown;
}

interface CacheFile {
  version: number;
  entries: Record<string, CacheEntry>;
}

/**
 * Deterministic JSON serialization: object keys are sorted and
 * undefined-valued properties are dropped, so the same logical inputs
 * always hash to the same string regardless of key insertion order.
 */
const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v === undefined ? null : v)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(record).sort()) {
    if (record[key] === undefined) continue;
    parts.push(`${JSON.stringify(key)}:${stableStringify(record[key])}`);
  }
  return `{${parts.join(",")}}`;
};

/** Hash everything that affects an AI call's output: inputs + prompt valves. */
export const hashAIInputs = (
  kind: string,
  inputs: unknown,
  valves: unknown,
): string =>
  createHash("sha256")
    .update(stableStringify({ v: CACHE_VERSION, kind, inputs, valves }))
    .digest("hex");

/**
 * File-backed cache of AI outputs keyed by an input hash. Stored inside the
 * output directory so CI runs that commit generated assets also persist the
 * cache, letting subsequent runs skip model calls when inputs are unchanged.
 */
export class AICache {
  private dirty = false;

  private constructor(
    private readonly path: string,
    private readonly entries: Record<string, CacheEntry>,
  ) {}

  static load(path: string): AICache {
    try {
      const parsed = JSON.parse(readFileSync(path, "utf8")) as CacheFile;
      if (
        parsed &&
        parsed.version === CACHE_VERSION &&
        parsed.entries &&
        typeof parsed.entries === "object"
      ) {
        return new AICache(path, parsed.entries);
      }
    } catch {
      // Missing or corrupt cache file — start fresh.
    }
    return new AICache(path, {});
  }

  get<T>(key: string, hash: string): T | undefined {
    const entry = this.entries[key];
    return entry && entry.hash === hash ? (entry.value as T) : undefined;
  }

  set(key: string, hash: string, value: unknown): void {
    this.entries[key] = { hash, value };
    this.dirty = true;
  }

  /** Writes the cache file only when entries changed since load. */
  save(): void {
    if (!this.dirty) return;
    const file: CacheFile = { version: CACHE_VERSION, entries: this.entries };
    writeFileSync(this.path, `${JSON.stringify(file, null, 2)}\n`);
    this.dirty = false;
  }
}

import { mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AICache, hashAIInputs } from "./ai-cache.js";

const tmpCachePath = (): string =>
  join(mkdtempSync(join(tmpdir(), "ai-cache-")), ".ai-cache.json");

describe("hashAIInputs", () => {
  it("is stable across object key order", () => {
    const a = hashAIInputs("kind", { x: 1, y: [{ b: 2, a: 1 }] }, { m: "gpt" });
    const b = hashAIInputs("kind", { y: [{ a: 1, b: 2 }], x: 1 }, { m: "gpt" });
    expect(a).toBe(b);
  });

  it("ignores undefined-valued properties", () => {
    const a = hashAIInputs("kind", { x: 1, y: undefined }, {});
    const b = hashAIInputs("kind", { x: 1 }, {});
    expect(a).toBe(b);
  });

  it("changes when inputs change", () => {
    const a = hashAIInputs("kind", { x: 1 }, { temperature: 0.5 });
    const b = hashAIInputs("kind", { x: 2 }, { temperature: 0.5 });
    const c = hashAIInputs("kind", { x: 1 }, { temperature: 0.9 });
    const d = hashAIInputs("other", { x: 1 }, { temperature: 0.5 });
    expect(new Set([a, b, c, d]).size).toBe(4);
  });
});

describe("AICache", () => {
  it("misses on empty cache and hits after set", () => {
    const cache = AICache.load(tmpCachePath());
    expect(cache.get("preamble", "h1")).toBeUndefined();
    cache.set("preamble", "h1", "hello");
    expect(cache.get<string>("preamble", "h1")).toBe("hello");
  });

  it("misses when the hash differs", () => {
    const cache = AICache.load(tmpCachePath());
    cache.set("preamble", "h1", "hello");
    expect(cache.get("preamble", "h2")).toBeUndefined();
  });

  it("round-trips through save and load", () => {
    const path = tmpCachePath();
    const cache = AICache.load(path);
    cache.set("classifications", "abc", [{ name: "repo", status: "active" }]);
    cache.save();

    const reloaded = AICache.load(path);
    expect(reloaded.get("classifications", "abc")).toEqual([
      { name: "repo", status: "active" },
    ]);
  });

  it("does not write the file when nothing changed", () => {
    const path = tmpCachePath();
    const cache = AICache.load(path);
    cache.set("preamble", "h1", "hello");
    cache.save();
    const before = readFileSync(path, "utf8");
    const mtimeBefore = statSync(path).mtimeMs;

    const reloaded = AICache.load(path);
    reloaded.save();
    expect(readFileSync(path, "utf8")).toBe(before);
    expect(statSync(path).mtimeMs).toBe(mtimeBefore);
  });

  it("starts fresh on a corrupt cache file", () => {
    const path = tmpCachePath();
    writeFileSync(path, "not json{");
    const cache = AICache.load(path);
    expect(cache.get("preamble", "h1")).toBeUndefined();
  });

  it("discards entries from a different cache version", () => {
    const path = tmpCachePath();
    writeFileSync(
      path,
      JSON.stringify({
        version: 0,
        entries: { preamble: { hash: "h1", value: "stale" } },
      }),
    );
    const cache = AICache.load(path);
    expect(cache.get("preamble", "h1")).toBeUndefined();
  });
});

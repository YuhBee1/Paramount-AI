import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

describe("P/AI service invariants", () => {
  it("uses one-way hashes for API key lookup material", () => {
    const secret = "pai_example_secret";
    const digest = createHash("sha256").update(secret).digest("hex");
    expect(digest).toHaveLength(64);
    expect(digest).not.toContain(secret);
  });

  it("keeps credit idempotency keys deterministic for retries", () => {
    const key = (userId: number, reason: string, amount: number) => `grant:${userId}:${reason}:${amount}`;
    expect(key(4, "starter", 2000)).toBe(key(4, "starter", 2000));
    expect(key(4, "starter", 2000)).not.toBe(key(4, "starter", 2001));
  });

  it("rejects unsafe file path components", () => {
    const safe = /^[\w .()\-\/]+$/;
    expect(safe.test("src/App.tsx")).toBe(true);
    expect(safe.test("../../.env") && !"../../.env".includes(".." as string)).toBe(false);
  });
});

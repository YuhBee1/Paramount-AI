import { describe, expect, it } from "vitest";
import { chooseModel, calculateCreditCharge } from "./domain/policies";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const models = [
  { name: "fast-text", capabilities: ["text" as const], priority: 20 },
  { name: "premium-text", capabilities: ["text" as const], priority: 50 },
  { name: "vision-pro", capabilities: ["vision" as const], priority: 10 },
];

describe("P/AI foundation policies", () => {
  it("selects the lowest priority enabled model for a capability", () => {
    expect(chooseModel({ operation: "TEXT_GENERATION", input: "hello" }, models)).toBe("fast-text");
  });

  it("honors a valid user-selected model", () => {
    expect(chooseModel({ operation: "TEXT_GENERATION", model: "premium-text", input: "hello" }, models)).toBe("premium-text");
  });

  it("rejects unsupported operations instead of silently falling back", () => {
    expect(() => chooseModel({ operation: "IMAGE_GENERATION", input: "a lighthouse" }, models)).toThrow("No enabled model supports image");
  });

  it("rounds platform charges up and enforces the configurable minimum", () => {
    expect(calculateCreditCharge(0.12, 10)).toBe(2);
    expect(calculateCreditCharge(0, 10, 0)).toBe(0);
  });
});

describe("projects.create validation", () => {
  it("rejects unsafe slugs before persistence", async () => {
    const user = { id: 7, openId: "test", name: "Test", email: "test@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } as const;
    const ctx: TrpcContext = { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.projects.create({ name: "Demo", slug: "not safe" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

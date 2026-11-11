import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "@/lib/oauth-return-path";

describe("sign-in return path", () => {
  it("keeps the assistant consent page with its request id", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc")).toBe("/.lovable/oauth/consent?authorization_id=abc");
  });
  it("never sends players to another website", () => {
    expect(oauthReturnPath("https://evil.example/x")).toBe("/");
    expect(oauthReturnPath("//evil.example/x")).toBe("/");
    expect(oauthReturnPath("/\\evil.example/")).toBe("/");
    expect(oauthReturnPath(undefined)).toBe("/");
  });
});

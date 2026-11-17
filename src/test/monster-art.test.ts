import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { BESTIARY } from "@/game/bestiary";

describe("monster artwork coverage", () => {
  it("provides a unique front, side and back image for every monster in the bestiary", () => {
    const fingerprints = new Set<string>();
    for (const monster of BESTIARY) {
      for (const view of ["", "_side", "_back"]) {
        const path = resolve("src/assets/art", `m_${monster.id}${view}.webp`);
        expect(existsSync(path), `${monster.id}${view} is missing`).toBe(true);
        const bytes = readFileSync(path);
        expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
        expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
        const hash = createHash("sha256").update(bytes).digest("hex");
        expect(fingerprints.has(hash), `${monster.id}${view} borrows another picture`).toBe(false);
        fingerprints.add(hash);
      }
    }
    expect(fingerprints.size).toBe(BESTIARY.length * 3);
  });
});
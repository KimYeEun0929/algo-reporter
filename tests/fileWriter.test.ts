import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { ensureAndWriteReport } from "../src/services/fileWriter.js";

describe("ensureAndWriteReport", () => {
  it("writes report file under reports directory with date_id format", async () => {
    const problem = { site: "baekjoon", id: "1234" } as const;
    const markdown = "# test";

    const { reportPath } = await ensureAndWriteReport({ problem, markdown });

    const exists = await fs
      .access(reportPath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);

    const dir = path.dirname(reportPath);
    const file = path.basename(reportPath);
    expect(dir.endsWith("reports")).toBe(true);

    // YYYY-MM-DD_1234.md
    const rx = /^\d{4}-\d{2}-\d{2}_1234\.md$/;
    expect(rx.test(file)).toBe(true);
  });
});

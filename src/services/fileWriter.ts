import fs from "node:fs/promises";
import path from "node:path";
import type { ParsedProblem } from "../utils/problemParser.js";

export async function ensureAndWriteReport(input: {
  problem: ParsedProblem;
  markdown: string;
}): Promise<{ reportPath: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const id = input.problem.id;

  const reportsDir = path.resolve(process.cwd(), "reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `${dateStr}_${id}.md`;
  const reportPath = path.join(reportsDir, filename);
  await fs.writeFile(reportPath, input.markdown, "utf8");

  return { reportPath };
}

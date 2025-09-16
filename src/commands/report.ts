import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { parseProblem } from "../utils/problemParser.js";
import { generateReportParts } from "../services/llm.js";
import { buildReportMarkdown } from "../services/reportTemplate.js";
import { ensureAndWriteReport } from "../services/fileWriter.js";
import { commitAndPushReport } from "../services/git.js";

export function registerReportCommand(program: Command): void {
  program
    .command("report")
    .requiredOption("--url <url>", "Problem URL (Baekjoon or LeetCode)")
    .requiredOption("--code <path>", "Path to solution code file")
    .option(
      "--lang <language>",
      "Programming language of the code (auto-detected by extension)"
    )
    .option("--commit", "Create git branch, commit, and push the report", false)
    .action(
      async (opts: {
        url: string;
        code: string;
        lang?: string;
        commit?: boolean;
      }) => {
        const { url, code, lang, commit } = opts;

        const problem = parseProblem(url);
        const absoluteCodePath = path.resolve(process.cwd(), code);
        const codeContent = await fs.readFile(absoluteCodePath, "utf8");

        const inferredLang =
          lang ?? inferLanguageFromExtension(absoluteCodePath);

        const parts = await generateReportParts({
          problemMeta:
            problem.site === "baekjoon"
              ? { platform: "baekjoon", id: problem.id, url }
              : { platform: "leetcode", slug: problem.id, url },
          userCode: codeContent,
          language: inferredLang,
        });

        const markdown = buildReportMarkdown({
          meta: { ...problem, url },
          sections: {
            language: inferredLang,
            summary: parts.summary,
            approach: parts.approach,
            complexity: parts.complexity,
            alternatives: parts.alternatives,
            commentedCode: parts.commentedCode,
            retrospective: "작성 예정",
          },
        });

        const { reportPath } = await ensureAndWriteReport({
          problem,
          markdown,
        });

        if (commit) {
          await commitAndPushReport({ problem, reportPath });
        }

        // eslint-disable-next-line no-console
        console.log(`Report created: ${reportPath}`);
      }
    );
}

function inferLanguageFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
      return "typescript";
    case ".js":
      return "javascript";
    case ".py":
      return "python";
    case ".java":
      return "java";
    case ".cpp":
    case ".cc":
    case ".cxx":
    case ".hpp":
      return "cpp";
    case ".c":
      return "c";
    case ".go":
      return "go";
    case ".rb":
      return "ruby";
    default:
      return "plain";
  }
}

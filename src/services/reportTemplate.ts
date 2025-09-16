import type { ParsedProblem } from "../utils/problemParser.js";

export function buildReportMarkdown(input: {
  meta: ParsedProblem & { url: string };
  sections: {
    language: string;
    summary: string;
    approach: string;
    complexity: string; // 시간·공간 복잡도
    alternatives: string; // 대안 접근
    commentedCode: string;
    retrospective: string;
  };
}): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const problemId = input.meta.id;
  const titleLine = input.meta.title ? ` - ${input.meta.title}` : "";
  const langToken = normalizeLangToken(input.sections.language);

  return [
    `# 문제 보고서: ${problemId}${titleLine}`,
    "",
    `- 날짜: ${dateStr}`,
    `- 플랫폼: ${input.meta.site}`,
    `- URL: ${input.meta.url}`,
    "",
    "## 문제 요약",
    "",
    input.sections.summary.trim(),
    "",
    "## 접근",
    "",
    input.sections.approach.trim(),
    "",
    "## 시간·공간 복잡도",
    "",
    input.sections.complexity.trim(),
    "",
    "## 대안 접근",
    "",
    input.sections.alternatives.trim(),
    "",
    "## 주석 강화 코드",
    "",
    `\u0060\u0060\u0060${langToken}`,
    input.sections.commentedCode.trim(),
    "```",
    "",
    "## 회고",
    "",
    input.sections.retrospective.trim(),
    "",
  ].join("\n");
}

function normalizeLangToken(language: string): string {
  const l = (language || "").toLowerCase();
  switch (l) {
    case "ts":
    case "typescript":
      return "ts";
    case "js":
    case "javascript":
      return "js";
    case "py":
    case "python":
      return "python";
    case "java":
      return "java";
    case "cpp":
    case "c++":
      return "cpp";
    case "c":
      return "c";
    case "go":
      return "go";
    case "rb":
    case "ruby":
      return "ruby";
    default:
      return ""; // no token
  }
}

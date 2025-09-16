import OpenAI from "openai";

export type ProblemMeta =
  | { platform: "baekjoon"; id: string; url?: string }
  | { platform: "leetcode"; slug: string; url?: string };

export type LlmInput = {
  problemMeta: ProblemMeta;
  userCode: string;
  language: string;
};

export type ReportParts = {
  summary: string;
  approach: string;
  complexity: string;
  alternatives: string;
  commentedCode: string;
};

const MODEL = "gpt-5";

export function selectCodeForCommenting(
  userCode: string,
  language: string
): {
  codeSnippet: string;
  truncated: boolean;
} {
  // Heuristic: keep up to ~6000 characters to avoid token issues; prefer whole functions if possible
  const MAX_CHARS = 6000;
  if (userCode.length <= MAX_CHARS) {
    return { codeSnippet: userCode, truncated: false };
  }

  // Try to keep the most relevant parts: detect main/solve/function blocks quickly
  const patterns = [
    /class\s+Solution[\s\S]*?\n\}/m, // common in LeetCode (Java/TS)
    /def\s+\w+\([^\)]*\):[\s\S]*?(?=\n\S|$)/m, // Python function
    /int\s+main\s*\([^\)]*\)\s*\{[\s\S]*?\}\s*/m, // C/C++ main
    /public\s+static\s+void\s+main\s*\([^\)]*\)[\s\S]*?\}/m, // Java main
  ];
  for (const re of patterns) {
    const match = userCode.match(re);
    if (match && match[0].length <= MAX_CHARS) {
      return { codeSnippet: match[0], truncated: true };
    }
  }

  // Fallback: take the first N chars, ending at a line boundary
  const slice = userCode.slice(0, MAX_CHARS);
  const lastNewline = slice.lastIndexOf("\n");
  const codeSnippet = lastNewline > 0 ? slice.slice(0, lastNewline) : slice;
  return { codeSnippet, truncated: true };
}

export function buildPrompt(args: {
  problemMeta: ProblemMeta;
  language: string;
  codeSnippet: string;
  truncated: boolean;
}): { system: string; user: string } {
  const problemId =
    args.problemMeta.platform === "baekjoon"
      ? `Baekjoon ${args.problemMeta.id}`
      : `LeetCode ${args.problemMeta.slug}`;
  const urlPart = args.problemMeta.url
    ? `\n문제 URL: ${args.problemMeta.url}`
    : "";

  const system =
    "역할: 알고리즘 면접관이자 CS 강사. 한국어로 간결하고 교육적인 설명을 제공한다. 출력은 반드시 JSON으로 한다.";

  const constraints = [
    "- 반드시 포함: 시간/공간 복잡도 명시",
    "- 반드시 포함: 대안 접근 최소 1가지 이상",
    "- 주석강화코드: 기존 코드 스타일과 구조를 존중하고, 불필요한 리팩토링을 피하며 주석 중심으로 개선",
  ].join("\n");

  const truncInfo = args.truncated
    ? "\n참고: 코드가 길어 핵심 함수/영역만 발췌되었음. 나머지는 추정하지 말고 주석에 가정 명시."
    : "";

  const user = [
    `문제: ${problemId}${urlPart}`,
    `언어: ${args.language}`,
    "",
    "요구사항:",
    constraints,
    truncInfo,
    "",
    "코드:",
    "```",
    args.codeSnippet,
    "```",
    "",
    "아래 JSON 구조로만 응답하세요:",
    '{"summary":"...","approach":"...","complexity":"...","alternatives":"...","commentedCode":"..."}',
  ].join("\n");

  return { system, user };
}

export async function generateReportParts(
  input: LlmInput
): Promise<ReportParts> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorReport(
      "환경 변수 OPENAI_API_KEY가 설정되지 않았습니다. `config set openaiKey <키>` 또는 .env에 설정하세요."
    );
  }

  const client = new OpenAI({ apiKey });

  const { codeSnippet, truncated } = selectCodeForCommenting(
    input.userCode,
    input.language
  );
  const { system, user } = buildPrompt({
    problemMeta: input.problemMeta,
    language: input.language,
    codeSnippet,
    truncated,
  });

  try {
    const response = await client.responses.create({
      model: MODEL,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      //temperature: 0.3,
    });

    const text = response.output_text ?? "";
    const parsed = safeParseJson(text);
    const obj = parsed as Partial<ReportParts>;

    return {
      summary: obj.summary ?? "요약 생성 실패",
      approach: obj.approach ?? "접근 방식 생성 실패",
      complexity: obj.complexity ?? "시간/공간 복잡도 생성 실패",
      alternatives: obj.alternatives ?? "대안 접근 생성 실패",
      commentedCode: obj.commentedCode ?? codeSnippet,
    };
  } catch (err) {
    const message = toUserFacingError(err);
    return errorReport(message);
  }
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}$/);
    if (!match) throw new Error("LLM returned non-JSON output");
    return JSON.parse(match[0]);
  }
}

function toUserFacingError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/unauthorized|api key|401/i.test(msg)) {
    return "OpenAI 인증 오류가 발생했습니다. API 키를 확인하세요.";
  }
  if (/timeout|network|fetch|ECONN/i.test(msg)) {
    return "네트워크/타임아웃 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
  }
  return `LLM 호출 중 오류가 발생했습니다: ${msg}`;
}

function errorReport(message: string): ReportParts {
  const hint = [
    message,
    "",
    "summary/approach/complexity/alternatives 필드는 오류 안내를 포함합니다.",
    "commentedCode는 원본 코드를 그대로 반환합니다.",
  ].join("\n");
  return {
    summary: hint,
    approach: hint,
    complexity: "시간/공간 복잡도: 오류로 생성되지 않았습니다.",
    alternatives: "대안 접근: 오류로 생성되지 않았습니다.",
    commentedCode: "",
  };
}

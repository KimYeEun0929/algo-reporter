import { describe, it, expect } from "vitest";
import { buildReportMarkdown } from "../src/services/reportTemplate.js";

describe("buildReportMarkdown", () => {
  it("contains required sections and language fence", () => {
    const md = buildReportMarkdown({
      meta: {
        site: "baekjoon",
        id: "1000",
        url: "https://www.acmicpc.net/problem/1000",
      },
      sections: {
        language: "python",
        summary: "요약",
        approach: "접근",
        complexity: "복잡도",
        alternatives: "대안",
        commentedCode: "print(1)",
        retrospective: "회고",
      },
    });

    expect(md).toContain("# 문제 보고서: 1000");
    expect(md).toContain("## 문제 요약");
    expect(md).toContain("## 접근");
    expect(md).toContain("## 시간·공간 복잡도");
    expect(md).toContain("## 대안 접근");
    expect(md).toContain("## 주석 강화 코드");
    expect(md).toContain("## 회고");
    expect(md).toContain("```python");
  });
});

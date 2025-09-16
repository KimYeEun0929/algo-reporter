import { describe, it, expect } from "vitest";
import { parseProblem } from "../src/utils/problemParser.js";

describe("parseProblem", () => {
  it("parses Baekjoon URL", () => {
    const p = parseProblem("https://www.acmicpc.net/problem/2750");
    expect(p).toEqual({ site: "baekjoon", id: "2750", title: "Unknown" });
  });

  it("parses LeetCode URL with trailing slash", () => {
    const p = parseProblem("https://leetcode.com/problems/two-sum/");
    expect(p).toEqual({ site: "leetcode", id: "two-sum", title: "Two Sum" });
  });

  it("parses LeetCode URL without trailing slash and with query", () => {
    const p = parseProblem(
      "https://leetcode.com/problems/longest-substring-without-repeating-characters?envType=study-plan"
    );
    expect(p).toEqual({
      site: "leetcode",
      id: "longest-substring-without-repeating-characters",
      title: "Longest Substring Without Repeating Characters",
    });
  });

  it("throws on unsupported URL", () => {
    expect(() => parseProblem("https://example.com/abc")).toThrowError();
  });

  it("throws on invalid URL", () => {
    expect(() => parseProblem("not-a-url")).toThrowError("Invalid URL");
  });
});

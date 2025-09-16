export type ParsedProblem = {
  site: "baekjoon" | "leetcode";
  id: string;
  title?: string;
};

export function parseProblem(inputUrl: string): ParsedProblem {
  let url: URL;
  try {
    url = new URL(inputUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathname = url.pathname.replace(/\/+$/g, "");

  // Baekjoon: acmicpc.net/problem/<id>
  if (hostname === "acmicpc.net") {
    const match = pathname.match(/^\/problem\/(\d+)$/);
    if (!match) throw new Error("Unsupported Baekjoon URL");
    return { site: "baekjoon", id: match[1], title: "Unknown" };
  }

  // LeetCode: leetcode.com/problems/<slug>/ (ignore trailing slash and queries)
  if (hostname === "leetcode.com" || hostname === "leetcode.cn") {
    const match = pathname.match(/^\/problems\/([a-z0-9\-]+)$/i);
    if (!match) throw new Error("Unsupported LeetCode URL");
    const slug = match[1];
    return { site: "leetcode", id: slug, title: toTitleCaseFromSlug(slug) };
  }

  throw new Error("Unsupported platform URL");
}

function toTitleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

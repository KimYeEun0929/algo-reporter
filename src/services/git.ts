import path from "node:path";
import type { ParsedProblem } from "../utils/problemParser.js";
import { execPromise } from "../utils/exec.js";

function buildFriendlyError(message: string): Error {
  const tips = [
    "- 저장소 초기화: git init",
    "- 사용자 정보 설정: git config user.name 'Your Name' && git config user.email 'you@example.com'",
    "- 원격 추가: git remote add origin <your-remote-url>",
    "- 인증 로그인: GitHub Desktop 또는 gh auth login, 또는 PAT 설정",
  ].join("\n");
  return new Error(`${message}\n\n다음 작업을 시도해보세요:\n${tips}`);
}

export async function commitAndPushReport(input: {
  problem: ParsedProblem;
  reportPath: string;
}): Promise<void> {
  const cwd = process.cwd();
  const id = input.problem.id;
  const title = input.problem.title ?? "";
  const branch = `algo/report-${id}`;
  const relativeReportPath = path.relative(cwd, input.reportPath);

  // Check if git repository
  try {
    await execPromise("git rev-parse --is-inside-work-tree", cwd);
  } catch {
    throw buildFriendlyError(
      "현재 디렉토리는 Git 저장소가 아닙니다. 보고서 커밋/푸시를 위해 먼저 저장소를 초기화하세요."
    );
  }

  // Stage changes (only the report file)
  try {
    await execPromise(`git add ${JSON.stringify(relativeReportPath)}`, cwd);
  } catch (e) {
    throw buildFriendlyError(`변경사항 스테이징에 실패했습니다: ${String(e)}`);
  }

  // Create/switch branch
  try {
    const { stdout: branchesStdout } = await execPromise(
      "git branch --list",
      cwd
    );
    const exists = branchesStdout
      .split(/\r?\n/)
      .some((l) => l.replace(/^\*\s*/, "").trim() === branch);
    if (exists) {
      await execPromise(`git checkout ${JSON.stringify(branch)}`, cwd);
    } else {
      await execPromise(`git checkout -b ${JSON.stringify(branch)}`, cwd);
    }
  } catch (e) {
    throw buildFriendlyError(`브랜치 전환/생성에 실패했습니다: ${String(e)}`);
  }

  // Commit
  try {
    const msg = `docs(report): ${id}${title ? " " + title : ""}`;
    await execPromise(`git commit -m ${JSON.stringify(msg)}`, cwd);
  } catch (e) {
    throw buildFriendlyError(
      `커밋에 실패했습니다: ${String(e)}\n변경사항이 없으면 새 파일이 맞는지, .gitignore에 의해 무시되지 않는지 확인하세요.`
    );
  }

  // Check origin
  let hasOrigin = false;
  try {
    const { stdout } = await execPromise("git remote", cwd);
    hasOrigin = stdout.split(/\s+/).some((r) => r.trim() === "origin");
  } catch {
    // ignore
  }
  if (!hasOrigin) {
    throw buildFriendlyError(
      '원격 "origin" 이 설정되어 있지 않습니다.\n예: git remote add origin <your-remote-url>\n그 다음: git push -u origin ' +
        branch
    );
  }

  // Push
  try {
    await execPromise(`git push -u origin ${JSON.stringify(branch)}`, cwd);
  } catch (e) {
    throw buildFriendlyError(
      `푸시에 실패했습니다: ${String(e)}\n- 원격 저장소 권한/인증을 확인하세요.\n- GitHub라면 gh auth login 또는 PAT를 사용하세요.\n- 수동 푸시: git push -u origin ${branch}`
    );
  }
}

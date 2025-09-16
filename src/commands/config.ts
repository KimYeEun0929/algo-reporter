import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";

export function registerConfigCommand(program: Command): void {
  program
    .command("config")
    .description("Manage configuration")
    .command("set")
    .argument("<key>", "Config key, e.g., openaiKey")
    .argument("<value>", "Value to set")
    .action(async (key: string, value: string) => {
      if (key === "openaiKey") {
        await upsertEnv("OPENAI_API_KEY", value);
        // eslint-disable-next-line no-console
        console.log("OPENAI_API_KEY updated in .env");
        // eslint-disable-next-line no-console
        console.log(platformTips());
      } else {
        // eslint-disable-next-line no-console
        console.error("Unsupported key. Use: openaiKey");
        process.exitCode = 1;
      }
    });
}

async function upsertEnv(key: string, value: string): Promise<void> {
  const envPath = path.resolve(process.cwd(), ".env");
  let content = "";
  try {
    content = await fs.readFile(envPath, "utf8");
  } catch {
    content = "";
  }
  const lines = content.split(/\r?\n/).filter(Boolean);
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }
  const next = lines.join("\n") + "\n";
  await fs.writeFile(envPath, next, "utf8");
}

function platformTips(): string {
  return [
    "환경 변수 적용 안내:",
    "- Windows PowerShell: $env:OPENAI_API_KEY='...' (세션 한정)",
    "- Windows 시스템 영구 설정: setx OPENAI_API_KEY '...' (새 세션 필요)",
    "- macOS/Linux (bash/zsh): export OPENAI_API_KEY='...'",
    "- .env 파일은 dotenv로 자동 로드됩니다.",
  ].join("\n");
}

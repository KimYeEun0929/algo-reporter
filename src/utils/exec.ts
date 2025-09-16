import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(execCb);

export type ExecResult = {
  stdout: string;
  stderr: string;
};

export async function execPromise(
  cmd: string,
  cwd?: string
): Promise<ExecResult> {
  const { stdout, stderr } = await execAsync(cmd, {
    cwd,
    windowsHide: true,
    shell: true,
  });
  return { stdout: stdout?.toString() ?? "", stderr: stderr?.toString() ?? "" };
}

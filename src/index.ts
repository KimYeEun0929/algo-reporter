import { Command } from "commander";
import dotenv from "dotenv";
import { registerReportCommand } from "./commands/report.js";
import { registerConfigCommand } from "./commands/config.js";

dotenv.config();

const program = new Command();
program
  .name("algo-reporter")
  .description("Generate algorithm problem-solving reports using GPT-5")
  .version("0.1.0");

registerReportCommand(program);
registerConfigCommand(program);

program.parseAsync(process.argv);

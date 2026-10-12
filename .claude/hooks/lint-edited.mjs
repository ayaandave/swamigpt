#!/usr/bin/env node
// PostToolUse: lints the file Claude just edited, so mistakes are caught right away.
// Exit code 2 sends the errors back to Claude to fix.
import { execFileSync } from "node:child_process";

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const file = JSON.parse(input || "{}").tool_input?.file_path ?? "";
  if (!/\.(ts|tsx|mjs|js)$/.test(file) || file.includes("node_modules") || file.includes("/.claude/")) return;
  try {
    execFileSync("npx", ["eslint", "--no-warn-ignored", file], { cwd: process.env.CLAUDE_PROJECT_DIR, stdio: "pipe" });
  } catch (e) {
    process.stderr.write(`ESLint found problems in ${file}:\n${e.stdout?.toString() ?? ""}${e.stderr?.toString() ?? ""}`);
    process.exit(2);
  }
});

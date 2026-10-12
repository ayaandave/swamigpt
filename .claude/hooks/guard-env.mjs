#!/usr/bin/env node
// PreToolUse: asks the user before Claude reads, edits or runs a command on an .env file.
// The keys in .env.local must never be printed; editing it (e.g. a new voice ID) is sometimes needed.
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const { tool_input: t = {} } = JSON.parse(input || "{}");
  const target = [t.file_path, t.path, t.command, t.pattern].filter(Boolean).join(" ");
  if (!/(^|[\s/"'])\.env(\.[\w-]+)?\b/.test(target)) return;
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: "This touches an .env file with secret keys. Never print key values.",
      },
    }),
  );
});

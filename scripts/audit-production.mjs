import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["audit", "--omit=dev", "--json"],
  { encoding: "utf8" },
);

if (!result.stdout) {
  console.error(result.stderr || "npm audit did not return JSON");
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("Could not parse npm audit output");
  console.error(result.stdout);
  process.exit(1);
}

const failures = [];
for (const [packageName, vulnerability] of Object.entries(
  report.vulnerabilities || {},
)) {
  if (!["high", "critical"].includes(vulnerability.severity)) continue;

  failures.push(`${packageName}: ${vulnerability.severity}`);
}

if (failures.length > 0) {
  console.error("Unapproved production dependency vulnerabilities:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Production audit passed with no high or critical advisories.");

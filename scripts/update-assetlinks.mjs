import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const fingerprintPattern = /^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/u;
const fingerprints = process.argv
  .slice(2)
  .map((value) => value.trim().toUpperCase());

if (fingerprints.length === 0 || fingerprints.some((item) => !fingerprintPattern.test(item))) {
  console.error(
    'Usage: node scripts/update-assetlinks.mjs "AA:BB:...:FF" ["11:22:...:FF"]',
  );
  process.exit(1);
}

const assetLinksPath = resolve("public/.well-known/assetlinks.json");
const statements = JSON.parse(await readFile(assetLinksPath, "utf8"));
const appStatement = statements.find(
  (statement) =>
    statement?.target?.namespace === "android_app" &&
    statement.target.package_name === "net.himalayanholytemple.retreat",
);

if (!appStatement) {
  console.error("Android app statement was not found in assetlinks.json");
  process.exit(1);
}

const existing = appStatement.target.sha256_cert_fingerprints || [];
appStatement.target.sha256_cert_fingerprints = [...new Set([
  ...existing,
  ...fingerprints,
])];
await writeFile(assetLinksPath, `${JSON.stringify(statements, null, 2)}\n`);
console.log("Updated public/.well-known/assetlinks.json");

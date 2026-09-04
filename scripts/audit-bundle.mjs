import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const forbidden = [
  "Maintain silence during designated quiet hours",
  "First Ceremony — Full Moon",
  "Vegetarian meals are provided throughout the retreat",
  "fasting.himalayanholytemple.net",
  "/books/fenomen-suicida.pdf",
];

function filesIn(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

const failures = [];
for (const path of filesIn("dist").filter((file) => /\.(?:html|js|css)$/u.test(file))) {
  const contents = readFileSync(path, "utf8");
  for (const marker of forbidden) {
    if (contents.includes(marker)) failures.push(`${path}: ${marker}`);
  }
}

const serviceWorker = readFileSync("dist/sw.js", "utf8");
if (/cache\.match\([^)]*(?:api\/audio|url\.pathname)/u.test(serviceWorker)) {
  failures.push("dist/sw.js: protected media must not be served from Cache API");
}

if (failures.length) {
  console.error("Protected content leaked into the browser bundle:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Bundle audit passed: no protected content markers were found.");

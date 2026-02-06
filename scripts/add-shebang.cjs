const fs = require("node:fs");
const path = require("node:path");

const cliPath = path.join(__dirname, "..", "dist", "cli.js");
const shebang = "#!/usr/bin/env node\n";

if (!fs.existsSync(cliPath)) {
  process.exit(0);
}

const content = fs.readFileSync(cliPath, "utf-8");
if (content.startsWith(shebang)) {
  process.exit(0);
}

fs.writeFileSync(cliPath, `${shebang}${content}`, "utf-8");

import fs from "node:fs";
import { spawnSync } from "node:child_process";

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

function pass(message) {
  console.log("PASS:", message);
}

const pre = spawnSync(process.execPath, ["scripts/prephase6-check.mjs"], { stdio: "inherit" });
if (pre.status !== 0) process.exit(pre.status || 1);

const syntaxFiles = [
  "preview-server.mjs",
  "manuscript-import.mjs",
  "server/books.mjs",
  "server/storage.mjs",
  "server/history.mjs",
  "server/pdf.mjs",
  "server/theme.mjs",
  "server/util.mjs",
  "_shared/wizard.js",
  "_shared/workspace.js",
  "_shared/paged_book_viewer.js",
  "_shared/book_editor.js",
  "_shared/auth.js",
  "_shared/book_tools.js",
];

for (const file of syntaxFiles) {
  if (!fs.existsSync(file)) fail(`missing critical file: ${file}`);
  const out = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (out.status !== 0) fail(`${file} syntax — ${(out.stderr || out.stdout || "").trim()}`);
  pass(`${file} syntax`);
}

const util = fs.readFileSync("server/util.mjs", "utf8");
if (!util.includes("MAX_JSON_BODY_BYTES") || !util.includes("status: 413")) {
  fail("request body size guard is missing");
}
pass("request body size guard");

const workspace = fs.readFileSync("_shared/workspace.js", "utf8");
for (const marker of ["/__pdf", "/__theme", "/__book/cover", "panel-export-complete"]) {
  if (!workspace.includes(marker)) fail(`workspace release marker missing: ${marker}`);
}
pass("workspace MVP release markers");

const authClient = fs.readFileSync("_shared/auth.js", "utf8");
for (const authMarker of ["mychapter-auth-v1", "signInWithPassword", "signUp", "signOut", "persistSession"]) {
  if (!authClient.includes(authMarker)) fail(`auth client marker missing: ${authMarker}`);
}
const serverText = fs.readFileSync("preview-server.mjs", "utf8");
if (!serverText.includes('"GET /__auth"')) fail("auth route is missing");
const libraryText = fs.readFileSync("_shared/library.html", "utf8");
for (const authMarker of ["/__auth", "auth-login", "auth-logout", "/_shared/auth.js"]) {
  if (!libraryText.includes(authMarker)) fail(`library auth marker missing: ${authMarker}`);
}
pass("auth foundation markers");

console.log("\nRelease static check: PASS");

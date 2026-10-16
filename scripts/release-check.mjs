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
  "_shared/landing.js",
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
if (authClient.includes("rdrafwfdwfzgcfiqkgug")) fail("auth must not point to the MyChapter app Supabase project");

for (const authMarker of ["chagok-auth-v1", "signInWithPassword", "signUp", "signOut", "persistSession"]) {
  if (!authClient.includes(authMarker)) fail(`auth client marker missing: ${authMarker}`);
}
const serverText = fs.readFileSync("preview-server.mjs", "utf8");
if (!serverText.includes('"GET /__auth"')) fail("auth route is missing");
if (!serverText.includes('"GET /library"')) fail("library route is missing");
if (!serverText.includes("landingPage()")) fail("landing route is missing");

const landingText = fs.readFileSync("_shared/landing.html", "utf8");
for (const marker of ["/__auth?returnTo=/library", "/library", "/__wizard", "/_shared/landing.js", "로그인 준비 중"]) {
  if (!landingText.includes(marker)) fail(`landing marker missing: ${marker}`);
}

const landingJs = fs.readFileSync("_shared/landing.js", "utf8");
if (!landingJs.includes("paintLocal") || !landingJs.includes("'/__wizard'")) {
  fail("landing local mode must route new-book CTA to /__wizard");
}
if (!landingJs.includes("paintConfigured") || !landingJs.includes("/__auth?returnTo=/__wizard")) {
  fail("landing configured mode must preserve auth returnTo for new-book CTA");
}

const libraryText = fs.readFileSync("_shared/library.html", "utf8");
for (const authMarker of ["/__auth?returnTo=/library", "auth-login", "auth-logout", "/_shared/auth.js", "isConfigured"]) {
  if (!libraryText.includes(authMarker)) fail(`library auth marker missing: ${authMarker}`);
}

for (const authMarker of ["safeReturnTo", "getReturnTo", "isConfigured", "raw.startsWith('//')", "raw.includes('\\\\')"]) {
  if (!authClient.includes(authMarker)) fail(`auth return marker missing: ${authMarker}`);
}

if (!/url:\s*""/.test(authClient) || !/publishableKey:\s*""/.test(authClient)) {
  fail("auth config must remain blank until Chagok Web Supabase is connected");
}

const authHtml = fs.readFileSync("_shared/auth.html", "utf8");
if (!authHtml.includes("location.href = returnTo")) fail("auth success does not honor returnTo");
if (!authHtml.includes("auth-local") || !authHtml.includes('href="/__wizard"')) {
  fail("auth local fallback navigation is missing");
}

const wizardText = fs.readFileSync("_shared/wizard.js", "utf8");
if (!wizardText.includes("location.href = '/library'")) fail("wizard cancel does not return to library");

const workspaceHtml = fs.readFileSync("_shared/workspace.html", "utf8");
if (!workspaceHtml.includes('href="/library"')) fail("workspace library links are not aligned");

pass("auth + entry routing markers");
pass("local/guest fallback markers");

console.log("\nRelease static check: PASS");

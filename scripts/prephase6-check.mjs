import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read = (p) => fs.readFileSync(p, "utf8");
const fail = (message) => {
  console.error("FAIL:", message);
  process.exitCode = 1;
};
const pass = (message) => console.log("PASS:", message);
const expect = (condition, message) => condition ? pass(message) : fail(message);
const sha256 = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").toUpperCase();

const wizardHtml = read("_shared/wizard.html");
const wizardJs = read("_shared/wizard.js");
const previewServer = read("preview-server.mjs");
const importer = read("manuscript-import.mjs");

try {
  new vm.Script(wizardJs, { filename: "_shared/wizard.js" });
  pass("wizard.js syntax");
} catch (error) {
  fail("wizard.js syntax — " + error.message);
}

const ids = [...wizardHtml.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
expect(new Set(ids).size === ids.length, "wizard HTML has no duplicate ids");

for (const step of ["method", "input", "meta", "structure", "theme"]) {
  expect(wizardHtml.includes(`data-step="${step}"`), `wizard includes ${step} step`);
}

expect(wizardJs.includes("fetch('/__parse'"), "wizard uses parse-only endpoint");
expect(!wizardJs.includes("/__new-book"), "wizard does not create books before Phase 6");
expect(!wizardJs.includes("/__structure"), "S07 does not use opened-book structure API");
expect(wizardJs.includes("beforeunload"), "wizard protects in-memory work on refresh/navigation");
expect(wizardJs.includes("themeId: 'practical'"), "Practical remains the default theme");
expect(wizardHtml.includes('data-theme="practical"') && wizardHtml.includes('data-theme="minimal"'), "only Practical/Minimal theme choices are present");

const parseStart = previewServer.indexOf('"POST /__parse"');
const parseEnd = previewServer.indexOf('"GET /__cover"', parseStart);
const parseRoute = parseStart >= 0 && parseEnd > parseStart ? previewServer.slice(parseStart, parseEnd) : "";
expect(!!parseRoute, "parse-only server route exists");
expect(!/ws\.write\(|books\.create\(/.test(parseRoute), "parse-only route has no disk/book creation calls");
expect(importer.includes("export async function parseManuscript"), "parseManuscript export exists");
expect(importer.includes("export async function importManuscript"), "legacy importManuscript remains available");

const protectedBook = "books/내 포트폴리오, AI로 직접 만들기";
expect(
  sha256(protectedBook + "/book.html") === "C28B6334184CBD31D8EEA8CDCD0F8BE0ECEAD6E13C6B35B7A62F66FE92FFBFDB",
  "protected 168-page book.html hash"
);
expect(
  sha256(protectedBook + "/book.css") === "D2673237AA46F8AE309DC264F078B7CDEFD1E47A3F4EF242123691C56ED313B6",
  "protected 168-page book.css hash"
);

if (!process.exitCode) console.log("\nPre-Phase-6 safety gate: PASS");

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const nav = require("./build-frame")

const baseDir = "./html"; // Change this to the directory you want to scan
const result = {};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (path.extname(fullPath) === ".html") {
      callback(fullPath);
    }
  });
}

function extractPageDiv(html) {
  const $ = cheerio.load(html);
  const div = $('div.page').first();
  return div.length ? div.html().trim() : null;
}

walkDir(baseDir, filePath => {
  const html = fs.readFileSync(filePath, "utf8");
  const content = extractPageDiv(html);
  if (content) {
    const relativePath = path.relative(baseDir, filePath).replace(/\\/g, "/");
    result[relativePath] = content;
  }
});

fs.writeFileSync("./API/pages.json", JSON.stringify({ articles: result, nav: nav.nav }, null, 2), "utf8");
console.log("✅ pages.json created.");

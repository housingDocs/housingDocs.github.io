const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const navMap = require("./build-frame").nav;

function parseHTMLtoMcdoc(htmlString) {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  const result = {
    blocks: []
  };

  const page = document.querySelector('.page');
  if (!page) return result;

  const divs = [...page.querySelectorAll("div")];
  let i = 0;

  while (i < divs.length) {
    const div = divs[i];
    const type = div.className.trim().replace('page-content-', '');

    if (!type) {
      i++;
      continue;
    }

    if (type === "list") {
      i++;
      continue;
    }

    if (type === "list-point") {
      const list = { type: "list", items: [] };
      while (i < divs.length && divs[i].className.trim().replace('page-content-', '') === "list-point") {
        list.items.push(extractTextWithLinks(divs[i]));
        i++;
      }
      result.blocks.push(list);
      continue;
    }

    const content = type === "code"
      ? { lines: div.textContent.trim().split("\n").map(line => line.trimEnd()) }
      : { text: extractTextWithLinks(div) };

    result.blocks.push({ type, ...content });
    i++;
  }

  return result;
}

function extractTextWithLinks(element) {
  let result = "";
  for (const node of element.childNodes) {
    if (node.nodeType === 3) {
      result += node.textContent;
    } else if (node.nodeType === 1 && node.tagName.toLowerCase() === "a") {
      const href = node.getAttribute("href");
      const text = node.textContent;
      result += `[${text}](${href})`;
    } else {
      result += node.textContent;
    }
  }
  return result.trim();
}

// Only look one level deep: ./html/<group>/*.html
const INPUT_ROOT = './html';
const OUTPUT_FILE = './api/pages.json';

const nav = {};
const articles = {};

const topDirs = fs.readdirSync(INPUT_ROOT, { withFileTypes: true }).filter(d => d.isDirectory());

for (const dir of topDirs) {
  const groupName = dir.name;
  const fullDir = path.join(INPUT_ROOT, groupName);
  const navKey = groupName.replaceAll('_', ' ');
  const navEntry = navMap[navKey];

  if (!navEntry) {
    console.warn(`⚠️ No navMap entry found for group: ${navKey}`);
    continue;
  }

  nav[groupName] = {
    iconColor: navEntry.iconColor,
    points: []
  };

  const allFiles = [];

  function gatherHtmlFiles(base) {
    const entries = fs.readdirSync(base, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(base, entry.name);
      if (entry.isDirectory()) {
        gatherHtmlFiles(fullPath);
      } else if (entry.name.endsWith(".html")) {
        allFiles.push(fullPath);
      }
    }
  }

  gatherHtmlFiles(fullDir);

  const fileMap = {};

  for (const filePath of allFiles) {
    const relative = path.relative(INPUT_ROOT, filePath); // e.g. "home/Intro.html"
    const urlPath = `/html/${relative.replace(/\\/g, "/")}`;
    const fileId = relative.replace(/\.html$/, '').replace(/\\/g, '/'); // e.g. "home/Intro"

    const html = fs.readFileSync(filePath, 'utf8');
    const mcdoc = parseHTMLtoMcdoc(html);
    articles[fileId] = mcdoc;

    const fileName = path.basename(filePath, ".html").replaceAll('_', ' ') || fileId;
    fileMap[urlPath] = {
      name: fileName,
      link: urlPath
    };
  }

  // Preserve ordering from navMap
  for (const point of navEntry.points) {
    if (fileMap[point.link]) {
      nav[groupName].points.push(fileMap[point.link]);
    } else {
      console.warn(`⚠️ Missing file for navMap entry: ${point.link}`);
    }
  }
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ nav, articles }, null, 2));
console.log(`✅ Exported ${Object.keys(articles).length} articles from ${topDirs.length} nav groups.`);

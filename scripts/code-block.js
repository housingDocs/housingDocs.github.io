
function log(string) {
  console.log(`CODE_BLOCKS > ${string}`);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => log('Copied to clipboard!'))
    .catch(err => console.error('Failed to copy: ', err));
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function unEscapeHtml(text) {
  return (text || '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

function tokenizeHTSL(code) {
    const tokens = []
    let pos = 0

    const tokenPatterns = [
        { type: 'syntax-comment-block', regex: /\/\*[\s\S]*?\*\//y },
        { type: 'syntax-comment-line', regex: /\/\/.*(?:\n|$)/y },
        { type: 'syntax-string-quoted-double', regex: /"([^"\\]|\\.)*"/y },
        { type: 'syntax-constant-numeric-float', regex: /\b\d+\.\d+\b/y },
        { type: 'syntax-constant-numeric', regex: /\b\d+\b/y },
        { type: 'syntax-constant-language-boolean', regex: /\b(true|false)\b/y },
        { type: 'syntax-keyword-control', regex: /\b(var|globalvar|teamvar|playerWeather|playerTime|displayNametag|launchTarget|changeVelocity|dropItem|define|loop|stat|globalstat|chat|if|random|giveItem|removeItem|tp|compassTarget|applyLayout|applyPotion|enchant|actionBar|cancelEvent|changeHealth|changePlayerGroup|clearEffects|title|failParkour|fullHeal|xpLevel|houseSpawn|kill|parkCheck|sound|resetInventory|lobby|gamemode|hungerLevel|maxHealth|function|consumeItem|displayMenu|closeMenu|pause|setTeam|teamstat|balanceTeam|goto|else|exit)\b/y },
        { type: 'syntax-keyword-operator', regex: /\b(increment|decrement|set|multiply|divide|inc|dec|mult|div|=|\+=|-=|\*=|\/=|\/\/=|unset)\b/y },
        { type: 'syntax-keyword-operator-logical', regex: /\b(and|or)\b/y },
        { type: 'syntax-keyword-operator-comparison', regex: />=|==|<=|!=|>|<|=>|=<|=/y },
        { type: 'syntax-support-function', regex: /\b(stat|globalstat|gamemode|hasItem|hasPotion|doingParkour|inRegion|hasPermission|hasGroup|damageCause|blockType|isSneaking|health|maxHealth|hunger|damageAmount|placeholder|teamstat|hasTeam|isFlying|fishingEnv|isItem|canPvp|portal)\b/y },
        { type: 'syntax-variable-other', regex: /\b(stat|globalstat|teamstat|var|globalvar|teamvar)\s+\w+\b/y },
        { type: 'syntax-variable-other', regex: /\bloop \d+\s+\w+\b/y },
        { type: 'syntax-variable-other', regex: /\bdefine\s+\w+\b/y },
    ]

    while (pos < code.length) {
        let matched = false
        for (const { type, regex } of tokenPatterns) {
            regex.lastIndex = pos
            const m = regex.exec(code)
            if (m && m.index === pos) {
                tokens.push({ text: m[0], type })
                pos += m[0].length
                matched = true
                break
            }
        }

        if (!matched) {
            tokens.push({ text: code[pos], type: 'plain' })
            pos++
        }
    }

    return tokens
  }

  function syntaxHighlightHTSL(code) {
    const escaped = escapeHtml(code)
    const tokens = tokenizeHTSL(escaped)
    return tokens.map(t =>
      t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
    ).join('')
}

function tokenizeMarkdown(code) {
  // code is expected to be escaped already (escapeHtml applied before calling)
  const tokens = [];
  let pos = 0;

  const isLineStart = (i) => i === 0 || code[i - 1] === '\n';
  const specials = new Set(['!', '#', '-', '*', '`']);
  let inTable = false;
  let inMenu = false;

  while (pos < code.length) {
    // 1) Table start/end
    if (code.startsWith('&lt;table&gt;', pos)) {
      tokens.push({ text: '&lt;table&gt;', type: 'syntax-markdown' });
      inTable = true;
      pos += 13;
      continue;
    }
    if (code.startsWith('&lt;/table&gt;', pos)) {
      tokens.push({ text: '&lt;/table&gt;', type: 'syntax-markdown' });
      inTable = false;
      pos += 14;
      continue;
    }

    // 2) Menu start/end detection
    if (code.startsWith('&lt;menu', pos)) {
      const end = code.indexOf('&gt;', pos);
      const text = code.slice(pos, end + 4);
      tokens.push({ text, type: 'syntax-markdown' });
      inMenu = true;
      pos = end + 4;
      continue;
    }
    if (code.startsWith('&lt;/menu&gt;', pos)) {
      tokens.push({ text: '&lt;/menu&gt;', type: 'syntax-markdown' });
      inMenu = false;
      pos += 13;
      continue;
    }

    // 3) Escaped special
    if (code[pos] === '\\' && pos + 1 < code.length && specials.has(code[pos + 1])) {
      tokens.push({ text: '\\', type: 'syntax-escape' });
      tokens.push({ text: code[pos + 1], type: 'plain' });
      pos += 2;
      continue;
    }

    // 4) XML-like tags (not inside table or menu)
    if (!inTable && !inMenu && code.startsWith('&lt;', pos)) {
      const end = code.indexOf('&gt;', pos + 4);
      if (end !== -1) {
        tokens.push({ text: code.slice(pos, end + 4), type: 'syntax-markdown' });
        pos = end + 4;
        continue;
      }
    }

    // 5) Line-start markdown markers
    if (isLineStart(pos)) {
      if (code.startsWith('### ', pos)) { tokens.push({ text: '###', type: 'syntax-markdown' }); pos += 3; continue; }
      if (code.startsWith('## ', pos))  { tokens.push({ text: '##', type: 'syntax-markdown' }); pos += 2; continue; }
      if (code.startsWith('# ', pos))   { tokens.push({ text: '#', type: 'syntax-markdown' }); pos += 1; continue; }
      if (code.startsWith('!! ', pos))  { tokens.push({ text: '!!', type: 'syntax-markdown' }); pos += 2; continue; }
      if (code.startsWith('! ', pos))   { tokens.push({ text: '!', type: 'syntax-markdown' }); pos += 1; continue; }
      const match = code.slice(pos).match(/^(?:-|&#45;)(\w?)\s/);
      if (match) {
        const flag = match[1];
        tokens.push({ text: `-${flag} `, type: 'syntax-markdown' });
        pos += 2 + (flag ? 1 : 0);
        continue;
      }
    }

    // 6) Table cells
    if (inTable && code[pos] === '|') {
      tokens.push({ text: '|', type: 'syntax-markdown' });
      pos++;
      continue;
    }

    if (inTable && code[pos] == '{') {
      const end = code.indexOf('}', pos + 1);
      if (end !== -1) {
        tokens.push({ text: code.slice(pos, end + 1), type: 'syntax-markdown' });
        pos = end + 1;
        continue;
      }
    }

    // === CUSTOM DSL HIGHLIGHTING (only inside <menu>...</menu>) ===
    if (inMenu) {
      // Texture declaration: name:https://...
      // Highlight only the name and the first colon
      const texMatch = code.slice(pos).match(/^([a-zA-Z0-9_-]+):([^\s]+)/);
      if (texMatch) {
        tokens.push({ text: texMatch[1], type: 'syntax-markdown' }); // texture name
        tokens.push({ text: ':', type: 'syntax-markdown' }); // colon
        tokens.push({ text: texMatch[2], type: 'plain' }); // URL
        pos += texMatch[0].length;
        continue;
      }

      // @default
      if (code.startsWith('@default', pos)) {
        tokens.push({ text: '@default', type: 'syntax-markdown' });
        pos += 8;
        continue;
      }

      // @(...) — highlight the whole part
      if (code[pos] === '@' && code[pos + 1] === '(') {
        const end = code.indexOf(')', pos + 2);
        if (end !== -1) {
          tokens.push({ text: code.slice(pos, end + 1), type: 'syntax-markdown' });
          pos = end + 1;
          continue;
        }
      }

      // highlight braces for slot blocks
      if (code[pos] === '{' || code[pos] === '}') {
        tokens.push({ text: code[pos], type: 'syntax-markdown' });
        pos++;
        continue;
      }

      // highlight parentheses around texture references
      if (code[pos] === '(' || code[pos] === ')') {
        tokens.push({ text: code[pos], type: 'syntax-markdown' });
        pos++;
        continue;
      }
    }
    // === END MENU CUSTOM HIGHLIGHTING ===

    // 7) Inline markdown markers
    if (code.startsWith('**', pos)) { tokens.push({ text: '**', type: 'syntax-markdown' }); pos += 2; continue; }
    if (code[pos] === '*')          { tokens.push({ text: '*', type: 'syntax-markdown' }); pos += 1; continue; }
    if (code[pos] === '`')          { tokens.push({ text: '`', type: 'syntax-markdown' }); pos += 1; continue; }
    if (code[pos] === '§')          { tokens.push({ text: '§', type: 'syntax-markdown' }); pos += 1; continue; }

    // 8) Default char
    tokens.push({ text: code[pos], type: 'plain' });
    pos++;
  }

  return tokens;
}


function syntaxHighlightMarkdown(code) {
  const escaped = escapeHtml(code); // escape HTML first
  const tokens = tokenizeMarkdown(escaped);

  return tokens.map(t =>
    t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
  ).join('');
}

/* ---------------------------
   Caret helpers
   --------------------------- */

function getCaretCharacterOffsetWithin(element) {
  const sel = window.getSelection();
  let caretOffset = 0;
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }
  return caretOffset;
}

function setCursorAtOffset(el, offset) {
  const range = document.createRange();
  const sel = window.getSelection();

  let currentNode = null;
  let currentOffset = 0;
  let remainingOffset = offset;

  function walk(node) {
    if (node.nodeType === 3) { // text node
      if (node.textContent.length >= remainingOffset) {
        currentNode = node;
        currentOffset = remainingOffset;
        return true;
      } else {
        remainingOffset -= node.textContent.length;
      }
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (walk(node.childNodes[i])) return true;
      }
    }
    return false;
  }

  walk(el);

  if (currentNode) {
    range.setStart(currentNode, currentOffset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function insertAtCaret(str) {
  const sel = window.getSelection();
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(str));

  // Move cursor after inserted text
  range.setStart(range.endContainer, range.endOffset);
  range.setEnd(range.endContainer, range.endOffset);
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ---------------------------
   Markdown -> HTML renderer
   (handles escapes so escaped chars do not format)
   --------------------------- */

function markdownToHTML(markdown) {
  // 1) Extract escapes (backslash + special) and replace with placeholders
  const escapeMap = {};
  let escI = 0;
  markdown = markdown.replace(/\\([!#\-\*`])/g, (m, ch) => {
    const key = `__ESC${escI++}__`;
    escapeMap[key] = escapeHtml(ch)
    return key;
  });

  // 7) Color
  markdown = markdown.replace(
    /<color\s+["']?(#[0-9a-fA-F]{3,6}|[a-zA-Z-]+)["']?>((.|\s*?)*?)<\/color>/gs,
    '<span style="color: $1; font-size: inherit;">$2</span>'
  );

  // 2) Titles & headings (line anchors, processed before lists)
  markdown = markdown.replace(/^!! (.+)$/gm, '<div class="page-subtitle">$1</div>');
  markdown = markdown.replace(/^! (.+)$/gm, '<div class="page-title">$1</div>');
  markdown = markdown.replace(/^### (.+)$/gm, '<div class="page-content-subheader">$1</div>');
  markdown = markdown.replace(/^## (.+)$/gm, '<div class="page-content-header">$1</div>');
  markdown = markdown.replace(/^# (.+)$/gm, '<div class="page-content-superheader">$1</div>');
  
  markdown = markdown.replace(/\*\*(.+?)\*\*/g, (m, inner) => `<b>${escapeHtml(inner)}</b>`);
  markdown = markdown.replace(/\*(.+?)\*/g, (m, inner) => `<i>${escapeHtml(inner)}</i>`);
  markdown = markdown.replace(/`([^`]+)`/g, (m, inner) => `<div class="page-content-code"><pre>${escapeHtml(inner).replaceAll('-', '&#45;')}</pre></div>`);


  // 3) Lists: merge consecutive "- " lines into one list block
  markdown = markdown.replace(
    /(?:^|\n)((?:-([a-zA-Z]?) .+(?:\n-[a-zA-Z]? .+)*)+)/g,
    (block) => {
      const items = block.trim().split("\n").map(line => {
        // Match each line safely
        const lineMatch = line.match(/^-([a-zA-Z]?)\s(.+)/);
        if (!lineMatch) return ''; // skip invalid lines

        const lineFlag = lineMatch[1]; // optional letter
        const text = lineMatch[2];

        return `<div class="page-content-list-point" data-flag="${lineFlag}">${text}</div>`;
      }).join('');

      return `<div class="page-content-list">${items}</div>`;
    }
  );



  // Inline formatting: bold, italic, inline code
  const spanMap = [
    { markdown: 'm', class: 'markdown-monospace' }
  ];

  for (const el of spanMap) {
    markdown = markdown.replaceAll(`<${el.markdown}>`, `<span class="${el.class}">`);
    markdown = markdown.replaceAll(`</${el.markdown}>`, '</span>');
  }

  // Links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => `<a href="${href}">${text}</a>`);

  markdown = markdown.replace(/<display\s+texture="([^"]+)">(.*?)<\/display>/gs, (match, texture, content) => {
    return `
    <div class="page-content-item-display">
      <img src="${texture}">
      <div class="page-content-item-display-content">
        ${content.trim()}
      </div>
    </div>`;
  });

  // Menus
  markdown = markdown.replace(/<menu\s+(\d+)x(\d+)>\s*(.*?)\s*<\/menu>/gs, (m, width, height, content) => {
    const textureDecls = [...content.matchAll(/^\s*([^:]+?)\s*:\s*(.+?)\s*$/gm)].map(x => [x[1], x[2]])
    const textureMap = Object.fromEntries(textureDecls)
    textureMap["_"] = "_"

    const slotDecls = [...content.matchAll(/@(default|\([^)]+\))\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g)];
    const slotMap = {}

    for (const slot of slotDecls) {
      slotMap[slot[1]] = {
        texture: slot[2],
        content: slot[3]
      }
    }

    console.log(textureMap, slotMap)

    let slots = ''

    console.log(slotMap)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const location = `(${x}|${y})`
        const slot = slotMap[location]

        let texture
        let content
        if (slot) {
          texture = textureMap[slot.texture]
          content = slot.content
        } else {
          texture = textureMap[slotMap.default.texture]
          content = slotMap.default.content
        }
        
        slots += `<div class="page-content-menu-slot">
          ${texture ?  `<img class="page-content-menu-slot-img" src="${texture}">` : ""}
          <div class="page-content-item-display-content">${content}</div>
        </div>`
      }
    }

    return `<div class="page-content-menu" style="width: ${width * 64 + 12}px; height: ${height * 64 + 12}px; grid-template-columns: repeat(${width}, 1fr); grid-template-rows: repeat(${height}, auto)">
      ${slots}
    </div>`
  })

  // Tables
  markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (fullMatch, tableContent) => {
    const rows = tableContent.trim().split('\n').filter(row => row.trim())
    if (rows.length === 0) return '<div class="page-content-table"></div>'

    const map = rows.map(row => row.split('|').map(cell => cell.trim()))
    const strengths = []
    const strengthSum = () => {
      let sum = 0
    
      for (str of strengths) {
        sum += str
      }

      return sum
    }

    const width = map[0].length;
    const height = map.length;

    let newMap = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y == 0) {
          const strength = map[y][x].match(/\{(\d+)\}/)
          if (strength) {
            strengths.push(parseInt(strength[1], 10))
          } else {
            strengths.push(0)
          }
          newMap.push({ value: map[y][x].replace(/\{\d+\}/, '').trim(), width: strengths[x], height: 1, left: x == 0, top: true });
          continue
        }

        switch (map[y][x]) {

          case "<": {
            for (let i = 1; i <= x; i++) {
              const val = newMap[y * width + x - i];
              if (!val) continue;
              val.width += strengths[x];
              break;
            }
            newMap.push(null);
            break;
          }

          case "^": {
            for (let i = 1; i <= y; i++) {
              const val = newMap[(y - i) * width + x];
              if (!val) continue;
              val.height += 1;
              break;
            }
            newMap.push(null);
            break;
          }

          default: {
            newMap.push({ value: map[y][x], width: strengths[x], height: 1, left: x == 0, top: false });
          }
        }
      }
    }

    newMap = newMap.filter(item => item);

    let tableHTML = `<div class="page-content-table" style="display: grid; grid-template-columns: repeat(${strengthSum()}, 1fr); grid-template-rows: repeat(${height}, auto);">`;

    for (const cell of newMap) {
      tableHTML += `<div class="page-content-table-cell" style="grid-column: span ${cell.width}; grid-row: span ${cell.height};" ${cell.left ? 'data-left' : ''} ${cell.top ? 'data-top' : ''}>
        ${cell.value}
      </div>`;
    }

    tableHTML += '</div>';
    return tableHTML;
  });

  markdown = markdown.replace(/§(.*?)§/gs, (match, content) => {
    if (content.trim() === '') return '';
    return `<div class="page-content-text">${content}</div>`;
  });

  // 12) Restore escape placeholders
  for (const key in escapeMap) {
    markdown = markdown.replaceAll(key, escapeMap[key]);
  }

  return markdown;
}

/* ---------------------------
   Editor handlers
   --------------------------- */

function handleEditor(editor) {
  editor.innerHTML = `
    <div class="page-content-code-icon">HTSL</div>
    <button class="page-content-code-copy-button" title="Copy">
      <span class="material-symbols-outlined">content_copy</span>
      <div class="page-content-code-copy-button-hover">Copy</div>
    </button>
    <hr>
    <pre contenteditable="true" spellcheck="false"></pre>
  `;

  const pre = editor.querySelector('pre');
  const button = editor.querySelector('.page-content-code-copy-button');

  pre.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // stop browser resetting formatting
      insertAtCaret("\n");    // custom helper to insert newline
    }
  });

  pre.addEventListener("input", () => {
    const caretOffset = getCaretCharacterOffsetWithin(pre);

    // Grab plain text
    const text = pre.innerText;

    // Re-render with highlighting
    pre.innerHTML = syntaxHighlightHTSL(text);

    // Restore caret
    setCursorAtOffset(pre, caretOffset);

    // Update copy button
    button.onclick = () => copyToClipboard(text);
  });
}

function handleMarkdownEditor(editor) {
  // set up editor UI
  const savedMarkdown = unEscapeHtml(localStorage.getItem('markdown_editor') || "");

  editor.innerHTML = `
    <div class="page-content-code-icon">MARKDOWN</div>
    <button class="page-content-code-markdown-create">Create Article</button>
    <button class="page-content-code-markdown-copy-html">Copy HTML</button>
    <button class="page-content-code-copy-button" title="Copy"> 
      <span class="material-symbols-outlined">content_copy</span>
      <div class="page-content-code-copy-button-hover">Copy</div>
    </button>
    <hr>
    <pre contenteditable="true" spellcheck="false">${syntaxHighlightMarkdown(savedMarkdown)}</pre>
  `;

  const pre = editor.querySelector('pre');
  const parent = editor.parentNode;
  parent.insertAdjacentHTML('beforeend', `<div class="article-preview" style="width:100%;"></div>`);
  const preview = parent.querySelector('.article-preview');

  const copyMarkdownButton = editor.querySelector('.page-content-code-copy-button');
  const copyHTMLButton = editor.querySelector('.page-content-code-markdown-copy-html');
  const createArticleButton = editor.querySelector('.page-content-code-markdown-create');

  function onInput() {
    const caretOffset = getCaretCharacterOffsetWithin(pre);
    const text = pre.textContent;

    // highlight in editor
    pre.innerHTML = syntaxHighlightMarkdown(text);

    // restore caret
    setCursorAtOffset(pre, caretOffset);

    // wire buttons
    copyMarkdownButton.onclick = () => copyToClipboard(text);
    copyHTMLButton.onclick = () => copyToClipboard(unEscapeHtml(markdownToHTML(text)));
    createArticleButton.onclick = () => {
      preview.innerHTML = markdownToHTML(text)
      fixMarkdownPreview(preview);
    };

    // persist raw text (escaped) so HTML entities don't break storage
    localStorage.setItem('markdown_editor', escapeHtml(text));
  }

  onInput();

  pre.addEventListener('input', onInput);

  pre.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      const text = pre.textContent;
      preview.innerHTML = markdownToHTML(text);
      fixMarkdownPreview(preview);
    } else if (e.key === "Enter") {
      e.preventDefault()
      insertAtCaret('\n')
    }
  });
}

/* ---------------------------
   Preview fixer (post-processing)
   --------------------------- */



function fixMarkdownPreview(preview) {
  const itemDisplays = document.querySelectorAll('.page-content-item-display')
  document.querySelectorAll('.page-content-menu-slot').forEach((s) => {
      handleItemDisplay(s)
  })

  itemDisplays.forEach((i) => {
    handleItemDisplay(i)
  })

  // Enhance code blocks: syntax highlight HTSL inside <pre> if present
  preview.querySelectorAll('.page-content-code').forEach(codeField => {
    const pre = codeField.querySelector('pre');
    const raw = pre ? pre.textContent : '';
    codeField.innerHTML = `
      <div class="page-content-code-icon">HTSL</div>
      <button class="page-content-code-copy-button" title="Copy">
        <span class="material-symbols-outlined">content_copy</span>
        <div class="page-content-code-copy-button-hover">Copy</div>
      </button>
      <hr>
      <pre>${syntaxHighlightHTSL(raw)}</pre>
    `;
  });

  // Numbered list display
  preview.querySelectorAll('.page-content-list').forEach((list) => {
    let i = 1;
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
      switch (point.dataset.flag) {
        case 'r': {
            point.innerHTML = `<div class="page-content-list-number"><span style="font-family: monospace; font-size: 14px; letter-spacing: -1px">${intToRoman(i).toLowerCase()}</span>.</div><pre>${point.innerHTML}</pre>`;
            break
        }
        case 'R': {
            point.innerHTML = `<div class="page-content-list-number"><span style="font-family: monospace; font-size: 14px; letter-spacing: -1px">${intToRoman(i)}</span>.</div><pre>${point.innerHTML}</pre>`;
            break
        }
        case 'a': {
            point.innerHTML = `<div class="page-content-list-number">${ i <= 26 ? String.fromCharCode(96 + i) : 'OUT OF RANGE' }.</div><pre>${point.innerHTML}</pre>`
            break
        }
        case 'A': {
            point.innerHTML = `<div class="page-content-list-number">${ i <= 26 ? String.fromCharCode(64 + i) : 'OUT OF RANGE' }.</div><pre>${point.innerHTML}</pre>`
            break
        }
        case 'd': {
            point.innerHTML = `<div class="page-content-list-number">• </div><pre>${point.innerHTML}</pre>`
            break
        }
        default: {
            point.innerHTML = `<div class="page-content-list-number">${i}.</div><pre>${point.innerHTML}</pre>`;
        }
      }
      i++;
    });
  });

  // Enumerate superheaders
  let i = 1;
  preview.querySelectorAll('.page-content-superheader').forEach((superHeader) => {
    superHeader.innerHTML = `<span class="page-content-list-number">${i}.</span>  ${superHeader.innerHTML}`;
    i++;
  });

  // Table column parsing
  document.querySelectorAll('.page-content-table').forEach((table) => {
    const firstRow = table.firstElementChild;
    table.querySelectorAll('.page-content-table-column').forEach((column) => {
      const hasTitle = firstRow == column.parentNode;
      const rows = column.innerHTML.split('|');
      const title = hasTitle ? rows.shift() : '';
      let newHTML = hasTitle ? `<div class="page-content-table-title">${title}</div>` : '';
      for (const row of rows) {
        newHTML += `<div class="page-content-table-cell">${row}</div>`;
      }
      column.innerHTML = newHTML;
    });
  });

  // wire copy buttons inside preview
  preview.querySelectorAll('.page-content-code-copy-button').forEach(btn => {
    const pre = btn.parentNode.querySelector('pre');
    if (pre) btn.onclick = () => copyToClipboard(pre.textContent);
  });

}

const codeFields = document.querySelectorAll('.page-content-code');

for (const codeField of codeFields) {
  const isMarkdown = codeField.classList.contains('markdown');
  if (codeField.classList.contains('code-editor')) {
    if (isMarkdown) { handleMarkdownEditor(codeField); continue; }
    handleEditor(codeField);
    continue;
  }

  // Static code blocks (not editable)
  const text = codeField.querySelector('pre') ? codeField.querySelector('pre').textContent : '';
  codeField.innerHTML = `
    <div class="page-content-code-icon">${isMarkdown ? "MARKDOWN" : "HTSL"}</div>
    <button class="page-content-code-copy-button" title="Copy">
      <span class="material-symbols-outlined">content_copy</span>
      <div class="page-content-code-copy-button-hover">Copy</div>
    </button>
    <hr>
    <pre>${isMarkdown ? syntaxHighlightMarkdown(text) : syntaxHighlightHTSL(text)}</pre>
  `;
  const btn = codeField.querySelector('.page-content-code-copy-button');
  if (btn) btn.onclick = () => copyToClipboard(text);
}

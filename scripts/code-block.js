
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
    .replace(/>/g, "&gt;");
}

function unEscapeHtml(text) {
  return (text || '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

/* ---------------------------
   HTSL tokenizer & highlighter
   (kept mostly as before)
   --------------------------- */

function tokenizeHTSL(code) {
  const tokens = [];
  let pos = 0;

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
  ];

  while (pos < code.length) {
    let matched = false;
    for (const { type, regex } of tokenPatterns) {
      regex.lastIndex = pos;
      const m = regex.exec(code);
      if (m && m.index === pos) {
        tokens.push({ text: m[0], type });
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ text: code[pos], type: 'plain' });
      pos++;
    }
  }

  return tokens;
}

function syntaxHighlightHTSL(code) {
  const escaped = escapeHtml(code);
  const tokens = tokenizeHTSL(escaped);
  return tokens.map(t =>
    t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
  ).join('');
}

/* ---------------------------
   Markdown tokenizer & highlighter
   --------------------------- */

/*
 Token types emitted:
 - plain: normal text characters
 - syntax-markdown: the special markers (#, ##, ###, !, !!, -, *, **, `)
 - syntax-escape: the leading backslash when escaping a special char (render gray)
*/
function tokenizeMarkdown(code) {
  // code is expected to be escaped already (escapeHtml applied before calling)
  const tokens = [];
  let pos = 0;

  const isLineStart = (i) => i === 0 || code[i - 1] === '\n';
  // we'll match against raw characters (these are unchanged by escapeHtml)
  const specials = new Set(['!', '#', '-', '*', '`']);

  while (pos < code.length) {
    // 1) Escaped special: backslash + special -> render backslash as escape token, then the char as plain
    if (code[pos] === '\\' && pos + 1 < code.length && specials.has(code[pos + 1])) {
      tokens.push({ text: '\\', type: 'syntax-escape' });
      tokens.push({ text: code[pos + 1], type: 'plain' });
      pos += 2;
      continue;
    }

    // 2) XML-like tags user might type as &lt;...&gt;
    if (code.startsWith('&lt;', pos)) {
      const end = code.indexOf('&gt;', pos + 4);
      if (end !== -1) {
        tokens.push({ text: code.slice(pos, end + 4), type: 'syntax-markdown' });
        pos = end + 4;
        continue;
      }
    }

    // 3) Line-start markers: check longest first (###, !!, ##, !, #, -)
    if (isLineStart(pos)) {
      if (code.startsWith('### ', pos)) { tokens.push({ text: '###', type: 'syntax-markdown' }); pos += 3; continue; }
      if (code.startsWith('## ', pos))  { tokens.push({ text: '##', type: 'syntax-markdown' }); pos += 2; continue; }
      if (code.startsWith('# ', pos))   { tokens.push({ text: '#', type: 'syntax-markdown' }); pos += 1; continue; }
      if (code.startsWith('!! ', pos))  { tokens.push({ text: '!!', type: 'syntax-markdown' }); pos += 2; continue; }
      if (code.startsWith('! ', pos))   { tokens.push({ text: '!', type: 'syntax-markdown' }); pos += 1; continue; }
      if (code.startsWith('- ', pos))   { tokens.push({ text: '-', type: 'syntax-markdown' }); pos += 1; continue; }
    }

    // 4) Inline markers anywhere: '**', '*', '`'
    if (code.startsWith('**', pos)) { tokens.push({ text: '**', type: 'syntax-markdown' }); pos += 2; continue; }
    if (code[pos] === '*')         { tokens.push({ text: '*', type: 'syntax-markdown' }); pos += 1; continue; }
    if (code[pos] === '`')         { tokens.push({ text: '`', type: 'syntax-markdown' }); pos += 1; continue; }

    // 5) Default char
    tokens.push({ text: code[pos], type: 'plain' });
    pos++;
  }

  return tokens;
}

function syntaxHighlightMarkdown(code) {
  // highlightMarkdown works on raw text: we escape HTML then tokenize
  const escaped = escapeHtml(code);
  const tokens = tokenizeMarkdown(escaped);

  // map tokens to HTML (spans for non-plain)
  return tokens.map(t =>
    t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
  ).join('')
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
    // Render the backslash as a gray element and the character literal after it
    // Note: we don't escape the char because it's not special HTML (<>& handled later if needed)
    escapeMap[key] = escapeHtml(ch)
    return key;
  });

  // 2) Titles & headings (line anchors, processed before lists)
  markdown = markdown.replace(/^!! (.+)$/gm, '<div class="page-subtitle">$1</div>');
  markdown = markdown.replace(/^! (.+)$/gm, '<div class="page-title">$1</div>');
  markdown = markdown.replace(/^### (.+)$/gm, '<div class="page-content-subheader">$1</div>');
  markdown = markdown.replace(/^## (.+)$/gm, '<div class="page-content-header">$1</div>');
  markdown = markdown.replace(/^# (.+)$/gm, '<div class="page-content-superheader">$1</div>');

  // 3) Lists: merge consecutive "- " lines into one list block
  markdown = markdown.replace(/(?:^|\n)(- .+(?:\n- .+)*)/g, (block) => {
    const items = block.trim().split("\n").map(line =>
      `<div class="page-content-list-point"><pre>${escapeHtml(line.replace(/^- /, ''))}</pre></div>`
    ).join('');
    return `<div class="page-content-list">${items}</div>`;
  });

  // 4) Inline formatting: bold, italic, inline code
  // Note: we escape content of replacement to avoid accidental HTML injection
  markdown = markdown.replace(/\*\*(.+?)\*\*/g, (m, inner) => `<b>${escapeHtml(inner)}</b>`);
  markdown = markdown.replace(/\*(.+?)\*/g, (m, inner) => `<i>${escapeHtml(inner)}</i>`);
  markdown = markdown.replace(/`([^`]+)`/g, (m, inner) => `<code>${escapeHtml(inner)}</code>`);

  // 5) Custom wiki tags (allow user to use their <table>, <row>, <subheader>, <m> tags
  const map = [
    { markdown: 'table', class: 'page-content-table' },
    { markdown: 'row', class: 'page-content-table-row' },
    { markdown: 'subheader', class: 'page-content-subheader' }
  ];
  const spanMap = [
    { markdown: 'm', class: 'markdown-monospace' }
  ];
  for (const el of map) {
    markdown = markdown.replaceAll(`<${el.markdown}>`, `<div class="${el.class}">`);
    markdown = markdown.replaceAll(`</${el.markdown}>`, '</div>');
  }
  for (const el of spanMap) {
    markdown = markdown.replaceAll(`<${el.markdown}>`, `<span class="${el.class}">`);
    markdown = markdown.replaceAll(`</${el.markdown}>`, '</span>');
  }

  // 6) Links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => `<a href="${href}">${text}</a>`);

  // 7) Columns
  markdown = markdown.replace(/<column\s+width="([^"]+)"\s*>/g, (m, w) => `<div class="page-content-table-column" style="width: ${escapeHtml(w)};">`);
  markdown = markdown.replaceAll('</column>', '</div>');

  // 8) Code blocks (custom <code> ... </code> tag)
  markdown = markdown.replaceAll('<code>', '<div class="page-content-code"><pre>');
  markdown = markdown.replaceAll('</code>', '</pre></div>');

  // 10) Restore escape placeholders
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

  pre.addEventListener('input', () => {
    const caretOffset = getCaretCharacterOffsetWithin(pre);
    const text = pre.textContent;
    pre.innerHTML = syntaxHighlightHTSL(text);
    setCursorAtOffset(pre, caretOffset);
    button.onclick = () => copyToClipboard(text);
  });

  // initialize empty content if needed
  pre.textContent = pre.textContent || '';
  pre.innerHTML = syntaxHighlightHTSL(pre.textContent);
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
    copyHTMLButton.onclick = () => copyToClipboard(markdownToHTML(text));
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
    }
  });
}

/* ---------------------------
   Preview fixer (post-processing)
   --------------------------- */

function fixMarkdownPreview(preview) {
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
      console.log(point.innerHTML)
      point.innerHTML = `<div class="page-content-list-number">${i}.</div><pre>${unEscapeHtml(point.innerHTML)}</pre>`;
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

  preview.innerHTML = `<div class="page-content-text">${preview.innerHTML}</div>`
}

/* ---------------------------
   Initialization
   --------------------------- */

log('Start tokenization');

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

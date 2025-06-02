function log(string) {
  console.log(`CODE_BLOCKS > ${string}`);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      log('Copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unEscapeHtml(text) {
  return text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')
}

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
      // No token matched, consume one char as plain text
      tokens.push({ text: code[pos], type: 'plain' });
      pos++;
    }
  }

  return tokens;
}

function tokenizeMarkdown(code) {
  const tokens = []
  let pos = 0
  const tokenPatterns = [
    { type: 'syntax-markdown', regex: /&lt;[^&<>]+&gt;/g }
  ]

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

  return tokens

}

function syntaxHighlightHTSL(code) {
  const escaped = escapeHtml(code);
  const tokens = tokenizeHTSL(escaped);
  return tokens.map(t =>
    t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
  ).join('');
}

function syntaxHighlightMarkdown(code) {
  const escaped = escapeHtml(code);
  const tokens = tokenizeMarkdown(escaped);
  return tokens.map(t =>
    t.type === 'plain' ? t.text : `<span class="${t.type}">${t.text}</span>`
  ).join('');
}

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
    if (node.nodeType === 3) {
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

function markdownToHTML(markdown) {
  const map = [
    { markdown: 'title', class: 'page-title' },
    { markdown: 'subtitle', class: 'page-subtitle' },
    { markdown: 'superheader', class: 'page-content-superheader' },
    { markdown: 'header', class: 'page-content-header'},
    { markdown: 'text', class: 'page-content-text' },
    { markdown: 'list', class: 'page-content-list' },
    { markdown: 'point', class: 'page-content-list-point' },
    { markdown: 'table', class: 'page-content-table' },
    { markdown: 'row', class: 'page-content-table-row' },
    { markdown: 'subheader', class: 'page-content-subheader' }
  ]

  const spanMap = [
    { markdown: 'm', class: 'markdown-monospace'}
  ]

  for (const el of map) {
    markdown = markdown.replaceAll(`<${el.markdown}>`, `<div class="${el.class}">`)
    markdown = markdown.replaceAll(`</${el.markdown}>`, '</div>')
  }

  for (const el of spanMap) {
    markdown = markdown.replaceAll(`<${el.markdown}>`, `<span class="${el.class}">`)
    markdown = markdown.replaceAll(`</${el.markdown}>`, '</span>')
  }

  markdown = markdown.replace(/<link\s+ref="([^"]+)">([\s\S]*?)<\/link>/g, '<a href="$1">$2</a>')
  markdown = markdown.replace(/<column\s+width="([^"]+)"\s*>/g, '<div class="page-content-table-column" style="width: $1;">');

  markdown = markdown.replaceAll('<code>', '<div class="page-content-code"><pre>').replaceAll('</code>', '</pre></div>').replaceAll('</column>', '</div>')

  return markdown
}

function handleEditor(editor) {
  editor.innerHTML = `
    <div class="page-content-code-icon">HTSL</div>
    <button class="page-content-code-copy-button">
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
}

function handleMarkdownEditor(editor) {
  function onInput() {
    const caretOffset = getCaretCharacterOffsetWithin(pre)
    const text = pre.textContent

    pre.innerHTML = syntaxHighlightMarkdown(text)

    setCursorAtOffset(pre, caretOffset);
    
    copyMarkdownButton.onclick = () => copyToClipboard(text)
    copyHTMLButton.onclick = () => copyToClipboard(markdownToHTML(text))
    createArticleButton.onclick = () => {
      preview.innerHTML = markdownToHTML(text)
      fixMarkdownPreview(preview)
    }

    localStorage.setItem('markdown_editor', escapeHtml(text))
  }
  const savedMarkdown = unEscapeHtml(localStorage.getItem('markdown_editor') || "")

  editor.innerHTML = `
    <div class="page-content-code-icon">MARKDOWN</div>
    <button class="page-content-code-markdown-create">
      Create Article
    </button>
    <button class="page-content-code-markdown-copy-html">
      Copy HTML
    </button>
    <button class="page-content-code-copy-button">
      <span class="material-symbols-outlined">content_copy</span>
      <div class="page-content-code-copy-button-hover">Copy</div>
    </button>
    <hr>
    <pre contenteditable="true" spellcheck="false">${syntaxHighlightMarkdown(savedMarkdown)}</pre>`

    const pre = editor.querySelector('pre')
    const parent = editor.parentNode
    parent.insertAdjacentHTML('beforeend', `<div class="article-preview" style="width:100%;"></div>`)
    const preview = parent.querySelector('.article-preview')

    const copyMarkdownButton = editor.querySelector('.page-content-code-copy-button')
    const copyHTMLButton = editor.querySelector('.page-content-code-markdown-copy-html')
    const createArticleButton = editor.querySelector('.page-content-code-markdown-create')

    onInput()

    pre.addEventListener('input', () => {
      
      onInput()

    })
    pre.addEventListener('keydown', function (e) {

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()

        const text = pre.textContent

        preview.innerHTML = markdownToHTML(text)
        fixMarkdownPreview(preview)
      }
    });
}

function fixMarkdownPreview(preview) {
  preview.querySelectorAll('.page-content-code').forEach(codeField => {
    codeField.innerHTML = `
      <div class="page-content-code-icon">HTSL</div>
      <button class="page-content-code-copy-button">
        <span class="material-symbols-outlined">content_copy</span>
        <div class="page-content-code-copy-button-hover">Copy</div>
      </button>
      <hr>
      <pre>${syntaxHighlightHTSL(codeField.querySelector('pre').textContent)}</pre>
    `
  })
  preview.querySelectorAll('.page-content-list').forEach((list) => {
    let i = 1
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
        point.innerHTML = `<pre>  <span class="page-content-list-number">${i}.</span>  ${point.innerHTML}</pre>`
        i++
    })
  })

  let i = 1
  preview.querySelectorAll('.page-content-superheader').forEach((superHeader) => {
      superHeader.innerHTML = `<span class="page-content-list-number">${i}.</span>  ${superHeader.innerHTML}`
      i++
  })
  document.querySelectorAll('.page-content-table').forEach((table) => {
    const firstRow = table.firstElementChild
    table.querySelectorAll('.page-content-table-column').forEach((column) => {
        const hasTitle = firstRow == column.parentNode
        const rows = column.innerHTML.split('|')
        const title = hasTitle ? rows.shift() : ''

        let newHTML = hasTitle ? `<div class="page-content-table-title">${title}</div>` : ''

        for (const row of rows) {
            newHTML += `<div class="page-content-table-cell">${row}</div>`
        }
        column.innerHTML = newHTML
    })
  })
}

log('Start tokenization');

const codeFields = document.querySelectorAll('.page-content-code');

for (const codeField of codeFields) {
  const isMarkdown = codeField.classList.contains('markdown')
  if (codeField.classList.contains('code-editor')) {
    if (isMarkdown) {
      handleMarkdownEditor(codeField)
      continue
    }
    handleEditor(codeField);
    continue;
  }
  const text = codeField.querySelector('pre').textContent;
  codeField.innerHTML = `
    <div class="page-content-code-icon">${isMarkdown ? "MARKDOWN" : "HTSL"}</div>
    <button class="page-content-code-copy-button">
      <span class="material-symbols-outlined">content_copy</span>
      <div class="page-content-code-copy-button-hover">Copy</div>
    </button>
    <hr>
    <pre>${isMarkdown ? syntaxHighlightMarkdown(text) : syntaxHighlightHTSL(text)}</pre>
  `;
  codeField.querySelector('.page-content-code-copy-button').onclick = () => copyToClipboard(text);
}


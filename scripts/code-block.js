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
      // No token matched, consume one char as plain text
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
  editor.innerHTML = `
    <div class="page-content-code-icon">HTSL</div>
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
    <pre contenteditable="true" spellcheck="false"></pre>`
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

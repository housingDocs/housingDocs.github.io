

async function getSnippets(start, end) {
    return fetch('https://housingdocsserver.onrender.com/snippets', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            rangeStart: start,
            rangeEnd: end
        })
    }).then((r) => {
        return r.json()
    })
}

let i = 0
const snippetRows = document.querySelectorAll('.forum-snippet-row')
let curRow

getSnippets(1, 6).then((r) => {
    r = JSON.parse(r)
    for (const snippet of r) {
        console.log(snippet)
        curRow = snippetRows.item(i < 3 ? 0 : 1)
        curRow.innerHTML += `

<div class="forum-snippet">
    <div class="forum-snippet-top">
        <div class="forum-snippet-top-name">
            ${snippet.name}
        </div>
        <div class="forum-snippet-top-author">
            <span>by</span> ${snippet.author}
        </div>
    </div>
    <div class="forum-snippet-content">
        <pre>${syntaxHighlightHTSL(snippet.content)}</pre>
    </div>
</div>

`

        i++
    }

    for (i; i % 3 != 0; i++) {
        curRow.innerHTML += '<div style="flex: 1; margin: 0 12px"></div>'
    }
})

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

const snippetCache = {}

async function getSnippets(rangeStart, rangeEnd) {
    return fetch('https://housingdocsserver.onrender.com/snippets', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            rangeStart,
            rangeEnd
        })
    }).then((r) => {
        return r.json()
    })
}

async function searchSnippets(search) {
  return fetch('https://housingdocsserver.onrender.com/snippets/search', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      search
    })
  }).then((r) => {
    return r.json()
  })
}

const submitKeyInput = document.querySelector('#submit-key-input')

async function getOwnSnippets(key) {
  return fetch('https://housingdocsserver.onrender.com/snippets/own', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key
    })
  }).then((r) => {
    return r.json()
  })
}

let i = 0
const snippetRows = document.querySelectorAll('.forum-snippet-row')
let curRow

function clearRows() {
  snippetRows.forEach((row) => {
    row.innerHTML = ''
  })
}

function fixName() {
  document.querySelectorAll('.forums-snippet-top-name').forEach(name => {
    if (checkOverflow(name)) {
      let i = 1
      const wholeContent = name.textContent
      name.textContent = ''
      console.log(wholeContent)

      while (!checkOverflow(name)) {
        name.textContent = wholeContent.slice(0, i)
        i += 1
      }
    }
  });
} 

getSnippets(1, 6).then((r) => {
    r = JSON.parse(r)
    for (const snippet of r) {
        snippetCache[snippet.id] = snippet

        console.log(snippet)
        curRow = snippetRows.item(i < 3 ? 0 : 1)
        curRow.innerHTML += `

<div class="forum-snippet">
    <button class="forum-snippet-top" onclick="showSnippet(${snippet.id})">
        <div class="forum-snippet-top-name">
            ${snippet.name}
        </div>
        <div class="forum-snippet-top-author">
            <span>by</span> ${snippet.author}
        </div>
    </button>
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
    fixName()
})

const forumContainer = document.querySelector('#forum')
const snippetContainer = document.querySelector('#big-snippet')
const submitContainer = document.querySelector('#submit')

const snippetHeader = document.querySelector('#big-snippet-name')
const snippetDescription = document.querySelector('#big-snippet-description')
const snippetContent = document.querySelector('#big-snippet-content')

window.showSnippet = (id) => {
    const snippet = snippetCache[id]
    if (!snippet) return

    forumContainer.style.display = 'none'
    snippetContainer.style.display = 'block'
    submitContainer.style.display = 'none'

    snippetHeader.innerHTML = `${snippet.name} <span style="font-size: 28px; color: #7c5ed7ff;">by ${snippet.author}</span>`
    snippetDescription.textContent = snippet.description
    snippetContent.innerHTML = `<pre>${syntaxHighlightHTSL(snippet.content)}</pre>`
}

window.showForum = () => {
    forumContainer.style.display = 'block'
    snippetContainer.style.display = 'none'
    submitContainer.style.display = 'none'
}

window.showSubmit = () => {
  forumContainer.style.display = 'none'
  snippetContainer.style.display = 'none'
  submitContainer.style.display = 'block'

  const key = localStorage.getItem('htsl-key')

  if (key) {
    submitKeyInput.value = key
  }
}

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

function search() {
  clearRows()
  searchSnippets(searchField.value).then((r) => {
    let i = 0
    let curRow
    r = JSON.parse(r)
    for (const snippet of r) {
        snippetCache[snippet.id] = snippet

        console.log(snippet)
        curRow = snippetRows.item(i < 3 ? 0 : 1)

        curRow.innerHTML += `
          <div class="forum-snippet">
          <button class="forum-snippet-top" onclick="showSnippet(${snippet.id})">
              <div class="forum-snippet-top-name">
                  ${snippet.name}
              </div>
              <div class="forum-snippet-top-author">
                  <span>by</span> ${snippet.author}
              </div>
          </button>
          <div class="forum-snippet-content">
              <pre>${syntaxHighlightHTSL(snippet.content)}</pre>
          </div>
          </div>`

          i++
      }

      for (i; i % 3 != 0; i++) {
          curRow.innerHTML += '<div style="flex: 1; margin: 0 12px"></div>'
      }
  })

}

const searchField = document.querySelector('.forum-search')
const searchButton = document.querySelector('#forum-search-button')

const searchSpan = searchButton.querySelector('span')

searchButton.onclick = () => {
  switch (searchButton.getAttribute('data-action')) {
    case 'search': {
      search()
      break
    }

    case 'submit': {
      showSubmit()
      break
    }
  }
}

searchField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    search()
  }
})
 
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey) {
    searchSpan.textContent = "add"
    searchButton.setAttribute('data-action', 'submit')
  }
})

document.addEventListener("keyup", (event) => {
  if (event.key === "Control" || event.key === "Meta") {
    searchSpan.textContent = "search"
    searchButton.setAttribute('data-action', 'search')
  }
})

const submitKeyButton = document.querySelector('#submit-key-button')
const ownSnippetsContainer = document.querySelector('#own-snippets')

submitKeyButton.addEventListener('click', () => {
  const key = submitKeyInput.value
  localStorage.setItem('htsl-key', key)

  getOwnSnippets(key).then((r) => {
    ownSnippetsContainer.innerHTML = ''
    if (r.error) {
      alert(r.error)
      return
    }
    document.querySelectorAll('.page-content-header').forEach((h) => {
      h.style.display = 'block'
    })

    document.querySelector('#new-snippet').style.display = 'block'

    for (const snippet of JSON.parse(r)) {
      console.log(snippet)
      ownSnippetsContainer.innerHTML += `
      <div class="own-snippet">
        <div class="own-snippet-name">
          ${snippet.name}
        </div>
        <div class="own-snippet-description">
          ${snippet.description}
        </div>
        <div class="own-snippet-date">
          ${timeConverter(snippet.date)}
        </div>
      </div>`
    }
  })
})

function autoResizeRows(el) {
  const style = window.getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight);

  // Reset rows so scrollHeight is accurate for the current content
  el.rows = 1;

  // Calculate how many rows are needed
  const neededRows = Math.floor(el.scrollHeight / lineHeight);

  // Apply rows
  el.rows = neededRows;
}

document.querySelectorAll("#new-snippet-inputs textarea").forEach(el => {
  el.addEventListener("input", () => autoResizeRows(el));
  autoResizeRows(el); // initial sizing
});

const submitButton = document.querySelector('#submit-snippet')

const newName = document.querySelector('#new-snippet-name')
const newDescription = document.querySelector('#new-snippet-description')
const newContent = document.querySelector('#new-snippet-content')

document.querySelectorAll('.new-snippet-input').forEach((i) => {
  i.addEventListener('input', () => {
    if (newName.value !== "" && newDescription.value !== "" && newContent.value !== "") {
      submitButton.disabled = false
    } else {
      submitButton.disabled = true
    }
  })
})

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

submitButton.addEventListener('click', () => {
  if (submitButton.disabled) return
  try {
    fetch('https://housingdocsserver.onrender.com/snippets/add', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.value,
        description: newDescription.value,
        content: newContent.value,
        key: localStorage.getItem('htsl-key')
      })
    }).then((r) => {
      return r.json()
    }).then((r) => {
      r = JSON.parse(r)
      if (r.status) {
        window.location.reload()
      }
    })

  } catch(e) {
    alert(e)
  }
})
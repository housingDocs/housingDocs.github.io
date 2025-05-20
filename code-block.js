function log(string) {
    console.log(`TOKENIZER > ${string}`)
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
}

function scan(string) {
    let newString = `<div class="page-content-code-icon">HTSL</div><button class="page-content-code-copy-button"><span class="material-symbols-outlined">content_copy</span><div class="page-content-code-copy-button-hover">Copy</div></button><hr><pre>`
    let lastPunctuation = -1
    let isCurString = false

    console.log(string)

    string = string + ' '

    for (let i = 1; i < string.length; i++) {

        if (string[i] == '\t') console.log(i)
        
        const substr = string.substring(lastPunctuation + 1, i)
        let punct = string[i]

        let found = false

        if (string[i] === '\'') {
            if (isCurString) {}
        }

        if (punctuation.includes(punct)) {
            for (const type in tokens) {
                const list = tokens[type]
                if (list.includes(substr)) {
                    if (punct === '\n') {
                        punct = '<br>'
                    } else if (punct !== ' ') {
                        punct = `<span class="token-punctuation">${punct}</span>`
                    }

                    newString += `<span class="token-${type}">${substr}</span>${punct}`
                    lastPunctuation = i

                    found = true

                    break
                }
            }
            if (found) continue

            if (punct === '\n') {
                punct = '<br>'
            } else if (punct !== ' ') {
                punct = `<span class="token-punctuation">${punct}</span>`
            }

            if (punct === ' ') console.log(i)
            
            newString += `${substr}${punct}`
            lastPunctuation = i
            
        }        
    }
    newString += '</pre>'
    return newString
}

const punctuation = [
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    ':',
    ';',
    '+',
    '-',
    '*',
    '/',
    ' ',
    '\n'
]

const tokens = {
    "keyword": [
        'from',
        'in',
        'for',
        'of',
        'import',
        'is'
    ],
    "datatype": [
        'String',
        'Array'
    ]
}

log('Start tokenization')

const codeFields = document.querySelectorAll('.page-content-code')
console.log(codeFields)

for (const codeField of codeFields) {
    const text = codeField.querySelector('pre').textContent
    codeField.innerHTML = scan(text)
    codeField.querySelector('.page-content-code-copy-button').onclick = () => copyToClipboard(text)
} 


function log(string) {
    console.log(`TOKENIZER > ${string}`)
}

/*function removeAll(string, charList) {
    for (const char of charList) {
        string = string.replace(char, ' ')
    }
}

function replaceList(string, obj) {
    for (const key in obj) {
        for (const char of obj[key]) {
            console.log(char)
            string = string.replaceAll(char, `<span class="${key}">${char}</span>`)
        }
    }
    return string
}*/

function scan(string) {
    let newString = ''
    let lastPunctuation = -1
    console.log(string)

    for (let i = 1; i < string.length; i++) {
        
        const substr = string.substring(lastPunctuation + 1, i)
        let punct = string[i]

        let found = false

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
            
            newString += `${substr}${punct}`
            lastPunctuation = i
            
        }        
    }
    return newString
}

const punctuation = [
    '(',
    ')',
    '[',
    ']',
    ' ',
    '\n'
]

const tokens = {
    "keyword": [
        'from',
        'in',
        'for',
        'of',
        'import'
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
    let inner = codeField.innerText
    inner = scan(inner)
    console.log(inner)
    codeField.innerHTML = inner
} 

/*for (const codeField of codeFields) {
    let inner = codeField.innerHTML
    let innerPunctuationLess = removeAll(inner, ['(', ')', '[', ']'])
    console.log(codeField, inner)

    inner = replaceList(inner, {
        "token-keyword": ['as', 'from', 'in', 'of', 'for', 'import'],
        "token-datatype": ['String'],
        "token-punctuation": ['(', ')']
    })

    codeField.innerHTML = inner

}*/
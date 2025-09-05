
const nav = 
{
    Home: {
        icon: "home",
        iconColor: "#6341E0",
        points: [
            { name: "Docs Introduction", link: "/html/Home/Introduction.html"},
        ]
    },
    "General Housing": {
        icon: "hardware",
        iconColor: "#f5e942",
        points: [
            { name: "Housing Browser", link: "/html/General_Housing/Housing_Browser.html"},
            { name: "Item Editor", link: "/html/General_Housing/Item_Editor.html" },
            { name: "Formatting Codes", link: "/html/General_Housing/Formatting_Codes.html" },
            { name: "Data Values", link: "/html/General_Housing/Data_Values.html" },
            { name: "Cookies", link: "/html/General_Housing/Cookies.html" }
        ]
    },
    "Housing Menu": {
        icon: "star",
        iconColor: "#47f3ffff",
        points: [
            { name: "Groups and Permissions", link: "/html/Housing_Menu/Groups_and_Permissions.html"},
            { name: "Pro Tools", link: "/html/Housing_Menu/Pro_Tools.html" },
            { name: "Special Items", link: "/html/Housing_Menu/Special_Items.html" }
        ]
    },
    "House Settings": {
        icon: "handyman",
        iconColor: "#e41212",
        points: [
            { name: "Plot Size", link: "/html/House_Settings/Plot_Size.html" },
            { name: "Themes", link: "/html/House_Settings/Themes.html"}
        ]
    },
    Systems: {
        icon: "settings",
        iconColor: "#fc6203",
        points: [
            { name: "Edit Actions", link: "/html/Systems/Edit_Actions.html" },
            { name: "Functions", link: "/html/Systems/Functions.html"},
            { name: "Custom Commands", link:"/html/Systems/Custom_Commands.html" },
            { name: "Regions", link: "/html/Systems/Regions.html" },
            { name: "Event Actions", link: "/html/Systems/Event_Actions.html" },
            { name: "Scoreboard Editor", link:"/html/Systems/Scoreboard_Editor.html" }
        ]
    },
    HTSL: {
        icon: "code",
        iconColor: "#67C520",
        points: [
            { name: "HTSL Introduction", link: "/html/HTSL/Introduction.html" },
            { name: "Code Block Editor", link: "/html/HTSL/Code_Block_Editor.html"},
            { name: "HTSL Forum", link:"/html/HTSL/Forum.html" }
        ]
    },
    Contribute: {
        icon: "ad_group",
        iconColor: "#22DD22",
        points: [
            { name: "Contribute", link: "/html/Contribute/Contribute.html" },
            { name: "Article Markdown", link: "/html/Contribute/Article_Markdown.html"},
            { name: "Article Editor", link: "/html/Contribute/Article_Editor.html"}
        ]
    },
    Other: {
        icon: "coffee",
        iconColor: "#f5e942",
        points: [
            { name: "About", link: "/html/Other/About.html" }
        ]
    }
};


if (typeof document !== 'undefined') {

    const sidebars = document.querySelectorAll('.sidebar-content')

let navHTML = '<input class="sidebar-search" placeholder="Search"></input>'

for (const group in nav) {
    navHTML += 
`<div class="sidebar-nav-group">
    <div class="sidebar-nav-header">
        <span class="material-symbols-outlined" style="color: ${nav[group].iconColor};">
            ${nav[group].icon}
        </span>
        ${group}
    </div>`

    for (const point of nav[group].points) {
        navHTML += (window.location.pathname != point.link) ?
`<a href="${point.link}"><div class="sidebar-nav-point">
    ${point.name}
</div></a>` : `<div class="sidebar-nav-point sidebar-nav-point-active">
    ${point.name}
</div>`
    }

    navHTML += '</div>'

}

// Enable @media on mobile
document.querySelector('head').innerHTML += `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

// Fill top
sidebars.item(0).innerHTML = navHTML
document.querySelector('.top').innerHTML = 
`<button class="dropdown">
    <span class="material-symbols-outlined">
        menu
    </span>
</button>
<div class="logo">
    <span class="material-symbols-outlined">
        import_contacts
    </span>
    hDocs
</div>
<a href="https://discord.gg/qRvcDc3vz5"><div class="discord">
    <img src="../../assets/discord.png">
</div></a>`

const dropdown = document.querySelector('.dropdown')
const sidebar = document.querySelector('.sidebar')
const page = document.querySelector('.page')

dropdown.onclick = () => {
    if (dropdown.dataset.active == 'true') {
        sidebar.style.display = 'none'
        page.style.display = 'block'
        dropdown.dataset.active = 'false'
    } else {
        sidebar.style.display = 'block'
        page.style.display = 'none'
        dropdown.dataset.active = 'true'
    }
}

// Searchbar
const searchBar = document.querySelector('.sidebar-search')

searchBar.addEventListener('input', () => {
    document.querySelectorAll('.sidebar-nav-point').forEach((point) => {
        if (point.textContent.toLowerCase().includes(searchBar.value.toLowerCase())) {
            point.style = 'display: block;'
        } else {
            point.style = 'display: none;'
        }
    })
    document.querySelectorAll('.sidebar-nav-group').forEach((group) => {
        let display = false
        group.querySelectorAll('.sidebar-nav-point').forEach((point) => {
            console.log(point.style.display)
            if (point.style.display == 'block') {
                display = true
            }
        })
        if (display) {
            group.style = 'display: block;'
        } else {
            group.style = 'display: none;'
        }
    })
})

// Order Lists
document.querySelectorAll('.page-content-list').forEach((list) => {
    let i = 1;
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
      point.innerHTML = `<div class="page-content-list-number">${i}.</div><pre>${point.innerHTML}</pre>`;
      i++;
    });
  });

// Order Superheaders, make sub-navigation

let subnavHTML = ''

let i = 1
document.querySelectorAll('.page-content-superheader').forEach((superHeader) => {
    subnavHTML += `<a href="#${superHeader.textContent}"><span>#</span>${superHeader.textContent}<a><br>`
    superHeader.setAttribute('id', superHeader.textContent)
    superHeader.innerHTML = `<span class="page-content-list-number">${i}.</span>  ${superHeader.innerHTML}`
    i++
})

if (i != 1) {
    sidebars.item(1).innerHTML += 
    `<div class="sidebar-subnav">
        <div class="sidebar-subnav-title" style="text-wrap: nowrap;">
            Content on this Page
        </div>
        <div class="sidebar-subnav-links">
            ${subnavHTML}
        </div>
    </div>`
}

// Create Tables
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

// Item Displays
const colorMap = {
    "&0": "#000000", // Black
    "&1": "#0000AA", // Dark Blue
    "&2": "#00AA00", // Dark Green
    "&3": "#00AAAA", // Dark Aqua
    "&4": "#AA0000", // Dark Red
    "&5": "#AA00AA", // Dark Purple
    "&6": "#FFAA00", // Gold
    "&7": "#AAAAAA", // Gray
    "&8": "#555555", // Dark Gray
    "&9": "#5555FF", // Blue
    "&a": "#55FF55", // Green
    "&b": "#55FFFF", // Aqua
    "&c": "#FF5555", // Red
    "&d": "#FF55FF", // Light Purple
    "&e": "#FFFF55", // Yellow
    "&f": "#FFFFFF"  // White
}

const formatMap = {
    "&l": "font-weight: bold;",       // Bold
    "&m": "text-decoration: line-through;", // Strikethrough
    "&n": "text-decoration: underline;",    // Underline
    "&o": "font-style: italic;"       // Italic
}

function parseMinecraftText(text) {
    const regex = /(&[0-9a-fklmnor])/gi;
    const parts = text.split(regex);

    let activeStyles = [];
    const result = [];

    for (const part of parts) {
        if (!part) continue;

        if (part.match(regex)) {
            const code = part.toLowerCase();

            if (code === "&r") {
                activeStyles = [];
            } else if (/&[0-9a-f]/.test(code)) {
                activeStyles = [code];
            } else {
                activeStyles.push(code);
            }
        } else {
            result.push({ styles: activeStyles, text: part });
        }
    }

    return result;
}

function buildStyledText(text) {
    const data = parseMinecraftText(text)
    let html = '\u200B'

    for (const part of data) {
        let span = '<span style="font-family: minecraft; '
        for (const style of part.styles) {
            if (colorMap[style]) {
                span += `color: ${colorMap[style]};`
            } else if (formatMap[style]) {
                span += formatMap[style]
            }
        }

        html += span + `">${part.text}</span>`
    }

    return html
}

function makeToolTip(text) {
    let html = ''

    const lines = text.split('\n')
    const name = lines[0]
    html += `<div class="tooltip-name">${buildStyledText(name)}</div>`

    if (lines.length > 1) {
        const lore = lines.slice(1)

        for (const l of lore) {
            html += `<div class="tooltip-lore">${buildStyledText(l)}</div>`
        }
    }

    return html
}

const itemDisplays = document.querySelectorAll('.page-content-item-display')

const tooltip = document.createElement('div')
tooltip.setAttribute('id', 'tooltip')
tooltip.dataset.scroll = "0"

document.body.appendChild(tooltip)

itemDisplays.forEach((i) => {
    console.log(i)
    i.addEventListener("mouseenter", () => {
        tooltip.innerHTML =
        
        makeToolTip(
                i.querySelector('.page-content-item-display-content').textContent.trim()
        )

        tooltip.style.opacity = "1";
    });

    i.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.clientY - tooltip.dataset.scroll + "px"
    });

    i.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        tooltip.dataset.scroll = "0"
    });

    i.addEventListener("wheel", (e) => {
        e.preventDefault();

        let scroll = parseFloat(tooltip.dataset.scroll) || 0;
        const maxScroll = tooltip.clientHeight; // adjust as needed

        let delta = e.deltaY;

        // Prevent scrolling past top/bottom
        if ((scroll >= maxScroll && delta > 0) || (scroll <= 0 && delta < 0)) {
        delta = 0;
        }

        scroll += delta;

        if (scroll > tooltip.clientHeight) {
        scroll = tooltip.clientHeight
        } else if (scroll < 0) {
        scroll = 0
        }

        tooltip.dataset.scroll = scroll;
        tooltip.style.top = `${e.clientY - scroll}px`;

        console.log(e.deltaY, tooltip.dataset.scroll, scroll);
    });
})

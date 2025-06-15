
const nav = {
    Home: {
        icon: "home",
        iconColor: "#6341E0",
        points: [
            { name: "Docs Introduction", link: "/html/home/Introduction.html"},
        ]
    },
    "General Housing": {
        icon: "hardware",
        iconColor: "#f5e942",
        points: [
            { name: "Groups and Permissions", link: "/html/general/Groups_and_Permissions.html"},
            { name: "Special Items", link: "/html/general/Special_Items.html" },
            { name: "Item Editor", link: "/html/general/Item_Editor.html" },
            { name: "Formatting Codes", link: "/html/general/Formatting_Codes.html" },
            { name: "Data Values", link: "/html/general/Data_Values.html" },
        ]
    },
    "House Settings": {
        icon: "handyman",
        iconColor: "#e41212",
        points: [
            { name: "Plot Size", link: "/html/settings/Plot_Size.html" }
        ]
    },
    Systems: {
        icon: "settings",
        iconColor: "#fc6203",
        points: [
            { name: "Edit Actions", link: "/html/systems/Edit_Actions.html" },
            { name: "Regions", link: "/html/systems/Regions.html" },
            { name: "Event Actions", link: "/html/systems/Event_Actions.html" },
            { name: "Scoreboard Editor", link:"/html/systems/Scoreboard_Editor.html" },
            { name: "Custom Commands", link:"/html/systems/Custom_Commands.html" }
        ]
    },
    HTSL: {
        icon: "code",
        iconColor: "#67C520",
        points: [
            { name: "HTSL Introduction", link: "/html/htsl/Introduction.html" },
            { name: "Code Block Editor", link: "/html/htsl/Code_Block_Editor.html"}
        ]
    },
    Contribute: {
        icon: "ad_group",
        iconColor: "#22DD22",
        points: [
            { name: "Contribute", link: "/html/contribute/Contribute.html" },
            { name: "Article Markdown", link: "/html/contribute/Article_Markdown.html"},
            { name: "Article Editor", link: "/html/contribute/Article_Editor.html"}
        ]
    },
    Other: {
        icon: "coffee",
        iconColor: "#f5e942",
        points: [
            { name: "About", link: "/html/other/About.html" }
        ]
    }
}

module.exports = {
    nav
}

if (typeof document !== 'undefined') {
    // Create Navbar
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
    let i = 1
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
        point.innerHTML = `<span class="page-content-list-number">${i}.</span><div class="page-content-list-content">${point.innerHTML}</div>`
        i++
    })
})

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

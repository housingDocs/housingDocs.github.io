
const nav = (typeof window === 'undefined') ? 
  exports.nav = {
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
            { name: "Groups and Permissions", link: "/html/General_Housing/Groups_and_Permissions.html"},
            { name: "Special Items", link: "/html/General_Housing/Special_Items.html" },
            { name: "Item Editor", link: "/html/General_Housing/Item_Editor.html" },
            { name: "Formatting Codes", link: "/html/General_Housing/Formatting_Codes.html" },
            { name: "Pro Tools", link: "/html/General_Housing/Pro_Tools.html" },
            { name: "Data Values", link: "/html/General_Housing/Data_Values.html" },
            { name: "Cookies", link: "/html/General_Housing/Cookies.html" }
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
            { name: "Regions", link: "/html/Systems/Regions.html" },
            { name: "Event Actions", link: "/html/Systems/Event_Actions.html" },
            { name: "Scoreboard Editor", link:"/html/Systems/Scoreboard_Editor.html" },
            { name: "Custom Commands", link:"/html/Systems/Custom_Commands.html" }
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
} : {
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
            { name: "Groups and Permissions", link: "/html/General_Housing/Groups_and_Permissions.html"},
            { name: "Special Items", link: "/html/General_Housing/Special_Items.html" },
            { name: "Item Editor", link: "/html/General_Housing/Item_Editor.html" },
            { name: "Formatting Codes", link: "/html/General_Housing/Formatting_Codes.html" },
            { name: "Pro Tools", link: "/html/General_Housing/Pro_Tools.html" },
            { name: "Data Values", link: "/html/General_Housing/Data_Values.html" },
            { name: "Cookies", link: "/html/General_Housing/Cookies.html" }
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
            { name: "Regions", link: "/html/Systems/Regions.html" },
            { name: "Event Actions", link: "/html/Systems/Event_Actions.html" },
            { name: "Scoreboard Editor", link:"/html/Systems/Scoreboard_Editor.html" },
            { name: "Custom Commands", link:"/html/Systems/Custom_Commands.html" }
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


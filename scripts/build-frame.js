
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
            { name: "Plot Size", link: "/html/general/Plot_Size.html" },
            { name: "Groups and Permissions", link: "/html/general/Groups_and_Permissions.html"},
            { name: "Formatting Codes", link: "/html/general/Formatting_Codes.html" },
            { name: "Data Values", link: "/html/general/Data_Values.html" }
        ]
    },
    Systems: {
        icon: "settings",
        iconColor: "#fc6203",
        points: [
            { name: "Regions", link: "/html/systems/Regions.html" },
            { name: "Event Actions", link: "/html/systems/Event_Actions.html"},
            { name: "Scoreboard Editor", link:"/html/systems/Scoreboard_Editor.html" },
            { name: "Commands", link:"/html/systems/Commands.html" }
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
    Other: {
        icon: "ad_group",
        iconColor: "#F52222",
        points: [
            { name: "Contribute", link: "/html/other/Contribute.html" },
            { name: "Article Markdown", link: "/html/other/Article_Markdown.html"},
            { name: "Article Editor", link: "/html/other/Article_Editor.html"}
        ]
    }
}

// Create Navbar
const sidebars = document.querySelectorAll('.sidebar-content')

let navHTML = ''

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

sidebars.item(0).innerHTML = navHTML
document.querySelector('.top').innerHTML = 
`<div class="logo">
    <span class="material-symbols-outlined">
        import_contacts
    </span>
    hDocs
</div>
<a href="https://discord.gg/qRvcDc3vz5"><div class="discord">
    <img src="../../assets/discord.png">
</div></a>`

// Order Lists
document.querySelectorAll('.page-content-list').forEach((list) => {
    let i = 1
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
        point.innerHTML = `<pre>  <span class="page-content-list-number">${i}.</span>  ${point.innerHTML}</pre>`
        i++
    })
})

// Order Superheaders
let i = 1
document.querySelectorAll('.page-content-superheader').forEach((superHeader) => {
    superHeader.innerHTML = `<span class="page-content-list-number">${i}.</span>  ${superHeader.innerHTML}`
    i++
})

// Create Tables
document.querySelectorAll('.page-content-table').forEach((table) => {
    const firstRow = table.firstElementChild
    table.querySelectorAll('.page-content-table-column').forEach((column) => {
        console.log(column.parentNode, firstRow)
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
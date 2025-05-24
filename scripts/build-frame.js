
const nav = {
    Home: {
        icon: "home",
        iconColor: "#6341E0",
        points: [
            { name: "Docs Introduction", link: "/html/home/Introduction.html"},
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
            { name: "Article Editor", link: "/html/other/Article_Editor.html"}
        ]
    }
}

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

document.querySelectorAll('.page-content-list').forEach((list) => {
    let i = 1
    list.querySelectorAll('.page-content-list-point').forEach((point) => {
        point.innerHTML = `<pre>  <span class="page-content-list-number">${i}.</span>  ${point.innerHTML}</pre>`
        i++
    })
})

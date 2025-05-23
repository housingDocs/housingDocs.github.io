
const nav = {
    Home: {
        icon: "home",
        iconColor: "#6341E0",
        points: [
            { name: "Docs Introduction", link: "/html/home/Introduction.html"},
        ]
    },
    HTSL: {
        icon: "deployed_code",
        iconColor: "#67C520",
        points: [
            { name: "HTSL Introduction", link: "/html/htsl/Introduction.html" },
            { name: "Code Block Editor", link: "/html/htsl/Code_Block_Editor.html"}
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


/*<div class="sidebar-nav-group">
    <div class="sidebar-nav-header">
        <span class="material-symbols-outlined green">
            deployed_code
        </span>
        HTSL
    </div>
    <a href="/html/htsl/Introduction.html"><div class="sidebar-nav-point">
        HTSL Introduction
    </div></a>
    <a href="/html/htsl/Code_Block_Editor.html"><div class="sidebar-nav-point">
        Code Block Editor
    </div></a>
</div>*/
let popOutButton = document.getElementById('popOut');
popOutButton.onclick = function() {
    api.send('popOut');
}

let refreshThemesButton = document.getElementById('refreshThemes');
refreshThemesButton.onclick = function() {
    api.send('triggerRefreshPopOutList');
}

let popOutList = document.getElementById('popOutList');
api.on('refreshPopOutList', function(list, event) {
    // Remove old values
    while (popOutList.hasChildNodes()) {
        popOutList.removeChild(popOutList.firstChild);
    }

    // Add new values
    for (var i = 0; i < list.length; i++) {
        var theme = list[i];
        var elem = document.createElement("option");
        elem.textContent = theme;
        popOutList.appendChild(elem);
    }
});


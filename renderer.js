let homePage = document.getElementById('home');
let optionsPage = document.getElementById('options');
let aboutPage = document.getElementById('about');

let homePageButton = document.getElementById('navButtonHome');
homePageButton.onclick = function() {
    optionsPage.style.display = 'none';
    aboutPage.style.display = 'none';
    homePage.style.display = 'block';
}

let optionsPageButton = document.getElementById('navButtonOptions');
optionsPageButton.onclick = function() {
    homePage.style.display = 'none';
    aboutPage.style.display = 'none';
    optionsPage.style.display = 'block';
}

let aboutPageButton = document.getElementById('navButtonAbout');
aboutPageButton.onclick = function() {
    homePage.style.display = 'none';
    optionsPage.style.display = 'none';
    aboutPage.style.display = 'block';
}

let refreshThemesButton = document.getElementById('refreshThemes');
refreshThemesButton.onclick = function() {
    //api.send('triggerRefreshPopOutList');
}

let popOutList = document.getElementById('popOutList');
/*api.on('refreshPopOutList', function(list, event) {
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
});*/

let popOutButton = document.getElementById('popOut');
popOutButton.onclick = function() {
    let popOutTheme = popOutList.options[popOutList.selectedIndex].text;
    //api.send('popOut', popOutTheme);
};

let saveOptionsButton = document.getElementById('saveOptionsButton');
saveOptionsButton.onclick = function() {
    // save stuff
};

let optionArtistSeparatorPreview = document.getElementById('optionArtistSeparatorPreview');
let optionArtistSeparatorInput = document.getElementById('optionArtistSeparatorInput');
optionArtistSeparatorInput.onkeyup = function() {
    let artistSeparator = optionArtistSeparatorInput.value;

    let previewText = 'Artist1' + artistSeparator + 'Artist2'

    optionArtistSeparatorPreview.innerText = previewText;
};

let optionCombinedFormattingPreview = document.getElementById('optionCombinedFormattingPreview');
let optionCombinedFormattingInput = document.getElementById('optionCombinedFormattingInput');
optionCombinedFormattingInput.onkeyup = function() {
    let artistSeparator = optionArtistSeparatorInput.value;
    let combinedFormatting = optionCombinedFormattingInput.value;

    if (artistSeparator !== '' && combinedFormatting !== '' && combinedFormatting.includes('${artists}') && combinedFormatting.includes('${title}')) {
        // send to main
    }
};
let root = document.documentElement;

let songTitleSpan = document.getElementById("songTitle");
let songArtistsSpan = document.getElementById("songArtists");
let albumCoverElem = document.getElementById("albumCover");

/*api.on('refreshPopOutSongInfo', function(isPlaying, songTitle, songArtists, albumCoverPath, event) {
    // Refreshes album cover
    albumCoverElem.src = albumCoverPath + '?' + Date.now();

    // Refreshes title and artists
    songTitleSpan.textContent = songTitle;
    songArtistsSpan.textContent = songArtists;

    doTextScroll();
});*/

let songTitle =  document.getElementById('songTitle');
let songArtists =  document.getElementById('songArtists');
let songTitleHidden =  document.getElementById('songTitleHidden');
let songArtistsHidden =  document.getElementById('songArtistsHidden');
let boundary = document.getElementById('textBoundaries');

let loopSpace = 20; // percentage of extra space between loops

function doTextScroll() {
    let boundaryWidth = boundary.offsetWidth;
    let titleWidth = songTitle.clientWidth;
    let artistsWidth = songArtists.clientWidth;

    if (titleWidth > boundaryWidth) {
        let rightValue = titleWidth / boundaryWidth * 100;
        let animationLength = window.innerWidth / boundaryWidth * 100 * (1 / 6) * 5;
    
        songTitleHidden.style.left =  'calc(' + rightValue + '% + ' + loopSpace + 'vw)';
        root.style.setProperty('--titleWidth', 'calc(-' + animationLength + '% - ' + loopSpace + 'vw)');

        songTitle.style.animation = 'periodicScrollTitle 20s 5s linear infinite'
        songTitleHidden.style.animation = 'periodicScrollTitle 20s 5s linear infinite'
        songTitleHidden.textContent = songTitle.textContent;
        songTitleHidden.style.display = 'inline-flex';
    }
    else {
        songTitleHidden.style.display = 'none';
        songTitleHidden.style.animation = 'none';
        songTitle.style.animation = 'none';
    }
    
    if (artistsWidth > boundaryWidth) {
        let rightValue = artistsWidth / boundaryWidth * 100;
        let animationLength = window.innerWidth / boundaryWidth * 100 * (1 / 6) * 5;

        songArtistsHidden.style.left =  'calc(' + rightValue + '% + ' + loopSpace + 'vw)';
        root.style.setProperty('--artistsWidth', 'calc(-' + animationLength + '% - ' + loopSpace + 'vw)');
    
        songArtists.style.animation = 'periodicScrollArtists 20s 5s linear infinite'
        songArtistsHidden.style.animation = 'periodicScrollArtists 20s 5s linear infinite'
        songArtistsHidden.textContent = songArtists.textContent;
        songArtistsHidden.style.display = 'inline-flex';
    }
    else {
        songArtistsHidden.style.display = 'none';
        songArtistsHidden.style.animation = 'none'
        songArtists.style.animation = 'none'
    }
}

doTextScroll();
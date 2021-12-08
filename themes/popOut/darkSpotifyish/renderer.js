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
});*/

let songTitle =  document.getElementById('songTitle');
let songArtists =  document.getElementById('songArtists');
let songTitleHidden =  document.getElementById('songTitleHidden');
let songArtistsHidden =  document.getElementById('songArtistsHidden');


let viewportWidth = document.documentElement.clientWidth;
let titleWidth = songTitle.clientWidth;
let artistsWidth = songArtists.clientWidth;

console.log(viewportWidth + ' ' + titleWidth + ' ' + artistsWidth);

if (titleWidth > viewportWidth * 0.8) {
    let titleWidthConverted = Math.ceil(titleWidth / viewportWidth * 100);
    let leftValue = 'calc(-' + titleWidthConverted + 'vw - 20vw)'
    songTitleHidden.style.left = leftValue;

    //root.style.setProperty('--titleWidth', leftValue);
    songTitle.style.animation = 'periodicScroll 10s 3s linear infinite'
    songTitleHidden.style.animation = 'periodicScroll 20s 5s linear infinite'
    songTitleHidden.textContent = songTitle.textContent;
    songTitleHidden.style.display = 'inline-flex';

    console.log(songTitle.style.animation);
}
else {
    songTitleHidden.style.display = 'none';
    songTitleHidden.style.animation = 'none';
    songTitle.style.animation = 'none';
}

if (artistsWidth > viewportWidth * 0.8) {
    let artistsWidthConverted = Math.ceil(artistsWidth / viewportWidth * 100);
    let leftValue = 'calc(-' + artistsWidthConverted + 'vw - 20vw)'
    songArtistsHidden.style.left = leftValue;

    songArtists.style.animation = 'periodicScroll 10s 3s linear infinite'
    songArtistsHidden.style.animation = 'periodicScroll 20s 5s linear infinite'
    songArtistsHidden.style.display = 'inline-flex';
}
else {
    songArtistsHidden.style.display = 'none';
    songArtistsHidden.style.animation = 'none'
    songArtists.style.animation = 'none'

}
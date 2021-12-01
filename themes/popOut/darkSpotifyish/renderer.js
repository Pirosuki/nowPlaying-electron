let songTitleSpan = document.getElementById("songTitle");
let songArtistsSpan = document.getElementById("songArtists");
let albumCoverElem = document.getElementById("albumCover");

api.on('refreshPopOutSongInfo', function(songTitle, songArtists, albumCoverPath, event) {
    // Refreshes album cover
    albumCoverElem.src = albumCoverPath + "?" + Date.now();

    // Waits for cover to load before changing text
    albumCoverElem.addEventListener('load', function() {
        // Refreshes title and artists
        songTitleSpan.textContent = songTitle;
        songArtistsSpan.textContent = songArtists;
    })
});
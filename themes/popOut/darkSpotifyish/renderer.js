let songTitleSpan = document.getElementById("songTitle");
let songArtistsSpan = document.getElementById("songArtists");
let albumCoverElem = document.getElementById("albumCover");

api.on('refreshPopOutSongInfo', function(isPlaying, songTitle, songArtists, albumCoverPath, event) {
    // Refreshes album cover
    albumCoverElem.src = albumCoverPath + '?' + Date.now();

    // Refreshes title and artists
    songTitleSpan.textContent = songTitle;
    songArtistsSpan.textContent = songArtists;
});
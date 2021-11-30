let songTitleSpan = document.getElementById("songTitle");
let songArtistsSpan = document.getElementById("songArtists");
let albumCoverElem = document.getElementById("albumCover");

app.on('refreshSongInfo', function(event, songTitle, songArtists) {
    // Refreshes album cover
    image.src = "./katt.png?" + Date.now();

    // Refreshes title and artists
    songTitleSpan.textContent = songTitle;
    songArtistsSpan.textContent = songArtists;
});
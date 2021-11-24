var textInput = document.getElementById("textInput");
textInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        var value = textInput.value;
        window.app.send('writeText', value);
    }
})

var imageInput = document.getElementById("imageInput");
imageInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        var value = imageInput.value;
        window.app.send('writeImage', value);
    }
})

var getCurrentButton = document.getElementById("getCurrentButton");
getCurrentButton.addEventListener('click', function(event) {
    window.app.send('getCurrentPlaying');
})
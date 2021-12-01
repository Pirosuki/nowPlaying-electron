let popOutButton = document.getElementById("popOut");
popOutButton.onclick = function() {
    api.send('popOut');
}
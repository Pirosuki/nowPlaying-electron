const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs');
const request = require('request')
const open = require('open');

const spotifyAuth = require('./spotifyAuth.js')

const albumCoverFilePath = './output/albumCover.png';
const songTitleFilePath = './output/songTitle.txt';
const songArtistsFilePath = './output/songArtists.txt';
const songCombinedFilePath = './output/songCombined.txt'
const configFilePath = './config.json';

const config = require(configFilePath);

var accessToken;

const getCurrentPlayingOptions = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
};

const configFileDefaults = JSON.stringify({
    "app": {
        "theme": "dark",
        "closeToTray": "true"
    },
    "output": {
        "combinedFormatting": "${Artists} - ${title}",
        "artistSeparator": ", "
    }
}, null, 2)

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setMenuBarVisibility(false)

    win.webContents.openDevTools()

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    // Open new window if none are currently present.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })

    // Create folder for output values
    if (!fs.existsSync('./output')){
        fs.mkdirSync('./output');
    }
    // Create placeholder files
    fs.openSync(albumCoverFilePath, 'w');
    fs.openSync(songTitleFilePath, 'w');
    fs.openSync(songArtistsFilePath, 'w');
    fs.openSync(songCombinedFilePath, 'w');

    // Checks existance of json file
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, configFileDefaults)
    }

    // Starts song checking loop
    let loopFrequency = config.output.loopFrequency;
    loopCheckPlaying(loopFrequency);
})

// This piece closes the program when all windows get closed unless we're running on macos.
// In the future this is where we'd add support for hiding the app in the windows arrow in the bottom right.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

function getCurrentPlaying() {
    if (accessToken !== undefined) {
        request(getCurrentPlayingOptions, function(err, res, body) {
            if (body !== '') {
                let json = JSON.parse(body);
                if (json.is_playing === true) {
                    outputSongInfo(json)
                }
                else if (body.includes('error')) {
                    if (json.error.message === 'Invalid access token') {
                        console.log("Access token invalid, attempting to renew.")
                        triggerAuth(function() {
                            console.log("Received new access token, retrying.")
                            return;
                        })
                    }
                    else {
                        logMessage("Spotify returned \"Error " + json.error.status + ": " + json.error.message + "\"");
                    }
                };
                return
            }
    
            logMessage("Not currently playing");
            fs.writeFileSync('./jsonTEMP.json', body);
        });
    }
};

function triggerAuth(callback) {
    spotifyAuth.getAccessToken(function(token) {
        accessToken = token;
        callback();
    })
}

function outputSongInfo(data) {
    // Album cover
    let albumCoverSize = config.output.albumCoverSize;

    albumCoverURL = data.album.images[albumCoverSize].url;

    request(albumCoverURL, {encoding: 'binary'}, function(err, res, body) {
        fs.writeFileSync(albumCoverFilePath, body, 'binary');
    });

    // Title
    let title = json.item.name;

    fs.writeFileSync(songTitleFilePath, title);

    // Artists
    let separator = config.output.artistSeparator;

    let artistList = [];
    let artists;
    for(var i in json.item.artists) {
        artistList.push(json.item.artists[i].name);
        artists = artistList.join(separator);
    }

    fs.writeFileSync(songArtistsFilePath, artists);

    // Combined
    let combinedFormatting = config.output.combinedFormatting;
    let combined = eval(combinedFormatting);
    
    fs.writeFileSync(songCombinedFilePath, combined);

    logMessage("Now playing: " + combined);
}

function loopCheckPlaying(loopFrequency) {
    getCurrentPlaying(function() {
    }, loopFrequency);
}

// This script checks if the last message is identical to the incoming one to reduce spam.
var lastMessage = '';
function logMessage(message) {
    if (message !== lastMessage) {
        console.log(message);
    }
    lastMessage = message;
}
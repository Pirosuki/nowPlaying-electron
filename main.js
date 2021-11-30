const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs');
const axios = require('axios');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const spotifyAuth = require('./spotifyAuth.js');
const { json } = require('express');

const albumCoverFilePath = './output/albumCover.png';
const songTitleFilePath = './output/songTitle.txt';
const songArtistsFilePath = './output/songArtists.txt';
const songCombinedFilePath = './output/songCombined.txt'
const configFilePath = './config.json';

const config = require(configFilePath);

var accessToken;

let loopFrequency = config.output.pollFrequency;

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
})

// This piece closes the program when all windows get closed unless we're running on macos.
// In the future this is where we'd add support for hiding the app in the windows arrow in the bottom right.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

function getCurrentPlaying(callback) {
    if (accessToken !== undefined) {
        axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Content-type': 'gaming',
                    Authorization: 'Bearer ' + accessToken
                }
            })
            .then(function (response) {
                body = response.data;
                if (body !== '') {
                    if (body.is_playing === true) {
                        outputSongInfo(body, function() {
                            callback();
                        })
                    }
                    return
                }
        
                logMessage("Not currently playing");
                callback();
            })
            .catch(function (error) {
                if (error.response.statusText === 'Invalid access token') {
                    console.log("Access token invalid, attempting to renew.")
                    triggerAuth(function() {
                        console.log("Received new access token, retrying.")
                        callback();
                    })
                }
                else {
                    console.log("Spotify returned \"Error " + error.response.status + ": " + error.response.statusText + "\"");
                }
            });
    }
    else {
        console.log("No current accessToken, requesting new one.");
        triggerAuth(function() {
            console.log("Received new access token, retrying.");
            callback();
        });
    }
};

function triggerAuth(callback) {
    spotifyAuth.getAccessToken(function(token) {
        accessToken = token;
        callback();
    })
}

function outputSongInfo(data, callback) {
    // Album cover
    let albumCoverSize = config.output.albumCoverSize;

    albumCoverURL = data.item.album.images[albumCoverSize].url;

    axios.get(albumCoverURL, {
        responseType: 'stream'
    })
    .then(response => {
        response.data.pipe(fs.createWriteStream(albumCoverFilePath));
    })

    // Title
    let title = data.item.name;

    fs.writeFileSync(songTitleFilePath, title);

    // Artists
    let separator = config.output.artistSeparator;

    let artistList = [];
    let artists;
    for(var i in data.item.artists) {
        artistList.push(data.item.artists[i].name);
        artists = artistList.join(separator);
    }

    fs.writeFileSync(songArtistsFilePath, artists);

    // Combined
    let combinedFormatting = config.output.combinedFormatting;
    let combined = eval(combinedFormatting);
    
    fs.writeFileSync(songCombinedFilePath, combined);

    logMessage("Now playing: " + combined);

    callback();
}

// Song checking loop
function loopSongCheck() {
    getCurrentPlaying(function() {
        sleep(loopFrequency).then(() => {
            loopSongCheck();
        })
    });
}
// Starts song checking loop
loopSongCheck();

// This script checks if the last message is identical to the incoming one to reduce spam.
var lastMessage = '';
function logMessage(message) {
    if (message !== lastMessage) {
        console.log(message);
    }
    lastMessage = message;
}
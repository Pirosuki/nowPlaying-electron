const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs');
const axios = require('axios');
const contextMenu = require('electron-context-menu');

const spotifyAuth = require('./spotifyAuth.js');

const albumCoverFilePath = './output/albumCover.png';
const songTitleFilePath = './output/songTitle.txt';
const songArtistsFilePath = './output/songArtists.txt';
const songCombinedFilePath = './output/songCombined.txt'
const configFilePath = './config.json';

const config = require(configFilePath);

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

var accessToken;

let loopFrequency = config.output.pollFrequency;

let lastPlayed = 'nothingCurrentlyPlaying';

const configFileDefaults = JSON.stringify({
    "app": {
      "theme": "auto",
      "closeToTray": "true"
    },
    "output": {
      "pollFrequency": "5000",
      "combinedFormatting": "`${artists} - ${title}`",
      "artistSeparator": ", ",
      "albumCoverSize": "2"
    }
  }, null, 2)

contextMenu({
	showInspectElement: true,
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setMenuBarVisibility(false)

    win.loadFile('index.html');

    return win;
}

let popOutWinId;
const createPopOut = (popOutThemePath, aspectRatio) => {
    const popOutWin = new BrowserWindow({
        width: 500,
        height: 100,
        frame: false,
        transparent: true,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    popOutWin.setMenuBarVisibility(false);

    popOutWin.setAspectRatio(aspectRatio);
    
    popOutWin.loadFile(popOutThemePath);

    popOutWinId = popOutWin.id;
    popOutWin.on('close', function() {
        popOutWinId = undefined;
    })
}

app.whenReady().then(() => {
    win = createWindow();

    win.on('close', function() {
        app.quit();
    })

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
    loopSongCheck();

    console.log("nowPlaying.js loaded and ready!");
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
                if (body !== '' && body.is_playing === true) {
                    outputSongInfo(body, function() {
                        callback();
                    })
                }
                else {
                    // Code goes here if nothing is currently playing
                    if ('nothingCurrentlyPlaying' !== lastPlayed) {
                        if (popOutWinId !== undefined) {
                            // Not playing values
                            let title = 'Nothing currently'
                            let artists = 'Playing'
                            let coverPath = './albumCoverNotPlaying.jpeg'

                            let popOutWin = BrowserWindow.fromId(popOutWinId);
                            popOutWin.webContents.send('refreshPopOutSongInfo', true, title, artists, coverPath);    
                        }
                
                        console.log("Nothing currently playing...");
                        lastPlayed = 'nothingCurrentlyPlaying';
                    }
                    
                    callback();
                }
            })
            .catch(function (error) {
                //fs.writeFileSync('./latestError.json', JSON.stringify(error, null, 2));

                console.log(error);

                if (error.response.status === 401) {
                    console.log("caught error " + error.response.status + ", attempting to renew token.");
                    triggerAuth(function() {
                        console.log("Received new access token, retrying.");
                        callback();
                    });
                }
                else {
                    console.log(error);
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
    // Checks if song is a local song since local songs don't support certain fields
    if (data.item.is_local) {
        // Sets template album cover since local song doesn't have it's own
        albumCoverFilePath = './albumCoverLocalFile.jpeg';
    }
    else {
        // Sets album cover
        let albumCoverSize = config.output.albumCoverSize;
        albumCoverURL = data.item.album.images[albumCoverSize].url;
    }

    // Title
    let title = data.item.name;

    // Artists
    let artistSeparator = config.output.artistSeparator;
    let artistList = [];
    let artists;
    for(var i in data.item.artists) {
        artistList.push(data.item.artists[i].name);
        artists = artistList.join(artistSeparator);
    }

    // Checks so that neither artists nor title are empty, this is mostly incase you're listening to local songs that might not have artist specified.
    // Also creates a combined output of text and artist, based on the template in the config.
    let combined
    if (artists !== '' && title !== '') {
        let combinedFormatting = config.output.combinedFormatting;
        combined = eval(combinedFormatting);
    }
    else if (artists === '') {
        combined = title;
    }

    // KEEP GOING FROM HERE 

    // Check to see if we're wasting our time writing info that's already there
    if (title + artists !== lastPlayed) {
        // This part is a function because we need the callback to know when the image has been written.
        writeImage(albumCoverURL, albumCoverFilePath, function() {
            // Writing all the output files
            fs.writeFileSync(songTitleFilePath, title);    
            fs.writeFileSync(songArtistsFilePath, artists);
            fs.writeFileSync(songCombinedFilePath, combined);

            // Sends info to popOut display
            if (popOutWinId !== undefined) {
                let popOutWin = BrowserWindow.fromId(popOutWinId);
                popOutWin.webContents.send('refreshPopOutSongInfo', true, title, artists, albumCoverFilePath);    
            }

            console.log("Now playing: " + combined);
            lastPlayed = title + artists;

            callback();
        })
    }
    else {
        callback();
    }
}

ipcMain.on('popOut', function(event, popOutTheme) {
    if (popOutWinId !== undefined) {
        let popOutWin = BrowserWindow.fromId(popOutWinId);
        popOutWin.close();
    }

    let popOutThemePath = './themes/popOut/' + popOutTheme + '/index.html';
    let popOutConfigPath = './themes/popOut/' + popOutTheme + '/config.json';

    const popOutConfig = require(popOutConfigPath);
    let aspectRatio = parseInt(popOutConfig.aspectRatio);

    console.log(aspectRatio);

    // Create new popout
    createPopOut(popOutThemePath, aspectRatio);
});

ipcMain.on('saveOptions', function(event, options) {
    // Read current config
    let config = require(configFilePath);

    // Edit changed values
    // config.output.pollFrequency = 5000;

    // Write new config
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
});

ipcMain.on('triggerRefreshPopOutList', function(event) {
    refreshPopOutList();
})

function refreshPopOutList() {
    let win = BrowserWindow.fromId(1);

    let dir = './themes/popOut';
    let list =  fs.readdirSync(dir);

    win.webContents.send('refreshPopOutList', list);
}

function writeImage(url, path, callback) {
    axios.get(url, {
        responseType: 'stream'
    })
    .then(response => {
        response.data.pipe(fs.createWriteStream(path));
    })
    .finally(() => {
        // FIX // Apparently it's pretty random whether the file is done writing or not, this is just to make sure.
        sleep(250).then(() => {
            callback();
        })
    });
};

// Song checking loop
function loopSongCheck() {
    getCurrentPlaying(function() {
        sleep(loopFrequency).then(() => {
            loopSongCheck();
        })
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});
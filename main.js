const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs');
const request = require('request')
const open = require('open');

const textFilePath = './output/text.txt';
const imageFilePath = './output/image.png';
const configFilePath = './config.json';

var token;

const getCurrentPlayingOptions = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
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
    fs.openSync(textFilePath, 'w');
    fs.openSync(imageFilePath, 'w');

    // Checks existance of json file
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, configFileDefaults)
    }

    // Checks if there is an already existing token
    if (fs.existsSync("./cache/token")) {
        token = fs.readFileSync("./cache/token")
    }
    else {
        console.log("Could not find token")
    }

})

// This piece closes the program when all windows get closed unless we're running on macos.
// In the future this is where we'd add support for hiding the app in the windows arrow in the bottom right.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

ipcMain.on('writeText', (event, value) => {
    fs.writeFileSync(textFilePath, value);

    console.log("Attempted to write text \"" + value + "\"");
});

ipcMain.on('writeImage', (event, url) => {
    request(url, {encoding: 'binary'}, function(err, res, body) {
        fs.writeFileSync(imageFilePath, body, 'binary');
    });

    console.log("Attempted to write image \"" + url + "\"");
});

ipcMain.on('getCurrentPlaying', (event) => {
    request(getCurrentPlayingOptions, function(err, res, body) {
        if (body !== '') {
            let json = JSON.parse(body);
            if (json.is_playing === true) {
                logMessage("Current track is \"" + json.item.name + "\"");
                return
            }
        }
        else if (body.error.status !== '') {
            console.log("Spotify returned" + body.error.status + ": " + body.error.message);
            return
        }

        logMessage("Not currently playing");
        fs.writeFileSync('./jsonTEMP.json', body);
    });
});

ipcMain.on('authOpenBrowser', (event) => {
    open('https://google.com/')
})

// This script checks if the last message is identical to the incoming one to reduce spam.
var lastMessage = '';
function logMessage(message) {
    if (message !== lastMessage) {
        console.log(message);
    }
    lastMessage = message;
}
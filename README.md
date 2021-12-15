## nowPlaying.js
nowPlaying.js is a script that grabs your current playing track on Spotify and puts it in an easily capturable window for recording/streaming software.

## How to use
This script requires [Node.js](https://nodejs.org/). After making sure you've got node installed, open a command prompt in the source folder and run `npm install` to install all the build dependencies. Once that's done the script can be run with `npm start`.

## To do:
- UI .json config editor. Trigger function that changes global variable for a chance to skip restart.
- Theme list remember which was picked last.
- popOut remember size and position.
- Option to run without user interface
- Option to hide application under icon on top for macos or arrow for windows
- Fix vulnerabilities `npm audit`
- Package to portable executable
- Load theme specific settings that push changes in realtime eg. color, transparency and scroll toggle.
## THIS SCRIPT IS OUTDATED AND HAS LOTS OF SECURITY FLAWS
I really wouldn't recommend using it at all, go to https://github.com/Pirosuki/nowPlaying for future updates.

## nowPlaying-electron
nowPlaying-electron is a script that grabs your current playing track on Spotify and puts it in an easily capturable window for recording/streaming software.

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
- Load theme specific settings that push changes in realtime eg. color, transparency, scroll toggle and custom background image.
- Explore potentially adding support for more platforms. Web platforms could be solved through a firefox/chrome extension, osu! might be best to simply read the title of the application since that changes depending on the current beatmap. Drag items to order priority.
- Progress bar
- Tab with checkboxes for each application that we can get music info from. Include dragging them in a list to prioritize.

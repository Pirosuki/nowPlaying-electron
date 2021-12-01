const {
    contextBridge,
    ipcRenderer
} = require('electron')

contextBridge.exposeInMainWorld('api', {
        send: (channel, data) => {
            let validChannels = ['toMain', 'popOut', 'triggerRefreshPopOutList'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
            else {
                console.log("denied api.send for invalid channel: " + channel);
            }
        },
        on: (channel, func) => {
            let validChannels = ['fromMain', 'refreshSongInfo', 'refreshPopOutList'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
            else {
                console.log("denied api.on for invalid channel: " + channel);
            }
        }
    }
)

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }

    // Fill the theme dropdown
    ipcRenderer.send('triggerRefreshPopOutList');
})
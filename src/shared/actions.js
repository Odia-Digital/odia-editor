const { remote, ipcRenderer } = window.require('electron');
const { channels } = require('./constants');

ipcRenderer.on(channels.OPEN_FILE, function (e, data) {
  // DEPRECATED
});

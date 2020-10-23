const { app, BrowserWindow } = require('electron');
const { channels } = require('../../src/shared/constants');

module.exports.helpMenuTemplate = {
  label: "Help",
  submenu: [
    {
      label: "Toggle Preview",
      accelerator: "CmdOrCtrl+P",
      click: () => {
        BrowserWindow.getAllWindows()[0].webContents.send(channels.TOGGLE_PREVIEW, true);
      }
    },
    {
      label: "Toggle Typing Chart",
      accelerator: "CmdOrCtrl+H",
      click: () => {
        BrowserWindow.getAllWindows()[0].webContents.send(channels.TOGGLE_HELP, true);
      }
    },
  ]
};

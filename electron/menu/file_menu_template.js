const {
  newFile,
  openFile,
  saveFile,
  saveFileAs,
  exportHtml,
  extractImage,
  quit,
} = require('../actions/file');

module.exports.fileMenuTemplate = {
  label: "File",
  submenu: [
    {
      label: "New",
      accelerator: "CmdOrCtrl+N",
      click: newFile,
    },
    {
      label: "Open",
      accelerator: "CmdOrCtrl+O",
      click: openFile,
    },
    {
      label: "Extract from Image",
      accelerator: "CmdOrCtrl+Shift+I",
      click: extractImage,
    },
    { type: "separator" },
    {
      label: "Save",
      accelerator: "CmdOrCtrl+S",
      click: saveFile,
    },
    {
      label: "Save As",
      accelerator: "CmdOrCtrl+Shift+S",
      click: saveFileAs,
    },
    {
      label: "Export as HTML",
      accelerator: "CmdOrCtrl+E",
      click: exportHtml,
    },
    { type: "separator" },
    {
      label: "Quit",
      accelerator: "CmdOrCtrl+Q",
      click: quit,
    },
  ]
};

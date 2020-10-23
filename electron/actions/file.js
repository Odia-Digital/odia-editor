const { app, dialog, BrowserWindow, ipcMain } = require('electron');
const jetpack = require('fs-jetpack');
const { createWorker } = require('tesseract.js');
const path = require('path');

const { channels } = require('../../src/shared/constants');

async function openFile () {
  const shouldSaveFile = await shouldSave();
  let savePromise = Promise.resolve(true);
  if (shouldSaveFile) {
    const { response } = await askUserToSave();
    if (response === 2) savePromise = Promise.resolve(false);
    if (response === 1) savePromise = Promise.resolve(true);
    if (response === 0) {
      const canceled = await saveFile();
      savePromise = Promise.resolve(!canceled);
    }
  }
  const shouldOpen = await savePromise;

  if (shouldOpen) {
    const { filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      properties: ['openFile'],
      filters: [
        { name: 'All supported files', extensions: ['md', 'markdown', 'txt', 'html', 'jade', 'pug', 'js', 'json', 'yaml', 'yml'] },
        { name: 'Markdown Files (*.md)', extensions: ['md', 'markdown'] },
        { name: 'YAML Files (*.yaml)', extensions: ['yaml', 'yml'] }
      ],
    });

    if (filePaths.length) {
      const file = filePaths[0];
      const content = jetpack.read(file);
      message(channels.OPEN_FILE, {
        path: file,
        content,
      });
    }
  }
}

async function newFile () {
  const shouldSaveFile = await shouldSave();
  let savePromise = Promise.resolve(true);
  if (shouldSaveFile) {
    const { response } = await askUserToSave();
    if (response === 2) savePromise = Promise.resolve(false);
    if (response === 1) savePromise = Promise.resolve(true);
    if (response === 0) {
      const canceled =  await saveFile();
      savePromise = Promise.resolve(!canceled);
    }
  }
  const shouldOpen = await savePromise;
  if (shouldOpen) message(channels.NEW_FILE, true);
}

function extractImage () {
  const files = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }],
  });

  if (files.length) {
    const file = files[0];
    message(channels.LOAD_IMAGE, true);

    ocrRead(file).then(text => {
      message(channels.EXTRACT_IMAGE, {
        text,
      });
    });
  }
}

function message (channel, data) {
  return BrowserWindow.getAllWindows()[0].webContents.send(channel, data);
}

function shouldSave () {
  return new Promise((resolve, reject) => {
    ipcMain.once(channels.SHOULD_SAVE, (e, val) => {
      return resolve(val);
    });
    message(channels.SHOULD_SAVE, true);
  });
}

function askUserToSave () {
  return dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    type: 'question',
    title: 'Unsaved content alert',
    message: 'You have unsaved content. Do you want to save it before continuing ?',
    buttons: ['Save', 'Don\'t save', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
  });
}

function saveFileHelper (asHtml, saveAs) {
  return new Promise((resolve, reject) => {
    ipcMain.once(channels.SAVE_FILE, (e, data) => {
      if (!asHtml && !saveAs && data.filepath.length > 0) {
        jetpack.write(data.filepath, data.content);
        message(channels.SAVE_FILE, 1);
        return resolve(false);
      }

      const defaultName = addExt(`untitled_${Date.now()}`, asHtml ? 'html' : 'md');

      dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        title: asHtml ? 'Export as HTML' : 'Save File',
        defaultPath: saveAs ? ( data.filepath ? data.filepath :  defaultName) : defaultName,
        filters: [{ name: asHtml ? 'HTML' : 'Markdown (*.md)', extensions: [asHtml ? 'html' : 'md'] }],
      }).then(({ canceled, filePath }) => {
        if (!canceled && filePath) {
          const filepath = addExt(filePath, asHtml ? 'html' : 'md');
          jetpack.write(filepath, asHtml ? wrapHtml(data.html) : data.content);
          message(channels.SAVE_FILE, 1);
          return resolve(false);
        }
        return resolve(true);
      });
    });
    message(channels.SAVE_FILE, 0);
  });
}

function addExt (name, ext) {
  if (/^.+\..+$/.test(name)) return name;
  if (name.endsWith('.')) return `${name}${ext}`;
  return `${name}.${ext}`;
}

function wrapHtml (html) {
  return `<!doctype html><html><body>${html}</body></html>`;
}

function saveFile () {
  return saveFileHelper();
}

function saveFileAs () {
  return saveFileHelper(false, true);
}

function exportHtml () {
  return saveFileHelper(true);
}

async function ocrRead (filename) {
  const worker = createWorker({
    cachePath: path.join(__dirname, '..', 'lang-data'),
  });

  await worker.load();
  await worker.loadLanguage('ori');
  await worker.initialize('ori');
  const { data: { text } } = await worker.recognize(filename);
  await worker.terminate();

  return text;
}

function quit () {
  return app.quit();
}

module.exports = {
  openFile,
  extractImage,
  saveFile,
  saveFileAs,
  exportHtml,
  newFile,
  quit,
};

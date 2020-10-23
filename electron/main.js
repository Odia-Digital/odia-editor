const path = require('path');
const url = require('url');
const { app, Menu } = require('electron');

const { devMenuTemplate } = require('./menu/dev_menu_template');
const { editMenuTemplate } = require('./menu/edit_menu_template');
const { fileMenuTemplate } = require('./menu/file_menu_template');
const { helpMenuTemplate } = require('./menu/help_menu_template');
const createWindow = require('./window');

const env = require(`./env_dev.json`);

const setApplicationMenu = () => {
  const menus = [fileMenuTemplate, editMenuTemplate, helpMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

app.on("ready", () => {
  setApplicationMenu();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });

  mainWindow.loadURL(env.electronStartUrl ||
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );
});

app.on("window-all-closed", () => {
  app.quit();
});

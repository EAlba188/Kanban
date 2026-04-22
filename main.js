const { app, BrowserWindow, Menu, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let zoom = 1;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico')
  });

  win.loadFile('index.html');

  win.webContents.setZoomFactor(zoom);

  createMenu(win);
}

function setZoom(win, value) {
  zoom = value;
  win.webContents.setZoomFactor(zoom);
}

function createMenu(win) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Export",
          click: () => {
            win.webContents.executeJavaScript(`
              localStorage.getItem("kanban-app-data-v3")
            `).then(data => {
              dialog.showSaveDialog(win, {
                title: "Exportar Kanban",
                defaultPath: "kanban-backup.json"
              }).then(result => {
                if (!result.canceled) {
                  fs.writeFileSync(result.filePath, data || "{}");
                }
              });
            });
          }
        },
        {
          label: "Import",
          click: () => {
            dialog.showOpenDialog(win, {
              filters: [{ name: "JSON", extensions: ["json"] }]
            }).then(result => {
              if (!result.canceled) {
                const data = fs.readFileSync(result.filePaths[0], 'utf-8');

                win.webContents.executeJavaScript(`
                  localStorage.setItem("kanban-app-data-v3", \`${data}\`);
                  location.reload();
                `);
              }
            });
          }
        },
        { type: "separator" },
        {
          label: "Zoom In",
          click: () => setZoom(win, Math.min(zoom + 0.1, 2))
        },
        {
          label: "Zoom Out",
          click: () => setZoom(win, Math.max(zoom - 0.1, 0.6))
        },
        {
          label: "Reset Zoom",
          click: () => setZoom(win, 1)
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);
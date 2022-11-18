const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell
} = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

// production mode
process.env.NODE_ENV = 'production';

// MacOS process
const isMac = process.platform === 'darwin';

// check for dev mode
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;
// creating the (main window) browser window for app
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences:{
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // open devtools in dev NODE_ENV
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  // select browser window loading file
  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: 300,
    height: 300
  });
  // select browser window loading file
  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// run the app for view the browser window (app is ready)
app.whenReady().then(() => {
  createMainWindow();

// Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // remove main window on close to prevent memory leak
  mainWindow.on('closed', () => (mainWindow = null))

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  })
})

// menu template
const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu:[{
        label: 'About',
        click: createAboutWindow,
      }]
  }] : []),
  {
    role:'filemenu'
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow,
    }]
  }] : [])
]

// respond to ipcRenderer Resize
ipcMain.on('image:resize',(e, options) =>{
  options.dest = path.join(os.homedir(), 'imageResizer')
  resizeImage(options);
  // console.log(options)
})

// resize the image
 async function resizeImage({imgPath,width,height,dest}) {
   try{
     const newPath = await resizeImg(fs.readFileSync(imgPath),{
       width: +width,
       height: +height
     });
     // create filename
     const filename = path.basename(imgPath);

     // create destination folder if not exists
     if(!fs.existsSync(dest)){
       fs.mkdirSync(dest);
     }

     // write file to destination
     fs.writeFileSync(path.join(dest, filename), newPath);

     // send success to render
     mainWindow.webContents.send('image:done')
     // open dest folder
     shell.openPath(dest)
   }catch(err){
     console.log(err)
   }
 }
// all window closing event for MacOS
app.on('window-all-closed', () => {
  if (!isMac) {
    // close the app
    app.quit();
  }
})


// npx electronmon .

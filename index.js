const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url')

var win;

app.on('ready', createWindow);

function createWindow(){
    win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true
    });

    win.setMenu(null);

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    win.on('closed', ()=>{
        console.log("haha");
        win = null;
    })
}

app.on('window-all-closed', ()=>{
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('active', ()=>{
    if(win === null){
        createWindow();
    }
    else {
        win.show();
    }
});
"use strict";
const fs = require('fs');


const { app, BrowserWindow, dialog, Menu, shell, ipcMain } = require('electron');
const path = require('path');

let isSetNoTimeout = false;
let key = null;



const createMainWindow = () => {

    const configData = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    const win = new BrowserWindow({
        width: parseInt(configData['winWidth']),
        height: parseInt(configData['winHeight']),
        title: 'Shukuchi',
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.webContents.on('new-window', (e, url) => {
        let paymentWindow = new BrowserWindow({
            width:1024,
            height:576,
            useContentSize:true,
            minWidth:1024,
            minHeight:576,
        });
        paymentWindow.loadURL(url);
    });
    win.loadURL('https://allb-browser.pokelabo.jp/web/play?type=' + configData['playVersion']);
    let intervalID = setTimeout(() => {
        if(win.title != 'Shukuchi'){
            win.title = 'Shukuchi'
        }
    }, 1500);
    
};

const createSettingWindow = () => {
    const winSetting = new BrowserWindow({
        width: 800,
        height: 600,
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'setting.js')
        }
    });
    winSetting.loadFile('setting.html');
}

app.whenReady().then(() => {
    let existConfig = true
    try {
        fs.readFileSync('config.json', 'utf8');
    } catch(error) {
        createSettingWindow();
        existConfig = false
    }
    if (existConfig) createMainWindow();
    

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
    
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('config-save', (item,exdata) => {
    fs.writeFileSync('./config.json', exdata, 'utf8');
});

ipcMain.on('close-setting', () => {
    const wins = BrowserWindow.getAllWindows();
    wins.forEach((wind) => {
        wind.close();
    })
    createMainWindow();
});

const templateMenu = [
    {
        label: '&Shukuchi',
        submenu: [
            
            {
                label: '終了',
                accelerator: 'Alt+F4',
                click() { app.quit(); }
            }
        ]
    },
    {
        label: '表示(&V)',
        submenu: [
            {
                label:'更新(&R)',
                role: 'reload'
            },
            {
                type: 'separator'
            },
            {
                label: '全画面表示(&S)',
                type: 'checkbox',
                accelerator: 'F11',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        if (focusedWindow.isFullScreen()){
                            focusedWindow.setFullScreen(false);
                            focusedWindow.setMenuBarVisibility(true);
                            focusedWindow.setAutoHideMenuBar(false);
                        } else {
                            focusedWindow.setFullScreen(true);
                            focusedWindow.setMenuBarVisibility(false);
                            focusedWindow.setAutoHideMenuBar(false);
                        }
                    }
                }
            },
            {
                label: '最前面表示(&T)',
                type: 'checkbox',
                accelerator: 'CmdOrCtrl+T',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        if (focusedWindow.isAlwaysOnTop()) {
                            focusedWindow.setAlwaysOnTop(false);
                        } else {
                            focusedWindow.setAlwaysOnTop(true);
                        }
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'アプリのリセット',
                role: 'forceReload'
            },
            {
                label: '開発者ツール',
                type: 'checkbox',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'ツール',
        submenu: [
            {
                label: 'タイムアウト抑止',
                type: 'checkbox',
                click(item, focusedWindow) {
                    if (isSetNoTimeout) {
                        focusedWindow.webContents.send('no-timeout-false')
                        isSetNoTimeout = false;
                    } else {
                        focusedWindow.webContents.send('no-timeout-true')
                        isSetNoTimeout = true;
                    }
                }
            },
            {
                label: '設定',
                click(item, focusedWindow) {
                    key = dialog.showMessageBoxSync(
                        {
                            type: 'question',
                            buttons: ['Yes', 'No'],
                            title: '確認',
                            message: '設定画面を開きます',
                            detail: '設定の反映のため、アプリケーションを一旦終了します。\nよろしいですか？'
                        });
                        
                        if(key == 0){
                            focusedWindow.close();
                            createSettingWindow();
                        }
                        
                    
                }
            }
        ]
    },
    {
        label: 'ヘルプ(&H)',
        submenu: [
            /*{
                label: '更新の確認(&C)',
                click() {
                    dialog.showMessageBox(
                        {
                            type:'question',
                            buttons:['Yes', 'No'],
                            title: '確認',
                            message: 'ブラウザを開き、更新を確認します',
                            detail: 'ブラウザでGithubのリリースページを開きます。\n必要に応じて最新版をダウンロードしてください。\n現在のバージョン：' + app.getVersion()
                        },
                        (key) => {
                            if (key !== null) {
                                shell.openExternal('https://github.com/ulong32/Shukuchi/');
                            }
                            console.log(key)
                        }
                    );
                }
            },*/
            {
                label: 'Shukuchiについて(&A)',
                click() {
                    dialog.showMessageBox(
                        BrowserWindow.getFocusedWindow(),
                        {
                            title: 'Shukuchiについて',
                            type: 'info',
                            buttons: ['OK'],
                            message: 'Shukuchi',
                            detail: 'ブラウザ版ラスバレ用のちょっと使いやすいプレイ環境\nDev:あんさいんどろんぐ(ulong32)\n\nVersion:' + app.getVersion()
                        }
                    );
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

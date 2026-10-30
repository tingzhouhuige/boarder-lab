const {app,BrowserWindow}=require('electron');
const fs=require('fs');
const path=require('path');
app.setPath('userData',path.join(__dirname,'dist','fullscreen-check-profile'));
require('./main.js');
app.whenReady().then(async()=>{
  try {
    const win=BrowserWindow.getAllWindows()[0];
    if(win.webContents.isLoading()) await new Promise(r=>win.webContents.once('did-finish-load',r));
    const wait=()=>new Promise(r=>setTimeout(r,400));
    const toggle=()=>win.webContents.executeJavaScript(`document.querySelector('[data-window-action="fullscreen"]').click()`);
    await toggle();await wait();
    if(!win.isFullScreen())throw Error('Did not enter fullscreen');
    const pressed=await win.webContents.executeJavaScript(`document.querySelector('[data-window-action="fullscreen"]').getAttribute('aria-pressed')`);
    if(pressed!=='true')throw Error('Button state not synchronized');
    await toggle();await wait();
    if(win.isFullScreen())throw Error('Toggle did not exit fullscreen');
    await toggle();await wait();
    win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});await wait();
    if(win.isFullScreen())throw Error('Escape did not exit fullscreen');
    fs.writeFileSync(path.join(__dirname,'dist','fullscreen-check-result.txt'),'PASS: button enter/exit, state synchronization, Escape exit');app.exit(0);
  }catch(error){fs.writeFileSync(path.join(__dirname,'dist','fullscreen-check-result.txt'),String(error));app.exit(1)}
});

const {app,BrowserWindow}=require('electron');
const fs=require('fs');
const path=require('path');
app.setPath('userData',path.join(__dirname,'dist','window-controls-v211-profile'));
app.disableHardwareAcceleration();app.commandLine.appendSwitch('no-sandbox');require('./main.js');
app.whenReady().then(async()=>{
  try {
    const win=BrowserWindow.getAllWindows()[0];
    if(win.webContents.isLoading()) await new Promise(r=>win.webContents.once('did-finish-load',r));
    const wait=()=>new Promise(r=>setTimeout(r,400));
    const toggle=()=>win.webContents.executeJavaScript(`document.querySelector('[data-window-action="fullscreen"]').click()`);
    await win.webContents.executeJavaScript("localStorage.setItem('border-lab-intro-v1','seen')");
    const ordered=await win.webContents.executeJavaScript("[...document.querySelectorAll('.desktop-window-controls button')].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left).map(b=>b.dataset.windowAction).join(',')");
    const centers=await win.webContents.executeJavaScript("[...document.querySelectorAll('.desktop-window-controls button')].map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b,'::before');return {action:b.dataset.windowAction,center:r.top+r.height/2,height:r.height,dotHeight:s.height,alignment:getComputedStyle(b).alignItems}})");
    if(Math.max(...centers.map(r=>r.center))-Math.min(...centers.map(r=>r.center))>.1)throw Error('Window controls not level');
    fs.writeFileSync(path.join(__dirname,'dist','window-controls-alignment.json'),JSON.stringify(centers,null,2));
    console.log(JSON.stringify(centers));
    if(ordered!=='fullscreen,minimize,maximize,close')throw Error('Wrong window action order: '+ordered);
    await win.webContents.executeJavaScript("document.querySelector('[data-window-action=\"maximize\"]').click()");await wait();
    if(!win.isMaximized())throw Error('Maximize failed');
    if(await win.webContents.executeJavaScript("document.querySelector('[data-window-action=\"maximize\"]').title")!=='还原')throw Error('Restore label missing');
    await win.webContents.executeJavaScript("document.querySelector('[data-window-action=\"maximize\"]').click()");await wait();
    if(win.isMaximized())throw Error('Restore failed');
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

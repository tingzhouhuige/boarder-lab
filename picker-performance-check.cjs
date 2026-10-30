const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const profile = path.join(__dirname, 'dist', 'picker-performance-profile');
const fixture = path.join(profile, 'photos');
fs.mkdirSync(fixture, {recursive:true});
fs.copyFileSync(path.join(__dirname, 'assets', 'template-classic.jpg'), path.join(fixture, 'test.jpg'));
fs.writeFileSync(path.join(profile, 'preferences.json'), JSON.stringify({photoBrowserDir:fixture}));
app.setPath('userData', profile);
app.disableHardwareAcceleration();
dialog.showOpenDialog = async () => ({canceled:false, filePaths:[fixture]});
require('./main.js');
app.whenReady().then(async () => {
  try {
    const win = BrowserWindow.getAllWindows()[0];
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    const backend = await win.webContents.executeJavaScript(`(async()=>{
      const list = await borderLabDesktop.browsePhotos(true);
      const first = await borderLabDesktop.photoThumbnail(list.files[0].path);
      const cached = await borderLabDesktop.photoThumbnail(list.files[0].path);
      if (!first?.startsWith('data:image/jpeg') || first !== cached) throw Error('Real thumbnail IPC/cache failed');
      return {thumbnailBytes:first.length, data:first};
    })()`);
    const testWin = new BrowserWindow({show:false,width:1400,height:900,webPreferences:{backgroundThrottling:false}});
    await testWin.loadFile('index.html');
    // Real paint scheduling must be tested on a visible surface: Chromium may
    // suspend modal timers in hidden windows even with background throttling off.
    testWin.showInactive();
    await testWin.webContents.executeJavaScript('window.testThumbnail = '+JSON.stringify(backend.data));
    delete backend.data;
    const result = await testWin.webContents.executeJavaScript(`Promise.race([(async()=>{
      window.testStage='start';
      const assert = (value, message) => {if(!value) throw Error(message)};
      const pause = ms => new Promise(r=>setTimeout(r,ms));
      // Hidden Electron windows suspend paint frames. Keep scheduling testable
      // without opening a foreground window on the user's desktop.
      window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),16);
      window.cancelAnimationFrame=clearTimeout;
      let lastFile='photo-7500.jpg', generation=0, jobs=0, peak=0, requests=0, latency=300;
      const requestedPaths=[];
      const files=Array.from({length:10000},(_,i)=>({name:'photo-'+i+'.jpg',path:'photo-'+i+'.jpg',mimeType:'image/jpeg'}));
      window.borderLabDesktop={
        browsePhotos: async change => {if(change)generation++; return {files,directory:'folder-'+generation,lastFile}},
        photoThumbnail: async path=>{requestedPaths.push(path);jobs++;peak=Math.max(peak,jobs);requests++;await pause(latency);jobs--;return testThumbnail},
        choosePhotos: async paths=>{lastFile=paths.at(-1);return {files:paths.map(path=>({path}))}}
      };
      const css=document.createElement('style');css.textContent='.remember-photo-picker button{transition:none!important}';document.head.append(css);
      let pending=openRememberingPhotoPicker();window.testStage='opened';await pause(300);
      const grid=document.querySelector('.remember-photo-grid');
      const find=i=>grid.querySelector('[data-index="'+i+'"]');
      const show=async i=>{const cols=Math.max(1,Math.floor(grid.clientWidth/157));grid.scrollTop=Math.floor(i/cols)*176;grid.dispatchEvent(new Event('scroll'));await pause(35);};
      const click=async(i,mods={})=>{await show(i);await pause(400);assert(find(i),'target mounted '+i+' scroll='+grid.scrollTop+' first='+grid.querySelector('button')?.dataset.index);find(i).dispatchEvent(new MouseEvent('click',{bubbles:true,...mods}))};
      window.testStage='initial assertions';
      assert(grid.querySelectorAll('button').length<100,'10,000 photos must render fewer than 100 cards');
      assert(find(7500) && grid.scrollTop>0,'restores last photo at deep offset');
      assert(!grid.querySelector('[aria-pressed="true"]'),'history not selected');
      window.testStage='wait previews';
      await pause(500);assert(requests>0 && requests<100 && peak<=1,'visible-only bounded thumbnail queue');
      assert([...grid.querySelectorAll('img[src]')].every(img=>img.src.startsWith('data:image/jpeg')),'rendered previews are thumbnails');
      const beforeDrag=requests;
      window.testStage='drag';
      let dragMutations=0;
      const mutations=new MutationObserver(entries=>dragMutations+=entries.length);
      mutations.observe(grid.querySelector('.remember-photo-surface'),{childList:true,subtree:true});
      let ticks=0; const heartbeat=setInterval(()=>ticks++,10);
      for(let i=0;i<20;i++) {
        const target=1000+i*300;
        await show(target);
        assert(find(target),'photo frame remains visible during scrolling');
        assert(find(target).querySelector('span').textContent===files[target].name,'filename visible before image');
      }
      clearInterval(heartbeat);
      mutations.disconnect();
      assert(requests===beforeDrag,'no new thumbnail requests during continuous scrolling');
      assert(dragMutations>0,'lightweight frames update while images are paused');
      assert(ticks>30,'UI event loop responsive with slow thumbnail reads');
      const priorityStart=requestedPaths.length;
      await show(4000);await pause(420);
      const firstIndex=Number(requestedPaths[priorityStart]?.replace('photo-','').replace('.jpg',''));
      const priorityCols=Math.max(1,Math.floor(grid.clientWidth/157));
      const rowTop=Math.floor(firstIndex/priorityCols)*176;
      assert(Number.isFinite(firstIndex) && rowTop>=grid.scrollTop && rowTop<grid.scrollTop+grid.clientHeight,'first request targets visible stop position, not overscan');
      await click(10);await click(12);assert(find(12).matches('[aria-pressed="true"]') && !find(10).matches('[aria-pressed="true"]'),'plain click single');
      await click(15,{ctrlKey:true});assert(find(12).matches('[aria-pressed="true"]'),'Ctrl retains');
      await click(15,{ctrlKey:true});assert(find(15).matches('[aria-pressed="false"]'),'Ctrl toggles off');
      await click(20);await click(23,{shiftKey:true});assert([20,21,22,23].every(i=>find(i)?.matches('[aria-pressed="true"]')),'Shift range');
      await click(9000,{ctrlKey:true});await click(9002,{ctrlKey:true,shiftKey:true});
      await show(20);await pause(400);assert(find(20).matches('[aria-pressed="true"]'),'selection survives virtual unmount');
      await show(9000);await pause(400);assert(find(9002).matches('[aria-pressed="true"]'),'Ctrl Shift range');
      window.testStage='import';
      await click(7501);document.querySelector('[data-import]').click();
      const imported=await pending;assert(imported.files.length===1 && imported.files[0].path==='photo-7501.jpg','imports only explicit selection');
      pending=openRememberingPhotoPicker();await pause(150);
      window.testStage='folder';
      document.querySelector('[data-folder]').click();await pause(250);
      const updated=document.querySelector('.remember-photo-grid');
      assert(document.querySelector('[data-path]').textContent==='folder-1','folder change applied');
      const mounted=updated.querySelectorAll('button').length;
      assert(mounted<100,'folder change remains virtual');
      assert(!updated.querySelector('[aria-pressed="true"]'),'folder change clears selection');
      assert(updated.querySelector('.last-photo'),'folder change restores position');
      window.testStage='cancel';
      document.querySelector('[data-cancel]').click();assert((await pending).canceled,'cancel');
      await pause(350);latency=0;files.length=80;lastFile='photo-0.jpg';
      const warmStart=requestedPaths.length;
      pending=openRememberingPhotoPicker();await pause(4000);
      const rendered=new Set([...document.querySelectorAll('.remember-photo-grid button')].map(button=>button.dataset.path));
      const backgroundWarmed=requestedPaths.slice(warmStart).some(path=>!rendered.has(path));
      assert(backgroundWarmed,'idle queue preloads photos outside mounted viewport');
      document.querySelector('[data-cancel]').click();await pending;
      return {pass:true,virtualListPhotos:10000,mountedCards:mounted,peakThumbnailJobs:peak,totalRequests:requests,scrollHeartbeatTicks:ticks,requestsDuringDrag:0,domMutationsDuringDrag:dragMutations,backgroundWarmed};
    })(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Timed out at '+window.testStage)),30000))])`);
    fs.writeFileSync(path.join(__dirname,'dist','picker-performance-result.json'),JSON.stringify({backend,result},null,2));
    app.exit(0);
  } catch(error) {fs.writeFileSync(path.join(__dirname,'dist','picker-performance-result.json'),String(error));app.exit(1)}
});

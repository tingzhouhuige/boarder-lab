const {app,BrowserWindow}=require('electron');
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
const childProcess=require('node:child_process');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist','paper-surface-before.js'),childProcess.execFileSync('git',['show','53d5954:paper-surface.js'],{cwd:fs.existsSync(path.join(root,'.git'))?root:path.join(root,'../publish-boarder-lab')}));
const requested=[];
app.setPath('userData',path.join(root,'dist','web-check-profile'));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 requested.push(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(error,bytes)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(bytes);});
});
app.whenReady().then(async()=>{
 let stage='starting';
 setTimeout(()=>{fs.writeFileSync(path.join(root,'dist','web-check-result.json'),'Timed out: '+stage);app.exit(1)},30000);
 const win=new BrowserWindow({show:false,width:1400,height:900,webPreferences:{backgroundThrottling:false,contextIsolation:false,preload:path.join(root,'web-check-preload.cjs')}});
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  stage='server ready';
  stage='loading page';
  await win.loadURL(`http://127.0.0.1:${server.address().port}/index.html`);win.showInactive();
  if(requested.some(url=>/paper-cotton-surface|template-classic\.jpg/.test(url)))throw Error('Startup requested full-resolution template assets');
  stage='browser tests';
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=['startup does not request full-resolution paper or template photos'],assert=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
   assert(!paperSurface.loading,'paper original loading is deferred');
   assert(window.BORDER_LAB_READY && !uploadButton.disabled,'import control is enabled after critical script initialization');
   const pause=ms=>new Promise(r=>setTimeout(r,ms));
   const root=await navigator.storage.getDirectory();window.testFolder=await root.getDirectoryHandle('photos',{create:true});
   const handle=await testFolder.getFileHandle('sample.jpg',{create:true}),writable=await handle.createWritable();
   await writable.write(await(await fetch('assets/template-classic.jpg')).blob());await writable.close();
   const result=await borderLabDesktop.browsePhotos(true);
   assert(result.files.length===1,'folder enumeration');
   const first=await borderLabDesktop.photoThumbnail(result.files[0].path);
   assert(first?.startsWith('data:image/jpeg'),'real web worker thumbnail');
   await borderLabDesktop.pauseThumbnails();
   assert(first===await borderLabDesktop.photoThumbnail(result.files[0].path),'thumbnail cache reused after worker restart');
   assert((await borderLabStorage.all('thumbnails')).length>=1,'persistent IndexedDB cache exists');
   const chosen=await borderLabDesktop.choosePhotos([result.files[0].path]);
   assert(chosen.files[0] instanceof File,'selected file uses browser File API');
   await handleFiles(desktopPhotosToFiles(chosen));assert(photoItems.length===1,'web import into editor');
   await editHistory.undo();assert(photoItems.length===0,'web undo import');await editHistory.redo();assert(photoItems.length===1,'web redo import');
   const remembered=await borderLabDesktop.browsePhotos(false);assert(remembered.lastFile===result.files[0].path,'last photo persisted');
   await borderLabDesktop.pauseThumbnails();
   const OriginalWorker=window.Worker;
   try{
    window.Worker=class{constructor(){throw Error('simulated worker failure')}};
    const fallback=await borderLabDesktop.photoThumbnail(result.files[0].path);
    assert(fallback?.startsWith('data:image/jpeg'),'browser decoding fallback when worker cannot start');
   }finally{window.Worker=OriginalWorker;}
   const picking=openRememberingPhotoPicker();
   let displayed=false;
   for(let i=0;i<100;i++){
    await pause(50);
    const image=document.querySelector('.remember-photo-grid img');
    if(image?.complete && image.naturalWidth>0){displayed=true;break;}
   }
   assert(displayed,'thumbnail actually visible in photo picker');
   assert(document.querySelector('.remember-photo-grid button').getAttribute('aria-pressed')==='false','remembered thumbnail is not automatically selected');
   document.querySelector('.remember-photo-picker [data-cancel]').click();await picking;
   let permissionUnderModal=null;
   const originalPermission=testFolder.requestPermission.bind(testFolder);
   testFolder.requestPermission=options=>{permissionUnderModal=Boolean(document.querySelector('dialog[open]'));return originalPermission(options)};
   const actualImport=openPhotoPicker();
   for(let i=0;i<100&&!document.querySelector('.remember-photo-grid img');i++)await pause(25);
   assert(permissionUnderModal===false,'actual import requests permission before opening custom modal');
   let changeUnderModal=null;const originalPicker=window.showDirectoryPicker;
   window.showDirectoryPicker=async()=>{changeUnderModal=Boolean(document.querySelector('dialog[open]'));return testFolder};
   document.querySelector('[data-folder]').click();await pause(100);
   assert(changeUnderModal===false,'changing folders temporarily closes custom modal before native picker');
   window.showDirectoryPicker=originalPicker;testFolder.requestPermission=originalPermission;
   document.querySelector('.remember-photo-picker [data-cancel]').click();await actualImport;
   const beforeSource=await(await fetch('dist/paper-surface-before.js')).text();
   const BeforePaper=new Function(beforeSource.replace('window.paperSurface = new PaperSurface();','return PaperSurface;'))();
   const before=new BeforePaper();await before.ready;await paperSurface.ready;
   const makeCanvas=()=>{const canvas=document.createElement('canvas');canvas.width=400;canvas.height=300;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,400,300);return canvas};
   const oldCanvas=makeCanvas(),newCanvas=makeCanvas();before.apply(oldCanvas,.7,'fixed-photo');paperSurface.apply(newCanvas,.7,'fixed-photo');
   assert(oldCanvas.toDataURL()===newCanvas.toDataURL(),'paper rendering pixels identical to original implementation');
   await borderLabDesktop.saveWatermark(first,'mark.jpg');assert((await borderLabDesktop.loadWatermark()).fileName==='mark.jpg','watermark persistence');
   assert(document.getElementById('appVersion').textContent==='v2.1.0','web version');
   assert(document.querySelector('.web-fullscreen-toggle'),'web fullscreen control');
   return checks;
  })()`);
  fs.writeFileSync(path.join(root,'dist','web-check-result.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(root,'dist','web-v210.png'),(await win.webContents.capturePage()).toPNG());server.close();app.exit(0);
 }catch(error){fs.writeFileSync(path.join(root,'dist','web-check-result.json'),String(error));server.close();app.exit(1)}
});

const {app,BrowserWindow}=require('electron');
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
app.setPath('userData',path.join(root,'dist','web-check-profile'));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
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
  stage='browser tests';
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=[],assert=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
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
   await borderLabDesktop.saveWatermark(first,'mark.jpg');assert((await borderLabDesktop.loadWatermark()).fileName==='mark.jpg','watermark persistence');
   assert(document.getElementById('appVersion').textContent==='v2.1.0','web version');
   assert(document.querySelector('.web-fullscreen-toggle'),'web fullscreen control');
   return checks;
  })()`);
  fs.writeFileSync(path.join(root,'dist','web-check-result.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(root,'dist','web-v210.png'),(await win.webContents.capturePage()).toPNG());server.close();app.exit(0);
 }catch(error){fs.writeFileSync(path.join(root,'dist','web-check-result.json'),String(error));server.close();app.exit(1)}
});

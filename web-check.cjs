const {app,BrowserWindow}=require('electron');
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,fixture=path.join(root,'dist','web-input-fixture','photos');
fs.mkdirSync(path.join(fixture,'nested'),{recursive:true});
fs.copyFileSync(path.join(root,'assets','template-classic.jpg'),path.join(fixture,'sample.jpg'));
fs.copyFileSync(path.join(root,'assets','template-classic.jpg'),path.join(fixture,'nested','nested.jpg'));
fs.writeFileSync(path.join(fixture,'notes.txt'),'ignored');
app.setPath('userData',path.join(root,'dist','web-input-check-profile'));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(error,bytes)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(bytes);});
});
app.whenReady().then(async()=>{
 let stage='starting',chooserError,folderChoosers=0,fileChoosers=0;
 setTimeout(()=>{fs.writeFileSync(path.join(root,'dist','web-check-result.json'),'Timed out: '+stage);app.exit(1)},30000);
 const win=new BrowserWindow({show:false,width:1400,height:900,webPreferences:{backgroundThrottling:false}});
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  await win.loadURL(`http://127.0.0.1:${server.address().port}/index.html`);win.showInactive();
  win.webContents.debugger.attach('1.3');
  await win.webContents.debugger.sendCommand('Page.enable');
  await win.webContents.debugger.sendCommand('Page.setInterceptFileChooserDialog',{enabled:true});
  win.webContents.debugger.on('message',async(event,method,params)=>{
   if(method!=='Page.fileChooserOpened')return;
   try{
    const {node}=await win.webContents.debugger.sendCommand('DOM.describeNode',{backendNodeId:params.backendNodeId});
    const directory=node.attributes.includes('webkitdirectory');directory?folderChoosers++:fileChoosers++;
    await win.webContents.debugger.sendCommand('DOM.setFileInputFiles',{backendNodeId:params.backendNodeId,files:directory?[fixture]:[path.join(fixture,'sample.jpg')]});
   }catch(error){chooserError=error;}
  });
  stage='initial chooser';
  await win.webContents.executeJavaScript(`window.testImport=openPhotoPicker();void 0`,true);
  const initial=await win.webContents.executeJavaScript(`document.querySelector('.remember-photo-picker [data-status]').textContent`);
  if(!initial.includes('点击')||folderChoosers)throw Error('First open must show enabled choices without waiting for permission');
  await win.webContents.executeJavaScript(`document.querySelector('.remember-photo-picker [data-folder]').click()`,true);
  stage='native directory input';
  const result=await win.webContents.executeJavaScript(`(async()=>{
   const checks=['initial chooser has explicit actions without permission wait'];
   const assert=(value,label)=>{if(!value)throw Error(label);checks.push(label)};
   const pause=ms=>new Promise(r=>setTimeout(r,ms));
   let displayed=false;
   for(let i=0;i<150;i++){await pause(50);const image=document.querySelector('.remember-photo-grid img');if(image?.complete&&image.naturalWidth>0){displayed=true;break;}}
   assert(displayed,'real directory input yields visible thumbnail');
   assert(document.querySelectorAll('.remember-photo-grid button').length===1,'only supported photos in chosen folder appear');
   const listing=await borderLabDesktop.browsePhotos(false),path=listing.files[0].path;
   const first=await borderLabDesktop.photoThumbnail(path);assert(first?.startsWith('data:image/jpeg'),'real worker decodes native File input');
   await borderLabDesktop.pauseThumbnails();assert(first===await borderLabDesktop.photoThumbnail(path),'persistent thumbnail cache reused');
   const chosen=await borderLabDesktop.choosePhotos([path]);assert(chosen.files[0] instanceof File,'native input returns browser File');
   document.querySelector('.remember-photo-grid button').click();
   document.querySelector('.remember-photo-picker [data-import]').click();await window.testImport;
   assert(photoItems.length===1,'actual import entry loads chosen photo into editor');
   await editHistory.undo();assert(photoItems.length===0,'undo import');await editHistory.redo();assert(photoItems.length===1,'redo import');
   window.testPicking=openRememberingPhotoPicker();await pause(100);
   assert(!document.querySelector('.remember-photo-picker [data-folder]').disabled,'reopening uses session files without permission wait');
   assert(document.querySelector('.remember-photo-grid button').getAttribute('aria-pressed')==='false','previous photo is not automatically selected');
   document.querySelector('.remember-photo-picker [data-cancel]').click();await window.testPicking;
   await borderLabDesktop.pauseThumbnails();const OriginalWorker=window.Worker;
   try{window.Worker=class{constructor(){throw Error('simulated worker failure')}};assert((await borderLabDesktop.photoThumbnail(path))?.startsWith('data:image/jpeg'),'fallback decodes when worker unavailable');}finally{window.Worker=OriginalWorker;}
   return checks;
  })()`);
  if(chooserError)throw chooserError;
  if(folderChoosers!==1)throw Error('Native directory chooser not exercised');
  stage='direct file input';
  await win.webContents.executeJavaScript(`window.directImport=openPhotoPicker();void 0`,true);
  await win.webContents.executeJavaScript(`document.querySelector('[data-direct-photos]').click()`,true);
  await win.webContents.executeJavaScript(`window.directImport`);
  if(fileChoosers!==1)throw Error('Native file input not exercised');
  result.push('direct photo input imports without directory permission');
  fs.writeFileSync(path.join(root,'dist','web-check-result.json'),JSON.stringify(result,null,2));
  fs.writeFileSync(path.join(root,'dist','web-v210.png'),(await win.webContents.capturePage()).toPNG());server.close();app.exit(0);
 }catch(error){fs.writeFileSync(path.join(root,'dist','web-check-result.json'),`${stage}: ${chooserError||error}`);server.close();app.exit(1)}
});

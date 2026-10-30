(() => {
  if(window.borderLabDesktop)return;
  const storage=window.borderLabStorage;
  let currentFolder=null,folderId='',entries=new Map(),worker=null,nextId=0;
  const pending=new Map();
  const pauseThumbnails=async()=>{
    worker?.terminate();worker=null;
    for(const request of pending.values()){clearTimeout(request.timer);request.resolve(null);}
    pending.clear();
  };
  const platform={
    getVersion:async()=>window.BORDER_LAB_VERSION,
    pauseThumbnails,
    saveWatermark:async(data,fileName)=>{await storage.put('settings','watermark',{data,fileName});},
    loadWatermark:async()=>await storage.get('settings','watermark')||{},
  };
  if('showDirectoryPicker' in window && 'Worker' in window && 'OffscreenCanvas' in window){
    platform.browsePhotos=async(change=false)=>{
      try{
        let handle=currentFolder;
        if(change){handle=await window.showDirectoryPicker({id:'border-lab-import-folder',mode:'read'});}
        else{
          if(!handle)handle=(await storage.get('settings','lastFolder').catch(()=>null))?.handle;
          if(handle && await handle.queryPermission({mode:'read'})!=='granted'){
            if(await handle.requestPermission({mode:'read'})!=='granted')handle=null;
          }
          if(!handle)handle=await window.showDirectoryPicker({id:'border-lab-import-folder',mode:'read'});
        }
        await pauseThumbnails();
        let record;
        for(const saved of await storage.all('folders').catch(()=>[])){
          if(await handle.isSameEntry(saved.handle)){record=saved;break;}
        }
        record ||= {id:crypto.randomUUID(),handle};
        await storage.put('folders',record.id,record).catch(()=>{});
        await storage.put('settings','lastFolder',record).catch(()=>{});
        const next=new Map();
        for await(const entry of handle.values())if(entry.kind==='file' && /\.(jpe?g|png|webp)$/i.test(entry.name))next.set(`${record.id}/${entry.name}`,entry);
        currentFolder=handle;folderId=record.id;entries=next;
        const collator=new Intl.Collator('zh-CN',{numeric:true});
        const files=[...entries].map(([path,entry])=>({path,name:entry.name})).sort((a,b)=>collator.compare(a.name,b.name));
        return {files,directory:handle.name,lastFile:await storage.get('settings','lastPhoto').catch(()=>null)};
      }catch(error){if(error.name==='AbortError')return {canceled:true};throw error;}
    };
    platform.choosePhotos=async paths=>{
      const files=[];
      for(const path of paths){if(!entries.has(path))throw Error('请重新选择照片文件夹');files.push(await entries.get(path).getFile());}
      await storage.put('settings','lastPhoto',paths.at(-1)).catch(()=>{});
      return {files,canceled:false};
    };
    platform.photoThumbnail=path=>new Promise(resolve=>{
      const handle=entries.get(path);if(!handle){resolve(null);return;}
      if(!worker){
        worker=new Worker('web-thumbnail-worker.js');
        worker.onmessage=({data})=>{const request=pending.get(data.id);if(!request)return;clearTimeout(request.timer);pending.delete(data.id);request.resolve(data.url||null);};
        worker.onerror=()=>pauseThumbnails();
      }
      const id=++nextId;
      pending.set(id,{resolve,timer:setTimeout(pauseThumbnails,8000)});
      worker.postMessage({id,handle,folderId});
    });
  }
  window.borderLabDesktop=platform;
  const button=document.createElement('button');
  button.className='web-fullscreen-toggle';button.type='button';
  button.innerHTML=document.querySelector('[data-window-action="fullscreen"]').innerHTML;
  const sync=()=>{const full=Boolean(document.fullscreenElement);button.title=full?'退出全屏（Esc）':'进入全屏';button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(full));};
  button.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(error){console.error('Fullscreen unavailable',error);}});
  document.addEventListener('fullscreenchange',sync);sync();
  if(document.fullscreenEnabled)document.querySelector('.brand-block').append(button);
})();

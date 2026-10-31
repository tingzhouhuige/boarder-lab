(() => {
  if(window.borderLabDesktop)return;
  const storage=window.borderLabStorage;
  let currentFolder=null,folderId='',entries=new Map(),worker=null,nextId=0,thumbnailGeneration=0;
  const pending=new Map();
  // Load before the click: waiting for IndexedDB can lose user activation.
  let rememberedFolder=null,knownFolders=[],rememberedPhoto=null;
  storage.get('settings','lastFolder').then(value=>{rememberedFolder ||= value;}).catch(()=>{});
  storage.all('folders').then(value=>{knownFolders=value;}).catch(()=>{});
  storage.get('settings','lastPhoto').then(value=>{rememberedPhoto ||= value;}).catch(()=>{});
  const bounded=(task,signal,ms=15000)=>new Promise((resolve,reject)=>{
    const abort=()=>finish(reject,new DOMException('已取消读取','AbortError'));
    const timer=setTimeout(()=>finish(reject,Error('读取超时，请重试或更换文件夹')),ms);
    const finish=(done,value)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);done(value);};
    if(signal?.aborted){abort();return;}
    signal?.addEventListener('abort',abort,{once:true});Promise.resolve(task).then(value=>finish(resolve,value),error=>finish(reject,error));
  });
  const pauseThumbnails=async()=>{
    thumbnailGeneration++;
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
    platform.browsePhotos=async(change=false,{signal,onProgress}={})=>{
      try{
        let handle=currentFolder||rememberedFolder?.handle;
        if(change){handle=await window.showDirectoryPicker({id:'border-lab-import-folder',mode:'read'});}
        else{
          if(handle){
            if(await bounded(handle.requestPermission({mode:'read'}),signal,60000)!=='granted')handle=null;
          }
          if(!handle)handle=await window.showDirectoryPicker({id:'border-lab-import-folder',mode:'read'});
        }
        await pauseThumbnails();
        if(signal?.aborted)return {canceled:true};
        onProgress?.(0,0);
        let record;
        for(const saved of [rememberedFolder,...knownFolders].filter(Boolean)){
          if(await bounded(handle.isSameEntry(saved.handle).catch(()=>false),signal)){record=saved;break;}
        }
        record ||= {id:crypto.randomUUID(),handle};
        rememberedFolder=record;
        // Persistence must never hold up listing the user's files.
        storage.put('folders',record.id,record).catch(()=>{});
        storage.put('settings','lastFolder',record).catch(()=>{});
        const next=new Map();
        const iterator=handle.values();let scanned=0,lastYield=performance.now();
        while(true){
          const step=await bounded(iterator.next(),signal);if(step.done)break;
          const entry=step.value;
          if(entry.kind==='file' && /\.(jpe?g|png|webp)$/i.test(entry.name))next.set(`${record.id}/${entry.name}`,entry);
          scanned++;
          if(performance.now()-lastYield>12){onProgress?.(next.size,scanned);await new Promise(r=>setTimeout(r,0));lastYield=performance.now();}
        }
        if(signal?.aborted)throw new DOMException('已取消读取','AbortError');
        currentFolder=handle;folderId=record.id;entries=next;
        const collator=new Intl.Collator('zh-CN',{numeric:true});
        const files=[...entries].map(([path,entry])=>({path,name:entry.name})).sort((a,b)=>collator.compare(a.name,b.name));
        return {files,directory:handle.name,lastFile:rememberedPhoto};
      }catch(error){if(error.name==='AbortError')return {canceled:true};throw error;}
    };
    platform.choosePhotos=async paths=>{
      const files=[];
      for(const path of paths){if(!entries.has(path))throw Error('请重新选择照片文件夹');files.push(await entries.get(path).getFile());}
      rememberedPhoto=paths.at(-1);
      storage.put('settings','lastPhoto',rememberedPhoto).catch(()=>{});
      return {files,canceled:false};
    };
    const fallbackThumbnail=async(file,generation)=>{
      if(generation!==thumbnailGeneration)return null;
      const bitmap=await createImageBitmap(file,{resizeWidth:240,resizeQuality:'medium'});
      try{
        if(generation!==thumbnailGeneration)return null;
        const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
        canvas.getContext('2d').drawImage(bitmap,0,0);
        return canvas.toDataURL('image/jpeg',.7);
      }finally{bitmap.close();}
    };
    platform.photoThumbnail=async path=>{
      const handle=entries.get(path);if(!handle)return null;
      const generation=thumbnailGeneration;
      try{
        // File-system permission belongs to the window. Transfer a File, not a
        // handle that may be unable to request/read permission inside a worker.
        const file=await bounded(handle.getFile(),undefined,8000);
        if(generation!==thumbnailGeneration)return null;
        let url;
        try{
          url=await new Promise((resolve,reject)=>{
            if(!worker){
              worker=new Worker('web-thumbnail-worker.js?thumbnail-fix=2');
              worker.onmessage=({data})=>{
                const request=pending.get(data.id);if(!request)return;
                clearTimeout(request.timer);pending.delete(data.id);
                if(data.error)request.reject(Error(data.error));else request.resolve(data.url||null);
              };
              worker.onerror=worker.onmessageerror=()=>{
                worker?.terminate();worker=null;
                for(const request of pending.values()){clearTimeout(request.timer);request.reject(Error('缩略图后台线程不可用'));}
                pending.clear();
              };
            }
            const id=++nextId;
            const timer=setTimeout(()=>worker?.onerror?.(),8000);
            pending.set(id,{resolve,reject,timer});
            try{worker.postMessage({id,file,folderId});}catch(error){clearTimeout(timer);pending.delete(id);reject(error);}
          });
        }catch(error){
          if(generation!==thumbnailGeneration)return null;
          console.warn('后台缩略图失败，改用浏览器解码',error);
          url=await fallbackThumbnail(file,generation);
        }
        return generation===thumbnailGeneration?url:null;
      }catch(error){console.warn('无法读取缩略图',path,error);return null;}
    };
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

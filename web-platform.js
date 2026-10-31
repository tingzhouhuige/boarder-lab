(() => {
  if(window.borderLabDesktop)return;
  const storage=window.borderLabStorage;
  let currentDirectory='',folderId='',entries=new Map(),worker=null,nextId=0,thumbnailGeneration=0;
  const pending=new Map();
  let rememberedPhoto=null;
  storage.get('settings','lastPhoto').then(value=>{rememberedPhoto ||= value;}).catch(()=>{});
  const pickFiles=(directory,signal)=>new Promise((resolve,reject)=>{
    const input=document.createElement('input');input.type='file';input.multiple=true;input.hidden=true;
    input.dataset.webPhotoInput=directory?'folder':'files';
    if(directory)input.webkitdirectory=true;else input.accept='.jpg,.jpeg,.png,.webp';
    // Inputs outside a modal are inert. Keep the native input inside this dialog.
    (document.querySelector('.remember-photo-picker[open]')||document.body).append(input);
    let settled=false;
    const finish=value=>{if(settled)return;settled=true;input.remove();signal?.removeEventListener('abort',abort);resolve(value);};
    const abort=()=>finish(null);
    input.addEventListener('change',()=>finish(Array.from(input.files||[])),{once:true});
    input.addEventListener('cancel',abort,{once:true});
    if(signal?.aborted){abort();return;}
    signal?.addEventListener('abort',abort,{once:true});
    try{input.click();}catch(error){input.remove();signal?.removeEventListener('abort',abort);reject(error);}
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
  if('webkitdirectory' in document.createElement('input')){
    platform.choosePhotoFiles=async({signal}={})=>{
      const files=await pickFiles(false,signal);return files?.length?{files,canceled:false}:{canceled:true};
    };
    platform.browsePhotos=async(change=false,{signal,onProgress}={})=>{
      try{
        const listing=()=>({files:[...entries].map(([path,file])=>({path,name:file.name})).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN',{numeric:true})),directory:currentDirectory,lastFile:rememberedPhoto});
        if(!change)return currentDirectory?listing():{needsFolder:true};
        // Use the browser's file input instead of a saved permission/handle prompt.
        const picked=await pickFiles(true,signal);
        if(!picked?.length || signal?.aborted)return {canceled:true};
        await pauseThumbnails();
        const directory=picked[0].webkitRelativePath.split('/')[0]||'所选照片';
        const id=`input:${encodeURIComponent(directory)}`,next=new Map();let lastYield=performance.now();
        for(let index=0;index<picked.length;index++){
          const file=picked[index],relative=file.webkitRelativePath||file.name;
          // Keep the same non-recursive folder view as the desktop picker.
          if(relative.split('/').length<=2 && /\.(jpe?g|png|webp)$/i.test(file.name))next.set(`${id}/${relative}`,file);
          if(performance.now()-lastYield>12){onProgress?.(next.size,index+1);await new Promise(r=>setTimeout(r,0));lastYield=performance.now();}
          if(signal?.aborted)return {canceled:true};
        }
        currentDirectory=directory;folderId=id;entries=next;
        return listing();
      }catch(error){if(error.name==='AbortError')return {canceled:true};throw error;}
    };
    platform.choosePhotos=async paths=>{
      const files=[];
      for(const path of paths){if(!entries.has(path))throw Error('请重新选择照片文件夹');files.push(entries.get(path));}
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
      const file=entries.get(path);if(!file)return null;
      const generation=thumbnailGeneration;
      try{
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

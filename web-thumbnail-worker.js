importScripts('web-storage.js?import-fix=1');
self.onmessage=async({data:{id,handle,folderId}})=>{
  try{
    const file=await handle.getFile();
    const key=`240-q70-v1:${folderId}:${file.name}:${file.size}:${file.lastModified}`;
    let blob=await borderLabStorage.get('thumbnails',key).catch(()=>null);
    if(!blob){
      const bitmap=await createImageBitmap(file,{resizeWidth:240,resizeQuality:'medium'});
      const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);
      canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
      blob=await canvas.convertToBlob({type:'image/jpeg',quality:.7});
      await borderLabStorage.put('thumbnails',key,blob).catch(()=>{});
    }
    self.postMessage({id,url:new FileReaderSync().readAsDataURL(blob)});
  }catch(error){self.postMessage({id,error:error.message});}
};

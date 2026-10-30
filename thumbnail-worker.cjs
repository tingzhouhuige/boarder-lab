const { app, nativeImage } = require('electron');
const ready = app.whenReady();
const {cachedThumbnail}=require('./thumbnail-cache.cjs');
  process.on('message', async ({ id, filePath, cacheDir }) => {
    try {
      await ready;
      const bytes=await cachedThumbnail(filePath,cacheDir,async()=>{
        const image = await nativeImage.createThumbnailFromPath(filePath, {width:240,height:160});
        return image.isEmpty()?null:image.toJPEG(70);
      });
      const data=bytes?`data:image/jpeg;base64,${bytes.toString('base64')}`:null;
      if (process.connected) process.send({id,data});
    } catch { if (process.connected) process.send({id,data:null}); }
  });
process.on('disconnect', () => app.exit());

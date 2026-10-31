// Card previews only. Editor photos and full-resolution paper textures stay intact.
const {app,nativeImage}=require('electron');
const fs=require('node:fs'),path=require('node:path');
app.whenReady().then(()=>{
  for(const [source,target,width] of [['template-classic.jpg','template-preview.jpg',640],['paper-cotton-surface.png','paper-preview.jpg',512]]){
    const image=nativeImage.createFromPath(path.join(__dirname,'assets',source));
    if(image.isEmpty())throw Error('Cannot read '+source);
    fs.writeFileSync(path.join(__dirname,'assets',target),image.resize({width,quality:'best'}).toJPEG(88));
  }
  app.exit(0);
});

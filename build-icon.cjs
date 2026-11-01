const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');
app.whenReady().then(async () => {
 try {
 const input = nativeImage.createFromPath(path.join(__dirname, 'assets/app-icon.png'));
 const dimensions = input.getSize();
 const inset = Math.round(Math.min(dimensions.width, dimensions.height) * .095);
 const source = input.crop({x:inset,y:inset,width:dimensions.width-inset*2,height:dimensions.height-inset*2});
 for (const size of [16,24,32,48,64,128,256]) {
 fs.writeFileSync(path.join(__dirname, `assets/icon-sizes/app-icon-${size}.png`), source.resize({width:size,height:size,quality:'best'}).toPNG());
 }
 const {default:pngToIco}=await import('png-to-ico');
 fs.writeFileSync(path.join(__dirname,'assets/app-icon.ico'),await pngToIco([16,32,48,64,128,256].map(s=>path.join(__dirname,`assets/icon-sizes/app-icon-${s}.png`))));
 app.exit(0);
 } catch(error) { console.error(error); app.exit(1); }
});

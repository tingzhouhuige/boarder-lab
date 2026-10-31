const fs=require('fs');
const path=require('path');
const {version}=require('./package.json');
fs.writeFileSync(path.join(__dirname,'version.js'),`window.BORDER_LAB_VERSION = ${JSON.stringify(version)};\n`);
const scripts=['theme.js','paper-surface.js','version.js','web-storage.js','web-platform.js','photo-picker.js','app.js','edit-history.js'];
fs.writeFileSync(path.join(__dirname,'border-lab.js'),scripts.map(name=>`// ${name}\n${fs.readFileSync(path.join(__dirname,name),'utf8')}\n;`).join('\n'));

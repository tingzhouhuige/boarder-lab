const fs=require('fs');
const path=require('path');
const {version}=require('./package.json');
fs.writeFileSync(path.join(__dirname,'version.js'),`window.BORDER_LAB_VERSION = ${JSON.stringify(version)};\n`);

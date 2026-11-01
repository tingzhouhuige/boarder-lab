const path = require('path');
module.exports = async context => {
  if (context.electronPlatformName !== 'win32') return;
  await require('rcedit')(path.join(context.appOutDir, context.packager.appInfo.productFilename + '.exe'), {icon:path.join(__dirname,'..','assets','app-icon.ico')});
};

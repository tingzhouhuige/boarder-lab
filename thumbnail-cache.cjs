const fs=require('fs/promises');
const path=require('path');
const {createHash}=require('crypto');
async function cachedThumbnail(filePath, directory, generate) {
  const stat=await fs.stat(filePath);
  const key=createHash('sha256').update(`v1-240-q70:${filePath}:${stat.size}:${stat.mtimeMs}`).digest('hex');
  const target=path.join(directory,key+'.jpg');
  try {const bytes=await fs.readFile(target);if(bytes.length)return bytes;}catch{}
  const bytes=await generate();
  if(!bytes?.length)return null;
  try {
    await fs.mkdir(directory,{recursive:true});
    const temporary=target+'.'+process.pid+'.tmp';
    await fs.writeFile(temporary,bytes);await fs.rename(temporary,target);
  }catch{} // A read-only/full cache must never prevent importing a photo.
  return bytes;
}
module.exports={cachedThumbnail};

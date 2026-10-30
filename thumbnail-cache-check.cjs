const fs=require('fs/promises');const path=require('path');const assert=require('assert');
const {cachedThumbnail}=require('./thumbnail-cache.cjs');
(async()=>{
 const root=await fs.mkdtemp(path.join(require('os').tmpdir(),'border-thumbnail-cache-'));
 const source=path.join(root,'photo.jpg'),cache=path.join(root,'cache');
 await fs.writeFile(source,'original');let calls=0;
 const generate=async()=>{calls++;return Buffer.from('thumbnail-'+calls)};
 assert.equal((await cachedThumbnail(source,cache,generate)).toString(),'thumbnail-1');
 delete require.cache[require.resolve('./thumbnail-cache.cjs')];
 const reload=require('./thumbnail-cache.cjs').cachedThumbnail;
 assert.equal((await reload(source,cache,generate)).toString(),'thumbnail-1');assert.equal(calls,1);
 await fs.writeFile(source,'changed-photo-content');
 assert.equal((await reload(source,cache,generate)).toString(),'thumbnail-2');assert.equal(calls,2);
 await fs.rm(root,{recursive:true,force:true});
 console.log('PASS: persistent cache reused after module reload; changed photo regenerated');
})().catch(error=>{console.error(error);process.exit(1)});

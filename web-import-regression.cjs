const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const never=()=>new Promise(()=>{});
const checks=[];
function platform(storage,folder){
  let calls=0;
  const element={innerHTML:'',setAttribute(){},append(){},addEventListener(){}};
  const context={console,setTimeout,clearTimeout,DOMException,AbortController,performance,crypto:require('node:crypto').webcrypto,
    document:{createElement:()=>({...element}),querySelector:()=>element,addEventListener(){}},
    Worker:class{},OffscreenCanvas:class{}};
  context.window=context;context.borderLabStorage=storage;
  context.showDirectoryPicker=()=>{calls++;return Promise.resolve(folder)};
  vm.runInNewContext(fs.readFileSync(__dirname+'/web-platform.js','utf8'),context);
  return {api:context.borderLabDesktop,calls:()=>calls};
}
(async()=>{
  const folder={name:'small',async *values(){yield {kind:'file',name:'a.jpg',getFile:async()=>({name:'a.jpg'})};yield {kind:'file',name:'notes.txt'};}};
  const blocked={get:never,put:never,all:never};
  const {api,calls}=platform(blocked,folder);
  const start=performance.now(),listing=api.browsePhotos(false);
  assert.equal(calls(),1);checks.push('native picker called immediately without awaiting cache');
  const result=await Promise.race([listing,new Promise((_,reject)=>setTimeout(()=>reject(Error('listing blocked on cache')),500))]);
  assert.equal(result.files.length,1);assert(performance.now()-start<500);checks.push('small folder listed despite completely unresponsive cache');
  const chosen=await api.choosePhotos([result.files[0].path]);assert.equal(chosen.files[0].name,'a.jpg');checks.push('import completes despite blocked cache writes');
  const stalled=platform(blocked,{name:'stalled',values:()=>({next:never})});
  const controller=new AbortController();let progress=false;
  const reading=stalled.api.browsePhotos(true,{signal:controller.signal,onProgress:()=>{progress=true}});
  await new Promise(resolve=>setTimeout(resolve,10));controller.abort();
  assert.equal((await reading).canceled,true);assert(progress);checks.push('stalled folder read can be canceled immediately');
  const broken=platform(blocked,{name:'denied',values:()=>({next:()=>Promise.reject(Error('disk unavailable'))})});
  await assert.rejects(broken.api.browsePhotos(true),/disk unavailable/);checks.push('directory errors propagate instead of hanging');
  const context={self:{},indexedDB:{open:()=>({})},setTimeout,clearTimeout,Error};
  vm.runInNewContext(fs.readFileSync(__dirname+'/web-storage.js','utf8'),context);
  await assert.rejects(context.self.borderLabStorage.get('settings','lastFolder'),/超时/);checks.push('unresponsive IndexedDB has bounded wait');
  console.log(checks.join('\n'));
})().catch(error=>{console.error(error);process.exitCode=1});

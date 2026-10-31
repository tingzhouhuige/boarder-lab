const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const never=()=>new Promise(()=>{}),checks=[];
function platform(storage){
  let calls=0,latest,selection=[{name:'a.jpg',webkitRelativePath:'photos/a.jpg'},{name:'notes.txt',webkitRelativePath:'photos/notes.txt'},{name:'nested.jpg',webkitRelativePath:'photos/nested/nested.jpg'}];
  const element={innerHTML:'',setAttribute(){},append(){},addEventListener(){}};
  const context={console,setTimeout,clearTimeout,DOMException,AbortController,performance,
    document:{body:element,createElement:type=>{
      if(type!=='input')return {...element};
      const listeners={};
      return latest={webkitdirectory:false,hidden:false,dataset:{},removed:false,addEventListener(name,fn){listeners[name]=fn},
        remove(){this.removed=true},click(){calls++;if(selection!==null){this.files=selection;queueMicrotask(()=>listeners.change())}}};
    },querySelector:()=>element,addEventListener(){}},Worker:class{},OffscreenCanvas:class{}};
  context.window=context;context.borderLabStorage=storage;
  context.showDirectoryPicker=()=>{throw Error('legacy permission flow must not run')};
  vm.runInNewContext(fs.readFileSync(__dirname+'/web-platform.js','utf8'),context);
  return {api:context.borderLabDesktop,calls:()=>calls,latest:()=>latest,setSelection:value=>{selection=value}};
}
(async()=>{
  const blocked={get:never,put:never,all:never},test=platform(blocked);
  assert.equal((await test.api.browsePhotos(false)).needsFolder,true);assert.equal(test.calls(),0);
  checks.push('initial dialog never waits on saved permissions or cache');
  const listing=test.api.browsePhotos(true);assert.equal(test.calls(),1);
  const result=await Promise.race([listing,new Promise((_,reject)=>setTimeout(()=>reject(Error('listing blocked')),500))]);
  assert.equal(result.files.length,1);assert.equal(result.files[0].name,'a.jpg');checks.push('directory input lists photos despite completely unresponsive cache');
  assert(test.latest().removed);checks.push('native input cleaned up after selection');
  const chosen=await test.api.choosePhotos([result.files[0].path]);assert.equal(chosen.files[0].name,'a.jpg');checks.push('import completes despite blocked persistence');
  const reopened=await test.api.browsePhotos(false);assert.equal(reopened.lastFile,result.files[0].path);assert.equal(test.calls(),1);checks.push('reopening reuses session files and remembers previous photo');
  const controller=new AbortController();test.setSelection(null);
  const reading=test.api.browsePhotos(true,{signal:controller.signal});controller.abort();
  assert.equal((await reading).canceled,true);assert(test.latest().removed);checks.push('canceling a pending native chooser resolves and removes input');
  assert.equal((await test.api.browsePhotos(false)).files.length,1);checks.push('canceling a folder change preserves existing photos');
  test.setSelection([{name:'b.jpg'}]);assert.equal((await test.api.choosePhotoFiles()).files[0].name,'b.jpg');checks.push('direct photo selection bypasses directory permissions');
  const context={self:{},indexedDB:{open:()=>({})},setTimeout,clearTimeout,Error};
  vm.runInNewContext(fs.readFileSync(__dirname+'/web-storage.js','utf8'),context);
  await assert.rejects(context.self.borderLabStorage.get('settings','lastFolder'),/超时/);checks.push('unresponsive IndexedDB has bounded wait');
  console.log(checks.join('\n'));
})().catch(error=>{console.error(error);process.exitCode=1});

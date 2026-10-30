(() => {
  let connection;
  const open=()=>connection||(connection=new Promise((resolve,reject)=>{
    const request=indexedDB.open('border-lab-web',1);
    request.onupgradeneeded=()=>{for(const name of ['settings','folders','thumbnails'])request.result.createObjectStore(name);};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  }));
  const run=async(store,mode,action)=>{
    const db=await open();return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,mode),request=action(tx.objectStore(store));let result;
      request.onsuccess=()=>{result=request.result};
      tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  };
  self.borderLabStorage={get:(store,key)=>run(store,'readonly',s=>s.get(key)),
    put:(store,key,value)=>run(store,'readwrite',s=>s.put(value,key)),
    all:store=>run(store,'readonly',s=>s.getAll())};
})();

(() => {
  let connection;
  const open=()=>connection||(connection=new Promise((resolve,reject)=>{
    const request=indexedDB.open('border-lab-web',1);
    request.onupgradeneeded=()=>{for(const name of ['settings','folders','thumbnails'])request.result.createObjectStore(name);};
    const timer=setTimeout(()=>reject(Error('浏览器缓存读取超时')),1500);
    request.onblocked=()=>{clearTimeout(timer);reject(Error('浏览器缓存被其他页面占用'));};
    request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};request.onerror=()=>{clearTimeout(timer);reject(request.error);};
  }));
  const run=async(store,mode,action)=>{
    const db=await open();return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,mode),request=action(tx.objectStore(store));let result;
      const timer=setTimeout(()=>{reject(Error('浏览器缓存操作超时'));try{tx.abort();}catch{}},1500);
      request.onsuccess=()=>{result=request.result};
      tx.oncomplete=()=>{clearTimeout(timer);resolve(result);};tx.onerror=tx.onabort=()=>{clearTimeout(timer);reject(tx.error);};
    });
  };
  self.borderLabStorage={get:(store,key)=>run(store,'readonly',s=>s.get(key)),
    put:(store,key,value)=>run(store,'readwrite',s=>s.put(value,key)),
    all:store=>run(store,'readonly',s=>s.getAll())};
})();

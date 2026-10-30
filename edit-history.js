// Editing snapshots share immutable image/file resources; only editable values
// are copied. The history is session-local and never attempts to undo exports.
(() => {
  const limit = 100;
  let states = [], position = -1, restoring = false, timer, gesture = false;
  const retiredUrls = new Set();
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const capture = () => ({
    design: currentDesignSettings(),
    photos: photoItems.map(item => ({...item, settings: clone(item.id === currentPhotoId ? currentDesignSettings() : item.settings), exif: clone(item.exif), imagePromise:null, metadataPromise:null, thumbnailPromise:null})),
    currentPhotoId, nextPhotoId, photoOrientation, photoRotation,
    designSettingsModified, applyToAllEnabled,
    editorial: clone(editorialSettingsByOrientation),
    viewport: [previewScale,previewOffsetX,previewOffsetY],
    export: [exportRounded.checked,exportQualityRange.value,exportSizeSelect.value],
    watermark: [watermarkImage.getAttribute('src') || '',watermarkFileName.textContent],
    theme: document.documentElement.dataset.theme
  });
  const key = state => { const {nextPhotoId:ignored,...values}=state; return JSON.stringify({...values, photos:state.photos.map(item => ({
    id:item.id,url:item.url,settings:item.settings,rotation:item.rotation,layoutOrientation:item.layoutOrientation,settingsInitialized:item.settingsInitialized
  }))}); };
  const collect = () => {
    const retained = new Set([...photoItems,...states.flatMap(state=>state.photos)].map(item=>item.url));
    for (const url of retiredUrls) if (!retained.has(url)) {URL.revokeObjectURL(url);retiredUrls.delete(url);}
  };
  const commit = () => {
    clearTimeout(timer);
    if (restoring) return;
    const state = capture(); state.key = key(state);
    if (state.key === states[position]?.key) return;
    states.splice(position+1); states.push(state);
    if (states.length>limit+1) states.shift();
    position=states.length-1; collect();
  };
  const restore = async state => {
    const shell=document.querySelector('.app-shell');
    restoring=true; shell.inert=true;
    try {
      removeInlineWatermarkEditor();
      for(const item of photoItems) if(item.objectUrlOwned) retiredUrls.add(item.url);
      photoItems=state.photos.map(item=>({...item,settings:clone(item.settings),exif:clone(item.exif)}));
      currentPhotoId=state.currentPhotoId; nextPhotoId=Math.max(nextPhotoId,state.nextPhotoId);
      const item=photoItems.find(photo=>photo.id===currentPhotoId);
      if(item) await Promise.all([ensurePhotoImage(item),ensurePhotoMetadata(item)]);
      syncCurrentPhotoState(item);
      photoOrientation=state.photoOrientation;photoRotation=state.photoRotation;
      applyDesignSettings(state.design);
      designSettingsModified=state.designSettingsModified;
      applyToAllEnabled=state.applyToAllEnabled;
      Object.assign(editorialSettingsByOrientation,clone(state.editorial));
      applyAllButton.classList.toggle('active',applyToAllEnabled);
      applyAllButton.setAttribute('aria-pressed',String(applyToAllEnabled));
      const syncLabel=applyToAllEnabled?'全部照片参数同步已启用，点击关闭':'全部照片参数同步已关闭，点击启用';
      applyAllButton.title=syncLabel;applyAllButton.setAttribute('aria-label',syncLabel);
      [exportRounded.checked,exportQualityRange.value,exportSizeSelect.value]=state.export;
      syncCustomSelectDisplay(exportSizeSelect);
      const watermarkChanged=(watermarkImage.getAttribute('src')||'')!==state.watermark[0] || watermarkFileName.textContent!==state.watermark[1];
      if((watermarkImage.getAttribute('src')||'')!==state.watermark[0]) {
        if(state.watermark[0]) watermarkImage.src=state.watermark[0];else watermarkImage.removeAttribute('src');
      }
      watermarkFileName.textContent=state.watermark[1];
      if(watermarkChanged) window.borderLabDesktop?.saveWatermark?.(state.watermark[0],state.watermark[1]).catch(error=>console.error('Unable to save restored watermark',error));
      if(document.documentElement.dataset.theme!==state.theme) document.getElementById('themeToggle').click();
      [previewScale,previewOffsetX,previewOffsetY]=state.viewport;
      invertedWatermarkCanvas=null;invertedWatermarkCanvasKey='';previewCache.clear();
      photoList.replaceChildren();updatePhotoList();updateImageMetaLabel();
      updateLabels();updateExportQualityState();refreshExportButtonText();updatePreviewCornerRadius();syncAllRangeFills();
      applyPreviewViewport();renderPreview();collect();
    } finally {shell.inert=false;restoring=false;}
  };
  const travel = async direction => {
    if(restoring)return;
    commit();
    const next=position+direction;
    if(next<0||next>=states.length)return;
    const previous=position;
    try {await restore(states[next]);position=next;}
    catch(error){console.error('Unable to restore edit',error);await restore(states[previous]);}
  };
  editHistory={commit,retain:url=>retiredUrls.add(url),undo:()=>travel(-1),redo:()=>travel(1),
    get length(){return states.length},get position(){return position}};
  // No canvas pixels or binary buffers participate in comparison.
  const schedule = event => {
    if(restoring || event.target.closest?.('dialog') || event.target.type==='file')return;
    if(event.target.closest?.('.photo-card'))return;
    clearTimeout(timer);
    if(event.type==='input') {if(!gesture)timer=setTimeout(commit,450);}
    else queueMicrotask(commit);
  };
  document.addEventListener('pointerdown',event=>{
    if(restoring)return;
    if(timer)commit();
    gesture=event.target.matches?.('input[type="range"]')||event.target===canvasFrame;
  },true);
  const endGesture=event=>{gesture=false;if(!event.target.closest?.('dialog'))queueMicrotask(commit);};
  document.addEventListener('pointerup',endGesture);
  document.addEventListener('pointercancel',endGesture);
  for(const name of ['input','change','click','dblclick'])document.addEventListener(name,schedule);
  canvasFrame.addEventListener('wheel',()=>{clearTimeout(timer);timer=setTimeout(commit,450);},{passive:true});
  document.addEventListener('keydown',event=>{
    if(!(event.ctrlKey||event.metaKey)||event.altKey||event.key.toLowerCase()!=='z')return;
    if(document.querySelector('dialog[open]')||!confirmDialog.classList.contains('hidden'))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.shiftKey)editHistory.redo();else editHistory.undo();
  },true);
  commit();
})();

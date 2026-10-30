// Keep selection and scrolling under application control rather than relying
// on the system dialog's filename field to select an item in its shell view.
(() => {
  let active = false;
  window.openRememberingPhotoPicker = async () => {
    if (active) return { canceled: true };
    active = true;
    const previousFocus = document.activeElement;
    const modal = document.createElement("dialog");
    modal.className = "remember-photo-picker";
    modal.setAttribute("aria-label", "导入照片");
    modal.innerHTML = `<header><strong>导入照片</strong><button type="button" data-folder>更换文件夹</button></header>
      <p data-path></p><p data-status role="status"></p>
      <div class="remember-photo-grid" role="group" aria-label="照片列表"></div>
      <footer><span>单击单选 · Ctrl 多选 · Shift 连选 · 双击导入</span><button type="button" data-cancel>取消</button><button type="button" data-import disabled>导入选中照片</button></footer>`;
    document.body.append(modal);
    const grid = modal.querySelector(".remember-photo-grid");
    const surface = document.createElement("div");
    surface.className = "remember-photo-surface";
    grid.append(surface);
    const cards = new Map();
    const status = modal.querySelector("[data-status]");
    const confirm = modal.querySelector("[data-import]");
    const folder = modal.querySelector("[data-folder]");
    const selected = new Set();
    let anchor = null;
    let files = [], busy = false, observer, lastFile, renderWindow = () => {};
    let windowStart = -1, windowEnd = -1;
    let scrolling = false, pointerHeld = false, idleTimer, frame = 0, lastWidth = 0;
    const settle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (pointerHeld) return;
        scrolling = false;
        for (const img of visibleImages) if (img.dataset.loading === "canceled") delete img.dataset.loading;
        renderWindow(); pumpThumbnails();
      }, 350);
    };
    const pauseLoads = () => { clearTimeout(backgroundTimer); return window.borderLabDesktop.pauseThumbnails?.().catch(() => {}); };
    const interact = () => {
      if (!scrolling) pauseLoads();
      scrolling = true; settle();
    };
    const columns = () => Math.max(1, Math.floor((grid.clientWidth - 12 + 12) / (145 + 12)));
    const showIndex = index => {
      grid.scrollTop = Math.max(0, Math.floor(index / columns()) * 176 - grid.clientHeight / 2 + 82);
      renderWindow();
    };
    grid.addEventListener("scroll", () => {
      interact();
      // Keep lightweight frames and filenames visible while scrolling. Image
      // requests and image attachment remain paused until input has settled.
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; renderWindow(); });
    }, { passive: true });
    grid.addEventListener("wheel", interact, { passive: true });
    grid.addEventListener("pointerdown", () => { pointerHeld = true; interact(); }, { passive: true });
    const releasePointer = () => { if (pointerHeld) { pointerHeld = false; settle(); } };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("blur", releasePointer);
    const resize = new ResizeObserver(() => { windowStart = -1; renderWindow(); });
    resize.observe(grid);
    const visibleImages = new Set();
    const previewCache = new Map();
    const warmed = new Set();
    let backgroundTimer, warmCursor = 0, folderGeneration = 0;
    const warmNext = () => {
      if (!modal.isConnected || scrolling || busy || thumbnailJobs || !files.length) return;
      let index = null;
      for (let checked=0; checked<files.length; checked++) {
        const candidate=warmCursor++ % files.length;
        if (!warmed.has(files[candidate].path)) {index=candidate;break;}
      }
      if(index===null || !window.borderLabDesktop.photoThumbnail)return;
      const file=files[index], generation=folderGeneration;
      thumbnailJobs++;
      window.borderLabDesktop.photoThumbnail(file.path).then(url=>{
        if(generation!==folderGeneration)return;
        if(url || !scrolling)warmed.add(file.path);
      }).catch(()=>{if(generation===folderGeneration)warmed.add(file.path);}).finally(()=>{
        thumbnailJobs--;pumpThumbnails();
      });
    };
    let thumbnailJobs = 0;
    const pumpThumbnails = () => {
      if (!modal.isConnected || busy || scrolling) return;
      // IntersectionObserver delivery order is not viewport priority. Rank the
      // current cards afresh after every scroll: visible rows first, starting
      // nearest the center of the viewport, then the overscan rows.
      const viewportTop = grid.scrollTop;
      const viewportBottom = viewportTop + grid.clientHeight;
      const viewportCenter = (viewportTop + viewportBottom) / 2;
      const count = columns();
      const priority = img => {
        const index = Number(img.closest("button").dataset.index);
        const top = Math.floor(index / count) * 176;
        const visible = top + 164 > viewportTop && top < viewportBottom;
        return (visible ? 0 : 1000000) + Math.abs(top + 82 - viewportCenter);
      };
      const candidates = [...visibleImages].filter(img => img.isConnected)
        .sort((a, b) => priority(a) - priority(b));
      for (const img of candidates) {
        if (thumbnailJobs >= 1) break;
        if (previewCache.has(img.dataset.path)) {
          if (!img.getAttribute("src")) img.src = previewCache.get(img.dataset.path);
          continue;
        }
        if (img.dataset.loading || img.getAttribute("src")) continue;
        img.dataset.loading = "true";
        thumbnailJobs++;
        const request = window.borderLabDesktop.photoThumbnail
          ? window.borderLabDesktop.photoThumbnail(img.dataset.path)
          : Promise.resolve(img.dataset.src);
        Promise.resolve(request).then(url => {
          if (!url) { img.dataset.loading = scrolling ? "canceled" : "failed"; return; }
          if (url && img.isConnected) {
            warmed.add(img.dataset.path);
            if (!scrolling) img.src = url;
            previewCache.delete(img.dataset.path); previewCache.set(img.dataset.path, url);
            while (previewCache.size > 128) previewCache.delete(previewCache.keys().next().value);
          }
        }).catch(() => { img.alt = "预览不可用"; }).finally(() => {
          thumbnailJobs--; pumpThumbnails();
        });
      }
      clearTimeout(backgroundTimer);
      if(!thumbnailJobs)backgroundTimer=setTimeout(warmNext,150);
    };
    let finish;
    const result = new Promise(resolve => { finish = resolve; });
    const close = value => { pauseLoads(); window.removeEventListener("pointerup", releasePointer); window.removeEventListener("pointercancel", releasePointer); window.removeEventListener("blur", releasePointer); clearTimeout(idleTimer); cancelAnimationFrame(frame); resize.disconnect(); observer?.disconnect(); visibleImages.clear(); modal.close(); modal.remove(); active = false; previousFocus?.focus(); finish(value); };
    const update = () => {
      confirm.disabled = busy || !selected.size;
      status.textContent = `${files.length} 张照片，已选择 ${selected.size} 张`;
      for (const button of grid.querySelectorAll("button[data-path]")) button.setAttribute("aria-pressed", String(selected.has(button.dataset.path)));
    };
    const select = (index, event) => {
      if (busy) return;
      const additive = event.ctrlKey || event.metaKey;
      if (event.shiftKey) {
        if (anchor === null) anchor = index;
        if (!additive) selected.clear();
        for (let i = Math.min(anchor, index); i <= Math.max(anchor, index); i++) selected.add(files[i].path);
      } else if (additive) {
        selected.has(files[index].path) ? selected.delete(files[index].path) : selected.add(files[index].path);
        anchor = index;
      } else {
        selected.clear(); selected.add(files[index].path); anchor = index;
      }
      update();
    };
    grid.addEventListener("click", event => {
      if (!busy && (event.target === grid || event.target === surface) && !event.ctrlKey && !event.shiftKey) { selected.clear(); anchor = null; update(); }
    });
    grid.addEventListener("keydown", event => {
      if (busy) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault(); files.forEach(file => selected.add(file.path)); update(); return;
      }
      const current = Number(document.activeElement.dataset.index);
      if (!Number.isInteger(current)) return;
      if (event.key === "Enter") { event.preventDefault(); commit(); return; }
      const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns(), ArrowDown: columns() };
      let next;
      if (event.key in offsets) next = Math.max(0, Math.min(files.length - 1, current + offsets[event.key]));
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = files.length - 1;
      else return;
      event.preventDefault();
      if (event.shiftKey && anchor === null) anchor = current;
      if (!event.ctrlKey || event.shiftKey) select(next, event);
      showIndex(next);
      grid.querySelector(`[data-index="${next}"]`).focus({ preventScroll: true });
    });
    const commit = async () => {
      if (busy || !selected.size) return;
      busy = true; confirm.disabled = true; folder.disabled = true;
      try { close(await window.borderLabDesktop.choosePhotos([...selected])); }
      catch (error) { busy = false; folder.disabled = false; update(); status.textContent = `导入失败：${error.message}`; }
    };
    const load = async changeFolder => {
      if (busy) return;
      busy = true; folder.disabled = true; confirm.disabled = true;
      pauseLoads();
      visibleImages.clear(); observer?.disconnect();
      status.textContent = "正在读取文件夹…";
      try {
        const data = await window.borderLabDesktop.browsePhotos(changeFolder);
        if (data.canceled) { if (!files.length) close({ canceled: true }); else { windowStart = -1; renderWindow(); } return; }
        observer?.disconnect(); visibleImages.clear(); previewCache.clear(); warmed.clear(); folderGeneration++; selected.clear(); anchor = null; files = data.files;
        modal.querySelector("[data-path]").textContent = data.directory;
        lastFile = data.lastFile;
        cards.clear(); surface.replaceChildren(); lastWidth = 0;
        renderWindow = () => {
        if (!modal.isConnected) return;
        const count = columns();
        const width = (grid.clientWidth - 12 - (count - 1) * 12) / count;
        surface.style.height = `${Math.max(0, Math.ceil(files.length / count) * 176 - 12)}px`;
        const start = Math.max(0, Math.floor(grid.scrollTop / 176) - 2) * count;
        const end = Math.min(files.length, (Math.ceil((grid.scrollTop + grid.clientHeight) / 176) + 2) * count);
        if (start === windowStart && end === windowEnd && width === lastWidth) return;
        lastWidth = width;
        windowStart = start; windowEnd = end;
        const focused = grid.contains(document.activeElement) ? document.activeElement.dataset.index : null;
        if (!observer) observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) visibleImages.add(entry.target);
            else visibleImages.delete(entry.target);
          }
          pumpThumbnails();
        }, { root: grid, rootMargin: "200px" });
        for (const [index, button] of cards) {
          if (index < start || index >= end) {
            const img = button.querySelector("img");
            observer.unobserve(img); visibleImages.delete(img); button.remove(); cards.delete(index);
          }
        }
        for (let index = start; index < end; index++) {
          const file = files[index];
          if (cards.has(index)) {
            const button = cards.get(index);
            button.style.cssText = `position:absolute;left:${index % count * (width + 12)}px;top:${Math.floor(index / count) * 176}px;width:${width}px`;
            observer.observe(button.querySelector("img"));
            continue;
          }
          const button = document.createElement("button");
          button.style.cssText = `position:absolute;left:${index % count * (width + 12)}px;top:${Math.floor(index / count) * 176}px;width:${width}px`;
          button.type = "button"; button.dataset.path = file.path; button.dataset.index = index;
          button.setAttribute("aria-pressed", String(selected.has(file.path)));
          const img = document.createElement("img");
          img.alt = ""; img.dataset.src = file.url; img.dataset.path = file.path; img.decoding = "async";
          if (!scrolling && previewCache.has(file.path)) img.src = previewCache.get(file.path);
          const label = document.createElement("span"); label.textContent = file.name;
          button.title = file.name; button.append(img, label);
          button.addEventListener("click", event => select(index, event));
          button.addEventListener("dblclick", () => { if (busy) return; selected.add(file.path); update(); commit(); });
          surface.append(button); cards.set(index, button); observer.observe(img);
          if (file.path === lastFile) {
            button.classList.add("last-photo");
            const badge = document.createElement("small");
            badge.className = "last-photo-badge"; badge.textContent = "上次导入";
            button.append(badge);
          }
        }
        if (focused != null) grid.querySelector(`[data-index="${focused}"]`)?.focus({ preventScroll: true });
        };
        windowStart = -1; windowEnd = -1;
        grid.scrollTop = 0; renderWindow();
        const rememberedIndex = files.findIndex(file => file.path === lastFile);
        warmCursor=Math.max(0,rememberedIndex);
        if (rememberedIndex >= 0) showIndex(rememberedIndex);
      } catch (error) { status.textContent = `读取失败：${error.message}。请更换文件夹重试。`; return; }
      finally { busy = false; folder.disabled = false; confirm.disabled = !selected.size; pumpThumbnails(); }
      if (files.length) update();
    };
    modal.addEventListener("cancel", event => { event.preventDefault(); if (!busy) close({ canceled: true }); });
    modal.querySelector("[data-cancel]").onclick = () => { if (!busy) close({ canceled: true }); };
    folder.onclick = () => load(true); confirm.onclick = commit;
    modal.showModal();
    await load(false);
    return result;
  };
})();

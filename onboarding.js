(() => {
  const key = 'border-lab-intro-v1';
  const help = document.createElement('button');
  help.type = 'button'; help.className = 'intro-help'; help.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M7.8 7.5a2.3 2.3 0 0 1 4.4 1c0 1.6-2.2 1.8-2.2 3.3"/><circle cx="10" cy="14" r=".7" fill="currentColor" stroke="none"/></svg>';
  help.title = '基础操作教程'; help.setAttribute('aria-label', help.title);
  const tools = document.createElement('div'); tools.className = 'brand-tools';
  const brand = document.querySelector('.brand-block');
  const fullscreen = brand.querySelector('.web-fullscreen-toggle');
  if(fullscreen) tools.appendChild(fullscreen);

  tools.append(help,document.getElementById('themeToggle'));
  brand.appendChild(tools);
  const steps = [
    ['#uploadButton', '导入照片', '点击这里选择照片，也可以把照片拖入预览区。支持一次导入多张。'],
    ['#templateList', '选择边框', '在底部切换模板。白框、侧栏和水印都有各自的样式。'],
    ['.control-panel-scroll', '调整效果', '在左侧拖动滑块或输入数字微调。预览中的文字也可以双击编辑。'],
    ['.action-row', '导出成片', '导出当前照片，或一次导出全部照片。“恢复默认”可重置当前设计。']
  ];
  let dialog, index = 0, previousFocus, scrollTop;
  const seen = () => { try { return localStorage.getItem(key) === 'seen'; } catch { return false; } };
  const remember = () => { try { localStorage.setItem(key, 'seen'); } catch {} };
  const position = () => {
    if (!dialog?.open) return;
    const target = document.querySelector(steps[index][0]);
    const rect = target.getBoundingClientRect();
    const x = Math.max(8, rect.left - 5), y = Math.max(8, rect.top - 5);
    const right = Math.min(innerWidth - 8, rect.right + 5), bottom = Math.min(innerHeight - 8, rect.bottom + 5);
    const spot = dialog.querySelector('.intro-spot');
    Object.assign(spot.style, {left: x+'px',top:y+'px',width:Math.max(0,right-x)+'px',height:Math.max(0,bottom-y)+'px'});
    const card = dialog.querySelector('.intro-card');
    const width = Math.min(320, innerWidth - 32);
    card.style.width = width+'px';
    const left = Math.max(16,Math.min(innerWidth-width-16,right+18));
    let top = Math.max(16,Math.min(innerHeight-card.offsetHeight-16,y));
    if(left<right && left+width>x) top = bottom+18+card.offsetHeight<innerHeight ? bottom+18 : Math.max(16,y-card.offsetHeight-18);
    Object.assign(card.style,{left:left+'px',top:top+'px'});
  };
  const showStep = () => {
    const [selector,title,copy] = steps[index];
    const target = document.querySelector(selector);
    if (index !== 2) target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    dialog.querySelector('.intro-count').textContent = `${index+1} / ${steps.length}`;
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('p').textContent = copy;
    dialog.querySelector('[data-prev]').disabled = index===0;
    dialog.querySelector('[data-next]').textContent = index===steps.length-1 ? '开始使用' : '下一步';
    position();
  };
  const close = () => {
    if(!dialog) return;
    remember(); dialog.close(); dialog.remove(); dialog=null;
    window.removeEventListener('resize',position);
    document.removeEventListener('scroll',position,true);
    document.querySelector('.control-panel-scroll').scrollTop = scrollTop;
    previousFocus?.focus({preventScroll:true});
  };
  const start = () => {
    if(dialog) return;
    previousFocus=document.activeElement;
    scrollTop=document.querySelector('.control-panel-scroll').scrollTop;
    index=0; dialog=document.createElement('dialog'); dialog.className='intro-dialog';
    dialog.setAttribute('aria-labelledby','intro-title'); dialog.setAttribute('aria-describedby','intro-copy');
    dialog.innerHTML=`<div class="intro-spot" aria-hidden="true"></div><section class="intro-card"><div class="intro-top"><span class="intro-count"></span><button type="button" data-skip>跳过教程</button></div><h2 id="intro-title"></h2><p id="intro-copy"></p><footer><button type="button" data-prev>上一步</button><button type="button" data-next>下一步</button></footer></section>`;
    dialog.querySelector('[data-skip]').onclick=close;
    dialog.querySelector('[data-prev]').onclick=()=>{if(index>0){index--;showStep();}};
    dialog.querySelector('[data-next]').onclick=()=>{if(index===steps.length-1)close();else{index++;showStep();}};
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    document.body.appendChild(dialog);dialog.showModal();showStep();
    dialog.querySelector('[data-next]').focus();
    window.addEventListener('resize',position);document.addEventListener('scroll',position,true);
  };
  help.onclick=start;
  setTimeout(()=>{if(!seen()&&!document.querySelector('dialog[open],.dialog-backdrop:not(.hidden)'))start();},900);
})();

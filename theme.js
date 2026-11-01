(() => {
  const button = document.getElementById('themeToggle');
  const apply = (dark) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const label = dark ? '切换浅色模式' : '切换深色模式';
    button.innerHTML = dark ? "<svg viewBox=\"0 0 20 20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"10\" cy=\"10\" r=\"3.2\"/><path d=\"M10 1.7v1.6m0 13.4v1.6M1.7 10h1.6m13.4 0h1.6M4.1 4.1l1.2 1.2m9.4 9.4 1.2 1.2M4.1 15.9l1.2-1.2m9.4-9.4 1.2-1.2\"/></svg>" : "<svg viewBox=\"0 0 20 20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M16.8 12.2A7.1 7.1 0 0 1 7.8 3.2a7.2 7.2 0 1 0 9 9Z\"/></svg>";
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(dark));
  };
  let saved;
  try { saved = localStorage.getItem('border-lab-theme'); } catch {}
  apply(saved === 'dark');
  button.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    apply(dark);
    try { localStorage.setItem('border-lab-theme', dark ? 'dark' : 'light'); } catch {}
  });
})();

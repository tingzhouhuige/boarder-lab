(() => {
  const button = document.getElementById('themeToggle');
  const apply = (dark) => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const label = dark ? '切换浅色模式' : '切换深色模式';
    button.textContent = dark ? '☀' : '☾';
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

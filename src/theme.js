/* ---------- Tema claro e escuro ---------- */
(function(){
  var root = document.documentElement, opts = document.querySelectorAll('[data-theme-set]');
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function current(){ return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function mark(){ var c = current(); opts.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.themeSet === c)); }); }
  opts.forEach(function(b){
    b.addEventListener('click', function(){
      root.setAttribute('data-theme', b.dataset.themeSet);
      try { localStorage.setItem('tema', b.dataset.themeSet); } catch(e){}
      mark();
    });
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', mark);
  mark();
})();

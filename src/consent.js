/* ---------- Aviso de cookies + modo de consentimento do Google ----------
   O padrão (tudo negado) é definido no <head> do index.html, antes do Google Analytics.
   Aqui a pessoa escolhe; a escolha fica no aparelho dela e pode ser mudada pelo
   link "Cookies" do rodapé ou na página de privacidade. Anúncios ficam sempre negados. */
(function(){
  var KEY = 'consentimento-estatisticas';
  var root = document.documentElement, box = document.getElementById('consent');

  function get(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }
  function save(v){ try { localStorage.setItem(KEY, v); } catch(e){} }

  /* Recusou depois de ter aceitado: apaga os cookies do Google Analytics já gravados */
  function clearGa(){
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function(c){
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        ['', '; domain=' + host, '; domain=.' + host].forEach(function(d){
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  function apply(v){
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: v === 'aceito' ? 'granted' : 'denied' });
    if (v !== 'aceito') clearGa();
  }

  /* Texto e botões da página de privacidade (quando existirem) */
  function mark(){
    var v = get();
    document.querySelectorAll('[data-consent-status]').forEach(function(el){
      el.textContent = v === 'aceito' ? 'Hoje: você permitiu a contagem da sua visita.'
        : v === 'recusado' ? 'Hoje: você não permitiu a contagem da sua visita.'
        : 'Hoje: você ainda não escolheu. Sem escolha, nada é guardado.';
    });
    document.querySelectorAll('.consent-inline [data-consent]').forEach(function(b){
      b.setAttribute('aria-pressed', String(b.dataset.consent === v));
    });
  }

  function show(){
    if (!box) return;
    box.hidden = false; root.classList.add('consent-open');
  }
  function hide(){
    if (!box) return;
    box.hidden = true; root.classList.remove('consent-open');
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-consent]');
    if (b){
      var v = b.dataset.consent;
      save(v); apply(v); mark();
      if (box && box.contains(b)) hide();
      return;
    }
    if (e.target.closest('[data-cookie-prefs]')){
      show();
      var first = box && box.querySelector('[data-consent]');
      if (first) first.focus();
    }
  });

  if (box && !get()) show();
  mark();
})();

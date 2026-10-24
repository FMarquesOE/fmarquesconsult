(function(){
  var WA = "https://wa.me/5521976822900?text=Oi%20Felipe%2C%20preciso%20da%20sua%20ajuda%21";
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- 1. Demonstração no celular (roda uma vez e para) ---------- */
  var scenes = [
    {q:"manicure perto de mim", cat:"Manicure", msg:"Oi! Te achei no Google. Tem horário amanhã?"},
    {q:"bolo de aniversário em caxias", cat:"Confeitaria", msg:"Oi! Vi vocês no Google. Fazem bolo para sábado?"},
    {q:"conserto de celular perto de mim", cat:"Assistência técnica", msg:"Oi! Achei vocês no Google. Vocês trocam tela?"},
    {q:"salão de beleza aberto agora", cat:"Salão de beleza", msg:"Oi! Te achei no Google. Ainda dá pra encaixar hoje?"}
  ];
  var si = 0, timers = [];
  var qEl = document.getElementById('q'), caret = document.getElementById('caret'),
      results = document.getElementById('results'), notif = document.getElementById('notif'),
      pin = document.getElementById('pin'), replay = document.getElementById('replay'),
      cat = document.getElementById('cat'), msg = document.getElementById('msg');
  function clearT(){ timers.forEach(clearTimeout); timers = []; }
  function at(ms, fn){ timers.push(setTimeout(fn, ms)); }
  function play(s){
    clearT();
    cat.textContent = s.cat; msg.textContent = s.msg;
    if (reduce){ qEl.textContent = s.q; return; }
    qEl.textContent = ''; caret.hidden = false;
    results.classList.add('hide'); notif.classList.add('hide');
    pin.classList.remove('drop'); replay.classList.add('invisible');
    var t = 350, step = 55;
    for (var i = 0; i < s.q.length; i++){
      (function(n){ at(t + n*step, function(){ qEl.textContent = s.q.slice(0, n+1); }); })(i);
    }
    t += s.q.length*step + 350;
    at(t, function(){ caret.hidden = true; results.classList.remove('hide'); void pin.offsetWidth; pin.classList.add('drop'); });
    at(t + 1500, function(){ notif.classList.remove('hide'); });
    at(t + 2300, function(){ replay.classList.remove('invisible'); });
  }
  replay.addEventListener('click', function(){ si = (si + 1) % scenes.length; play(scenes[si]); });
  setTimeout(function(){ play(scenes[0]); }, 700);

  /* ---------- 2. Você se reconhece? (os ✓ se desenham ao chegar) ---------- */
  var pains = document.getElementById('pains');
  if (!reduce && hasIO && pains.getBoundingClientRect().top > innerHeight){
    pains.classList.add('arm');
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ pains.classList.add('in'); io.disconnect(); } });
    }, {threshold:.4});
    io.observe(pains);
  }

  /* ---------- 3. Como funciona (a linha se desenha com a rolagem) ---------- */
  var steps = document.getElementById('steps'), stepEls = steps.querySelectorAll('.step'), ticking = false;
  function updSteps(){
    ticking = false;
    var r = steps.getBoundingClientRect(), vh = innerHeight;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (vh*0.72 - r.top) / (r.height*0.9)));
    steps.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach(function(el, i){ el.classList.toggle('on', p >= i / (stepEls.length - 1) - 0.02); });
  }
  addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(updSteps); } }, {passive:true});
  addEventListener('resize', updSteps);
  updSteps();

  /* ---------- 4. Teste interativo ---------- */
  var Q = [
    {q:"Quando alguém procura pelo que você vende, seu negócio aparece no Google Maps?", ok:"Aparece no Google Maps", no:"Ainda não aparece no Google Maps"},
    {q:"Seu negócio tem um site próprio, além do Instagram?", ok:"Tem site próprio", no:"Depende só do Instagram"},
    {q:"A cliente consegue falar com você no WhatsApp com um toque, direto do Google ou do Instagram?", ok:"WhatsApp a um toque", no:"WhatsApp difícil de achar"},
    {q:"Você pede para as clientes satisfeitas deixarem avaliação no Google?", ok:"Pede avaliações", no:"Não pede avaliações"},
    {q:"Você sabe quanto sobrou de lucro no mês passado, separado do dinheiro da casa?", ok:"Sabe quanto sobrou no mês", no:"Não sabe quanto sobrou"}
  ];
  var R = [
    {lv:1, t:"Seu negócio ainda está escondido", d:"Hoje, quem procura pelo que você vende provavelmente encontra outro lugar. O primeiro passo é aparecer no Google com endereço, horário e WhatsApp.", s:"Presença no Google", p:"p-google"},
    {lv:2, t:"Você já começou, mas está deixando cliente pelo caminho", d:"Algumas portas já estão abertas. Com um site próprio e o WhatsApp a um toque, quem te encontra fala com você na hora.", s:"Vitrine Digital", p:"p-vitrine"},
    {lv:3, t:"Falta pouco", d:"Seu negócio já aparece. Agora é organizar: avaliações, captação de clientes e saber o que sobra no fim do mês.", s:"Negócio Organizado", p:"p-organizado"},
    {lv:4, t:"Seu negócio está bem encaminhado", d:"A base está feita. No diagnóstico, a gente procura juntos o próximo passo para crescer.", s:"um diagnóstico para achar o próximo passo"}
  ];
  var box = document.getElementById('quiz'), idx = 0, ans = [];
  function esc(s){ return s.replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function progress(n){
    var h = '<div class="progress" aria-hidden="true">';
    for (var i = 0; i < Q.length; i++) h += '<div class="seg' + (i < n ? ' done' : '') + '"><i></i></div>';
    return h + '</div>';
  }
  function render(anim){
    if (idx < Q.length){
      box.innerHTML = progress(idx) +
        '<div class="' + (anim ? 'swap' : '') + '">' +
        '<p class="qcount">Pergunta ' + (idx+1) + ' de ' + Q.length + '</p>' +
        '<p class="qtext">' + esc(Q[idx].q) + '</p>' +
        '<div class="answers"><button class="ans" id="ans-sim" type="button" data-v="1">Sim</button><button class="ans" id="ans-nao" type="button" data-v="0">Não</button></div>' +
        (idx > 0 ? '<button class="back" id="ans-back" type="button">← Voltar</button>' : '') +
        '</div>';
      return;
    }
    var score = ans.reduce(function(a,b){ return a+b; }, 0);
    var r = score <= 1 ? R[0] : score <= 3 ? R[1] : score === 4 ? R[2] : R[3];
    var lv = '<div class="levels" aria-hidden="true">';
    for (var i = 1; i <= 4; i++) lv += '<div class="lv"><i></i></div>';
    lv += '</div>';
    var list = '<ul class="checklist">';
    Q.forEach(function(q, i){
      list += ans[i] ? '<li class="ok"><span class="s">✓</span>' + esc(q.ok) + '</li>' : '<li class="no"><span class="s">○</span>' + esc(q.no) + '</li>';
    });
    list += '</ul>';
    box.innerHTML = '<div class="' + (anim ? 'swap' : '') + '">' +
      '<p class="rlabel">Seu resultado · nível ' + r.lv + ' de 4</p>' + lv +
      '<h3 class="rtitle">' + esc(r.t) + '</h3>' +
      '<p class="rtext">' + esc(r.d) + '</p>' + list +
      '<div class="suggest">Por onde eu começaria: <strong>' + (r.p ? '<a href="#' + r.p + '" data-plan="' + r.p + '">' + esc(r.s) + '</a>' : esc(r.s)) + '</strong></div>' +
      '<div class="r-actions"><a class="btn" href="' + WA + '" target="_blank" rel="noopener">Quero ajuda com isso</a>' +
      '<button class="ghost" id="ans-redo" type="button">Refazer o teste</button></div></div>';
    box.querySelectorAll('.lv').forEach(function(b, i){
      if (i < r.lv){ if (reduce) b.classList.add('on'); else setTimeout(function(){ b.classList.add('on'); }, 150 + i*180); }
    });
  }
  box.addEventListener('click', function(e){
    var link = e.target.closest('a[data-plan]');
    if (link){
      e.preventDefault();
      var card = document.getElementById(link.dataset.plan);
      card.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
      card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
      return;
    }
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.v !== undefined){
      ans[idx] = Number(t.dataset.v); idx++;
      render(true);
      var segs = box.querySelectorAll('.seg');
      if (segs[idx-1]) { segs[idx-1].classList.remove('done'); void segs[idx-1].offsetWidth; segs[idx-1].classList.add('done'); }
    } else if (t.id === 'ans-back'){ idx--; render(true); }
    else if (t.id === 'ans-redo'){ idx = 0; ans = []; render(true); }
  });
  render(false);

  /* ---------- 6. Antes e depois arrastável ---------- */
  var ba = document.getElementById('ba'), range = document.getElementById('ba-range'), hint = document.getElementById('ba-hint');
  var dragging = false, touched = false;
  function setPos(v){ v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--pos', v + '%'); range.value = Math.round(v); }
  function firstTouch(){ if (!touched){ touched = true; hint.classList.add('hide'); } }
  function fromEvent(e){ var r = ba.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
  ba.addEventListener('pointerdown', function(e){ dragging = true; firstTouch(); try{ ba.setPointerCapture(e.pointerId); }catch(_){} setPos(fromEvent(e)); });
  ba.addEventListener('pointermove', function(e){ if (dragging) setPos(fromEvent(e)); });
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){ ba.addEventListener(t, function(){ dragging = false; }); });
  range.addEventListener('input', function(){ firstTouch(); setPos(Number(range.value)); });
  ba.addEventListener('click', function(){ range.focus({preventScroll:true}); });
  /* Uma dica de movimento, uma vez, quando o case aparece na tela */
  if (!reduce && hasIO){
    var bio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        bio.disconnect();
        if (touched) return;
        var start = null, dur = 1400;
        function frame(ts){
          if (touched) return;
          if (!start) start = ts;
          var k = Math.min(1, (ts - start) / dur);
          setPos(50 - 16 * Math.sin(k * Math.PI));
          if (k < 1) requestAnimationFrame(frame);
        }
        setTimeout(function(){ requestAnimationFrame(frame); }, 400);
      });
    }, {threshold:.6});
    bio.observe(ba);
  }
  setTimeout(function(){ if (!touched) hint.classList.add('hide'); }, 15000);

  /* ---------- Perguntas: só uma aberta por vez ---------- */
  var dets = document.querySelectorAll('.faq details');
  dets.forEach(function(d){ d.addEventListener('toggle', function(){ if (d.open) dets.forEach(function(o){ if (o !== d) o.open = false; }); }); });

  /* ---------- Balão do WhatsApp: aparece uma vez e some sozinho ---------- */
  var balloon = document.getElementById('balloon'), hideT;
  setTimeout(function(){
    balloon.classList.remove('hide');
    hideT = setTimeout(function(){ balloon.classList.add('hide'); }, 9000);
  }, 20000);
  document.getElementById('closeBalloon').addEventListener('click', function(){ clearTimeout(hideT); balloon.classList.add('hide'); });
})();

/* ---------- Formulário do diagnóstico ----------
   Abre nos botões laranja (topo, pacotes, teste e chamada final).
   Ao enviar: grava o contato na planilha (sem esperar a resposta) e abre o WhatsApp
   com a mensagem pronta. Sem JavaScript, os botões continuam indo direto para o WhatsApp. */
(function(){
  var dlg = document.getElementById('lead-form');
  if (!dlg || typeof dlg.showModal !== 'function') return; /* navegador antigo: botões seguem para o WhatsApp */

  var PHONE = '5521976822900';
  var GREETING = 'Oi Felipe, preciso da sua ajuda!';
  var form = document.getElementById('lf-form'), done = document.getElementById('lf-done');
  var eyebrow = document.getElementById('lf-eyebrow'), title = document.getElementById('lf-title');
  var doneTitle = document.getElementById('lf-done-title'), again = document.getElementById('lf-again');
  var phone = document.getElementById('lf-whatsapp');
  var ctx = {origem: 'Topo', teste: ''}, openedAt = 0, pushed = false;

  /* ----- Abrir e fechar ----- */
  function open(btn){
    ctx.origem = btn.getAttribute('data-origem') || 'Site';
    ctx.teste = btn.getAttribute('data-teste') || '';
    var interesse = btn.getAttribute('data-interesse') || 'Diagnóstico gratuito';
    var radio = form.querySelector('input[name="interesse"][value="' + interesse + '"]');
    if (radio) radio.checked = true;
    eyebrow.textContent = interesse === 'Diagnóstico gratuito'
      ? 'Diagnóstico gratuito · 20 minutos'
      : 'Pacote ' + interesse;
    form.hidden = false; done.hidden = true;
    openedAt = Date.now();
    dlg.showModal();
    document.documentElement.classList.add('lf-open');
    title.focus({preventScroll: true});
    /* O botão "voltar" do celular fecha o formulário em vez de sair do site */
    try { history.pushState({leadForm: 1}, ''); pushed = true; } catch(e){ pushed = false; }
  }
  function close(){
    if (!dlg.open) return;
    dlg.close();
  }
  dlg.addEventListener('close', function(){
    document.documentElement.classList.remove('lf-open');
    if (pushed){ pushed = false; try { if (history.state && history.state.leadForm) history.back(); } catch(e){} }
  });
  addEventListener('popstate', function(){ if (dlg.open){ pushed = false; dlg.close(); } });

  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('[data-form="diagnostico"]');
    if (!btn) return;
    e.preventDefault();
    open(btn);
  });
  dlg.addEventListener('click', function(e){
    if (e.target.closest('[data-lf-close]')) { close(); return; }
    if (e.target === dlg) close(); /* toque fora da caixa */
  });

  /* ----- WhatsApp: máscara (21) 99999-9999 ----- */
  function digits(v){
    var d = String(v || '').replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length === 12 && d.charAt(0) === '0') d = d.slice(1);
    return d.slice(0, 11);
  }
  function mask(d){
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    var ddd = d.slice(0, 2), rest = d.slice(2);
    var cut = rest.length > 8 ? 5 : 4;
    return '(' + ddd + ') ' + (rest.length > cut ? rest.slice(0, cut) + '-' + rest.slice(cut) : rest);
  }
  phone.addEventListener('input', function(){
    var atEnd = phone.selectionStart === phone.value.length;
    phone.value = mask(digits(phone.value));
    if (atEnd) phone.setSelectionRange(phone.value.length, phone.value.length);
  });
  function phoneOk(d){
    if (!/^[1-9][1-9]/.test(d)) return false;
    if (d.length === 11) return d.charAt(2) === '9';
    return d.length === 10;
  }

  /* ----- Validação, com mensagens simples ----- */
  var rules = {
    nome:    {min: 2, msg: 'Escreve seu nome completo, por favor.'},
    negocio: {min: 2, msg: 'Qual é o nome do seu negócio?'},
    oque:    {min: 2, msg: 'Conta qual produto ou serviço você vende.'},
    cidade:  {min: 2, msg: 'Em qual cidade fica o seu negócio?'}
  };
  function setErr(id, text){
    var input = document.getElementById('lf-' + id), err = document.getElementById('lf-' + id + '-err');
    if (!err) return;
    err.textContent = text || ''; err.hidden = !text;
    if (input){
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (text) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
    }
  }
  function clean(v){ return String(v || '').replace(/\s+/g, ' ').trim(); }
  function validate(){
    var first = null, data = {};
    Object.keys(rules).forEach(function(k){
      var v = clean(form.elements[k].value); data[k] = v;
      var bad = v.length < rules[k].min;
      setErr(k, bad ? rules[k].msg : '');
      if (bad && !first) first = form.elements[k];
    });
    var d = digits(phone.value); data.whatsapp = d;
    var badPhone = !phoneOk(d);
    setErr('whatsapp', badPhone ? (d ? 'Confere o número: DDD + número, como (21) 99999-9999.' : 'Qual é o seu WhatsApp, com DDD?') : '');
    if (badPhone && !first) first = phone;
    var ok = form.elements.consentimento.checked;
    setErr('consent', ok ? '' : 'Para eu poder te chamar, marque a autorização acima.');
    if (!ok && !first) first = form.elements.consentimento;
    data.instagram = clean(form.elements.instagram.value).replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
    var r = form.querySelector('input[name="interesse"]:checked');
    data.interesse = r ? r.value : 'Diagnóstico gratuito';
    return {ok: !first, first: first, data: data};
  }
  /* Tira o aviso de erro assim que a pessoa corrige */
  form.addEventListener('input', function(e){
    var n = e.target.name;
    if (n === 'consentimento') return;
    var id = n === 'whatsapp' ? 'whatsapp' : n;
    var err = document.getElementById('lf-' + id + '-err');
    if (err && !err.hidden){
      var v = n === 'whatsapp' ? (phoneOk(digits(e.target.value)) ? 'x' : '') : (clean(e.target.value).length >= 2 ? 'x' : '');
      if (v) setErr(id, '');
    }
  });
  form.elements.consentimento.addEventListener('change', function(){ if (this.checked) setErr('consent', ''); });

  /* ----- Mensagem do WhatsApp ----- */
  function message(d){
    var lines = [GREETING, '', 'Meu nome é ' + d.nome + '.',
      'Negócio: ' + d.negocio + ' (' + d.oque + '), ' + d.cidade + '.'];
    if (d.instagram) lines.push('Instagram: @' + d.instagram);
    if (ctx.teste) lines.push('Fiz o teste do site: ' + ctx.teste.replace(/\s*\(.*\)$/, '').toLowerCase() + '.');
    lines.push(d.interesse === 'Diagnóstico gratuito'
      ? 'Quero marcar meu diagnóstico gratuito.'
      : 'Tenho interesse no pacote ' + d.interesse + '.');
    return lines.join('\n');
  }

  /* ----- Envio ----- */
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = validate();
    if (!v.ok){ v.first.focus(); return; }
    var d = v.data;
    var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message(d));

    /* 1. Grava o contato. Não espera a resposta: o WhatsApp abre na hora. */
    var payload = JSON.stringify({
      nome: d.nome, whatsapp: d.whatsapp, negocio: d.negocio, oque: d.oque, cidade: d.cidade,
      instagram: d.instagram, interesse: d.interesse, origem: ctx.origem, teste: ctx.teste,
      consentimento: true, site: form.elements.site.value, t: Date.now() - openedAt
    });
    try {
      fetch('/api/diagnostico', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: payload, keepalive: true})
        .catch(function(){});
    } catch(err){
      try { navigator.sendBeacon('/api/diagnostico', new Blob([payload], {type: 'application/json'})); } catch(_){}
    }

    /* 2. Abre o WhatsApp no mesmo toque (assim o navegador não bloqueia) */
    try { window.open(url, '_blank', 'noopener'); } catch(_){}

    /* 3. Mostra a confirmação, com um botão caso o WhatsApp não tenha aberto */
    again.href = url;
    doneTitle.textContent = 'Pronto, ' + d.nome.split(' ')[0] + '!';
    form.hidden = true; done.hidden = false;
    doneTitle.focus({preventScroll: true});
  });
})();

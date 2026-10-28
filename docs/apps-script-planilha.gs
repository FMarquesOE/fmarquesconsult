/**
 * Contatos do site · Felipe Marques
 * Cole este código na planilha: Extensões → Apps Script (apague o que já estiver lá).
 * Passo a passo completo em docs/formulario-diagnostico.md.
 *
 * O código secreto não fica escrito aqui: rode a função gerarCodigo() uma vez.
 * Ela cria o código, guarda nas propriedades do script e mostra no registro
 * para você copiar no Vercel (variável SHEETS_WEBHOOK_TOKEN).
 */

const ABA = 'Contatos';
const CABECALHO = ['Data', 'Nome', 'WhatsApp', 'Negócio', 'O que vende', 'Cidade', 'Instagram',
  'Interesse', 'Veio de', 'Teste do site', 'Etiqueta', 'Observações'];
const ETIQUETAS = ['Novo contato', 'Diagnóstico marcado', 'Proposta enviada', 'Cliente', 'Pioneira', 'Não seguiu'];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return resposta({ ok: false, error: 'formato' }); }
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!d || !token || d.token !== token) return resposta({ ok: false, error: 'token' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const aba = pegarAba();
    const fone = String(d.whatsapp || '').replace(/\D/g, '').slice(0, 11);
    const insta = seguro(d.instagram).replace(/^'/, '').replace(/^@+/, '');
    aba.appendRow([
      Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
      seguro(d.nome), formatarFone(fone), seguro(d.negocio), seguro(d.oque), seguro(d.cidade),
      insta ? '@' + insta : '', seguro(d.interesse), seguro(d.origem), seguro(d.teste),
      'Novo contato', ''
    ]);
    const linha = aba.getLastRow();
    // WhatsApp e Instagram viram link: um clique abre a conversa ou o perfil.
    if (fone) aba.getRange(linha, 3).setRichTextValue(link(formatarFone(fone), 'https://wa.me/55' + fone));
    if (insta) aba.getRange(linha, 7).setRichTextValue(link('@' + insta, 'https://www.instagram.com/' + encodeURIComponent(insta) + '/'));
    avisar(d, fone, insta);
    return resposta({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/** 1º: rode uma vez. Cria o código secreto e mostra no registro de execução (copie para o Vercel). */
function gerarCodigo() {
  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty('TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    props.setProperty('TOKEN', token);
  }
  Logger.log('Código para o Vercel (SHEETS_WEBHOOK_TOKEN): ' + token);
}

/** 2º: rode uma vez para autorizar e criar a aba com uma linha de teste. */
function testar() {
  const r = doPost({ postData: { contents: JSON.stringify({
    token: PropertiesService.getScriptProperties().getProperty('TOKEN'), nome: 'Teste', whatsapp: '21999999999', negocio: 'Negócio de teste', oque: 'teste',
    cidade: 'Duque de Caxias', instagram: '', interesse: 'Diagnóstico gratuito', origem: 'Topo', teste: ''
  }) } });
  Logger.log(r.getContent());
}

function pegarAba() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(ABA);
  if (!aba) aba = ss.insertSheet(ABA, 0);
  if (aba.getLastRow() === 0) {
    aba.appendRow(CABECALHO);
    aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold').setBackground('#1C2B4A').setFontColor('#F4EDE1');
    aba.setFrozenRows(1);
    aba.setColumnWidths(1, CABECALHO.length, 150);
    const regra = SpreadsheetApp.newDataValidation().requireValueInList(ETIQUETAS, true).setAllowInvalid(false).build();
    aba.getRange(2, 11, aba.getMaxRows() - 1, 1).setDataValidation(regra);
  }
  return aba;
}

/** Impede que um texto vire fórmula na planilha (ex.: começar com "="). */
function seguro(v) {
  const t = String(v == null ? '' : v).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, 120);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function formatarFone(d) {
  if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return d;
}

function link(texto, url) {
  return SpreadsheetApp.newRichTextValue().setText(texto).setLinkUrl(url).build();
}

function avisar(d, fone, insta) {
  const para = Session.getEffectiveUser().getEmail();
  if (!para) return;
  const assunto = 'Novo contato pelo site: ' + seguro(d.negocio) + ' (' + seguro(d.interesse) + ')';
  const corpo = [
    'Chegou um contato pelo formulário do site.', '',
    'Nome: ' + seguro(d.nome),
    'WhatsApp: ' + formatarFone(fone) + '  →  https://wa.me/55' + fone,
    'Negócio: ' + seguro(d.negocio) + ' (' + seguro(d.oque) + ')',
    'Cidade: ' + seguro(d.cidade),
    'Instagram: ' + (insta ? '@' + insta : '(não informou)'),
    'Interesse: ' + seguro(d.interesse),
    'Veio de: ' + seguro(d.origem) + (d.teste ? ' · ' + seguro(d.teste) : ''), '',
    'Se a pessoa não mandar mensagem em algumas horas, chame você pelo link acima.', '',
    'Planilha: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join('\n');
  MailApp.sendEmail(para, assunto, corpo);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

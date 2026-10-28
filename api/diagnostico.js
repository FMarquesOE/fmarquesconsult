/* Recebe o formulário do diagnóstico e grava na planilha do Google.
   A planilha recebe pelo Apps Script (ver docs/formulario-diagnostico.md).

   Variáveis no Vercel:
   - SHEETS_WEBHOOK_URL   endereço do Apps Script publicado como app da Web
   - SHEETS_WEBHOOK_TOKEN código combinado com o Apps Script (o mesmo nos dois lados)

   O site não espera a resposta desta função para abrir o WhatsApp,
   então um erro aqui nunca trava a cliente. */

const INTERESSES = ['Diagnóstico gratuito', 'Presença no Google', 'Vitrine Digital', 'Negócio Organizado'];
const ORIGENS = ['Topo', 'Pacote Presença no Google', 'Pacote Vitrine Digital', 'Pacote Negócio Organizado', 'Teste do site', 'Chamada final', 'Site'];
const HOSTS = ['fmarquestbg.com.br', 'www.fmarquestbg.com.br', 'fmarquesconsult.vercel.app', 'localhost', '127.0.0.1'];
const MIN_MS = 2500; /* menos que isso para preencher tudo é robô */

function allowedOrigin(req) {
  const o = req.headers.origin || req.headers.referer || '';
  if (!o) return false;
  let host;
  try { host = new URL(o).hostname; } catch { return false; }
  if (HOSTS.includes(host)) return true;
  /* prévias do Vercel deste projeto: fmarquesconsult-<algo>.vercel.app */
  return /^fmarquesconsult-[a-z0-9-]+\.vercel\.app$/.test(host);
}

function text(v, max) {
  return String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function phone(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  if (!/^[1-9][1-9]\d{8,9}$/.test(d)) return null;
  if (d.length === 11 && d[2] !== '9') return null;
  return d;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  if (!allowedOrigin(req)) return res.status(403).json({ ok: false });

  const b = parseBody(req);
  if (!b) return res.status(400).json({ ok: false, error: 'formato' });

  /* Robôs: campo escondido preenchido ou envio rápido demais. Responde "ok" e descarta. */
  if (text(b.site, 200) || Number(b.t) < MIN_MS) return res.status(200).json({ ok: true });

  const row = {
    nome: text(b.nome, 80),
    whatsapp: phone(b.whatsapp),
    negocio: text(b.negocio, 100),
    oque: text(b.oque, 100),
    cidade: text(b.cidade, 80),
    instagram: text(b.instagram, 60).replace(/^@+/, ''),
    interesse: INTERESSES.includes(b.interesse) ? b.interesse : 'Diagnóstico gratuito',
    origem: ORIGENS.includes(b.origem) ? b.origem : 'Site',
    teste: /^Nível [1-4] de 4 \([0-5] de 5 sim\)$/.test(String(b.teste || '')) ? b.teste : '',
  };
  const faltando = ['nome', 'negocio', 'oque', 'cidade'].filter((k) => row[k].length < 2);
  if (!row.whatsapp) faltando.push('whatsapp');
  if (b.consentimento !== true) faltando.push('consentimento');
  if (faltando.length) return res.status(422).json({ ok: false, faltando });

  const url = process.env.SHEETS_WEBHOOK_URL;
  const token = process.env.SHEETS_WEBHOOK_TOKEN;
  if (!url || !token) {
    console.error('[diagnostico] planilha não configurada (SHEETS_WEBHOOK_URL / SHEETS_WEBHOOK_TOKEN)');
    return res.status(503).json({ ok: false, error: 'nao-configurado' });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, ...row }),
      redirect: 'follow',
      signal: ctrl.signal,
    });
    const out = await r.json().catch(() => null);
    if (!out || !out.ok) {
      console.error('[diagnostico] planilha recusou', r.status, out && out.error);
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[diagnostico] falha ao gravar', err && err.name);
    return res.status(502).json({ ok: false });
  } finally {
    clearTimeout(timer);
  }
}

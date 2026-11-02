# Google Analytics (GA4) do site: eventos, links e configuração

Criado em 31/10/2026; ampliado em 02/11/2026. Propriedade do GA4: `G-6MZGV9X6CR`.
Os eventos respeitam o aviso de cookies (modo de consentimento): quem recusa não grava nada no aparelho, e o Google só recebe um sinal sem identificação. Por isso o GA4 mostra menos gente do que realmente entrou.
Nenhum evento leva nome, WhatsApp, cidade ou qualquer dado pessoal.

## 1. Links de divulgação (cada lugar com o seu link)
O navegador do Instagram quase nunca diz ao site de onde a pessoa veio: sem link marcado, a visita aparece como "direta" e não dá para saber que foi o Instagram. Por isso cada lugar usa um link curto próprio, que leva para a página com a marcação (UTM).

| Onde usar | Link | Aparece no GA4 como (origem / meio · campanha) |
|---|---|---|
| Bio do Instagram | `www.fmarquestbg.com.br/ig` | instagram / social · bio |
| Figurinha de link nos Stories | `www.fmarquestbg.com.br/stories` | instagram / social · stories |
| Respostas no Direct (ManyChat e à mão) | `www.fmarquestbg.com.br/dm` | instagram / social · direct |
| Catálogo e status do WhatsApp | `www.fmarquestbg.com.br/wpp` | whatsapp / social · catalogo |
| Perfil da Empresa no Google (campo Site) | `www.fmarquestbg.com.br/google` | google / organic · perfil_empresa |
| QR code do cartão de visita e materiais impressos | `www.fmarquestbg.com.br/cartao` | cartao / offline · cartao_visita |

- Os links curtos ficam em `vercel.json` (redirecionamento temporário, então dá para mudar o destino sem trocar o link divulgado).
- Novo lugar de divulgação = novo link curto aqui, antes de divulgar.
- O endereço sem nada (`www.fmarquestbg.com.br`) continua valendo para quem digita, para o Google e para indicação boca a boca.

## 2. Eventos do site
| Evento | Quando acontece | Dados enviados |
|---|---|---|
| `generate_lead` | A pessoa envia o formulário do diagnóstico (o contato vai para a planilha e o WhatsApp abre) | `origem` (Topo, Pacote …, Teste do site, Chamada final), `interesse` (pacote marcado), `fez_teste` (sim/não) |
| `formulario_aberto` | Abre o formulário num botão laranja | `origem`, `interesse` |
| `clique_whatsapp` | Toque num botão que vai direto para o WhatsApp | `origem` (Botão flutuante, Balão, Fale comigo, Formulário (abrir de novo)) |
| `clique_instagram` | Toque no @fmarquestbg do site | `origem` (Quem sou, Fale comigo) |
| `secao_vista` | A pessoa chega a uma seção (uma vez por visita) | `secao` (Você se reconhece, Como funciona, Teste, Pacotes, Case, Quem sou, Perguntas, Chamada final) |
| `pergunta_aberta` | Abre uma pergunta frequente (uma vez por pergunta por visita) | `pergunta` (o texto da pergunta) |
| `teste_botao_topo` | Toque em "Ou faça o teste de 1 minuto" no topo | — |
| `teste_inicio` | Primeira resposta do teste | — |
| `teste_concluido` | Última resposta do teste | `nivel` (1 a 4), `pontos` (0 a 5) |

O GA4 também mede sozinho (medição otimizada): visualização de página, rolagem até 90%, cliques em links que saem do site e tempo de engajamento.

## 3. Suas próprias visitas e testes
- **Marcar o seu aparelho como interno:** abra uma vez `www.fmarquestbg.com.br/?interno=1` em cada navegador que você usa (Chrome do celular, do computador etc.). A partir daí suas visitas saem dos relatórios (depois do passo 4.4). Para desmarcar: `?interno=0`.
- O navegador de dentro do Instagram e do WhatsApp é separado: para marcar, abra o link com `?interno=1` também por lá.
- **Ver os eventos na hora:** abra o site com `?debug=1` e acompanhe em Administrador → DebugView. Aceite os cookies no aviso para o teste valer.

## 4. Configuração do GA4 (propriedade "Consultoria Felipe Marques", ID 561106797)
| Item | Situação |
|---|---|
| Dimensões personalizadas `origem`, `interesse`, `fez_teste`, `nivel` | Feito em 31/10 |
| Dimensões `secao` (Secao vista) e `pergunta` (Pergunta aberta) | Feito em 02/11 |
| Retenção de dados em 14 meses | Feito em 31/10 |
| `generate_lead` como evento principal | Feito em 01/11 |
| Search Console vinculado | Feito em 31/10 |
| Fuso horário dos relatórios: (GMT-03:00) São Paulo (estava em Rio Branco, GMT-05) · moeda Real | Feito em 02/11 |
| **`clique_whatsapp` como evento principal** | **Falta (Felipe):** o evento só aparece na lista depois do primeiro clique real e de até 24 h. Administrador → Exibição de dados → Eventos → Eventos recentes → marcar a estrela de `clique_whatsapp`. |
| **Filtro "Internal Traffic" de Teste para Ativo** | **Falta (Felipe):** Administrador → Coleta e modificação de dados → Filtros de dados → Internal Traffic → Estado do filtro: Ativa → Salvar. Antes, marcar os seus navegadores com `?interno=1` (o navegador do app do Claude já está marcado). |
| Google Signals e recursos de anúncio | Deixar desligados (o aviso de cookies promete que não há propaganda) |

Atenção: a conta Google do navegador também tem a propriedade do studio (Vmafraunhas, ID 540799123). Conferir sempre no topo que está em "Consultoria Felipe Marques" antes de mexer.

## 5. Como ler
- **De onde vem quem procura você:** Relatórios → Aquisição → Aquisição de tráfego, com "Origem/meio da sessão" e a coluna de eventos principais. Compare instagram / social com google / organic e (direct).
- **Funil do site** (Explorar → Exploração de funil): `secao_vista` (Pacotes) → `formulario_aberto` → `generate_lead`. Mostra onde as pessoas desistem.
- **Taxa do formulário:** `generate_lead` ÷ `formulario_aberto`. Se muita gente abre e pouca envia, o formulário está pesado.
- **Teste:** `teste_inicio` → `teste_concluido` → `generate_lead` com `origem = Teste do site`. Os níveis mais comuns (`nivel`) dizem qual pacote o público mais precisa.
- **Objeções:** `pergunta_aberta` por `pergunta`. As mais abertas são as dúvidas que merecem post ou destaque no site.
- **Até onde leem:** `secao_vista` por `secao`. Uma queda grande entre duas seções mostra onde a página perde a pessoa.

## 6. Instagram x site (todo fim de mês, 10 minutos)
| De onde | O que anotar | Onde ver |
|---|---|---|
| Instagram | Contas alcançadas, visitas ao perfil, toques no link da bio | Painel profissional → Insights (últimos 30 dias) |
| Site | Sessões de instagram / social (bio, stories, direct), `generate_lead` e `clique_whatsapp` dessas sessões | GA4 → Aquisição de tráfego, filtrando origem = instagram |
| WhatsApp e planilha | Diagnósticos marcados e de onde vieram ("Veio de") | Planilha "Contatos do site" + conversas |

Contas: toques no link ÷ visitas ao perfil (o perfil convence a clicar?), sessões do /ig ÷ toques no link (perde gente no caminho?), contatos ÷ sessões do Instagram (o site convence?). Os números do Instagram e do GA4 nunca batem exatos (consentimento, bloqueadores, contagem diferente): olhe a tendência mês a mês.

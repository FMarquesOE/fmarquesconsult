# Eventos do site no Google Analytics (GA4)

Criado em 31/10/2026. Propriedade do GA4: `G-6MZGV9X6CR`.
Os eventos respeitam o aviso de cookies (modo de consentimento): quem recusa não grava nada no aparelho, e o Google só recebe um sinal sem identificação.
Nenhum evento leva nome, WhatsApp, cidade ou qualquer dado pessoal.

| Evento | Quando acontece | Dados enviados |
|---|---|---|
| `generate_lead` | A pessoa envia o formulário do diagnóstico (o contato vai para a planilha e o WhatsApp abre) | `origem` (Topo, Pacote …, Teste do site, Chamada final), `interesse` (pacote marcado), `fez_teste` (sim/não) |
| `formulario_aberto` | Abre o formulário num botão laranja | `origem`, `interesse` |
| `clique_whatsapp` | Toque num botão que vai direto para o WhatsApp | `origem` (Botão flutuante, Balão, Fale comigo, Formulário (abrir de novo)) |
| `teste_botao_topo` | Toque em "Ou faça o teste de 1 minuto" no topo | — |
| `teste_inicio` | Primeira resposta do teste | — |
| `teste_concluido` | Última resposta do teste | `nivel` (1 a 4), `pontos` (0 a 5) |

## Configurar no GA4 (uma vez, pelo Felipe)
1. Administrador → Exibição de dados → **Eventos principais** → marcar `generate_lead` como evento principal (é a "conversão" do site).
2. Administrador → **Definições personalizadas** → Criar dimensões do escopo "Evento": `origem`, `interesse`, `fez_teste` e `nivel`. Sem isso, os eventos chegam, mas esses detalhes não aparecem nos relatórios.
3. Para conferir na hora: Relatórios → Tempo real, ou Administrador → **DebugView**.

## Como ler
- **Taxa do formulário:** `generate_lead` ÷ `formulario_aberto`. Se muita gente abre e pouca envia, o formulário está pesado.
- **Teste:** `teste_inicio` → `teste_concluido` → `generate_lead` com `origem = Teste do site`.
- **WhatsApp direto:** `clique_whatsapp` conta quem preferiu não preencher nada. Somado ao `generate_lead`, dá o total de pessoas que procuraram o Felipe pelo site.

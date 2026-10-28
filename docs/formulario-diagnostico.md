# Formulário do diagnóstico · como funciona e como ligar a planilha

Criado em 28/10/2026. No ar no site desde 28/10/2026.
Planilha: **Contatos do site · Felipe Marques** (Google Drive do Felipe), aba **Contatos**, com o Apps Script "Contatos do site" publicado como App da Web.

## O caminho do contato
1. A pessoa toca num botão laranja: "Quero meu diagnóstico gratuito" (topo e chamada final), "Quero este" (pacotes) ou "Quero ajuda com isso" (resultado do teste).
2. Abre o formulário: nome completo, WhatsApp, nome do negócio, produto ou serviço que vende, cidade, Instagram (opcional), o que interessa (já vem marcado pelo botão) e a autorização para o contato.
3. Ao tocar em "Enviar e abrir o WhatsApp":
   - o contato vai para a planilha do Google (aba **Contatos**) e chega um email de aviso;
   - o WhatsApp abre na hora com a mensagem pronta, por exemplo:

```
Oi Felipe, preciso da sua ajuda!

Meu nome é Ana Souza.
Negócio: Doce Ana (bolos de festa), Duque de Caxias.
Instagram: @doceana
Tenho interesse no pacote Vitrine Digital.
```

4. Se a pessoa desistir antes de mandar a mensagem, o contato já está na planilha: é só chamar pelo link do WhatsApp na coluna C.

Continuam indo direto para o WhatsApp, sem formulário: o botão verde flutuante, o balão "Posso te ajudar?" e o bloco "Fale comigo". São a saída rápida para quem não quer preencher nada.

## Peças
| Arquivo | O que faz |
|---|---|
| `index.html` | Formulário (janela que sobe no celular) e botões marcados com `data-form` |
| `src/form.js` | Abre o formulário, confere os campos, grava e abre o WhatsApp |
| `src/theme.js` | Tema claro e escuro (separado do `main.js` para servir também à página de privacidade) |
| `api/diagnostico.js` | Recebe o formulário no Vercel, barra robôs e outros sites, limpa os dados e manda para a planilha |
| `docs/apps-script-planilha.gs` | Código que fica dentro da planilha: grava a linha, cria os links e manda o email |
| `privacidade.html` | Página de privacidade da consultoria (LGPD) |
| `vite.config.js` | Build com as duas páginas |

Proteções: campo escondido para robôs, envio em menos de 2,5 s descartado, só aceita envios do próprio site (fmarquesconsult.vercel.app, fmarquestbg.com.br e as prévias do Vercel), código secreto entre o Vercel e a planilha, e nenhum texto vira fórmula na planilha. Os logs do Vercel não guardam dados pessoais.

## Ligar a planilha (uns 10 minutos, uma vez só)

### 1. Criar a planilha
1. No Google Drive, crie uma planilha nova chamada **Contatos do site · Felipe Marques**.
2. Menu **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo de `docs/apps-script-planilha.gs`.
4. Salve (ícone de disquete).

### 2. Gerar o código, autorizar e testar
1. No alto do editor, escolha a função **gerarCodigo** e clique em **▶ Executar**.
2. O Google pede autorização. Como o script é seu, aparece o aviso "O Google não verificou este app": clique em **Avançado → Acessar (não seguro)** e em **Permitir**. Ele pede acesso à planilha e para enviar email em seu nome.
3. No registro de execução aparece "Código para o Vercel": copie o código e guarde na planilha de configuração, aba Variáveis. (Ele fica guardado no próprio script; rodar de novo mostra o mesmo código.)
4. Escolha a função **testar** e clique em **▶ Executar**.
5. Confira: a aba **Contatos** foi criada com o cabeçalho azul e uma linha "Teste", e chegou o email "Novo contato pelo site".
6. Apague só a linha de teste (deixe o cabeçalho).

### 3. Publicar
1. **Implantar → Nova implantação**.
2. Na engrenagem, escolha **App da Web**.
3. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**. (Ninguém consegue gravar sem o código secreto.)
4. **Implantar** e copie o endereço que termina em `/exec`.

### 4. Colocar no Vercel
No projeto `fmarquesconsult` → Settings → Environment Variables, crie as duas, marcando **Production** e **Preview**:

| Nome | Valor |
|---|---|
| `SHEETS_WEBHOOK_URL` | o endereço `/exec` do passo 3 |
| `SHEETS_WEBHOOK_TOKEN` | o código que apareceu no passo 2 |

Depois, faça o **Redeploy** da prévia da branch `formulario-diagnostico` para valer.

### 5. Testar no link de prévia
Preencha o formulário com seus dados e confira: o WhatsApp abriu com a mensagem, a linha entrou na planilha e o email chegou. Apague a linha de teste.

## Se mudar o código da planilha depois
O endereço `/exec` continua rodando a versão antiga até você publicar a nova: **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**. O endereço não muda.

## Colunas da planilha
Data · Nome · WhatsApp (link) · Negócio · O que vende · Cidade · Instagram (link) · Interesse · Veio de · Teste do site · Etiqueta · Observações.
A **Etiqueta** começa como "Novo contato" e tem as mesmas opções das etiquetas do WhatsApp Business (Novo contato · Diagnóstico marcado · Proposta enviada · Cliente · Pioneira), mais "Não seguiu". Colunas novas podem ser criadas à direita, sem mexer nas 12 primeiras.

## Observações
- Prazo de guarda (decisão de 28/10): quem não fecha pacote tem os dados apagados em até 1 ano; na planilha, revisar e apagar as linhas com mais de 1 ano.
- Quando a branch `dominio-fmarquestbg` entrar, conferir se as duas mudanças convivem no `index.html` (o formulário não mexe nas partes do domínio).

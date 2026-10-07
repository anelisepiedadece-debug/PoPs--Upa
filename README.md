# POPs UPA — Conhecimento na Palma da Mão

Acervo institucional da Policlínica 24h / UPA de Nova Santa Rita – RS. Projeto desenvolvido por **Anelise Piedade**, aprovado por **Lilian Silva – Diretora Geral**.

Site responsivo para consulta de Procedimentos Operacionais Padrão. Todos os documentos e PDFs exigem login. Uma única administradora cadastra, edita, exclui, anexa PDFs e gerencia a equipe; integrantes apenas consultam. Não há cadastro público nem senha padrão.

## Tecnologias e requisitos

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide Icons, QRCode, PDF.js, Zod e SQLite nativo do Node.js. Use **Node.js 24 ou superior** e npm. O banco e os PDFs são gravados em disco, fora da pasta pública. Não há serviços externos nem chaves de API obrigatórios.

```bash
cd /workspace/PoPs--Upa
npm ci --cache /workspace/.npm-cache
npm run dev
```

No seu computador, use a pasta onde baixou o projeto. O servidor de desenvolvimento usa a porta 3000. Para produção:

```bash
npm run build
npm run start
```

A produção exige HTTPS para que o cookie seguro de autenticação funcione fora de localhost.

## Seu primeiro acesso: definir a senha no site

Sua conta é **anelisepiedade**, com perfil de **administradora**. A equipe pode continuar usando e-mail para entrar. Não existe senha padrão nem senha escrita no código.

Depois da publicação, abra **Sou Anelise — configurar meu primeiro acesso** na tela de login. Você informa o código privado de ativação e escolhe uma senha de **12 a 128 caracteres**, diretamente no site. Ao concluir, sua conta é criada e o painel abre. Essa ativação só funciona uma vez por banco; depois a tela é fechada e ninguém pode criar outra administradora por ela.

O código de ativação não é a sua senha. Ele comprova que você é a responsável pela implantação. O responsável pela instalação deve gerar esse código e configurá-lo como `ADMIN_SETUP_CODE` no ambiente privado do servidor. Nunca o compartilhe em chat, GitHub ou links. A aplicação exige ao menos 32 caracteres para esse código. Sem essa configuração, o primeiro acesso permanece bloqueado.

Depois de entrar, vá a **Painel admin → Acesso da equipe** para cadastrar integrantes. Você pode suspender/reativar o acesso e redefinir senhas; essas ações encerram sessões anteriores. Sessões expiram após oito horas; cinco tentativas incorretas bloqueiam aquele login por quinze minutos. Só sua conta altera os POPs.

### Alternativa para um operador com acesso ao servidor

Se preferir criar a conta pelo terminal, execute na pasta do projeto. O usuário padrão é `anelisepiedade`; `ADMIN_LOGIN` pode selecionar outro usuário ou e-mail, e `ADMIN_EMAIL` continua compatível com a versão anterior.

```bash
read -r -s -p 'Sua senha (12 a 128 caracteres): ' ADMIN_PASSWORD
printf '\n'
export ADMIN_PASSWORD
npm run admin:create
unset ADMIN_PASSWORD
```

A senha não é exibida nem colocada no histórico do terminal. Só é possível criar uma administradora por banco. Não há recuperação automática por e-mail; guarde a senha com segurança. A recuperação administrativa precisa de um operador autorizado do servidor.

## Adicionar seus POPs sem mexer no código

1. Entre com sua conta administrativa e abra **Painel admin → Cadastrar POP**.
2. Preencha nome, código único, categoria, descrição, palavras-chave, versão, datas, elaboração e aprovação.
3. Selecione um PDF de até 15 MB. O servidor verifica o cabeçalho e o fim do arquivo. Não envie dados de pacientes. Use arquivos institucionais confiáveis; a validação de formato não substitui antivírus.
4. Opcionalmente, transcreva as seções do documento aprovado para facilitar a leitura na página.
5. Marque ativo para disponibilizar à equipe ou inativo para manter apenas no painel. Clique em **Salvar POP**.

Para atualizar, use **Editar POP**. Toda alteração guarda uma cópia da versão anterior e mantém o PDF anterior acessível somente à administradora. A equipe consulta somente o PDF atual dos POPs ativos. O histórico registra a versão e a data informadas no cadastro, portanto atualize esses campos ao revisar. Excluir remove o POP e seu histórico do banco. PDFs sem referência são retidos no disco e deixam de ser acessíveis pelo site; remova-os apenas por um processo de manutenção com backup e conferência de referências.

## Funcionalidades

- Pesquisa instantânea sem diferenciar acentos por título, código, categoria, palavras-chave e descrição.
- Dez categorias, contagem de documentos, filtros e ordenação.
- Páginas individuais, seções de consulta, visualizador PDF.js com navegação por páginas e texto acessível, download e histórico.
- Favoritos em localStorage, separados por conta e navegador; não sincronizados entre dispositivos.
- Mais acessados por consultas reais por sessão do navegador e destaques selecionados pela administradora.
- Documentos recentemente atualizados, compartilhamento nativo ou cópia do link e QR Codes da página atual. Compartilhar não libera acesso sem login.
- Painel funcional com persistência de POPs, arquivos e contas; não usa login simulado.
- Página Sobre, contato institucional sem telefone/e-mail inventados, navegação mobile e foco de teclado.

O primeiro banco contém cinco **exemplos demonstrativos**, sem conteúdo clínico nem PDFs fabricados. Substitua ou exclua os exemplos antes do uso institucional. Para começar um banco novo vazio, defina `POPS_SEED_DEMO=false` antes da primeira inicialização. Alterar essa variável depois não apaga dados existentes. Em Contato, o site orienta a equipe a usar os canais internos da unidade.

O comando `npm ci` prepara automaticamente o worker, fontes e recursos locais do leitor PDF em `public/`. Esses recursos são bibliotecas públicas; os documentos continuam privados e só são entregues após autenticação.

## Armazenamento, configuração e backup

`POPS_DATA_DIR` define a pasta de dados (padrão: `./data`, ignorada pelo Git). É preciso acesso de escrita e **volume persistente**. Dentro dela ficam `pops.sqlite`, eventuais arquivos WAL/SHM e `documents/`. Não a coloque em `public/`. Permissões locais são restritas para arquivos novos. Variáveis de ambiente adicionais são descritas em `.env.example`; nunca commit senhas, bancos ou PDFs institucionais.

Use a API de backup do SQLite ou uma parada controlada do serviço para copiar o banco e os PDFs de forma consistente. Teste a restauração. A pasta de dados deve ser persistida por uma única instância; não use SQLite em filesystem de rede nem várias réplicas independentes. A publicação deve manter todos os pedidos da aplicação ligados ao mesmo banco.

## Hospedagem sem orçamento

**O projeto deve usar apenas opções gratuitas.** A configuração anterior de hospedagem paga foi removida. Nenhum serviço foi contratado e nenhuma cobrança foi criada.

A versão atual usa SQLite e arquivos privados em disco. Ela pode funcionar em um computador ou servidor que a unidade já tenha disponível, sem assinatura de hospedagem, com apoio da TI para HTTPS, acesso da equipe e backups. O equipamento precisa permanecer ligado; a disponibilidade depende da infraestrutura da unidade.

Para colocar o site na internet usando planos gratuitos de serviços em nuvem, é necessário adaptar o banco, as sessões e os PDFs para armazenamento externo persistente. Uma alternativa a avaliar é Supabase para banco e arquivos privados, junto a uma hospedagem gratuita compatível com Next.js e com o uso institucional. Essa integração **ainda não está implementada**. Confira os limites, termos atuais e regras de suspensão dos planos antes de escolher; não habilite planos pagos ou cobrança automática.

Não basta selecionar um servidor gratuito com disco temporário: reinícios podem apagar contas e PDFs. O projeto atual também não está pronto para armazenamento temporário de funções serverless.

O código está no GitHub, mas **ainda não há um endereço público do site**. Esta interface de onboarding não disponibiliza prévia web. Publicar o ambiente do Codex não publica automaticamente o site para a equipe.

## Estrutura

```text
app/
  (portal)/          # páginas autenticadas, acervo, categorias, favoritos e admin
  login/             # entrada da equipe
  api/documents/     # PDFs autenticados, nunca arquivos públicos
  api/views/         # contagem de consultas
  actions.ts         # operações com validação e autorização no servidor
components/          # navegação, cards, pesquisa, PDF, formulários e ações
lib/
  db.ts              # SQLite, persistência, contas e sessões
  auth.ts            # autorização no servidor
  documents.ts       # armazenamento privado de PDFs
  types.ts           # modelo, categorias e busca
scripts/             # criação da administradora e execução isolada dos testes
tests/               # testes de domínio e fluxos no navegador
```

## Testes

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam Chromium instalado em `/usr/bin/chromium`. Para outro caminho, defina `CHROMIUM_PATH`. Alternativamente, instale Chromium com Playwright e ajuste o caminho. Os testes criam contas com senha aleatória em um banco temporário, executam desktop e mobile e removem esse banco ao terminar. Eles nunca usam o banco institucional. O build deve ser feito antes de `test:e2e`. Há capturas de teste em `/tmp/pops-desktop.png` e `/tmp/pops-mobile.png`; relatórios de falhas ficam em `test-results/`.

## Evolução para Supabase, PostgreSQL ou Firebase

O modelo `Pop` e as funções de persistência estão separados da interface. Para migrar:

- Substitua `lib/db.ts` por consultas ao serviço escolhido e migre POPs, versões e usuários.
- Use autenticação do provedor com papéis administradora/consulta e autorização também no servidor/banco (RLS no Supabase).
- Migre PDFs de `lib/documents.ts` para um bucket privado, disponibilizando links assinados após autorização. Histórico e POPs inativos não devem liberar documentos antigos para integrantes.
- Atualize sessões e o comando de criação da administradora. Não exponha chaves administrativas no navegador.
- Teste permissões, upload, suspensão de usuários e persistência após reiniciar.

Essa migração é uma etapa futura; SQLite e disco local já funcionam nesta versão.

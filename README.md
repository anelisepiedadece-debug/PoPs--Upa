# POPs UPA — Conhecimento na Palma da Mão

Acervo institucional da Policlínica 24h / UPA de Nova Santa Rita – RS. Projeto desenvolvido por **Anelise Piedade**, aprovado por **Lilian Silva – Diretora Geral**.

Site responsivo para consulta de Procedimentos Operacionais Padrão. Todos os documentos e PDFs exigem login. Uma única administradora cadastra, edita, exclui, anexa PDFs e gerencia a equipe; integrantes apenas consultam. Não há cadastro público nem senha padrão.

## Tecnologias e requisitos

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide Icons, QRCode, PDF.js, Zod e SQLite nativo do Node.js. Use **Node.js 24 ou superior** e npm. O banco e os PDFs são gravados em disco, fora da pasta pública. O modo local não precisa de serviços externos. O modo de nuvem usa Supabase (PostgreSQL e bucket privado), somente pelo servidor via HTTPS; as contas continuam sendo gerenciadas pela administradora no site.

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
3. Selecione um PDF de até 3 MB. O servidor verifica o cabeçalho e o fim do arquivo. Não envie dados de pacientes. Use arquivos institucionais confiáveis; a validação de formato não substitui antivírus.
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

## Publicação gratuita: Supabase + Netlify

A integração está implementada. **Ainda não há contas dos provedores conectadas nem endereço público.** Escolha somente os planos Free e confira os limites e termos atuais para uso institucional. Não habilite cobrança automática, planos pagos ou complementos pagos. Use os subdomínios gratuitos fornecidos pelos serviços; não é preciso comprar domínio.

### 1. Banco e PDFs no Supabase

1. Crie uma conta em https://supabase.com e um projeto **Free**, dedicado a este site. Guarde a senha do banco em local privado; ela não é usada pelo aplicativo.
2. No **SQL Editor**, execute o conteúdo de [supabase/setup.sql](supabase/setup.sql). Esse arquivo cria tabelas, uma função transacional, permissões e o bucket privado `pops-upa-private`. Pode ser executado novamente sem apagar os dados existentes.
3. Nas configurações do projeto, obtenha a URL HTTPS do projeto e a chave legada **service_role**. Essa chave é administrativa e deve ficar somente no ambiente privado da hospedagem. Não a envie em chat, não a coloque no GitHub e não use variáveis `NEXT_PUBLIC_` para ela.
4. O banco começa vazio. Não crie políticas públicas de leitura ou upload no bucket. O site verifica a sessão e o perfil antes de servir os PDFs; integrantes não recebem versões antigas ou documentos inativos.

### 2. Site no Netlify

1. Crie uma conta em https://www.netlify.com, escolhendo o plano **Free**. Conecte sua conta GitHub e importe `anelisepiedadece-debug/PoPs--Upa`, branch `main`.
2. O arquivo [netlify.toml](netlify.toml) configura Node.js 24, build e diretório `.next`. A integração automática do Netlify com Next.js fornece as funções do servidor. Não publique como um site estático/exportado.
3. **Antes de publicar**, configure estas variáveis no painel privado, para o build e para as funções do site:

| Variável                    | Valor                                           |
| --------------------------- | ----------------------------------------------- |
| `AWS_LAMBDA_JS_RUNTIME`     | `nodejs24.x` (Node.js 24 nas funções)           |
| `POPS_BACKEND`              | `supabase`                                      |
| `SUPABASE_URL`              | URL HTTPS do seu projeto Supabase               |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada `service_role`                    |
| `ADMIN_SETUP_CODE`          | Código privado aleatório de 32 a 256 caracteres |

Gere o código de ativação em um gerenciador de senhas, ou com `openssl rand -hex 32` no seu próprio computador, e guarde-o de forma privada. Ele é diferente da senha que você escolherá no site.

4. Publique e aguarde o build. Abra o endereço HTTPS `.netlify.app` fornecido no painel. Escolha **Sou Anelise — configurar meu primeiro acesso**, informe o código privado e defina sua senha. Depois cadastre a equipe e os POPs.
5. Confira o funcionamento real antes do uso institucional: faça upload de um PDF, consulte com uma conta de integrante, suspenda essa conta e confirme que o acesso foi encerrado. Reimplante o site e confira que as contas e o PDF continuam disponíveis. Reiniciar/publicar o site não deve apagar os dados do Supabase.

**Limites:** cada PDF pode ter até **3 MB**, para manter o envio dentro dos limites das funções da hospedagem. Arquivos antigos permanecem no armazenamento e contam na cota. Os planos gratuitos têm cotas de banco, armazenamento, tráfego e execução; projetos/sites podem ficar indisponíveis ao exceder limites ou por regras de inatividade. Consulte os painéis e os termos atuais. Não há garantia de funcionamento gratuito ilimitado ou de disponibilidade contínua.

A integração foi testada com PostgreSQL embutido e respostas HTTP simuladas do Supabase, além dos testes de navegador no modo local. O deploy real e o acesso ao Supabase do seu projeto dependem das contas e da configuração privada acima; ainda não foram validados. A interface de onboarding não fornece prévia web. Publicar o ambiente do Codex não publica o site para a equipe.

### Dados e backups

No modo de nuvem, contas, hashes das senhas, sessões, tentativas de login, POPs e histórico ficam no PostgreSQL; PDFs ficam no bucket privado. Nenhum dado institucional usa o disco temporário do Netlify. Com `POPS_BACKEND=supabase`, uma configuração ausente ou indisponível causa erro, sem criar um banco local vazio como alternativa.

Faça exportações periódicas do banco e downloads privados dos objetos com ferramentas do Supabase/PostgreSQL; mantenha cópias protegidas e teste a restauração. Não dependa de backups automáticos como se estivessem incluídos no plano gratuito.

No modo local (`POPS_BACKEND=local`), `POPS_DATA_DIR` define a pasta de dados (padrão `./data`, ignorada pelo Git). Ela contém `pops.sqlite`, WAL/SHM e `documents/`, e exige disco persistente de uma única instância. Use a API de backup do SQLite ou pare o serviço de forma controlada para copiar banco e PDFs consistentemente. A produção exige HTTPS. Dados de um banco local existente **não são migrados automaticamente** para o Supabase; preserve o backup e planeje a importação antes de trocar de modo em uma instalação em uso.

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
  db.ts              # interface assíncrona local/nuvem, contas e sessões
  local-db.ts        # SQLite para desenvolvimento ou servidor persistente
  cloud.ts           # conexão HTTPS privada com Supabase
  auth.ts            # autorização no servidor
  documents.ts       # armazenamento privado de PDFs
  types.ts           # modelo, categorias e busca
scripts/             # criação da administradora e execução isolada dos testes
tests/               # testes locais, PostgreSQL e fluxos no navegador
supabase/setup.sql   # banco, função transacional e bucket privado
netlify.toml         # configuração de build gratuito
```

## Testes

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam Chromium instalado em `/usr/bin/chromium`. Para outro caminho, defina `CHROMIUM_PATH`. Alternativamente, instale Chromium com Playwright e ajuste o caminho. Os testes criam contas com senha aleatória em um banco temporário, executam desktop e mobile e removem esse banco ao terminar. Eles nunca usam o banco institucional. O build deve ser feito antes de `test:e2e`. Há capturas de teste em `/tmp/pops-desktop.png` e `/tmp/pops-mobile.png`; relatórios de falhas ficam em `test-results/`.

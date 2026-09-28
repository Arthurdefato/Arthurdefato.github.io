# T&T Contabilidade

Site responsivo completo com 74 páginas geradas, área do cliente, API, banco de dados e armazenamento de arquivos. Paleta azul-marinho, branco e dourado.

## Abrir no VS Code e testar

1. Abra esta pasta no VS Code: **Arquivo → Abrir Pasta**.
2. Use **Node.js 24 LTS** (o banco local utiliza `node:sqlite`).
3. No terminal integrado, execute:

```sh
node build.mjs
node preview.mjs
```

4. Abra **http://127.0.0.1:4173**.

Esses dois comandos funcionam **sem instalar pacotes**, porque o servidor, o banco e os testes locais usam recursos do próprio Node. O primeiro comando gera as páginas; o segundo aplica as migrações pendentes e inicia o front-end e o back-end juntos.

### Com npm

```sh
npm install
npm run build
npm run dev
```

O projeto também inclui `pnpm-lock.yaml` e foi instalado com pnpm 10.32.1. Para reproduzir as versões verificadas, use `pnpm install --frozen-lockfile`. Não é necessário instalar as dependências para o teste básico acima; elas servem para gerar novas migrações e usar o ambiente Cloudflare.

### Testes

```sh
node --test tests/*.test.mjs
```

Ou `npm test`. Execute o build antes dos testes de páginas. Os testes do back-end usam bancos SQLite em memória e não modificam os dados que você cadastrou no navegador.

### Como acessar localmente

Clique em **Entrar → Entrar com ChatGPT**. No desenvolvimento, o login é simulado automaticamente para `preview@example.test`; não há senha. Essa simulação só existe em `preview.mjs`, é limitada ao endereço de loopback e **não é incluída no Worker de produção**.

Depois do login:

- `/cadastro`: complete nome, empresa e cidade.
- `/area-cliente`: cadastre dados e confira os registros.
- `/administracao`: acompanhe solicitações e responda mensagens. A conta local é administradora para permitir os testes.

Os dados locais ficam em `.sites-runtime/preview.sqlite`. Os arquivos enviados ficam em `.sites-runtime/objects/`. Fechar e abrir o servidor preserva os dados. Essa pasta não acompanha a entrega nem é publicada.

## O que funciona

- Homepage, serviços, planos, comparação, profissões, conteúdos, ajuda e páginas legais.
- Mega menus desktop, menu mobile, accordions, preferências de cookies e busca de artigos/ajuda.
- Oito calculadoras com premissas explicadas. A do Simples utiliza alíquota nominal e parcela a deduzir informadas pelo usuário.
- Abertura de empresa em cinco etapas, validação e gravação de solicitações.
- Formulário de contato com protocolo e registro persistente.
- Cadastro e atualização do perfil vinculado à identidade autenticada.
- Receitas/despesas, rascunhos de notas, equipe e obrigações: criar, consultar, editar e excluir.
- Upload privado de PDF/JPG/PNG/WebP, verificação do tipo real e limite de 10 MB por arquivo.
- Limite de 100 arquivos ou 100 MB por conta; download e exclusão com verificação de proprietário.
- Mensagens do cliente e respostas administrativas persistentes.
- Painel administrativo com visualização de clientes, pedidos, detalhes e atualização de status.
- Exclusão dos dados da conta com confirmação explícita; não exclui a conta ChatGPT.
- HTML com metadados, canonical, Open Graph textual, Twitter Card, breadcrumbs, Schema.org, sitemap e robots.

## O que depende de configuração externa

- **Emissão fiscal:** as notas são rascunhos. Não há conexão com prefeitura, SEFAZ ou provedor de NFS-e.
- **Impostos e folha:** os controles e a soma de salários não são apuração oficial; não há transmissão eSocial ou geração automática de guias.
- **Comunicação:** WhatsApp, e-mail transacional e notificações não estão conectados. As mensagens funcionam dentro da plataforma.
- **Pagamento e conta PJ:** não existem cobranças ou movimentações bancárias reais.
- **Empresa:** inserir CNPJ, CRC, endereço, responsáveis, canais oficiais, condições comerciais e políticas validadas.
- **Depoimentos e planos:** conteúdo claramente demonstrativo; preços sob consulta. Não há números de clientes, avaliações ou parcerias inventados como reais.
- **Autenticação pública:** a versão hospedada usa a autenticação da plataforma Sites/ChatGPT. Não há login próprio por e-mail e senha nem integração OAuth externa. Para outra hospedagem, implemente um provedor confiável e substitua `identity()`; não aceite os cabeçalhos de identidade diretamente da internet.
- **Backups:** os arquivos e dados persistem, mas não foi configurada uma política externa de backup/restauração. Defina-a antes da operação comercial.

## Estrutura

```text
generate.mjs             Conteúdo, rotas, componentes HTML e SEO
public/styles.css        Identidade visual e responsividade
public/app.js            Interações e cliente da API
public/assets/           Fotografias WebP locais
worker.mjs               API e autorização em produção
preview.mjs              Servidor local, SQLite e armazenamento em disco
build.mjs                Gera páginas e empacota o Worker
db/schema.ts             Esquema das oito tabelas
drizzle/                 Migrações geradas e histórico
drizzle.config.ts        Configuração das migrações
migrate.mjs              Aplica migrações no banco local
tests/                   Testes de API, segurança e páginas
docs/API.md              Contrato dos endpoints
docs/TESTAR.md            Roteiro de teste manual
docs/ASSETS.md            Fontes das fotografias
dist/client/             Site gerado; não editar diretamente
dist/server/             Worker gerado; não editar diretamente
.openai/hosting.json     Identidade e bindings da hospedagem Sites
.env.example             Referência das variáveis; sem segredos
```

Para editar textos, altere `generate.mjs`; para estilos e interações, altere `public/`. Depois execute `node build.mjs` e recarregue a página. Alterações em `worker.mjs` exigem reiniciar o servidor local.

## Produção

O Worker é compatível com Cloudflare e possui `fetch(request, env, ctx)`. Bindings:

- `ASSETS`: arquivos de `dist/client`.
- `DB`: banco D1.
- `BUCKET`: bucket R2 privado.
- `ADMIN_USER_IDS`: IDs de usuários autorizados a operar o painel administrativo, separados por vírgula. **Vazio por padrão; acesso negado até configurar.**

A hospedagem Sites fornece a identidade por cabeçalhos confiáveis e aplica as migrações de `drizzle`. O código nunca promove automaticamente o primeiro visitante a administrador. Configure a lista administrativa apenas após verificar a identidade correta (`GET /api/me`). Não publique `preview.mjs` como servidor de produção.

As consultas usam parâmetros e filtram os registros pelo usuário. As mutações rejeitam origens diferentes, os downloads são privados e os rascunhos fiscais não podem ser promovidos a documentos emitidos pelo cliente. Os testes são uma validação funcional, não uma auditoria independente de segurança ou LGPD.

## VS Code

As tarefas em `.vscode/tasks.json` permitem **Gerar site**, **Iniciar ambiente local** e **Executar testes** em Terminal → Executar tarefa. O arquivo `T&T Contabilidade.code-workspace` abre o projeto com um clique.

## Identidade visual e endereço do site

O símbolo enviado foi integrado em `public/assets/marca-tt-original.png`, preservando o arquivo original. As regras de aplicação estão no fim de `public/styles.css`.

Esta entrega é local e não depende de publicação. O endereço padrão usado nos metadados é `http://127.0.0.1:4173`. Ao publicar, defina `SITE_ORIGIN` com o domínio real antes de executar o build para atualizar canonical, sitemap e metadados.

## Crédito de desenvolvimento

Desenvolvido por **Arthur R**. O crédito aparece no rodapé de todas as páginas. A identidade T&T utiliza o símbolo original em selos, assinaturas, navegação e acesso, com rodapé institucional azul-marinho e detalhes dourados.

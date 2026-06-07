# ⬡ EstoquePro

Sistema de controle de estoque de produtos com interface web completa, construído com **Node.js**, **Express** e **MySQL**, aplicando Arquitetura em Camadas (Layered Architecture).

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura em Camadas](#arquitetura-em-camadas)
- [Banco de Dados](#banco-de-dados)
- [API Reference](#api-reference)
- [Front-end](#front-end)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Importação via CSV](#importação-via-csv)
- [Decisões Técnicas](#decisões-técnicas)

---

## Visão Geral

O EstoquePro é uma aplicação full-stack para gerenciamento de estoque industrial. Oferece um CRUD completo de produtos com categorias, filtros avançados, importação em lote via CSV, relatórios visuais com gráficos e painel de configurações persistido em banco de dados.

### Funcionalidades

- ✅ CRUD completo de produtos
- ✅ Categorias com cores personalizadas
- ✅ Filtros avançados por categoria, preço e quantidade
- ✅ Importação em lote via arquivo CSV
- ✅ Dashboard com métricas em tempo real
- ✅ Relatórios com gráficos (pizza, rosca, barras)
- ✅ Alertas configuráveis de estoque baixo
- ✅ Perfil de usuário persistido no banco
- ✅ Interface dark theme profissional

---

## Tecnologias

| Camada | Tecnologia | Finalidade |
|---|---|---|
| Servidor | Node.js v24+ | Runtime JavaScript |
| Framework | Express 5 | Roteamento e middlewares |
| Banco de dados | MySQL 8 | Persistência dos dados |
| Driver MySQL | mysql2/promise | Pool de conexões async/await |
| Upload de arquivos | multer | Processamento de CSV via multipart/form-data |
| Variáveis de ambiente | dotenv | Configuração segura de credenciais |
| Front-end | HTML + CSS + JS puro | Interface sem frameworks |
| Gráficos | Chart.js 4 | Visualizações na página de relatórios |
| Fontes | Google Fonts | DM Serif Display, DM Mono, Outfit |

---

## Estrutura do Projeto

```
estoque-api/
│
├── index.js                          ← Ponto de entrada: carrega .env e sobe o servidor
├── .env                              ← Variáveis de ambiente (não versionar)
├── .gitignore                        ← Ignora node_modules/ e .env
├── database.sql                      ← Script completo de criação do banco
├── package.json
│
├── public/                           ← Front-end (servido pelo Express como estático)
│   ├── index.html                    ← Dashboard principal
│   ├── script.js                     ← Lógica do Dashboard
│   ├── produtos.html                 ← Página de Produtos
│   ├── produtos.js                   ← Filtros, categorias e importação CSV
│   ├── relatorios.html               ← Página de Relatórios
│   ├── relatorios.js                 ← Gráficos com Chart.js
│   ├── configuracoes.html            ← Página de Configurações
│   ├── configuracoes.js              ← Salva perfil e alertas via API
│   ├── shared.js                     ← Utilitários compartilhados entre páginas
│   └── style.css                     ← Design system completo (dark theme)
│
└── src/
    ├── app.js                        ← Configura Express, middlewares e rotas
    │
    ├── config/
    │   └── database.js               ← Pool de conexão MySQL (lê do .env)
    │
    ├── models/                       ← Único lugar com SQL no sistema
    │   ├── produtoModel.js           ← findAll (filtros), findById, createMany, update, remove
    │   ├── categoriaModel.js         ← findAll, findById, create, remove
    │   ├── configuracaoModel.js      ← findAll, upsert (chave/valor)
    │   └── usuarioModel.js           ← findOne, update
    │
    ├── controllers/                  ← Gerencia req, res e status HTTP
    │   ├── produtoController.js      ← Inclui importação de CSV
    │   ├── categoriaController.js
    │   └── configuracaoController.js ← Unifica configurações + usuário
    │
    └── routes/                       ← Mapeia URLs para Controllers
        ├── produtoRoutes.js          ← Inclui rota POST /importar com multer
        ├── categoriaRoutes.js
        └── configuracaoRoutes.js
```

---

## Arquitetura em Camadas

O projeto segue a **Layered Architecture** com separação estrita de responsabilidades:

```
Requisição HTTP
      ↓
  Routes         → "Qual função executa para essa URL?"
      ↓
  Controller     → "Extrai dados do req, valida, devolve res"
      ↓
  Model          → "Executa o SQL e retorna o resultado"
      ↓
  database.js    → Pool de conexões MySQL
```

Cada camada conhece apenas a camada imediatamente abaixo dela. O Controller não sabe SQL. O Model não sabe de HTTP. As Routes não sabem de negócio.

### Fluxo real de um PUT /produtos/1

```
Thunder Client → PUT /produtos/1  { "preco": 0.90 }
      ↓
produtoRoutes.js   → router.put('/:id', atualizarProduto)
      ↓
produtoController  → extrai id=1 e preco=0.90 do req
                   → chama ProdutoModel.findById(1)   [verifica se existe]
                   → chama ProdutoModel.update(1, { preco: 0.90 })
                   → res.status(200).json({ mensagem: '...' })
      ↓
produtoModel       → monta UPDATE produtos SET preco = ? WHERE id = ?
                   → executa via pool.query()
      ↓
database.js        → pool MySQL executa no banco
```

---

## Banco de Dados

### Diagrama de tabelas

```
┌─────────────┐        ┌──────────────────┐
│  categorias │        │     produtos      │
│─────────────│        │──────────────────│
│ id (PK)     │◄───────│ id (PK)          │
│ nome        │  FK    │ nome             │
│ cor         │        │ preco            │
│ criado_em   │        │ quantidade       │
└─────────────┘        │ categoria_id(FK) │
                       │ criado_em        │
                       └──────────────────┘

┌──────────────────┐   ┌──────────────┐
│  configuracoes   │   │   usuarios   │
│──────────────────│   │──────────────│
│ chave (PK)       │   │ id (PK)      │
│ valor            │   │ nome         │
└──────────────────┘   │ cargo        │
                       │ email        │
                       │ criado_em    │
                       └──────────────┘
```

### Decisões de modelagem

- `categoria_id` usa `ON DELETE SET NULL` — deletar uma categoria não apaga os produtos vinculados, apenas desvincula
- `configuracoes` usa modelo chave/valor — flexível para adicionar novas configurações sem alterar a estrutura da tabela
- `categorias` tem `UNIQUE KEY` no nome — impede categorias duplicadas a nível de banco

---

## API Reference

### Produtos

| Método | Endpoint | Descrição | Body |
|---|---|---|---|
| GET | `/produtos` | Lista todos (aceita filtros via query string) | — |
| GET | `/produtos/:id` | Busca um produto por ID | — |
| POST | `/produtos` | Cria um ou múltiplos produtos | `{}` ou `[{}]` |
| POST | `/produtos/importar` | Importa produtos via arquivo CSV | `multipart/form-data` |
| PUT | `/produtos/:id` | Atualiza campos de um produto | `{}` |
| DELETE | `/produtos/:id` | Remove um produto | — |

#### Filtros disponíveis no GET /produtos

```
GET /produtos?categoria_id=1&preco_min=5&preco_max=50&qtd_min=100&qtd_max=5000
```

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `categoria_id` | number | Filtra por categoria |
| `preco_min` | number | Preço mínimo |
| `preco_max` | number | Preço máximo |
| `qtd_min` | number | Quantidade mínima |
| `qtd_max` | number | Quantidade máxima |

#### Exemplos de body

**POST /produtos — objeto único**
```json
{
  "nome": "Parafuso M8",
  "preco": 0.75,
  "quantidade": 2000,
  "categoria_id": 1
}
```

**POST /produtos — lote (array)**
```json
[
  { "nome": "Porca M8",   "preco": 0.50, "quantidade": 1500, "categoria_id": 1 },
  { "nome": "Arruela M8", "preco": 0.20, "quantidade": 3000, "categoria_id": 1 }
]
```

**PUT /produtos/:id — apenas os campos a atualizar**
```json
{
  "preco": 0.90,
  "quantidade": 5000
}
```

---

### Categorias

| Método | Endpoint | Descrição | Body |
|---|---|---|---|
| GET | `/categorias` | Lista todas as categorias | — |
| POST | `/categorias` | Cria uma nova categoria | `{ nome, cor }` |
| DELETE | `/categorias/:id` | Remove uma categoria | — |

**POST /categorias**
```json
{
  "nome": "Hidráulica",
  "cor": "#378add"
}
```

---

### Configurações

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/configuracoes` | Retorna configurações + dados do usuário |
| POST | `/configuracoes` | Salva configurações e/ou dados do usuário |

**GET /configuracoes — resposta**
```json
{
  "config": {
    "alerta_estoque_baixo": "10",
    "tema": "dark"
  },
  "usuario": {
    "id": 1,
    "nome": "Ismael",
    "cargo": "Administrador",
    "email": "ismael@empresa.com"
  }
}
```

**POST /configuracoes**
```json
{
  "config": {
    "alerta_estoque_baixo": 5,
    "tema": "dark"
  },
  "usuario": {
    "nome": "Ismael",
    "cargo": "Técnico de Automação",
    "email": "ismael@empresa.com"
  }
}
```

---

### Health Check

```
GET /health
→ { "status": "OK", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### Padrão de respostas HTTP

| Situação | Status |
|---|---|
| Sucesso ao listar ou buscar | `200 OK` |
| Criado com sucesso | `201 Created` |
| Campo obrigatório faltando | `400 Bad Request` |
| Recurso não encontrado | `404 Not Found` |
| Chave duplicada (categoria) | `409 Conflict` |
| Erro interno do servidor | `500 Internal Server Error` |

---

## Front-end

O front-end é servido diretamente pelo Express via `express.static('public')`. Não há framework — apenas HTML, CSS e JavaScript puro com `fetch()`.

### Páginas

| Página | URL | Funcionalidades |
|---|---|---|
| Dashboard | `/` | Métricas, tabela completa, criar/editar/deletar produtos |
| Produtos | `/produtos.html` | Filtros avançados, categorias, importação CSV |
| Relatórios | `/relatorios.html` | Gráficos de rosca, pizza e barras horizontais |
| Configurações | `/configuracoes.html` | Perfil do usuário, limite de alerta, tema |

### Arquivo shared.js

Contém utilitários compartilhados entre todas as páginas:
- `mostrarToast(msg, tipo)` — notificações visuais
- `formatarMoeda(valor)` — formata em R$ pt-BR
- `getStatusBadge(quantidade, limite)` — retorna classe e label do badge
- `escapeHtml(str)` — previne XSS ao inserir conteúdo dinâmico
- `carregarUsuarioSidebar()` — popula nome e avatar na sidebar

---

## Instalação e Configuração

### Pré-requisitos

- Node.js v18 ou superior
- MySQL 8.0 ou superior
- npm

### Passo a passo

**1. Clone ou baixe o projeto**
```bash
cd D:\
mkdir estoque-api && cd estoque-api
```

**2. Instale as dependências**
```bash
npm install
```

As dependências instaladas são:
```json
{
  "express": "^5.x",
  "mysql2": "^3.x",
  "dotenv": "^16.x",
  "multer": "^1.x"
}
```

**3. Configure o arquivo .env**
```bash
# Edite o .env com suas credenciais
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=estoque_db
PORT=3000
```

**4. Execute o script do banco de dados**

No MySQL Workbench: abra `database.sql` e execute com `Ctrl+Shift+Enter`

Ou via PowerShell:
```powershell
Get-Content database.sql | mysql -u root -p
```

> ⚠️ Se a tabela `produtos` já existia sem a coluna `categoria_id`, rode antes:
> ```sql
> ALTER TABLE produtos
>   ADD COLUMN categoria_id INT NULL,
>   ADD CONSTRAINT fk_produto_categoria
>     FOREIGN KEY (categoria_id) REFERENCES categorias(id)
>     ON DELETE SET NULL;
> ```

**5. Inicie o servidor**
```bash
node index.js
```

**6. Acesse no navegador**
```
http://localhost:3000
```

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | `sua_senha` |
| `DB_NAME` | Nome do banco de dados | `estoque_db` |
| `PORT` | Porta do servidor HTTP | `3000` |

> O arquivo `.env` nunca deve ser enviado ao GitHub. O `.gitignore` já garante isso.

---

## Importação via CSV

A página de Produtos permite importar produtos em lote via arquivo `.csv`.

### Formato esperado

```csv
nome,preco,quantidade,categoria_id
Parafuso M10,0.80,2000,1
Chave Philips,9.90,50,2
Cabo 4mm,6.50,300,3
```

### Regras

- A primeira linha é o cabeçalho e será ignorada
- Separador aceito: vírgula `,` ou ponto e vírgula `;`
- `categoria_id` é opcional — deixe vazio para sem categoria
- Linhas com dados inválidos são puladas e listadas no log de erros
- Tamanho máximo do arquivo: **2MB**

### Endpoint direto (Thunder Client)

```
POST /produtos/importar
Content-Type: multipart/form-data
campo: arquivo  →  seu_arquivo.csv
```

---

## Decisões Técnicas

### Por que `!== undefined` em vez de `||` no UPDATE?

```js
// ❌ Errado — o || ignora valores falsy como 0
preco: body.preco || antigoPrecio

// ✅ Correto — aceita qualquer valor enviado, incluindo 0
if (campos.preco !== undefined) { ... }
```

### Por que Pool de conexões?

O `mysql2` com `createPool` mantém conexões abertas e reutilizáveis. Abrir e fechar uma conexão por requisição é lento e desperdiça recursos. O pool gerencia isso automaticamente.

### Por que app.js separado do index.js?

Separar a configuração do servidor do ponto de entrada permite testar a aplicação com ferramentas como Supertest sem precisar subir um servidor real na porta 3000.

### Por que multer com memoryStorage?

O arquivo CSV é processado em memória (`req.file.buffer`) e descartado após a importação. Não faz sentido salvar o arquivo em disco já que ele é apenas um veículo para os dados — o que importa são os produtos inseridos no banco.

### Por que ON DELETE SET NULL nas categorias?

Deletar uma categoria não deve apagar todos os produtos vinculados a ela — isso seria uma perda de dados grave. Com `SET NULL`, os produtos ficam sem categoria mas permanecem no sistema.

---

## Autor

Desenvolvido por **Ismael** — Técnico de Automação Industrial em transição para Engenharia de Software.

Stack de aprendizado: Node.js · Express · MySQL · Arquitetura em Camadas · REST API · Front-end Vanilla

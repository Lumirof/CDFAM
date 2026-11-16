# CDFAM — Portal de divulgação e gestão de conteúdo

Plataforma web da **Coordenadoria de Desenvolvimento Familiar (CDFAM)** da Universidade Federal do Ceará (UFC), desenvolvida na disciplina **Projeto Integrado I** do curso de **Sistemas e Mídias Digitais** (Instituto UFC Virtual).

O objetivo é centralizar, em um canal oficial e sempre atualizado, as informações, notícias, serviços, campanhas e fluxos de solicitação da CDFAM para toda a comunidade acadêmica, e dar autonomia à equipe da coordenadoria para publicar e editar esse conteúdo sem depender de um desenvolvedor.

---

## Sumário

- [Contexto e problema](#contexto-e-problema)
- [Escopo](#escopo)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
- [Autenticação](#autenticação)
- [Endpoints da API](#endpoints-da-api)
- [Modelo de dados](#modelo-de-dados)
- [Status do projeto](#status-do-projeto)
- [Documentação](#documentação)
- [Equipe](#equipe)
- [Licença](#licença)

---

## Contexto e problema

A CDFAM oferece serviços de saúde e assistência à comunidade e é espaço de estágio, extensão e pesquisa para estudantes da área da saúde. Pesquisas e entrevistas feitas pela equipe mostraram que:

- a comunidade acadêmica em geral conhece pouco os serviços, ações e campanhas da CDFAM;
- o site oficial tem conteúdo desatualizado (as últimas notícias são de 2021), pois quem o mantém não tem autonomia nem uma ferramenta simples de edição;
- a comunicação do dia a dia acontece em grupos de WhatsApp e redes sociais, o que fragmenta a informação e faz perder o histórico.

A solução é um portal público de consulta, com uma área administrativa simples, que **não armazena dados de pacientes** e restringe dados administrativos aos usuários autenticados.

## Escopo

### Perfis de acesso

| Perfil | Autenticação | O que pode fazer |
| --- | --- | --- |
| **Visitante** | Não precisa de login | Consultar notícias, serviços, agenda, estágios e extensão |
| **Administrador** | E-mail e senha (JWT) | Criar, editar, despublicar e excluir os conteúdos acima |

### Conteúdos gerenciáveis

Notícias (com categorias, rascunho/publicação/arquivamento e imagens), eventos e categorias de evento, serviços de atendimento (com atividades e horários), horário de funcionamento, bloqueios de agenda (feriados e manutenção), mapa de agendamento vigente, atividades de estágio e ações de extensão (com turnos).

> O agendamento de salas **ficou fora do escopo** (versão 3.0 do documento de requisitos). A solicitação de salas continua sendo feita pelo formulário que a CDFAM já usa, e o site apenas orienta o fluxo e exibe a agenda.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Back-end | Node.js + Express 5 (CommonJS) |
| Banco de dados | MySQL (driver `mysql2`) |
| Autenticação | JSON Web Token (`jsonwebtoken`) e hash de senha com `bcryptjs` |
| Configuração | `dotenv`, `cors` |
| Desenvolvimento | `nodemon` |
| Front-end | HTML5, CSS3 e JavaScript (em desenvolvimento) |
| Design | Figma (protótipos de média fidelidade) |
| Gestão | GitHub, Trello e Notion |

## Arquitetura

O back-end é organizado em camadas, cada uma com uma responsabilidade:

```
Requisição → routes → middlewares (auth) → controllers → services → repositories → MySQL
```

| Camada | Responsabilidade |
| --- | --- |
| `routes` | Define os caminhos e separa as rotas **públicas** das rotas **administrativas** |
| `middlewares` | Autenticação via JWT, tratamento de erros e rota não encontrada |
| `controllers` | Recebem a requisição HTTP e devolvem a resposta |
| `services` | Regras de negócio e validação dos dados |
| `repositories` | Acesso ao banco (consultas SQL) |
| `utils` | Utilitários (`AppError`, `slugify`) |

## Estrutura do repositório

```
CDFAM/
├── database/
│   └── schema.sql            # Criação do banco `cdfam` e de todas as tabelas
├── public/
│   └── index.html            # Front-end (em desenvolvimento)
├── src/
│   ├── config/database.js    # Pool de conexões MySQL
│   ├── controllers/          # Camada HTTP
│   ├── middlewares/          # auth, validate, errorHandler
│   ├── repositories/         # Consultas SQL
│   ├── routes/               # Rotas públicas e administrativas
│   ├── services/             # Regras de negócio
│   ├── utils/                # AppError, slugify
│   ├── app.js                # Configuração do Express
│   └── server.js             # Inicialização (conecta ao MySQL e sobe o servidor)
├── .env.example              # Modelo das variáveis de ambiente
├── package.json
└── README.md
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [MySQL](https://www.mysql.com/) 8.0 ou superior (o schema usa `CHECK`, valores padrão com expressão e colunas geradas)
- Git

### 1. Clonar e instalar as dependências

```bash
git clone https://github.com/Lumirof/CDFAM.git
cd CDFAM
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o modelo e preencha com os seus dados:

```bash
cp .env.example .env
```

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `DB_HOST` | Servidor do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | `sua_senha` |
| `DB_NAME` | Nome do banco | `cdfam` |
| `JWT_SECRET` | Chave usada para assinar os tokens (use uma frase longa e aleatória) | — |
| `JWT_EXPIRES_IN` | Validade do token | `8h` |
| `PORT` | Porta da API (opcional, padrão `3000`) | `3000` |

> O arquivo `.env` está no `.gitignore`. Nunca o envie ao repositório.

### 3. Criar o banco de dados

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `cdfam` (`utf8mb4`) e todas as tabelas.

### 4. Criar o primeiro administrador

Todas as rotas de gerenciamento exigem login, então o primeiro administrador precisa ser inserido diretamente no banco. Gere o hash da senha:

```bash
node -e "console.log(require('bcryptjs').hashSync('SuaSenhaAqui', 10))"
```

E insira o registro:

```sql
USE cdfam;
INSERT INTO administrador (nome, email, senha_hash)
VALUES ('Seu Nome', 'seu@email.com', 'COLE_O_HASH_AQUI');
```

Os demais administradores podem ser criados depois pela própria API (`POST /api/admin/administradores`). A senha nova deve ter no mínimo 8 caracteres.

### 5. Iniciar o servidor

```bash
npm run dev     # desenvolvimento, com recarga automática (nodemon)
npm start       # produção
```

Se tudo estiver certo, o terminal mostra `MySQL conectado com sucesso!` e `Servidor CDFAM rodando em http://localhost:3000`. Para conferir, acesse `http://localhost:3000/` no navegador.

### Problemas comuns

- **`Cannot find module '../utils/AppError'`** — o arquivo se chama `src/utils/appError.js` (com `a` minúsculo), mas boa parte do código importa `AppError`. Isso funciona no Windows e no macOS, que ignoram maiúsculas e minúsculas, mas falha no Linux. Padronize o nome do arquivo e os imports.
- **`Erro ao conectar ao MySQL`** — confira as variáveis `DB_*` no `.env` e se o serviço do MySQL está ativo.
- **`Chave JWT não configurada`** — defina `JWT_SECRET` no `.env`.

## Autenticação

A API usa **JWT** no formato Bearer.

1. Faça login:

   ```http
   POST /api/auth/login
   Content-Type: application/json

   { "email": "seu@email.com", "senha": "SuaSenhaAqui" }
   ```

   A resposta traz o `token` e os dados do administrador (`id`, `nome`, `email`).

2. Envie o token nas rotas administrativas:

   ```http
   Authorization: Bearer <token>
   ```

O token expira conforme `JWT_EXPIRES_IN`. A cada requisição, o middleware também confere se o administrador ainda existe e está ativo. Erros seguem o formato `{ "erro": "mensagem", "detalhes": ... }`.

## Endpoints da API

Todas as rotas ficam sob o prefixo `/api`. As rotas **públicas** só leem dados; as rotas **administrativas** (`/api/admin/...`) exigem o token.

### Rotas públicas (visitantes)

| Recurso | Método e caminho |
| --- | --- |
| Notícias | `GET /noticias` · `GET /noticias/:slug` |
| Categorias de notícia | `GET /categorias` · `GET /categorias/:id` |
| Imagens de notícia | `GET /noticia-imagem` |
| Eventos | `GET /evento` · `GET /evento/:id` · `GET /evento/categorias` |
| Categorias de evento | `GET /evento-categoria` · `GET /evento-categoria/:id` |
| Serviços | `GET /servicos` · `GET /servicos/:id` |
| Atividades dos serviços | `GET /atividades-servicos` |
| Horários dos serviços | `GET /servico-horarios` · `GET /servico-horarios/:id` |
| Horário de funcionamento | `GET /horario-funcionamento` |
| Bloqueios de agenda | `GET /agenda-bloqueada` |
| Mapa de agendamento vigente | `GET /mapa-agendamento/vigente` |
| Atividades de estágio | `GET /atividades-estagio?modalidade=` · `GET /atividades-estagio/:id` |
| Ações de extensão | `GET /extensao` |

### Autenticação

| Método e caminho | Descrição |
| --- | --- |
| `POST /auth/login` | Entra com e-mail e senha |
| `PUT /auth/alterar-senha` | Altera a própria senha (exige token e a senha atual) |
| `POST /auth/logout` | Encerra a sessão (exige token) |

### Rotas administrativas (exigem token)

| Recurso | Caminho base | Operações |
| --- | --- | --- |
| Administradores | `/admin/administradores` | CRUD · `DELETE` desativa · `PATCH /:id/reativar` |
| Notícias | `/admin/noticias` | CRUD |
| Categorias de notícia | `/admin/categorias` | CRUD |
| Imagens de notícia | `/admin/noticia-imagem` | CRUD |
| Eventos | `/admin/evento` | CRUD |
| Categorias de evento | `/admin/evento-categoria` | CRUD |
| Serviços | `/admin/servicos` | CRUD · `DELETE` desativa |
| Atividades dos serviços | `/admin/atividades-servicos` | CRUD · `PATCH /:id/desativar` |
| Horários dos serviços | `/admin/servico-horarios` | CRUD |
| Horário de funcionamento | `/admin/horario-funcionamento` | CRUD · `PATCH /:id/desativar` |
| Bloqueios de agenda | `/admin/agenda-bloqueada` | CRUD |
| Mapa de agendamento | `/admin/mapas-agendamento` | CRUD (`DELETE` com `?confirmar=true`) |
| Atividades de estágio | `/admin/atividades-estagio` | CRUD · `DELETE` desativa |
| Ações de extensão | `/admin/extensao` | CRUD · `PATCH /:id/ativa` |
| Turnos de extensão | `/admin/extensao/:id/turnos` · `/admin/extensao-turnos/:id` | Listar, criar, atualizar e remover |

"CRUD" significa `GET /`, `GET /:id`, `POST /`, `PUT /:id` e `DELETE /:id`.

### Notícias: status e período de publicação

Uma notícia tem um dos status `rascunho`, `publicada`, `despublicada` ou `arquivada` (padrão: `rascunho`) e pode ter período de publicação (`publicada_em` e `publicada_ate`, no formato `AAAA-MM-DD`; o fim não pode ser anterior ao início). O slug é gerado a partir do título.

### Exemplo

```bash
# Criar uma notícia como administrador
curl -X POST http://localhost:3000/api/admin/noticias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 1,
    "titulo": "Campanha de vacinação contra a gripe",
    "resumo": "Vacinação aberta à comunidade.",
    "conteudo": "Texto completo da notícia...",
    "status": "publicada"
  }'
```

## Modelo de dados

O banco `cdfam` (MySQL, `utf8mb4`) tem 15 tabelas. As colunas `atualizado_por` e `autor_id` apontam para `administrador`.

| Tabela | Finalidade |
| --- | --- |
| `administrador` | Contas de administrador (`senha_hash`, `ativo`, `ultimo_login`) |
| `categoria` | Categorias de notícia |
| `noticia` | Notícias, com status, destaque, período de publicação e busca `FULLTEXT` |
| `noticia_imagem` | Imagens da notícia, com texto alternativo obrigatório (acessibilidade) |
| `servico_atendimento` | Serviços oferecidos: quem pode usar, local e como ser atendido |
| `atividade_servico` | Atividades de cada serviço |
| `servico_horario` | Dia e horário de cada serviço ou atividade (horários paralelos são permitidos) |
| `categoria_evento` | Categorias e cores dos eventos |
| `evento` | Eventos e campanhas, com período de publicação |
| `horario_funcionamento` | Horário geral de funcionamento |
| `bloqueio_agenda` | Feriados, manutenções e outros bloqueios |
| `mapa_agendamento` | Link do mapa de ocupação; só pode existir um `vigente` por vez |
| `atividade_estagio` | Estágios e práticas por modalidade (`pratica_assistida`, `estagio_internato`, `residencia`) |
| `acao_extensao` | Ações de extensão e seus coordenadores |
| `acao_extensao_turno` | Turnos (manhã ou tarde) por dia da semana de cada ação |

Em `dia_semana`, os valores vão de `0` a `6`. O banco aplica várias regras por `CHECK`: período de publicação coerente, `hora_fim` maior que `hora_inicio` e coordenador de extensão obrigatório.

## Status do projeto

**Já feito**

- Levantamento de requisitos, entrevista com a CDFAM, personas, mapa conceitual e moodboard (Checkpoint 1)
- Protótipos de média fidelidade (mobile e desktop, visitantes e administradores)
- Banco de dados modelado e criado (`database/schema.sql`)
- API REST com CRUD das 15 tabelas, autenticação JWT e rotas públicas e administrativas separadas
- Testes de requisições no Insomnia

**Em andamento / a fazer**

- Front-end em HTML, CSS e JavaScript (`public/index.html` ainda está vazio)
- Script de dados de exemplo (`seed`) para facilitar o desenvolvimento
- Documentação da API com Swagger
- Correção do nome do arquivo `appError.js` / `AppError` (ver [Problemas comuns](#problemas-comuns))

## Documentação

O relatório do **Checkpoint 2** reúne a identificação do problema, a coleta e análise de dados (questionário e entrevista), personas, mapa conceitual, moodboard, requisitos funcionais e não funcionais, regras de negócio, fluxos de usuário e protótipos.

## Equipe

| Nome |
| --- | --- |
| Bárbara Carvalho |
| Cybele Chaves |
| Giovanna Carneiro |
| Iasmin Sena |
| Julia Flor |

Projeto Integrado I — Sistemas e Mídias Digitais — Instituto UFC Virtual — Universidade Federal do Ceará.

## Licença

ISC (conforme o `package.json`).
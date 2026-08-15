# CinePass

Plataforma Full Stack para gerenciamento e compra de ingressos de sessões de cinema.

Projeto desenvolvido como parte do **Desafio Elite Dev da Verzel**.

> **Status:** Em desenvolvimento

## Sobre

O CinePass possui três perfis de usuário:

- **Organizador:** cria e gerencia eventos.
- **Cliente:** consulta eventos, reserva assentos, realiza pagamento simulado e recebe ingressos.
- **Portaria:** valida ingressos na entrada do evento.

Fluxo principal:

```text
Organizador
  ↓
Busca filme no TMDb
  ↓
Cria e publica evento
  ↓
Cliente visualiza evento
  ↓
Seleciona assentos
  ↓
Reserva
  ↓
Pagamento simulado
  ↓
Ingresso + QR Code
  ↓
Portaria valida ingresso
```

O escopo prioriza um fluxo completo de ponta a ponta antes de funcionalidades opcionais.

---

## Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT
- bcrypt

### Banco e infraestrutura
- PostgreSQL
- [Neon](https://neon.tech)

### Integração externa
- [TMDb](https://www.themoviedb.org/)

---

## Estrutura do projeto

Monorepo simples, com frontend e backend independentes, cada um com seu próprio `package.json`.

```text
cinepass/
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
└── README.md
```

Optei por não usar um framework full-stack único (como Next.js), para manter explícita a separação entre cliente e servidor e facilitar a leitura da solução.

---

## Arquitetura do backend

```text
Routes → Controller → Service → Prisma → PostgreSQL
```

**Routes** — define os endpoints e conecta cada rota ao controller correspondente.

**Controllers** — cuidam apenas do trânsito HTTP: recebem `req`, chamam o service e retornam `res` com o status adequado. Não concentram regra de negócio.

**Services** — concentram as regras de negócio e não dependem de `req`/`res`.

**Prisma** — usado como camada de acesso a dados, já tipada.

### Sobre não usar repository pattern

Decisão consciente: para o escopo e o prazo do desafio, o Prisma Client já fornece uma camada de acesso a dados tipada. Adicionar repositories seria uma abstração extra sem ganho proporcional aqui. Em um sistema maior, com múltiplas fontes de dados ou necessidade extensa de mocks em testes, essa camada faria mais sentido.

### `app.ts` e `server.ts`

`app.ts` concentra a configuração do Express (middlewares, rotas). `server.ts` só inicia o servidor com `.listen()`. Essa separação facilita testes de integração que usam a instância do `app` sem precisar abrir uma porta de rede.

---

## Banco de dados

Oito entidades: `User`, `Movie`, `Event`, `Seat`, `Reservation`, `ReservationSeat`, `Payment`, `Ticket`.

**Um único `User` com `Role`** (`ORGANIZER`, `CUSTOMER`, `GATEKEEPER`) em vez de tabelas separadas por papel. Os três compartilham a mesma estrutura de dados — a diferença está nas permissões, tratadas pela autorização no backend.

**`ReservationSeat` como entidade intermediária** entre `Reservation` e `Seat`. Uma reserva pode ter vários assentos (compra em grupo), então a relação é muitos-para-muitos. Essa tabela também permite gerar um ingresso individual por assento reservado.

**Proteção contra venda duplicada**: `ReservationSeat.seatId` tem `@unique`. O próprio PostgreSQL recusa duas associações simultâneas para o mesmo assento, mesmo em caso de requisições concorrentes — garantia no nível do banco, não só na aplicação.

**Valores monetários em `Decimal(10,2)`**, não `Float`, evitando erro de arredondamento em somas de dinheiro.

**`EventStatus`** (`DRAFT`, `PUBLISHED`, `CANCELLED`) diferencia um evento em criação de um evento disponível para clientes.

**Validação única de ingresso**: `Ticket.usedAt` — `null` significa não utilizado; uma data preenchida significa já validado. Sem necessidade de tabela de log separada.

---

## PostgreSQL no Neon

O banco é hospedado no [Neon](https://neon.tech), evitando dependência de instalação local e facilitando uma futura publicação da aplicação. Credenciais ficam apenas em variáveis de ambiente, não versionadas.

---

## Segurança

- Senhas armazenadas apenas como hash, via `bcrypt`.
- Autenticação via JWT, com segredo gerado aleatoriamente e mantido fora do versionamento.
- Mensagens de erro de login são genéricas ("e-mail ou senha inválidos"), sem indicar qual dos dois está incorreto — evita expor quais e-mails estão cadastrados.
- Código do ingresso (QR) planejado para ser gerado a partir de uma assinatura própria, não apenas um identificador exposto.

---

## Funcionalidades

### Concluídas
- [x] Estrutura inicial do projeto (frontend + backend)
- [x] Backend Node + Express + TypeScript
- [x] PostgreSQL + Neon
- [x] Modelagem do banco e migrations (Prisma)
- [x] Arquitetura em camadas (routes → controller → service)
- [x] Registro de usuário
- [x] Login com JWT
- [x] Hash de senha (bcrypt)

### Em desenvolvimento
- [ ] Middleware de autenticação (`authenticate`)
- [ ] Middleware de autorização por papel (`authorize`)
- [ ] Integração com TMDb
- [ ] CRUD de eventos
- [ ] Seleção de assentos
- [ ] Reserva (com transação para concorrência)
- [ ] Pagamento simulado
- [ ] Geração de ingresso com QR Code
- [ ] Compartilhamento de ingresso por link
- [ ] Validação na portaria
- [ ] Seed de dados de teste
- [ ] Deploy

---

## Como executar

### Pré-requisitos
- Node.js
- npm
- Git
- Conta no [Neon](https://neon.tech) (ou PostgreSQL local)

### Backend

```bash
cd backend
npm install
```

Configure `backend/.env`:

```env
PORT=3333
DATABASE_URL="sua_connection_string"
JWT_SECRET="sua_chave_secreta"
```

```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
---

## Dados de teste

O desafio exige dados semeados para permitir a avaliação do fluxo sem configuração manual.

Após a implementação do seed, serão disponibilizados aqui:

| Papel | E-mail | Senha |
|---|---|---|
| Organizador | Em breve | Em breve |
| Cliente 1 | Em breve | Em breve |
| Cliente 2 | Em breve | Em breve |
| Portaria | Em breve | Em breve |

---

## Uso de IA

Utilizei IA como ferramenta de apoio ao longo do desenvolvimento, principalmente para:

- entender o enunciado e planejar a divisão do trabalho em etapas;
- discutir alternativas de arquitetura e modelagem de banco (ex.: avaliar repository pattern, decidir entre `Float` e `Decimal`, desenhar a entidade `ReservationSeat`);
- resolver problemas de configuração e compatibilidade de versões (ex.: ajustes entre versões do Prisma);
- revisar código e sugerir tratamento de erros;
- apoiar a escrita desta documentação.

Decisões de modelagem e arquitetura foram discutidas com a IA, mas compreendidas e validadas por mim antes de aplicar — inclusive em pontos onde optei por uma abordagem mais simples do que a sugerida, priorizando o prazo do desafio .

---

## Contexto do desafio

Projeto desenvolvido para o Desafio Elite Dev da Verzel: uma plataforma de eventos e ingressos, com criação de eventos, reservas, pagamento simulado, ingresso com QR Code e validação na portaria.
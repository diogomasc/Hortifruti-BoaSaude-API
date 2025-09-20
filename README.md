# Hortifruti Boa Saúde API

API RESTful para gestão do marketplace de assinatura de hortifrúti com Node.js, Fastify e Drizzle ORM desenvolvida durante disciplina de Engenharia de Software no IFBA 2025.2.

## Sobre o Projeto

O Hortifruti Boa Saúde é um marketplace de assinatura que conecta produtores locais de hortifrúti com consumidores, promovendo alimentação saudável e sustentável. A API gerencia usuários (consumidores, produtores e administradores), endereços, carteiras digitais e todo o ecossistema do marketplace.

## Arquitetura

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[🌐 Web App<br/>React/Next.js]
    end
    
    subgraph "Backend Layer"
        API[🔧 Hortifruti API<br/>Node.js + Fastify + Drizzle ORM]
    end
    
    subgraph "Database Layer"
        POSTGRES[(🐘 PostgreSQL<br/>Docker Container)]
    end
    
    subgraph "Email Service (Feature Futura)"
        EMAIL[📧 Email Service<br/>Ativação de Conta e Recuperação de Senha]
    end
    
    WEB --> API
    
    API --> POSTGRES
    API --> EMAIL
    
    style WEB fill:#e3f2fd
    style API fill:#f3e5f5
    style POSTGRES fill:#e1f5fe
    style EMAIL fill:#e8f5e8
```

## Tecnologias

- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Fastify](https://fastify.dev/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM TypeScript-first
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Docker](https://www.docker.com/)** - Containerização
- **[Zod](https://zod.dev/)** - Validação de schemas TypeScript-first
- **[Argon2](https://github.com/ranisalt/node-argon2)** - Hash de senhas seguro

## Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

### Obrigatórios
- **[Node.js](https://nodejs.org/en/download/)** (versão 22)
- **[npm](https://www.npmjs.com/)**
- **[Docker](https://www.docker.com/get-started/)**
- **[Git](https://git-scm.com/downloads)**

### Opcionais (Recomendados)

- **[Postman](https://www.postman.com/downloads/)** ou **[Insomnia](https://insomnia.rest/download)** - Para testar a API

## Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/diogomasc/Hortifruti-BoaSaude-API.git
cd Hortifruti-BoaSaude-API
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.exemple .env

# Edite o arquivo .env com suas configurações
# O arquivo já vem com configurações padrão para desenvolvimento local
```

**Variáveis de ambiente principais:**
```env
NODE_ENV=dev
DATABASE_URL=postgresql://docker:docker@localhost:5432/api-hortifruti
```

### 4. Inicie o banco de dados
```bash
# Inicia o container PostgreSQL em background
docker-compose up -d
```

### 5. Execute as migrations
```bash
# Gera as migrations baseadas no schema
npm run db:generate

# Aplica as migrations no banco de dados
npm run db:migrate
```

### 6. Rodar a Aplicação (Desenvolvimento)
```bash
# Inicia o servidor em modo de desenvolvimento com hot reload
npm run dev
```

A API estará disponível em: **http://localhost:3333**

<!-- ### Acessar Documentação da API
Com o servidor rodando, acesse:
- **Swagger UI**: http://localhost:3333/docs -->

## Documentação

### Diagrama de Relacionamento

Para visualizar o diagrama completo das entidades e relacionamentos, consulte:
**[Diagrama de Relacionamento](./artifacts/Diagrama_de_Relacionamento_20_09_2025.md)**

### Visualizar Banco de Dados
```bash
# Abre o Drizzle Studio para explorar o banco visualmente
npm run db:studio
```

### Estrutura do Projeto
```
src/
├── @types/          # Definições de tipos TypeScript
├── database/        # Configuração do banco e schema
│   ├── client.ts    # Cliente do banco de dados
│   ├── schema.ts    # Schema das tabelas
│   └── seed.ts      # Dados iniciais (seeds)
├── env/             # Configuração de variáveis de ambiente
├── routes/          # Rotas da API
├── tests/           # Testes automatizados (e2e)
├── utils/           # Utilitários e helpers
├── app.ts           # Configuração do Fastify
└── server.ts        # Servidor principal
```

### Comandos Úteis para Desenvolvimento

```bash
# Resetar banco de dados (cuidado em produção!)
docker-compose down -v
docker-compose up -d
npm run db:migrate

# Ver logs do container PostgreSQL
docker-compose logs postgres

# Conectar diretamente ao PostgreSQL
docker exec -it api-hortifruti-pg psql -U docker -d api-hortifruti
```

## 🚀 Roadmap de Implementação

```mermaid
gantt
    title Roadmap MVP - Marketplace de Assinaturas
    dateFormat  YYYY-MM-DD
    section Fase 1 - CRUD Usuários & Testes
    CRUD Usuários Completo   :active, users, 2025-09-19, 2w
    Autenticação e Email     :auth, after users, 2w
    Sistema de Endereços     :addr, after auth, 2w
    Testes Unitários Fase 1  :tests1, after addr, 1w
    
    section Fase 2 - CRUD Produtos & Catálogo
    CRUD Produtos Completo   :products, after tests1, 2w
    Sistema de Categorias    :categories, after products, 2w
    Catálogo e Busca         :catalog, after categories, 2w
    Testes Unitários Fase 2  :tests2, after catalog, 1w
    
    section Fase 3 - Sistema de Assinaturas & Carrinho
    Carrinho de Assinaturas  :plans, after tests2, 2w
    Gestão de Assinaturas (Consumidor)  :cart, after plans, 2w
    Gestão de Assinaturas (Produtor)    :subscriptions, after cart, 2w
    Testes Unitários Fase 3  :tests3, after subscriptions, 1w
    
    section Fase 4 - Melhorias & Admin
    Painel Administrativo    :admin, after tests3, 3w
    Dashboard e Relatórios   :dashboard, after admin, 3w
    Otimizações e Cache      :optimization, after dashboard, 2w
    Testes Finais & Deploy   :final, after optimization, 1w
```

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**Desenvolvido por [Diogo Mascarenhas](https://github.com/diogomasc)**  
**IFBA - Instituto Federal da Bahia | 2025.2**

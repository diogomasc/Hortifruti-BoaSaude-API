# Hortifruti Boa Saúde API (Projeto Piloto)

API RESTful para o gerenciamento de um marketplace de assinaturas de hortifrúti, desenvolvida em **Node.js, Fastify e Drizzle ORM** como parte da disciplina de Engenharia de Software no **IFBA – 2025.2**.

A aplicação foi projetada seguindo princípios de **Clean Architecture**, aplicando padrões de design (Factory, Repository) e adotando boas práticas de segurança, escalabilidade e modularidade. Além de sua finalidade prática, este projeto também representa um processo de aprendizado e consolidação de conhecimentos em desenvolvimento de software moderno.

## Projeto Prático - Engenharia de Software

### Contexto Acadêmico

Este projeto foi desenvolvido como **Projeto Prático** da disciplina de **Engenharia de Software** do **Instituto Federal da Bahia (IFBA)** no semestre **2025.2**, sob orientação da professora responsável.

### Objetivos do Projeto

#### Objetivo Geral

Desenvolver uma API RESTful completa para um marketplace de assinaturas de hortifrúti, aplicando conceitos fundamentais de Engenharia de Software, incluindo arquitetura limpa, padrões de design, e boas práticas de desenvolvimento.

#### Objetivos Específicos

- **Aplicar Clean Architecture**: Implementar separação clara entre camadas de domínio, aplicação e infraestrutura
- **Implementar Design Patterns**: Utilizar padrões Repository, Factory e outros para resolver problemas comuns
- **Desenvolver Sistema RBAC**: Criar controle de acesso baseado em papéis (Consumer, Producer, Admin)
- **Integrar ORM Moderno**: Utilizar Drizzle ORM para gestão eficiente do banco de dados
- **Aplicar Validação Robusta**: Implementar validação de dados com Zod em todas as camadas
- **Documentar API**: Criar documentação interativa com Swagger/OpenAPI
- **Implementar Autenticação**: Desenvolver sistema seguro com JWT
- **Criar Testes**: Desenvolver suíte de testes unitários e de integração
- **Modelar Dados**: Projetar esquema de banco relacional otimizado

### Especificações Técnicas

#### Arquitetura

- **Padrão Arquitetural**: Clean Architecture
- **Linguagem**: TypeScript/Node.js
- **Framework Web**: Fastify
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI

#### Funcionalidades Implementadas

- Sistema completo de autenticação e autorização
- Gestão de usuários com diferentes papéis (RBAC)
- CRUD completo de produtos com upload de imagens
- Sistema de pedidos únicos e assinaturas recorrentes
- Gestão de endereços e carteiras digitais
- Aprovação descentralizada por produtores
- Notificações e monitoramento de status
- API RESTful com documentação interativa

## Sobre o Projeto

O **Hortifruti Boa Saúde** é um marketplace que conecta produtores locais de hortifrúti a consumidores por meio de um modelo de assinatura recorrente. O sistema promove **hábitos alimentares saudáveis**, incentivando o consumo de produtos frescos e sustentáveis, além de apoiar pequenos produtores da região.

A **API** implementa funcionalidades centrais, como:

- Gestão de usuários (consumidores, produtores e administradores)
- Controle de endereços e carteiras digitais
- Gerenciamento de produtos, pedidos e assinaturas
- Suporte a autenticação, autorização e papéis de acesso (RBAC)
- Sistema de aprovação descentralizada por produtores
- Notificações automáticas e monitoramento em tempo real

## Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB[Web App<br/>React/Next.js]
    end

    subgraph "Backend Layer"
        API[Hortifruti API<br/>Node.js + Fastify + Drizzle ORM]
    end

    subgraph "Database Layer"
        POSTGRES[(PostgreSQL<br/>Docker Container)]
    end

    subgraph "Email Service (Future Feature)"
        EMAIL[Email Service<br/>Ativação de Conta e Recuperação de Senha]
    end

    WEB --> API
    API --> POSTGRES
    API --> EMAIL

    style WEB fill:#e3f2fd
    style API fill:#f3e5f5
    style POSTGRES fill:#e1f5fe
    style EMAIL fill:#e8f5e8
```

A aplicação adota a separação em camadas (**Frontend, Backend e Database**), estendendo para futuras integrações (e-mail e notificações), de forma a garantir **evolutividade** e **escalabilidade**.

## Tecnologias Utilizadas

- **Node.js** – Runtime JavaScript para back-end.
- **Fastify** – Framework web rápido, extensível e eficiente.
- **TypeScript** – Superset tipado do JavaScript.
- **Drizzle ORM** – ORM moderno com suporte a TypeScript-first.
- **PostgreSQL** – Banco de dados relacional robusto.
- **Docker** – Containerização e portabilidade do ambiente.
- **Zod** – Validação de schemas de entrada e saída.
- **Argon2** – Algoritmo seguro de hashing de senhas.

## Padrões de Arquitetura e Design

Este projeto foi construído com base em padrões consolidados da engenharia de software, sendo também parte de um processo de **formação prática** nesses conceitos.

### Clean Architecture

Inspirada nas diretrizes de Robert C. Martin, garante **separação de responsabilidades** entre domínio, aplicação e infraestrutura, com forte apoio à testabilidade, flexibilidade tecnológica e inversão de dependências.

### Factory Pattern

Centraliza e encapsula a lógica de criação de objetos. Facilita a **manutenção**, promove **reutilização** e reduz o acoplamento entre módulos.

### Repository Pattern

Abstrai e organiza a lógica de persistência de dados, garantindo que regras de negócio não dependam diretamente da camada de banco. **Facilita testes** e a substituição de tecnologias de armazenamento.

## Segurança e Autenticação

- **JSON Web Tokens (JWT):** Autenticação stateless, leve e segura, adequada para arquiteturas distribuídas.
- **Role-Based Access Control (RBAC):** Autorização baseada em papéis, garantindo granularidade e rastreabilidade de permissões.

## Estrutura de Diretórios

A organização modular do projeto permite escalabilidade e facilita a evolução em longo prazo:

```
src/
├── @types/          # Definições de tipos globais e extensões
├── commands/        # Scripts de linha de comando e utilitários
├── constants/       # Constantes centralizadas da aplicação
├── database/        # Configuração do banco e schema Drizzle
├── env/             # Validação de variáveis de ambiente
├── http/            # Camada de apresentação HTTP
│   ├── controllers/ # Controladores organizados por domínio
│   │   ├── auth/        # Autenticação e autorização
│   │   ├── users/       # Gestão de usuários
│   │   ├── addresses/   # Gestão de endereços
│   │   ├── orders/      # Gestão de pedidos
│   │   └── products/    # Gestão de produtos
│   ├── middlewares/ # Middlewares HTTP (auth, RBAC, etc.)
│   ├── schemas/     # Validação de entrada/saída com Zod
│   └── routes.ts    # Definição centralizada de rotas
├── repositories/    # Camada de acesso a dados (Repository Pattern)
├── types/           # Tipos de negócio e domínio
├── use-cases/       # Regras de negócio (Clean Architecture)
│   ├── errors/      # Erros customizados de domínio
│   └── factories/   # Factories para casos de uso (Factory Pattern)
├── utils/           # Funções utilitárias e helpers
├── app.ts           # Configuração principal da aplicação
└── server.ts        # Ponto de entrada do servidor
```

## Instalação e Configuração

### Pré-requisitos

- **Node.js** (>= 22)
- **npm**
- **Docker**
- **Git**

( Recomendado: **Postman** ou **Insomnia** para testes )

### Passos de instalação

```bash
# Clone o repositório
git clone https://github.com/diogomasc/Hortifruti-BoaSaude-API.git
cd Hortifruti-BoaSaude-API

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

Configuração mínima de variáveis:

```env
NODE_ENV=dev
DATABASE_URL=postgresql://docker:docker@localhost:5432/api-hortifruti
```

### Inicialização

```bash
# Subir container PostgreSQL
docker-compose up -d

# Rodar migrations
npm run db:generate
npm run db:migrate

# Iniciar servidor em modo desenvolvimento
npm run dev
```

A API estará disponível em: **http://localhost:3333**

## Documentação e Diagramas

### Diagramas Técnicos

- **[Diagrama de Relacionamentos (ER)](./artifacts/Diagramas/Diagrama_de_Relacionamento.md)** - Modelagem completa do banco de dados
- **[Diagrama de Fluxo - Sistema de Assinaturas](./artifacts/Diagramas/Diagrama_de_Fluxo_Assinatura.md)** - Fluxo completo do processo de assinaturas
- **[Diagrama de Sequência UML](./artifacts/Diagramas/Diagrama_de_Sequencia_UML.md)** - Interações temporais entre componentes
- **[Casos de Uso e Rastreabilidade](./artifacts/Diagramas/Casos_de_Uso_e_Rastreabilidade.md)** - Mapeamento de funcionalidades e requisitos
- **[Diagrama de Módulos e Classes](./artifacts/Diagramas/Diagrama_de_Modulos_e_Classes.md)** - Arquitetura e organização do código

### Ferramentas de Desenvolvimento

- **Documentação Interativa da API**: [http://localhost:3333/docs](http://localhost:3333/docs) (Swagger UI)
- **Visualização do Banco de Dados**: Drizzle Studio

```bash
npm run db:studio
```

### Documentação Adicional

- **[Projeto Prático - Especificações](./artifacts/Docs/Projeto-Pratico.pdf)** - Documento de orientação do projeto

## Roadmap

### Fase 1: Fundação (Concluída)

- [x] Configuração do ambiente de desenvolvimento
- [x] Estrutura base do projeto com Clean Architecture
- [x] Configuração do banco de dados (Drizzle ORM)
- [x] Sistema de autenticação JWT com RBAC
- [x] Middleware de validação (Zod)
- [x] Documentação da API (Swagger)
- [x] Implementação dos Design Patterns (Repository, Factory)

### Fase 2: Core Features (Concluída)

- [x] CRUD de usuários com Repository Pattern
- [x] Sistema de perfis e permissões
- [x] Gestão de produtos e categorias
- [x] Carrinho de compras
- [x] Processamento de pedidos
- [x] Sistema de endereços
- [x] Gestão de assinaturas
- [x] Sistema de pagamentos (integração)

### Fase 3: Testes e Qualidade (Pendente)

- [ ] Testes unitários completos
- [ ] Testes de integração
- [ ] Testes E2E
- [ ] Cobertura de testes > 80%
- [ ] Testes de performance
- [ ] Testes de segurança

### Implementações Futuras

#### Melhorias e Otimizações

- [ ] Sistema de notificações
- [ ] Cache Redis para performance
- [ ] Rate limiting avançado
- [ ] Compressão de imagens automática
- [ ] Sistema de logs estruturados
- [ ] Métricas e observabilidade
- [ ] Otimização de queries do banco

## Licença

Este projeto está sob a licença **ISC**.  
Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

**Desenvolvido por [Diogo Mascarenhas](https://www.linkedin.com/in/diogomasc/)**  
Instituto Federal da Bahia (IFBA) – 2025.2

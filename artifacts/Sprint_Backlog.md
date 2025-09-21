# Sprint Backlog - Hortifruti Boa Saúde

## Legenda de Status

- ✅ **Concluído** - Tarefa implementada e testada
- 🔄 **Em Progresso** - Tarefa sendo desenvolvida
- ⏳ **Pendente** - Tarefa planejada para execução futura
- 🔍 **Em Análise** - Tarefa em fase de análise/refinamento

---

## Requisitos Funcionais (RF) e Regras de Negócio (RN)

### RF - Requisitos Funcionais Implementados

- **RF001** - Sistema de autenticação de usuários ✅
- **RF002** - Cadastro de usuários (consumidor/produtor/admin) ✅
- **RF003** - Gerenciamento de perfil de usuário ✅
- **RF004** - CRUD de endereços de usuário ✅
- **RF005** - Sistema de roles e permissões ✅
- **RF006** - Middleware de autenticação e autorização ✅

### RF - Requisitos Funcionais Pendentes

- **RF007** - CRUD de produtos ⏳
- **RF008** - Upload e gerenciamento de imagens de produtos ⏳
- **RF009** - Catálogo de produtos com filtros ⏳
- **RF010** - Carrinho de compras ⏳
- **RF011** - Sistema de pedidos ⏳
- **RF012** - Processamento de pagamentos ⏳
- **RF013** - Sistema de assinaturas ⏳
- **RF014** - Painel administrativo ⏳
- **RF015** - Relatórios e analytics ⏳
- **RF016** - Sistema de backup automatizado ⏳

### RN - Regras de Negócio Implementadas

- **RN001** - Validação de dados obrigatórios (email, senha, endereços) ✅
- **RN002** - Criptografia de senhas com Argon2 ✅
- **RN003** - Controle de acesso baseado em roles ✅
- **RN004** - Validação de formato de dados (email, telefone, CPF/CNPJ) ✅
- **RN005** - Campos obrigatórios para endereços (street, number, city, state, country, zipCode) ✅

### RN - Regras de Negócio Pendentes

- **RN006** - Validação de estoque de produtos ⏳
- **RN007** - Cálculo de frete e taxas ⏳
- **RN008** - Regras de desconto e promoções ⏳
- **RN009** - Validação de pagamentos ⏳
- **RN010** - Regras de cancelamento de pedidos ⏳
- **RN011** - Controle de permissões administrativas ⏳
- **RN012** - Políticas de backup e recuperação ⏳

---

## Sprint Backlog Detalhado

| Sprint       | Período     | Tarefa                                                      | Time              | Peso | Status | RF/RN               |
| ------------ | ----------- | ----------------------------------------------------------- | ----------------- | ---- | ------ | ------------------- |
| **Sprint 1** | Semanas 1-2 | Planejamento detalhado e análise final de requisitos        | Todos             | 2    | ✅     | -                   |
|              |             | Configuração do ambiente (Fastify, Drizzle, DB)             | Backend           | 3    | ✅     | -                   |
|              |             | Desenvolvimento da home page                                | Frontend          | 3    | ⏳     | RF001               |
|              |             | Cadastro de usuário                                         | Frontend, Backend | 13   | ✅     | RF002, RN001, RN004 |
|              |             | Login de usuário                                            | Frontend, Backend | 13   | ✅     | RF001, RN002        |
|              |             | Desenvolvimento do middleware de autenticação               | Backend           | 5    | ✅     | RF006, RN003        |
|              |             | Middleware de rotas e controle de roles                     | Frontend          | 5    | ⏳     | RF005               |
|              |             | Tela de perfil                                              | Frontend          | 5    | ⏳     | RF003               |
|              |             | Modelagem e implementação das tabelas `users` e `endereços` | Backend           | 8    | ✅     | RF002, RF004        |
|              |             | Implementação da autenticação segura com Argon2             | Backend           | 8    | ✅     | RF001, RN002        |
|              |             | CRUD completo de endereços                                  | Backend           | 8    | ✅     | RF004, RN005        |
|              |             | Validação de campos obrigatórios em endereços               | Backend           | 3    | ✅     | RN005               |
| **Sprint 2** | Semanas 3-4 | CRUD catálogo de produtos                                   | Frontend, Backend | 13   | ⏳     | RF007, RF008        |
|              |             | Upload e associação de imagens a produtos                   | Frontend, Backend | 8    | ⏳     | RF008               |
|              |             | Tela catálogo e detalhe de produto                          | Frontend          | 10   | ⏳     | RF009               |
|              |             | Tela e lógica do carrinho                                   | Frontend, Backend | 13   | ⏳     | RF010               |
|              |             | Implementação de filtros e busca no catálogo                | Frontend, Backend | 8    | ⏳     | RF009               |
|              |             | Sistema de categorias de produtos                           | Backend           | 5    | ⏳     | RF007               |
|              |             | Validação de estoque                                        | Backend           | 5    | ⏳     | RN006               |
| **Sprint 3** | Semanas 5-6 | Implementação do processo de pedido                         | Backend           | 13   | ⏳     | RF011               |
|              |             | Simulação e validação de pagamento                          | Backend           | 8    | ⏳     | RF012, RN009        |
|              |             | Tela "Meus Pedidos"                                         | Frontend          | 5    | ⏳     | RF011               |
|              |             | Tela "Minhas Vendas"                                        | Frontend          | 5    | ⏳     | RF011               |
|              |             | Implementação das assinaturas                               | Frontend, Backend | 13   | ⏳     | RF013               |
|              |             | Aprimoramento CRUD na tela "Meus Pedidos"                   | Frontend          | 8    | ⏳     | RF011               |
|              |             | Sistema de notificações                                     | Frontend, Backend | 8    | ⏳     | RF011               |
|              |             | Cálculo de frete                                            | Backend           | 5    | ⏳     | RN007               |
|              |             | Regras de cancelamento                                      | Backend           | 5    | ⏳     | RN010               |
|              |             | Testes funcionais integrados e correção de bugs             | QA                | 13   | ⏳     | -                   |
|              |             | Testes E2E backend                                          | QA                | 8    | ⏳     | -                   |
| **Sprint 4** | Semanas 7-8 | Módulo administrativo (UI + Backend)                        | Frontend, Backend | 21   | ⏳     | RF014, RN011        |
|              |             | Geração de relatórios e gestão de permissões                | Backend           | 8    | ⏳     | RF015, RN011        |
|              |             | Implementação do backup automatizado do banco               | Backend           | 8    | ⏳     | RF016, RN012        |
|              |             | Dashboard de analytics                                      | Frontend, Backend | 13   | ⏳     | RF015               |
|              |             | Sistema de logs e auditoria                                 | Backend           | 8    | ⏳     | RN011               |
|              |             | Otimização de performance                                   | Backend           | 8    | ⏳     | -                   |
|              |             | Testes finais e documentação Swagger                        | QA, Backend       | 13   | 🔄     | -                   |
|              |             | Preparação para entrega e demo final                        | Todos             | 5    | ⏳     | -                   |

---

## Resumo de Progresso

### ✅ Tarefas Concluídas (Sprint 1 - Parcial)

- Configuração completa do ambiente de desenvolvimento
- Sistema de autenticação e autorização implementado
- CRUD de usuários com validações completas
- CRUD de endereços com campos obrigatórios
- Middleware de segurança e controle de acesso
- Modelagem do banco de dados
- Criptografia de senhas com Argon2
- Documentação Swagger básica

### 🔄 Em Progresso

- Documentação Swagger completa
- Testes unitários e de integração

### ⏳ Próximas Prioridades

- Desenvolvimento do frontend (home page, perfil, middleware de rotas)
- Sistema de produtos e catálogo
- Implementação do carrinho de compras

---

## Observações Técnicas

### Middleware Frontend

- Gerencia o controle de acesso baseado em _roles_
- Protege rotas conforme o perfil do usuário
- Integração com sistema de autenticação

### Middleware Backend

- Realiza autenticação geral em cada requisição
- Validação de segurança e autorização
- Controle de rate limiting e CORS

### Arquitetura Implementada

- **Clean Architecture** com separação de responsabilidades
- **Repository Pattern** para abstração de dados
- **Use Cases** para lógica de negócio
- **Dependency Injection** para testabilidade
- **Validation Layer** com Zod schemas

### Tecnologias Utilizadas

- **Backend**: Fastify, Drizzle ORM, PostgreSQL, Argon2
- **Validação**: Zod schemas
- **Documentação**: Swagger/OpenAPI
- **Testes**: Vitest (planejado)
- **Deploy**: Docker (configurado)

---

## Métricas de Progresso

- **Total de Story Points**: ~280
- **Concluídos**: ~65 (23%)
- **Sprint 1 Progress**: 85% concluído
- **Estimativa de Conclusão**: Semana 8 (conforme planejado)

---

_Última atualização: Sprint 1 - Semana 2_

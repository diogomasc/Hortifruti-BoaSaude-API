# Diagrama de Relacionamento - Hortifruti Boa Saúde API

## Visão Geral do Banco de Dados

Este documento apresenta o diagrama de relacionamento das entidades do sistema Hortifruti Boa Saúde, implementado com Drizzle ORM e PostgreSQL.

## Diagrama de Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK
        text password_hash
        boolean is_active
        timestamp created_at
        user_roles role
        text first_name
        text last_name
        text phone
        text cpf UK "nullable - consumer only"
        date birth_date "nullable - consumer only"
        text cnpj UK "nullable - producer only"
        text shop_name "nullable - producer only"
        text shop_description "nullable - producer only"
    }
    
    ADDRESSES {
        uuid id PK
        uuid user_id FK
        text street
        text number
        text complement
        text city
        text state
        text country
        text zip_code
    }
    
    WALLETS {
        uuid id PK
        uuid user_id FK
        numeric balance
        timestamp updated_at
    }
    
    USERS ||--o{ ADDRESSES : "has"
    USERS ||--o| WALLETS : "owns (producer only)"
```

## Estrutura das Tabelas

### 1. Usuários (Tabela Unificada)

#### `users` - Todos os Tipos de Usuários
```
┌─────────────────────────────────────┐
│                users                │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ email (TEXT, UNIQUE)                │
│ password_hash (TEXT)                │
│ is_active (BOOLEAN, DEFAULT true)   │
│ created_at (TIMESTAMP)              │
│ role (user_roles ENUM)              │
│   - "consumer"                      │
│   - "producer"                      │
│   - "admin"                         │
│ first_name (TEXT)                   │
│ last_name (TEXT)                    │
│ phone (TEXT)                        │
│                                     │
│ -- Campos específicos por role --   │
│ cpf (TEXT, UNIQUE, nullable)        │
│   - Obrigatório para consumer       │
│ birth_date (DATE, nullable)         │
│   - Obrigatório para consumer       │
│ cnpj (TEXT, UNIQUE, nullable)       │
│   - Obrigatório para producer       │
│ shop_name (TEXT, nullable)          │
│   - Obrigatório para producer       │
│ shop_description (TEXT, nullable)   │
│   - Opcional para producer          │
└─────────────────────────────────────┘
```

### 2. Endereços

#### `addresses` - Endereços dos Usuários
```
┌─────────────────────────────────────┐
│              addresses              │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ user_id (UUID, FK)                  │
│ street (TEXT)                       │
│ number (TEXT)                       │
│ complement (TEXT)                   │
│ city (TEXT)                         │
│ state (TEXT)                        │
│ country (TEXT)                      │
│ zip_code (TEXT)                     │
└─────────────────────────────────────┘
```

### 3. Carteiras

#### `wallets` - Carteiras dos Produtores
```
┌─────────────────────────────────────┐
│               wallets               │
├─────────────────────────────────────┤
│ id (UUID, PK)                       │
│ user_id (UUID, FK)                  │
│ balance (NUMERIC(10,2))             │
│ updated_at (TIMESTAMP)              │
└─────────────────────────────────────┘
```

## Observações Técnicas

1. **Tabela Unificada de Usuários**: O sistema utiliza uma única tabela `users` com um enum `user_roles` para distinguir entre consumidores, produtores e administradores. Campos específicos por role são nullable e validados na aplicação.

2. **Enum de Roles**: O enum `user_roles` define três tipos: "consumer", "producer" e "admin", garantindo type safety, consistência no banco de dados e aplicação de RBAC (Role-Based Access Control).

3. **Campos Condicionais por Role**:
   - **Consumer**: Requer `cpf` e `birth_date`
   - **Producer**: Requer `cnpj` e `shop_name`, `shop_description` é opcional
   - **Admin**: Apenas campos básicos são necessários

4. **Relacionamento de Endereços**: A tabela `addresses` se relaciona com a tabela unificada `users` através do campo `user_id`, permitindo que qualquer tipo de usuário tenha endereços.

5. **Carteiras Exclusivas**: Apenas produtores possuem carteiras, com relacionamento 1:N entre `users` e `wallets` (um produtor pode ter múltiplas carteiras no futuro).

6. **Índices de Performance**: Todos os campos de email e documentos (CPF/CNPJ) possuem índices únicos para otimização de consultas e garantia de unicidade.
---

**Data de Atualização**: 27/01/2025  
**Versão do Schema**: 1.0 (Refatorado com Drizzle ORM)
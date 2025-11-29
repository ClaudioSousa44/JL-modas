# JL Modas - Sistema de Gestão

Sistema de gestão para loja de roupas desenvolvido em Angular 17.

## Funcionalidades

- **Login**: Sistema de autenticação de usuários
- **Dashboard**: Visualização de dados e estatísticas de vendas
- **Clientes**: Cadastro e gerenciamento de clientes (nome, número, valor devido)
- **Vendas**: Cadastro de vendas com seleção de cliente e controle de pagamento

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm start
```

3. Acesse a aplicação no navegador:

```
http://localhost:4200
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── login/           # Componente de login
│   │   ├── dashboard/       # Dashboard com estatísticas
│   │   ├── clientes/        # Gerenciamento de clientes
│   │   └── vendas/          # Gerenciamento de vendas
│   ├── models/              # Interfaces TypeScript
│   │   ├── cliente.model.ts
│   │   ├── venda.model.ts
│   │   └── login.model.ts
│   ├── services/            # Serviços para comunicação com API
│   │   ├── auth.service.ts
│   │   ├── cliente.service.ts
│   │   └── venda.service.ts
│   ├── guards/              # Guards de rota
│   │   └── auth.guard.ts
│   ├── app.component.ts     # Componente principal
│   └── app.routes.ts        # Configuração de rotas
└── ...
```

## Configuração da API

Os serviços estão configurados para se conectar com uma API Node.js em:

```
http://localhost:3000/api
```

Quando o backend estiver pronto, ajuste a URL base nos serviços:

- `src/app/services/auth.service.ts`
- `src/app/services/cliente.service.ts`
- `src/app/services/venda.service.ts`

## Rotas da Aplicação

- `/login` - Página de login
- `/dashboard` - Dashboard principal (protegida)
- `/clientes` - Gerenciamento de clientes (protegida)
- `/vendas` - Gerenciamento de vendas (protegida)

## Endpoints da API Esperados

### Autenticação

- `POST /api/auth/login` - Login de usuário

### Clientes

- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obter cliente por ID
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Vendas

- `GET /api/vendas` - Listar vendas
- `GET /api/vendas/:id` - Obter venda por ID
- `POST /api/vendas` - Criar venda
- `PUT /api/vendas/:id` - Atualizar venda
- `DELETE /api/vendas/:id` - Deletar venda
- `GET /api/vendas/estatisticas` - Obter estatísticas de vendas

**Nota**: Todos os endpoints (exceto login) requerem autenticação via header `Authorization: Bearer {token}`

## Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/jl-modas`.

## Tecnologias Utilizadas

- Angular 17
- TypeScript
- RxJS
- Angular Router
- Angular HTTP Client

## Desenvolvimento

Este projeto está configurado para trabalhar com um backend Node.js. Certifique-se de que o backend está rodando na porta 3000 antes de testar as funcionalidades completas.

# JL-modas

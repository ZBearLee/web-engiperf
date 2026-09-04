# web-engiperf

前端工程化与性能优化实战仓库。

pnpm workspace monorepo：Vue 3 前端 + NestJS 后端 + Prisma 数据层，围绕**工程化规范**与**性能优化**组织。

## 目录结构

```
web-engiperf/
├── apps/
│   └── vue-app/          # Vue 3 + Vite + TS + Element Plus（学习主体）
├── packages/
│   ├── db/               # Prisma schema / migration / seed，导出 PrismaClient
│   └── server/           # NestJS 12 服务，提供 products API
├── docker-compose.yml    # PostgreSQL 16 + pgAdmin
└── pnpm-workspace.yaml
```

## 环境要求

| 依赖 | 版本 |
| --- | --- |
| Node.js | `^22.18.0` 或 `>=24.12.0` |
| pnpm | `9.12.0`（`packageManager` 已锁定） |
| Docker | 用于本地 PostgreSQL（可选，也可连外部库） |

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动数据库

```bash
pnpm db:up          # docker compose up -d postgres pgadmin
pnpm db:logs        # 查看启动日志
```

默认连接信息（`docker-compose.yml`）：

- PostgreSQL：`localhost:5433`，库/用户/密码均为 `engiperf`
- pgAdmin：<http://localhost:5050>，账号 `admin@engiperf.local` / 密码 `admin`

### 3. 配置 DATABASE_URL

`packages/db` 下**没有** `.env`（已 gitignore），需要手动创建 `packages/db/.env`：

```env
DATABASE_URL="postgresql://engiperf:engiperf@localhost:5433/engiperf?schema=public"
```

> 端口是 `5433` 不是默认的 `5432`，注意别写错。

### 4. 初始化数据表

```bash
pnpm --filter @web-engiperf/db generate   # 生成 Prisma Client
pnpm --filter @web-engiperf/db db:push    # 建表（或用 migrate 走迁移文件）
pnpm seed                                 # 灌入 10 万条 Product 演示数据
```

### 5. 启动服务

**后端**（NestJS，默认 <http://localhost:3000>）：

```bash
pnpm dev:server     # 会先 build db 包，再 nest start --watch
```

**前端**（Vite，默认 <http://localhost:5173>）：

```bash
cd apps/vue-app
pnpm dev
```

只做前端、不碰数据库时，**可以直接跳过 2~4 步和第 5 步的后端**，只跑：

```bash
pnpm install
cd apps/vue-app && pnpm dev
```

## 常用命令

在**根目录**执行：

| 命令 | 说明 |
| --- | --- |
| `pnpm db:up` / `pnpm db:down` | 启停 PostgreSQL + pgAdmin |
| `pnpm db:logs` | 跟踪数据库日志 |
| `pnpm dev:server` | 构建 db 包 + 启动 NestJS 热更新 |
| `pnpm build:server` | 构建 db 包 + 构建 NestJS |
| `pnpm seed` | 灌入演示数据 |
| `pnpm clean` | 清理所有包的 `dist` / `node_modules` |

在 **`apps/vue-app`** 执行：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 类型检查（`vue-tsc`）+ 生产构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm test:unit` | Vitest 单元测试 |
| `pnpm lint` | oxlint + eslint（自动修复） |
| `pnpm format` | prettier 格式化 |

在 **`packages/db`** 执行：

| 命令 | 说明 |
| --- | --- |
| `pnpm generate` | 生成 Prisma Client |
| `pnpm migrate` | 创建并应用迁移（开发用） |
| `pnpm db:push` | 直接同步 schema 到库（不走迁移） |
| `pnpm studio` | 打开 Prisma Studio 可视化查看数据 |

## 后端 API

NestJS 服务监听 `3000`，已开启 CORS。

## 技术栈

- **前端**：Vue 3.5、Vite 8、TypeScript、Pinia、Vue Router、Element Plus（按需自动导入）
- **后端**：NestJS 12、Express
- **数据**：PostgreSQL 16、Prisma 6
- **工程化**：pnpm workspace、oxlint + eslint（flat config）、prettier、vitest


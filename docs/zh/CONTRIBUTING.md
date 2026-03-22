# 贡献指南

## 开始前

- 请先阅读 `LICENSE`、`NOTICE` 与 `docs/zh/LICENSE_GUIDE.md`
- 除非后续单独引入贡献协议，否则贡献默认受仓库的 PolyForm Noncommercial 1.0.0 约束
- 如果变更会影响用户可见行为，请同步规划中英文文档更新

## 开发流程

```bash
npm install
# 可选：如需自定义密钥或端口，再复制模板
cp .env.example .env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
npm run dev:frontend
```

也可以使用快速引导脚本：

```bash
./scripts/bootstrap.sh
```

这个脚本会安装依赖、生成 Prisma Client，并输出后续迁移与启动步骤。

## 代码标准

- 应用代码统一使用 TypeScript
- API 变更需同步更新 OpenAPI
- 认证、租户隔离、Agent 执行变更必须带测试
- 所有用户可见文本都要补齐中英文
- 不能为了赶功能而削弱租户隔离、审计覆盖或鉴权中间件
- 本地文件持久化的供应商设置只适合开发联调，不应被当作正式密钥管理方案

## 校验要求

推荐完整校验：

```bash
./scripts/check.sh
```

常用定向校验：

```bash
npm run typecheck --workspace=packages/backend
npm run test --workspace=packages/backend
npm run typecheck --workspace=packages/frontend
npm run build --workspace=packages/frontend
```

当前 CI 实际执行：

```bash
npm install
npm run db:generate
npm run typecheck
npm run build
npm run test
```

## 文档要求

- 变更涉及命令、环境变量、端口、部署方式或用户行为时，要同步更新 `docs/en` 与 `docs/zh`
- 根目录 `README.md` 应与 `docs/` 下的详细说明保持一致
- 如果前端行为发生明显变化，但当前没有自动化测试覆盖，需要在 PR 或交接说明中明确标注

## 提交前检查

- 构建通过
- 测试通过
- 文档同步更新
- 许可证影响已检查
- 没有引入新的跨租户访问路径
- 新增环境变量时，需同步更新 `.env.example`，必要时补充到部署文档

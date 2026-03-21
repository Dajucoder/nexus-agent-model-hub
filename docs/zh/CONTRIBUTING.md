# 贡献指南

## 开始前

- 请先阅读 `LICENSE`、`NOTICE` 与 `docs/zh/LICENSE_GUIDE.md`
- 除非后续单独引入贡献协议，否则贡献默认受仓库的 PolyForm Noncommercial 1.0.0 约束

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

## 代码标准

- 应用代码统一使用 TypeScript
- API 变更需同步更新 OpenAPI
- 认证、租户隔离、Agent 执行变更必须带测试
- 所有用户可见文本都要补齐中英文

## 提交前检查

- 构建通过
- 测试通过
- 文档同步更新
- 许可证影响已检查
- 没有引入新的跨租户访问路径

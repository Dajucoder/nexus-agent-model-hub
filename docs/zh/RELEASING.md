# 发布流程指南

当你准备发布像 `v0.2.0` 这样的仓库版本时，可直接按这份清单执行。

## 1. 确认版本号

- 仓库根版本、后端 workspace、前端 workspace、Helm Chart 与文档统一使用语义化版本。
- 在 `docs/releases/vX.Y.Z.md` 新建或完善对应版本说明。
- 在 `CHANGELOG.md` 中补齐同版本的正式条目。

## 2. 同步版本元数据

同一次提交中应一起更新这些位置：

- `package.json`
- `packages/backend/package.json`
- `packages/frontend/package.json`
- `package-lock.json`
- `.env.example`
- `docker-compose.yml`
- `helm/nexus-agent-model-hub/Chart.yaml`
- `packages/backend/src/config/index.ts`
- `docs/api/openapi.yaml`
- 所有会展示产品版本的 UI 回退值或硬编码运行时标识

## 3. 检查面向发布的文档

- 如果最新版本链接、初始化步骤或用户可见行为有变化，同步更新 `README.md`、`docs/en/README.md` 与 `docs/zh/README.md`。
- 当环境变量、认证方式、部署默认值或发布步骤有变化时，确保中英文运维文档保持一致。
- 如果 release 改动了可见文案或操作流程，要再次确认双语内容没有漂移。

## 4. 打标签前校验

在仓库根目录运行：

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

建议补充人工检查：

- 使用预置账号或预发租户管理员登录
- 刷新浏览器，确认基于 Cookie 的会话仍然有效
- 执行登出，确认会话被正确清理
- 打开 `/docs`、`/settings`、`/chat`、`/dashboard`
- 验证 `/api/v1/health` 与 `/api/v1/platform/summary`
- 执行一次成功的 Agent 调用和一次预期的校验失败

## 5. 提交、打标签、发布

校验通过后可执行：

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```

随后用 `docs/releases/vX.Y.Z.md` 的内容填写 Git 托管平台上的正式 Release 页面。

# Pi 学习进度追踪

> 计划详情见 [plan/plan-001.md](plan/plan-001.md)

---

## Phase 1: 基础夯实 ✅

- [x] 1.1 环境配置审计 — `settings.json` 存在，默认模型 claude-sonnet-4，thinking medium
- [x] 1.2 5 个 Prompt Templates — 已创建并同步到 `~/.pi/agent/prompts/`
  - `/review` — 代码审查
  - `/test` — 生成测试
  - `/refactor` — 重构建议
  - `/doc` — 生成文档
  - `/debug` — 调试分析
- [ ] 1.3 快捷键肌肉记忆 — 请在 pi TUI 中自行练习

## Phase 2: Skills 技能包开发 ✅

- [x] 2.1 3 个 Skills — 已创建并同步到 `~/.pi/agent/skills/`
  - `typescript-testing` — Vitest + Testing Library 测试规范
  - `react-patterns` — React 组件设计与 Hooks 最佳实践
  - `api-design` — REST/GraphQL API 设计规范
- [ ] 2.2 社区 Skills 安装 — 待执行 `pi install git:github.com/badlogic/pi-skills`

## Phase 3: Extensions 扩展开发 ✅

- [x] 3.1 Permission Gate 扩展 — `extensions/permission-gate.ts` (拦截 rm -rf, sudo 等)
- [x] 3.2 Protected Paths 扩展 — `extensions/protected-paths.ts` (保护 .env, node_modules 等)
- [x] 3.3 Git Checkpoint 扩展 — `extensions/git-checkpoint.ts` (自动 stash + `/restore-checkpoint`)
- [x] 3.4 自定义命令扩展 — `extensions/commands.ts` (`/stats`, `/clear-history`, `/branch-name`)
- [x] 3.5 Todo UI 扩展 — `extensions/todo.ts` (自定义工具 + 渲染 + Widget)

全部已同步到 `~/.pi/agent/extensions/`

## Phase 4: 高级扩展 ✅

- [x] 4.1 自定义 Compaction — `extensions/custom-compaction.ts` (保留代码相关消息记忆)
- [x] 4.2 自定义 Footer — `extensions/custom-footer.ts` (`/footer` 切换)
- [x] 4.3 模型状态指示器 — `extensions/model-status.ts` (模型 + thinking 状态)

全部已同步到 `~/.pi/agent/extensions/`

## Phase 5: 打包与分享 ⏳

- [ ] 5.1 Pi Package 打包
- [ ] 5.2 GitHub 发布

## Phase 6: 进阶探索 ⏳

- [ ] 选择 1-2 个进阶任务探索

---

*最后更新: 2026-05-29*

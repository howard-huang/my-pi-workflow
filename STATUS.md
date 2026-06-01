# Pi 学习进度追踪

> 最后更新: 2026-05-31 | v1.1.0

---

## ✅ Phase 1-6: 基础能力（v1.0.0）

- [x] 5 个 Prompt Templates
- [x] 3 个 Skills
- [x] 5 个安全/功能扩展（permission-gate, protected-paths, commands, todo, git-checkpoint）
- [x] 3 个高级扩展（custom-compaction, custom-footer, model-status）
- [x] Ollama 本地 Provider
- [x] MCP 设计文档
- [x] GitHub 仓库 + v1.0.0 release

## ✅ Phase 7: 子代理实战

- [x] pi-subagents 安装 + reviewer-zh 代理
- [x] review-flow chain（scout → reviewer-zh）
- [x] pi-intercom 安装

## ✅ Phase 8: 生态集成

- [x] 社区 Skills（badlogic/pi-skills，8 个）
- [x] pi-web-access 安装
- [ ] MCP 扩展 — mcp-bridge 因 Zod v3/v4 冲突已删除，待重建

## ✅ Phase 9: Themes

- [x] 自定义主题 `my-theme.json`（51 tokens，VS Code Dark+ 风）
- [x] Footer 引用主题色 `accent`

## ✅ Phase 10: SDK 集成

- [x] SDK 验证通过（11 模型可用）
- [x] `scripts/sdk-verify.mjs` + `scripts/batch-review.mjs`

## ✅ Phase 11: 收尾

- [x] PI-BEST-PRACTICES.md
- [x] GitHub release v1.1.0
- [x] 总结笔记（PI-BEST-PRACTICES.md 即经验汇总）

---

## 当前配置

**模型**: ccswitch/claude-sonnet-4（主）/ deepseek/deepseek-v4-pro（SDK 默认）
**本地模型**: ollama/llama3:latest, ollama/qwen2.5vl:7b
**扩展**: 10 个已加载
**子代理**: reviewer-zh + review-flow chain
**技能**: 11 个（3 自定义 + 8 社区）

---

## 已知限制

- MCP SDK Zod v3/v4 冲突 → mcp-bridge.ts 已删除
- Windows 异步子代理不稳定
- Ollama 本地模型不支持工具调用
- GitHub push 超时（网络代理问题）

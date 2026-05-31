# my-pi-workflow

这是一个关于学习 [pi](https://github.com/earendil-works/pi) 并实践的项目，覆盖 Prompt Templates、Skills、Extensions、Sub-agents、Themes、SDK 的完整开发流程。

GitHub: https://github.com/howard-huang/my-pi-workflow

## 版本

- **v1.1.0** (2026-05-31) — Phase 7-11 完成：子代理、生态集成、主题、SDK
- v1.0.0 (2026-05-30) — Phase 1-6 完成：基础扩展 + Skills + Prompts

## 项目结构

```
├── .pi/
│   ├── agents/reviewer-zh.md      # 中文代码审查子代理
│   └── chains/review-flow.chain.md # scout → reviewer-zh 链
├── prompts/                        # 6 个 Prompt Templates
├── skills/                         # 3 个自定义 Skills
├── scripts/
│   ├── sdk-verify.mjs             # SDK 可用性验证
│   └── batch-review.mjs           # 批量代码审查脚本
├── plan/                           # 设计文档
├── PI-BEST-PRACTICES.md            # 最佳实践汇总
├── STATUS.md                       # 进度追踪
└── TODO                            # 待办清单
```

## 安装

```bash
pi install git:github.com/howard-huang/my-pi-workflow@v1.1.0
```

## 扩展（~/.pi/agent/extensions/）

| 扩展 | 功能 | 状态 |
|------|------|------|
| permission-gate | 危险命令拦截 | ✅ |
| protected-paths | 敏感路径保护 | ✅ |
| commands | 自定义命令 (/stats, /todos 等) | ✅ |
| todo | 待办管理 + Widget | ✅ |
| custom-compaction | 记忆压缩 | ✅ |
| custom-footer | 自定义页脚（主题色） | ✅ |
| model-status | 模型状态指示 | ✅ |
| mcp-bridge | MCP 服务器集成 | ❌ 已删除（Zod 冲突） |
| ollama-provider | 本地 LLM | ✅ |
| git-checkpoint | 自动 stash | ❌ 已删除 |

## Prompt Templates（6 个）

`/review` `/test` `/refactor` `/doc` `/debug` `/plan`

## Skills

- **自定义**：`typescript-testing` `react-patterns` `api-design`
- **社区**：`brave-search` `browser-tools` `youtube-transcript` `transcribe` `vscode` `gccli` `gdcli` `gmcli`

## 子代理

- **reviewer-zh**：中文代码审查专家
- **review-flow chain**：scout 侦察 → reviewer-zh 深度审查

## 主题

- **my-theme**：基于 VS Code Dark+ 风格的自定义主题

## 常用命令

```bash
/model ccswitch/claude-sonnet-4   # 云模型
/model ollama/llama3:latest       # 本地模型
/reload                            # 重载扩展
/stats                             # 统计
/todos                             # 待办
/footer                            # 切换页脚
```

# AGENTS.md

> 本项目的工作流规范与经验沉淀

---

## 项目简介

本项目是系统学习 [pi](https://github.com/earendil-works/pi) 编码代理平台的实践成果，涵盖 Prompt Templates、Skills、Extensions 的完整开发流程。

GitHub: https://github.com/howard-huang/my-pi-workflow

---

## 扩展清单（11个）

| 扩展 | 功能 | 状态 |
|------|------|------|
| `permission-gate` | 拦截危险命令（rm -rf, sudo 等） | ✅ |
| `protected-paths` | 保护敏感路径（.env, node_modules 等） | ✅ |
| `git-checkpoint` | 工具调用前自动 stash | ✅ |
| `commands` | 自定义命令（/stats, /todos 等） | ✅ |
| `todo` | 待办管理工具 + Widget | ✅ |
| `custom-compaction` | 保留代码相关记忆 | ✅ |
| `custom-footer` | 自定义页脚（/footer 切换） | ✅ |
| `model-status` | 模型状态指示器 | ✅ |
| `sub-agent` | 子代理系统 | ⚠️ 设计完成，待架构支持 |
| `mcp-bridge` | MCP 服务器集成 | ✅ |
| `ollama-provider` | 本地 LLM Provider | ✅ |

---

## Prompt Templates（6个）

- `/review` — 代码审查
- `/test` — 生成测试
- `/refactor` — 重构建议
- `/doc` — 生成文档
- `/debug` — 调试分析
- `/plan` — 生成子代理任务计划

---

## Skills（3个）

- `typescript-testing` — Vitest + Testing Library
- `react-patterns` — React 组件设计
- `api-design` — REST/GraphQL API 设计

---

## 关键经验

### 1. 扩展加载位置

| 位置 | 范围 | 用途 |
|------|------|------|
| `~/.pi/agent/extensions/*.ts` | 全局 | 实际运行 |
| `./extensions/*.ts` | 项目 | 源码备份 |

> 修改后必须执行 `/reload` 生效

### 2. Windows 路径问题

`protected-paths.ts` 最初使用 `path.relative` 匹配失败，因为 Windows 返回反斜杠。修复方案：

```typescript
const norm = path.resolve(cwd, fp).split(path.sep).join("/");
```

### 3. 跨命令状态共享

子代理系统需要跨命令保存状态（plan → set-steps → next → done），但 pi 每个命令执行是独立上下文。

**尝试方案**：
- ❌ 内存变量 — 不共享
- ❌ 文件系统 — 写入受限
- ❌ sessionManager.setState — 不持久
- ⏳ 等待 pi 官方支持

### 4. Provider 配置

ccswitch 本身就是自定义 Provider 的最佳实践 — 通过 Anthropic 协议代理转发给 Kimi LLM。

Ollama 作为本地部署参考：
- 使用 `api: "openai-completions"`
- 本地模型不支持工具调用，仅纯文本

### 5. MCP 集成

MCP SDK 是 ESM 模块，在 pi 扩展中需动态导入：

```typescript
const { Client } = await import("@modelcontextprotocol/sdk/dist/esm/client/index.js");
```

---

## 常用命令

```bash
# 切换模型
/model ccswitch/claude-sonnet-4   # 云模型，功能完整
/model ollama/llama3:latest       # 本地模型，纯文本

# 扩展命令
/reload
/stats
/todos
/plan <目标>
/footer
/mcp-list

# Git
pi-checkpoint-<timestamp>  # 自动 stash 的检查点
```

---

## 待办

- [ ] 子代理系统 — 需 pi 架构支持跨命令状态共享
- [ ] MCP 服务器扩展（sqlite, fetch, git）
- [ ] 推送 GitHub 时网络超时问题排查

---

*最后更新: 2026-05-29*

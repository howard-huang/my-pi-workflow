# my-pi-workflow

这是一个关于学习 [pi](https://github.com/earendil-works/pi) 并实践的项目，让我可以熟悉 pi 的方方面面。

## 项目结构

- `prompts/` - 6 个 Prompt Templates
- `skills/` - 3 个 Skills
- `plan/` - 设计文档
- `PI-BEST-PRACTICES.md` - pi 最佳实践

## 安装

```bash
pi install git:github.com/howard-huang/my-pi-workflow@v1.0.0
```

## 扩展（位于 ~/.pi/agent/extensions/）

| 扩展 | 功能 | 状态 |
|------|------|------|
| permission-gate | 危险命令拦截 | ✅ |
| protected-paths | 敏感路径保护 | ✅ |
| commands | 自定义命令 (/stats, /todos 等) | ✅ |
| todo | 待办管理 | ✅ |
| custom-compaction | 记忆压缩 | ✅ |
| custom-footer | 自定义页脚 | ✅ |
| model-status | 模型状态指示 | ✅ |
| mcp-bridge | MCP 服务器集成 | ✅ |
| ollama-provider | 本地 LLM 支持 | ✅ |
| git-checkpoint | 自动 stash | ❌ 已删除 |
| sub-agent | 子代理系统 | ✅ 采用 pi-subagents |

# my-pi-workflow

这是一个关于学习 [pi](https://github.com/earendil-works/pi) 并实践的项目，让我可以熟悉 pi 的方方面面。

## 项目结构

- `extensions/` - 11 个自定义扩展
- `prompts/` - 6 个 Prompt Templates
- `skills/` - 3 个 Skills
- `plan/` - 设计文档

## 安装

```bash
pi install git:github.com/howard-huang/my-pi-workflow@v1.0.0
```

## 扩展列表

| 扩展 | 功能 |
|------|------|
| permission-gate | 危险命令拦截 |
| protected-paths | 敏感路径保护 |
| git-checkpoint | 自动 stash |
| commands | 自定义命令 (/stats, /todos 等) |
| todo | 待办管理 |
| custom-compaction | 记忆压缩 |
| custom-footer | 自定义页脚 |
| model-status | 模型状态指示 |
| sub-agent | 子代理系统 (设计完成) |
| mcp-bridge | MCP 服务器集成 |
| ollama-provider | 本地 LLM 支持 |

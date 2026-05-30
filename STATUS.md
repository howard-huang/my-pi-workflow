# Pi 学习进度追踪

## 已完成 ✅

### Phase 1: 基础夯实
- [x] 环境配置审计
- [x] 5 个 Prompt Templates (/review, /test, /refactor, /doc, /debug)
- [x] 快捷键肌肉记忆

### Phase 2: Skills 技能包
- [x] 3 个 Skills (typescript-testing, react-patterns, api-design)

### Phase 3: Extensions 扩展开发
- [x] Permission Gate (危险命令拦截)
- [x] Protected Paths (敏感路径保护)
- [x] Git Checkpoint (自动 stash)
- [x] Commands (/stats, /todos, /clear-history, /branch-name)
- [x] Todo UI (待办管理)

### Phase 4: 高级扩展
- [x] Custom Compaction (记忆压缩)
- [x] Custom Footer (状态栏)
- [x] Model Status (模型指示器)

### Phase 5: 打包与分享
- [x] Pi Package 配置
- [x] GitHub 仓库 (https://github.com/howard-huang/my-pi-workflow)

### Phase 6: 进阶探索
- [x] MCP 服务器集成 (filesystem)
- [x] 自定义 Provider (Ollama 本地 LLM)
- [x] 子代理系统设计文档

## 当前配置

**默认模型**: claude-sonnet-4 (云)
**本地模型**: llama3:latest, qwen2.5vl:7b (Ollama)
**扩展**: 11 个已加载

## 使用指南

### 切换模型
```
/model ccswitch/claude-sonnet-4  # 云模型，功能完整
/model ollama/llama3:latest      # 本地模型，隐私安全
```

### 常用命令
```
/stats        # 会话统计
/todos        # 待办事项
/plan         # 子代理计划
/mcp-list     # MCP 服务器列表
/footer       # 切换自定义页脚
```

## 注意事项

- Ollama 本地模型仅支持纯文本对话，不支持工具调用
- 需要工具功能时请切换回云模型
- 子代理系统 — 采用 pi-subagents（已验证可用）

## Phase 7 进度
- [x] pi-subagents 安装 + reviewer-zh 代理 + review-flow chain
- [x] reviewer-zh 成功运行，产出审查报告

---

*最后更新: 2026-05-30*

# 🎯 Pi 进阶计划 —— 剩余 30%

> 承接 plan-001.md，已完成 70% 核心能力。本计划补齐剩余部分。

---

## Phase 7: 子代理实战（第 1-2 天）

> plan-001 只读了 pi-subagents 文档，未实际动手。

### 任务 7.1: 安装 pi-subagents

```bash
pi install npm:pi-subagents
```

### 任务 7.2: 创建自定义代理

创建项目级代理文件 `.pi/agents/reviewer-zh.md`：

```yaml
---
name: reviewer-zh
description: 中文代码审查，检查逻辑错误、安全漏洞、性能问题
tools: read, bash, grep
skills: typescript-testing
model: anthropic/claude-sonnet-4
---
你是中文代码审查专家。审查时关注：
1. 逻辑错误和边界情况
2. 安全漏洞
3. 性能瓶颈
4. 可维护性
```

### 任务 7.3: 创建 Chain 工作流

`.pi/chains/review-flow.chain.md`：scout 扫描 → reviewer 审查 → 汇总。

### 任务 7.4: 安装 pi-intercom（可选）

```bash
pi install npm:pi-intercom
```

### 验收标准
- [ ] pi-subagents 安装成功
- [ ] 自定义代理可用
- [ ] chain 工作流跑通至少一次
- [ ] 理解 `{task}` `{previous}` `{outputs.name}` 链变量

---

## Phase 8: 生态集成（第 3-4 天）

### 任务 8.1: 安装社区 Skills

```bash
pi install git:github.com/badlogic/pi-skills
```

试用 `web_search`、`browser` 等技能。

### 任务 8.2: MCP 扩展

扩展 `mcp-bridge.ts`，添加更多服务器：

```typescript
const DEFAULT_SERVERS: ServerConfig[] = [
  { name: "filesystem", command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "."] },
  { name: "sqlite", command: "npx", args: ["-y", "@modelcontextprotocol/server-sqlite", "data.db"] },
  { name: "fetch", command: "npx", args: ["-y", "@modelcontextprotocol/server-fetch"] },
  { name: "git", command: "npx", args: ["-y", "@modelcontextprotocol/server-git", "."] },
];
```

### 任务 8.3: pi-web-access（可选）

```bash
pi install npm:pi-web-access
```

### 验收标准
- [ ] 社区 skills 试用成功
- [ ] 至少 3 个 MCP 服务器可用
- [ ] `/mcp-list` 显示所有服务器

---

## Phase 9: Themes 主题（第 5 天）

> plan-001 Phase 5 目录结构里有 `themes/` 但从未执行。

### 任务 9.1: 创建自定义主题

`~/.pi/agent/themes/my-theme.json`：

```json
{
  "name": "My Theme",
  "colors": {
    "text": "#d4d4d4",
    "accent": "#569cd6",
    "success": "#6a9955",
    "warning": "#d7ba7d",
    "error": "#f44747",
    "dim": "#808080",
    "muted": "#5a5a5a"
  }
}
```

### 任务 9.2: 在 Footer/Widget 中引用主题色

### 验收标准
- [ ] 主题文件创建
- [ ] `/theme my-theme` 可切换
- [ ] 至少在一个扩展中使用主题色

---

## Phase 10: SDK 集成（第 6-7 天）

### 任务 10.1: 程序化启动 pi

```typescript
import { Pi } from "@earendil-works/pi-coding-agent";

const pi = new Pi({ cwd: process.cwd() });
const result = await pi.send("审查 src/utils.ts");
console.log(result);
```

### 任务 10.2: 自动化脚本

写一个 Node 脚本批量执行代码审查：

```bash
node scripts/batch-review.js src/
```

### 验收标准
- [ ] SDK 程序化调用成功
- [ ] 至少一个自动化脚本跑通

---

## Phase 11: 收尾——文档与分享（第 8 天）

### 任务 11.1: 完善 PI-BEST-PRACTICES.md

补充 Phase 7-10 的实践经验。

### 任务 11.2: 更新 README + GitHub

```bash
git tag v1.2.0
git push origin v1.2.0
```

### 任务 11.3: 写一篇总结博客/笔记

记录从 plan-001 到现在的完整学习路径。

### 验收标准
- [ ] PI-BEST-PRACTICES.md 完整
- [ ] GitHub release v1.2.0
- [ ] 总结文档完成

---

## 📋 总检查清单

```
□ Phase 7: 子代理实战
  □ 7.1 pi-subagents 安装
  □ 7.2 自定义代理
  □ 7.3 Chain 工作流
  □ 7.4 pi-intercom

□ Phase 8: 生态集成
  □ 8.1 社区 Skills
  □ 8.2 MCP 扩展
  □ 8.3 pi-web-access

□ Phase 9: Themes
  □ 9.1 自定义主题
  □ 9.2 扩展中引用主题色

□ Phase 10: SDK 集成
  □ 10.1 程序化调用
  □ 10.2 自动化脚本

□ Phase 11: 收尾
  □ 11.1 最佳实践文档
  □ 11.2 GitHub release
  □ 11.3 总结文档
```

---

*计划制定: 2026-05-30*
*目标完成: 8 天*

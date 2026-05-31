# Pi 最佳实践

> 汇总 my-pi-workflow 项目全部阶段的实战经验
> 最后更新: 2026-05-31 | v1.1.0

---

## 一、扩展开发

### 1.1 扩展加载位置

| 位置 | 范围 | 用途 |
|------|------|------|
| `~/.pi/agent/extensions/*.ts` | 全局 | 实际运行 |
| `./extensions/*.ts` | 项目 | 源码备份 |

> 修改后必须执行 `/reload` 生效。

### 1.2 Windows 路径问题

`protected-paths.ts` 最初使用 `path.relative` 匹配失败，因为 Windows 返回反斜杠。修复方案：

```typescript
const norm = path.resolve(cwd, fp).split(path.sep).join("/");
```

### 1.3 MCP 集成（已废弃）

MCP SDK 是 ESM 模块，在 pi 扩展中需动态导入：

```typescript
const { Client } = await import("@modelcontextprotocol/sdk/client");
```

**已知问题**：`@modelcontextprotocol/sdk@1.29.0` 与 pi 的 jiti 加载环境存在 Zod v3/v4 版本冲突：
- `client.callTool()` 和 `client.request()` 内部都依赖 `CallToolResultSchema`（Zod v3 API）
- pi 环境加载 Zod v4，`v3Schema.safeParse is not a function`
- 独立 Node.js 进程正常，但在 jiti 加载的扩展中失败
- **结论**：当前无法在 pi 扩展中直接使用 MCP SDK，需探索替代方案（如子进程通信、CLI 桥接）

### 1.4 Provider 配置

- ccswitch 是 Anthropic 协议代理，转发给 Kimi LLM
- Ollama 使用 `api: "openai-completions"`，本地模型不支持工具调用

---

## 二、子代理系统

### 2.1 架构选择

采用 `pi-subagents` 而非自定义 TypeScript 扩展：
- **旧方案（不可行）**：TypeScript 扩展无法跨命令保存状态
- **新方案**：pi-subagents 通过 chain 变量 `{previous}` `{outputs.name}` 和文件输出解决状态传递

### 2.2 代理与链的设计

#### 自定义代理（`.pi/agents/reviewer-zh.md`）

```yaml
---
name: reviewer-zh
description: 中文代码审查专家
tools: read, bash, grep
skills: typescript-testing
model: ccswitch/claude-sonnet-4
---
# 系统提示词
```

#### Chain 工作流（`.pi/chains/review-flow.chain.md`）

```yaml
## scout
phase: Context
label: 代码侦察
as: context

## reviewer-zh
phase: Review
label: 深度审查
reads: ["context.md"]
```

> ⚠️ `reads` 必须是数组格式 `["file.md"]`，不能是字符串。

### 2.3 关键约束

- **异步模式在 Windows 上不稳定**：`Async runner process exited` 是已知问题，前台模式正常
- **Forked context 需要持久化 session**：packaged `planner`/`worker`/`oracle` 默认使用 fork，新 session 需显式设置 `context: "fresh"`
- **child 不继承 pi-subagents skill**：子代理接收具体角色任务，不应启动更多子代理
- **Max subagent depth 默认 2**：深层递归需额外配置

---

## 三、Skills 技能

### 3.1 安装社区 Skills

```bash
pi install git:github.com/badlogic/pi-skills
```

安装到 `~/.pi/agent/git/github.com/badlogic/pi-skills/`，包含 8 个技能：
- `brave-search` — 网页搜索（需 Brave API key）
- `browser-tools` — 浏览器自动化（需 Chrome）
- `youtube-transcript` — YouTube 字幕提取
- `transcribe` — 语音转录（需 Groq API key）
- `vscode` — VS Code 集成
- `gccli/gdcli/gmcli` — Google 服务 CLI

### 3.2 Skills 加载规则

Skills 从以下位置递归加载（SKILL.md）：
- `~/.pi/agent/skills/`
- `.pi/skills/`
- npm/git packages 的 `skills/` 目录
- `package.json` 的 `pi.skills` 配置

---

## 四、Themes 主题

### 4.1 主题文件格式

所有 51 个 color token 必须定义，不可省略。使用 `vars` 定义可复用颜色：

```json
{
  "name": "my-theme",
  "vars": { "accent": "#569cd6", "bg": "#1e1e2e" },
  "colors": {
    "accent": "accent",
    "selectedBg": "bg",
    ...
  }
}
```

### 4.2 引用主题色

扩展中通过 `theme.fg("tokenName", text)` 引用：

```typescript
ctx.ui.setFooter((tui, theme, footerData) => ({
  render(width) {
    const left = theme.fg("dim", `some text`);
    const right = theme.fg("accent", "highlighted");
    ...
  }
}));
```

### 4.3 热重载

编辑当前激活的主题文件时，pi 自动重新加载，无需 `/reload`。

---

## 五、SDK 集成

### 5.1 程序化调用

```typescript
import {
  AuthStorage,
  createAgentSession,
  ModelRegistry,
  SessionManager,
} from "@earendil-works/pi-coding-agent";

const authStorage = AuthStorage.create();
const modelRegistry = ModelRegistry.create(authStorage);

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage,
  modelRegistry,
});

session.subscribe((event) => {
  if (event.type === "message_update" &&
      event.assistantMessageEvent.type === "text_delta") {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

await session.prompt("审查 src/utils.ts");
```

### 5.2 批量脚本模式

```bash
# dry-run（安全预览）
node scripts/batch-review.mjs src/ --dry-run

# 实际审查（需 API key）
node scripts/batch-review.mjs src/ --ext .ts --max 5
```

---

## 六、项目结构最佳实践

```
my-pi-workflow/
├── .pi/
│   ├── agents/        # 项目级子代理
│   ├── chains/        # 项目级 chain 工作流
│   └── settings.json  # 项目设置
├── prompts/           # Prompt 模板
├── skills/            # 自定义 Skills
├── scripts/           # 自动化脚本（SDK）
├── plan/              # 设计文档
├── AGENTS.md          # 项目工作流规范
├── STATUS.md          # 进度追踪
├── TODO               # 待办清单
└── PI-BEST-PRACTICES.md  # 本文档
```

---

## 七、已知问题与规避

| 问题 | 影响 | 规避方案 |
|------|------|----------|
| MCP SDK Zod v3/v4 冲突 | MCP 扩展不可用 | 待探索子进程/CLI 桥接方案 |
| Windows 异步子代理不稳定 | async chain 可能失败 | 使用前台模式或 Linux/macOS |
| GitHub push 超时 | 无法推送 | 待排查网络代理配置 |
| Ollama 不支持工具调用 | 本地模型功能受限 | 需要工具时切换到云模型 |

---

## 八、常用命令速查

```bash
/model ccswitch/claude-sonnet-4   # 云模型
/model ollama/llama3:latest       # 本地模型
/reload                            # 重新加载扩展
/stats                             # 会话统计
/todos                             # 待办管理
/footer                            # 切换自定义页脚
/mcp-list                          # MCP 服务器列表
pi install npm:pi-subagents        # 安装子代理
pi install git:github.com/badlogic/pi-skills  # 社区技能
```

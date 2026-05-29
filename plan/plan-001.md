# 🎯 Pi 潜力挖掘执行计划

## 项目目标
系统性地掌握并应用 pi 的所有核心能力，从基础用户进阶为 pi 扩展开发者，最终能自定义工作流并分享成果。

---

## Phase 1: 基础夯实（第 1-2 天）

### 任务 1.1: 环境配置审计
**目标**: 确保 pi 配置最优

```bash
# 检查当前配置
cat ~/.pi/agent/settings.json

# 确认目录结构
ls ~/.pi/agent/
# 应有: extensions/ skills/ prompts/ themes/ sessions/ settings.json
```

**验收标准**:
- [ ] `settings.json` 存在且格式正确
- [ ] 知道全局配置和项目配置的区别（`~/.pi/agent/` vs `.pi/`）

### 任务 1.2: Prompt Templates 实战
**目标**: 创建 5 个常用模板

**创建目录**:
```bash
mkdir -p ~/.pi/agent/prompts
```

**模板清单**:

| 文件名 | 用途 | 触发命令 |
|--------|------|---------|
| `review.md` | 代码审查 | `/review` |
| `test.md` | 生成测试 | `/test` |
| `refactor.md` | 重构建议 | `/refactor` |
| `doc.md` | 生成文档 | `/doc` |
| `debug.md` | 调试分析 | `/debug` |

**review.md 示例**:
```markdown
---
description: 代码审查 - 检查bug、安全、性能问题
---
请审查以下代码，重点关注：
1. 逻辑错误和边界情况
2. 安全漏洞（XSS、SQL注入、命令注入等）
3. 性能瓶颈和优化建议
4. 可维护性和代码异味
5. 类型安全和错误处理

代码：
$1

请按严重程度分类问题，并给出具体修改建议。
```

**验收标准**:
- [ ] 5 个模板创建完成
- [ ] 在 pi 中输入 `/` 能看到自动补全
- [ ] 至少使用 3 次模板完成实际任务

### 任务 1.3: 快捷键肌肉记忆
**目标**: 熟记核心快捷键

| 快捷键 | 功能 | 练习次数 |
|--------|------|---------|
| `Shift+Tab` | 切换 Thinking 等级 | 10 次 |
| `Ctrl+P` / `Shift+Ctrl+P` | 循环模型 | 5 次 |
| `Ctrl+O` | 折叠/展开工具输出 | 10 次 |
| `Ctrl+T` | 折叠/展开思考块 | 5 次 |
| `Escape` x2 | 打开 `/tree` | 5 次 |
| `Ctrl+L` | 模型选择器 | 3 次 |
| `@` | 文件引用模糊搜索 | 10 次 |
| `!cmd` | 执行并发送 bash | 5 次 |
| `!!cmd` | 执行不发送 bash | 3 次 |

**验收标准**:
- [ ] 不看帮助能熟练使用所有快捷键
- [ ] 知道 `/hotkeys` 可以查看全部快捷键

---

## Phase 2: Skills 技能包开发（第 3-4 天）

### 任务 2.1: 为你的技术栈创建 Skills
**目标**: 创建 3 个领域技能

**创建目录**:
```bash
mkdir -p ~/.pi/agent/skills
```

**技能清单**（根据你的实际技术栈调整）:

| 技能名 | 适用场景 | 文件路径 |
|--------|---------|---------|
| `typescript-testing` | TS 项目测试 | `~/.pi/agent/skills/typescript-testing/SKILL.md` |
| `react-patterns` | React 组件开发 | `~/.pi/agent/skills/react-patterns/SKILL.md` |
| `api-design` | REST/GraphQL API 设计 | `~/.pi/agent/skills/api-design/SKILL.md` |

**typescript-testing/SKILL.md 示例**:
```markdown
---
name: typescript-testing
description: TypeScript 项目测试最佳实践。使用 Vitest + Testing Library。当用户需要写测试、审查测试或配置测试环境时使用。
---

# TypeScript 测试技能

## 工具链
- **测试框架**: Vitest（优先）或 Jest
- **React 测试**: @testing-library/react + @testing-library/user-event
- **Mock**: MSW (API), vi.fn() (函数)
- **覆盖率**: v8 (内置)

## 核心原则
1. **测试行为，非实现** - 用 `screen.getByRole`，不用 `getByTestId`
2. **一个测试一个概念** - 避免多个断言测试不同行为
3. **Arrange-Act-Assert** - 清晰的三段式结构
4. **避免测试第三方库** - 不测 React/Vitest 本身

## 文件命名
```
Component.test.tsx      # 组件测试
utils.test.ts           # 工具函数测试
hooks.test.ts           # Hook 测试
__tests__/              # 复杂模块的测试目录
```

## 常用模式

### 组件测试
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with valid input', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    // Act
    await userEvent.type(
      screen.getByRole('textbox', { name: /email/i }), 
      'test@example.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
```

### API Mock (MSW)
```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Test' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 配置参考

### vitest.config.ts
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '__tests__/setup.ts'],
    },
  },
});
```

## 反模式
- ❌ 测试内部状态 (`component.state`)
- ❌ 浅渲染（不用 `shallow`）
- ❌ 过度 mock（特别是自己的模块）
- ❌ 测试实现细节（如具体函数调用顺序）
```

**验收标准**:
- [ ] 3 个技能创建完成
- [ ] 在 pi 中 `/skill:name` 能正确加载
- [ ] AI 能根据任务自动匹配并应用技能
- [ ] 至少用技能完成 2 个实际开发任务

### 任务 2.2: 安装社区 Skills
**目标**: 体验生态

```bash
# 安装 pi-skills 包（搜索、浏览器自动化等）
pi install git:github.com/badlogic/pi-skills

# 查看可用技能
pi list
```

**验收标准**:
- [ ] pi-skills 安装成功
- [ ] 试用至少 1 个社区技能

---

## Phase 3: Extensions 扩展开发（第 5-10 天）

### 任务 3.1: 第一个扩展 - 危险命令拦截
**目标**: 掌握事件拦截机制

**文件**: `~/.pi/agent/extensions/permission-gate.ts`

```typescript
import type { ExtensionAPI, isToolCallEventType } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // 危险命令列表
  const DANGEROUS_PATTERNS = [
    /rm\s+-rf/i,
    /sudo/i,
    />.*\/dev\/null/,
    /mkfs\./i,
    /dd\s+if=/i,
  ];

  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return;

    const command = event.input.command;
    
    // 检查危险模式
    const matched = DANGEROUS_PATTERNS.find(p => p.test(command));
    if (!matched) return;

    // 请求确认
    const ok = await ctx.ui.confirm(
      "⚠️ 检测到危险命令",
      `即将执行: ${command}\n\n确认执行？`
    );

    if (!ok) {
      return { 
        block: true, 
        reason: "用户取消了危险命令执行" 
      };
    }
  });

  // 会话启动通知
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("🔒 Permission Gate 已激活", "info");
  });
}
```

**测试**:
```bash
pi -e ~/.pi/agent/extensions/permission-gate.ts
# 然后让 AI 执行: !rm -rf /tmp/test
```

**验收标准**:
- [ ] 扩展能正确加载
- [ ] 危险命令被拦截并弹出确认对话框
- [ ] 取消后 AI 收到 block 原因
- [ ] 确认后命令正常执行

### 任务 3.2: 路径保护扩展
**目标**: 保护敏感文件

**文件**: `~/.pi/agent/extensions/protected-paths.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "node:path";

export default function (pi: ExtensionAPI) {
  // 保护路径列表
  const PROTECTED_PATHS = [
    ".env",
    ".env.local",
    ".env.production",
    "node_modules/",
    "dist/",
    "build/",
    ".git/",
    "secrets/",
    "*.key",
    "*.pem",
  ];

  function isProtected(filePath: string, cwd: string): string | null {
    const relative = path.relative(cwd, path.resolve(cwd, filePath));
    
    for (const pattern of PROTECTED_PATHS) {
      if (pattern.endsWith("/")) {
        if (relative.startsWith(pattern) || relative.includes("/" + pattern)) {
          return pattern;
        }
      } else if (pattern.startsWith("*.")) {
        if (relative.endsWith(pattern.slice(1))) {
          return pattern;
        }
      } else {
        if (relative === pattern || relative.endsWith("/" + pattern)) {
          return pattern;
        }
      }
    }
    return null;
  }

  pi.on("tool_call", async (event, ctx) => {
    const toolName = event.toolName;
    
    // 拦截 write/edit 工具
    if (toolName === "write" || toolName === "edit") {
      const filePath = event.input.path;
      const protectedPattern = isProtected(filePath, ctx.cwd);
      
      if (protectedPattern) {
        const ok = await ctx.ui.confirm(
          "🛡️ 受保护路径",
          `文件 ${filePath} 匹配保护模式: ${protectedPattern}\n\n确认写入？`
        );
        
        if (!ok) {
          return {
            block: true,
            reason: `路径受保护: ${protectedPattern}`
          };
        }
      }
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("🛡️ Protected Paths 已激活", "info");
  });
}
```

**验收标准**:
- [ ] 尝试让 AI 写入 `.env` 被拦截
- [ ] 尝试让 AI 修改 `node_modules/` 下文件被拦截
- [ ] 确认后可以正常写入

### 任务 3.3: Git Checkpoint 扩展
**目标**: 自动保存工作进度

**文件**: `~/.pi/agent/extensions/git-checkpoint.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let checkpointCount = 0;

  pi.on("turn_start", async (event, ctx) => {
    // 检查是否是 git 仓库
    try {
      await ctx.bash?.exec("git rev-parse --git-dir", ctx.cwd);
    } catch {
      return; // 不是 git 仓库，跳过
    }

    // 检查是否有未提交更改
    const status = await ctx.bash?.exec("git status --porcelain", ctx.cwd);
    if (!status?.output.trim()) return; // 没有更改

    checkpointCount++;
    const stashName = `pi-checkpoint-${Date.now()}-${checkpointCount}`;
    
    try {
      await ctx.bash?.exec(
        `git stash push -m "${stashName}" --include-untracked`,
        ctx.cwd
      );
      ctx.ui.notify(`💾 Checkpoint #${checkpointCount} 已保存`, "info");
      
      // 持久化记录到会话
      pi.appendEntry("git-checkpoint", {
        stashName,
        turnIndex: event.turnIndex,
        timestamp: Date.now(),
      });
    } catch (e) {
      ctx.ui.notify("⚠️ Checkpoint 保存失败", "warning");
    }
  });

  // 注册恢复命令
  pi.registerCommand("restore-checkpoint", {
    description: "恢复最近的 git checkpoint",
    handler: async (_args, ctx) => {
      const entries = ctx.sessionManager.getEntries()
        .filter(e => e.type === "custom" && e.customType === "git-checkpoint");
      
      if (entries.length === 0) {
        ctx.ui.notify("没有可恢复的 checkpoint", "warning");
        return;
      }

      const lastEntry = entries[entries.length - 1];
      const data = lastEntry.data as { stashName: string };
      
      try {
        await ctx.bash?.exec("git stash pop", ctx.cwd);
        ctx.ui.notify(`✅ 已恢复: ${data.stashName}`, "info");
      } catch (e) {
        ctx.ui.notify("恢复失败，可能有冲突", "error");
      }
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("💾 Git Checkpoint 已激活", "info");
  });
}
```

**验收标准**:
- [ ] 每轮开始时自动 stash 未提交更改
- [ ] `/restore-checkpoint` 能恢复最近的 stash
- [ ] 非 git 仓库不报错

### 任务 3.4: 自定义命令扩展
**目标**: 创建实用命令

**文件**: `~/.pi/agent/extensions/commands.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // /stats - 会话统计
  pi.registerCommand("stats", {
    description: "显示会话统计信息",
    handler: async (_args, ctx) => {
      const entries = ctx.sessionManager.getEntries();
      const turns = entries.filter(e => e.type === "assistant").length;
      const tools = entries.filter(e => e.type === "toolResult").length;
      
      ctx.ui.notify(
        `📊 会话统计: ${turns} 轮对话, ${tools} 次工具调用, ${entries.length} 条记录`,
        "info"
      );
    },
  });

  // /clear-history - 清空当前分支（保留文件）
  pi.registerCommand("clear-history", {
    description: "清空当前会话分支历史（保留文件）",
    handler: async (_args, ctx) => {
      const ok = await ctx.ui.confirm(
        "⚠️ 清空历史",
        "这将清空当前分支的所有消息，但保留文件更改。\n\n确认？"
      );
      
      if (!ok) return;
      
      // 这里可以调用 compact 或创建新会话
      ctx.compact({
        customInstructions: "保留所有文件更改，只清空对话历史",
        onComplete: () => ctx.ui.notify("历史已清空", "info"),
        onError: (e) => ctx.ui.notify(`清空失败: ${e.message}`, "error"),
      });
    },
  });

  // /branch-name - 设置会话名称
  pi.registerCommand("branch-name", {
    description: "设置会话显示名称",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("用法: /branch-name <名称>", "warning");
        return;
      }
      pi.setSessionName(args.trim());
      ctx.ui.notify(`会话名称: ${args.trim()}`, "info");
    },
  });
}
```

**验收标准**:
- [ ] `/stats` 显示正确统计
- [ ] `/clear-history` 清空历史但保留上下文
- [ ] `/branch-name` 设置会话名称

### 任务 3.5: 自定义 UI 组件
**目标**: 掌握 TUI 组件开发

**文件**: `~/.pi/agent/extensions/todo.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export default function (pi: ExtensionAPI) {
  let todos: TodoItem[] = [];

  // 加载持久化数据
  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx.sessionManager.getEntries()
      .filter(e => e.type === "custom" && e.customType === "todo");
    
    if (entries.length > 0) {
      const last = entries[entries.length - 1];
      todos = (last.data as { todos: TodoItem[] }).todos;
    }
  });

  // 注册 todo 工具
  pi.registerTool({
    name: "todo",
    label: "Todo",
    description: "管理待办事项列表",
    promptSnippet: "Add, list, toggle, or remove todo items",
    parameters: Type.Object({
      action: Type.String({ 
        description: "Action: add, list, toggle, remove, clear" 
      }),
      text: Type.Optional(Type.String({ 
        description: "Todo text (for add)" 
      })),
      id: Type.Optional(Type.String({ 
        description: "Todo ID (for toggle/remove)" 
      })),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      switch (params.action) {
        case "add": {
          if (!params.text) return { content: [{ type: "text", text: "需要 text 参数" }] };
          const todo: TodoItem = {
            id: `todo-${Date.now()}`,
            text: params.text,
            done: false,
            createdAt: Date.now(),
          };
          todos.push(todo);
          persist();
          return {
            content: [{ type: "text", text: `✅ 添加: ${todo.text}` }],
            details: { todos },
          };
        }
        case "list": {
          const lines = todos.map(t => 
            `${t.done ? "✅" : "⬜"} ${t.text} (${t.id})`
          );
          return {
            content: [{ type: "text", text: lines.join("\n") || "暂无待办" }],
            details: { todos },
          };
        }
        case "toggle": {
          const todo = todos.find(t => t.id === params.id);
          if (!todo) return { content: [{ type: "text", text: "未找到" }] };
          todo.done = !todo.done;
          persist();
          return {
            content: [{ type: "text", text: `${todo.done ? "✅" : "⬜"} ${todo.text}` }],
            details: { todos },
          };
        }
        case "remove": {
          const idx = todos.findIndex(t => t.id === params.id);
          if (idx === -1) return { content: [{ type: "text", text: "未找到" }] };
          const removed = todos.splice(idx, 1)[0];
          persist();
          return {
            content: [{ type: "text", text: `🗑️ 删除: ${removed.text}` }],
            details: { todos },
          };
        }
        case "clear": {
          todos = [];
          persist();
          return {
            content: [{ type: "text", text: "🗑️ 已清空所有待办" }],
            details: { todos },
          };
        }
        default:
          return { content: [{ type: "text", text: "未知操作" }] };
      }
    },
    // 自定义渲染
    renderResult(result, options, theme, context) {
      const { todos } = result.details as { todos: TodoItem[] };
      const lines = [
        theme.fg("accent", theme.bold("📋 Todo 列表")),
        "",
        ...todos.map(t => {
          const icon = t.done 
            ? theme.fg("success", "✅") 
            : theme.fg("dim", "⬜");
          const text = t.done 
            ? theme.fg("muted", t.text) 
            : theme.fg("text", t.text);
          return `${icon} ${text}`;
        }),
        todos.length === 0 ? theme.fg("dim", "暂无待办事项") : "",
      ].filter(Boolean);
      
      return {
        render: (width: number) => lines,
        invalidate: () => {},
      };
    },
  });

  function persist() {
    pi.appendEntry("todo", { todos });
  }

  // Widget 显示在编辑器上方
  pi.on("session_start", async (_event, ctx) => {
    updateWidget(ctx);
  });

  function updateWidget(ctx: any) {
    const pending = todos.filter(t => !t.done);
    if (pending.length === 0) {
      ctx.ui.setWidget("todo", undefined);
      return;
    }
    
    ctx.ui.setWidget("todo", (_tui: any, theme: any) => {
      const lines = [
        theme.fg("accent", `📋 待办 (${pending.length})`),
        ...pending.slice(0, 3).map(t => 
          theme.fg("dim", `  • ${t.text}`)
        ),
        pending.length > 3 ? theme.fg("dim", `  ... 还有 ${pending.length - 3} 项`) : "",
      ].filter(Boolean);
      
      return {
        render: () => lines,
        invalidate: () => {},
      };
    });
  }
}
```

**验收标准**:
- [ ] AI 可以调用 `todo` 工具管理待办
- [ ] 自定义渲染显示美观的 todo 列表
- [ ] Widget 显示在编辑器上方
- [ ] 数据持久化到会话

---

## Phase 4: 高级扩展（第 11-14 天）

### 任务 4.1: 自定义 Compaction
**目标**: 控制上下文压缩行为

**文件**: `~/.pi/agent/extensions/custom-compaction.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_before_compact", async (event, ctx) => {
    // 自定义压缩策略：保留所有代码相关消息
    const entries = event.branchEntries;
    
    // 识别代码相关消息
    const codeRelated = entries.filter(e => {
      if (e.type !== "assistant" && e.type !== "user") return false;
      const content = JSON.stringify(e.content || "");
      return content.includes("```") || 
             content.includes("function") ||
             content.includes("class");
    });

    ctx.ui.notify(
      `🗜️ 压缩中: 保留 ${codeRelated.length} 条代码相关消息`,
      "info"
    );

    // 使用默认压缩，但附加自定义指令
    return {
      compaction: {
        summary: event.preparation.summary + 
          "\n\n[系统提示: 以上历史中包含代码实现，请保留关键代码片段的记忆]",
        firstKeptEntryId: event.preparation.firstKeptEntryId,
        tokensBefore: event.preparation.tokensBefore,
      }
    };
  });
}
```

### 任务 4.2: 自定义 Footer
**目标**: 显示更多信息

**文件**: `~/.pi/agent/extensions/custom-footer.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.setFooter((tui, theme, footerData) => {
      let lastRender = "";
      
      return {
        render(width: number): string[] {
          const branch = footerData.getGitBranch() || "no-git";
          const model = ctx.model?.id || "unknown";
          const usage = ctx.getContextUsage();
          const tokens = usage ? `${usage.tokens}` : "?";
          
          const line = [
            theme.fg("muted", `⎇ ${branch}`),
            theme.fg("accent", model),
            theme.fg("dim", `${tokens} tokens`),
            ...Array.from(footerData.getExtensionStatuses().entries())
              .map(([k, v]) => theme.fg("muted", `${k}: ${v}`)),
          ].join(" | ");
          
          lastRender = line;
          return [line];
        },
        invalidate() {},
        dispose: footerData.onBranchChange(() => tui.requestRender()),
      };
    });
  });
}
```

### 任务 4.3: 模型状态指示器
**目标**: 显示当前模型和思考等级

**文件**: `~/.pi/agent/extensions/model-status.ts`

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("model_select", async (event, ctx) => {
    const model = event.model;
    const thinking = ctx.getSystemPrompt ? "?" : "medium"; // 简化
    
    ctx.ui.setStatus("model", 
      ctx.ui.theme.fg("accent", `🧠 ${model.id}`)
    );
  });

  pi.on("thinking_level_select", async (event, ctx) => {
    const colors: Record<string, string> = {
      off: "dim",
      minimal: "muted",
      low: "success",
      medium: "accent",
      high: "warning",
      xhigh: "error",
    };
    
    const color = colors[event.level] || "text";
    ctx.ui.setStatus("thinking", 
      ctx.ui.theme.fg(color as any, `💭 ${event.level}`)
    );
  });
}
```

---

## Phase 5: 打包与分享（第 15-17 天）

### 任务 5.1: 创建 Pi Package
**目标**: 把所有成果打包

**目录结构**:
```
my-pi-workflow/
├── package.json
├── extensions/
│   ├── permission-gate.ts
│   ├── protected-paths.ts
│   ├── git-checkpoint.ts
│   ├── commands.ts
│   ├── todo.ts
│   ├── custom-compaction.ts
│   ├── custom-footer.ts
│   └── model-status.ts
├── skills/
│   ├── typescript-testing/
│   │   └── SKILL.md
│   ├── react-patterns/
│   │   └── SKILL.md
│   └── api-design/
│       └── SKILL.md
├── prompts/
│   ├── review.md
│   ├── test.md
│   ├── refactor.md
│   ├── doc.md
│   └── debug.md
└── themes/
    └── my-theme.json
```

**package.json**:
```json
{
  "name": "my-pi-workflow",
  "version": "1.0.0",
  "description": "我的 pi 工作流配置",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  }
}
```

**安装测试**:
```bash
# 本地测试
pi -e ./my-pi-workflow

# 或者安装到全局
pi install ./my-pi-workflow
```

### 任务 5.2: 发布到 GitHub
**目标**: 分享给社区

```bash
# 创建仓库
git init
git add .
git commit -m "Initial pi workflow package"
gh repo create my-pi-workflow --public
git push -u origin main

# 打标签
git tag v1.0.0
git push origin v1.0.0
```

**别人安装**:
```bash
pi install git:github.com/yourname/my-pi-workflow@v1.0.0
```

---

## Phase 6: 进阶探索（持续）

### 可选任务清单

| 任务 | 难度 | 价值 |
|------|------|------|
| 自定义 Provider（接入本地 LLM） | ⭐⭐⭐⭐⭐ | 私有化部署 |
| 子代理系统（用扩展实现） | ⭐⭐⭐⭐⭐ | 复杂任务分解 |
| Plan Mode（用扩展实现） | ⭐⭐⭐⭐ | 复杂项目规划 |
| 自定义编辑器（Vim/Emacs 模式） | ⭐⭐⭐⭐ | 编辑器偏好 |
| 游戏扩展（Snake/Doom） | ⭐⭐⭐ | 娱乐 |
| MCP 服务器集成 | ⭐⭐⭐⭐ | 生态互通 |
| SDK 程序化集成 | ⭐⭐⭐⭐ | 自动化工作流 |

---

## 📋 执行检查清单

```
□ Phase 1 完成
  □ 1.1 环境配置审计
  □ 1.2 5 个 Prompt Templates
  □ 1.3 快捷键肌肉记忆

□ Phase 2 完成
  □ 2.1 3 个 Skills
  □ 2.2 社区 Skills 安装

□ Phase 3 完成
  □ 3.1 Permission Gate 扩展
  □ 3.2 Protected Paths 扩展
  □ 3.3 Git Checkpoint 扩展
  □ 3.4 自定义命令扩展
  □ 3.5 Todo UI 扩展

□ Phase 4 完成
  □ 4.1 自定义 Compaction
  □ 4.2 自定义 Footer
  □ 4.3 模型状态指示器

□ Phase 5 完成
  □ 5.1 Pi Package 打包
  □ 5.2 GitHub 发布

□ Phase 6 持续
  □ 选择 1-2 个进阶任务探索
```

---

## 🎓 布道者宣言

> **"Pi 不是工具，是平台。**
> **不是用它工作，是用它创造工作方式。**
> **每一个扩展都是你对编程工作流的一次重新定义。"**

---

*计划制定日期: 2026-05-29*
*目标完成: 17 天基础周期 + 持续进阶*

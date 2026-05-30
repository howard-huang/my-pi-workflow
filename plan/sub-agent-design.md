# 子代理系统设计文档

## 1. 背景和动机

### 1.1 问题

当前 pi 处理复杂任务时存在以下局限：

1. **上下文窗口限制** — 大项目代码量超出模型上下文容量
2. **注意力分散** — 单次会话处理多文件时，AI 容易遗漏细节
3. **任务耦合** — 重构、测试、文档等任务混在一起，难以追踪进度
4. **串行瓶颈** — 无法并行执行独立子任务

### 1.2 目标

构建一个**任务分解与多代理协作系统**，让 pi 能够：

- 将复杂任务自动拆分为原子化子任务
- 每个子任务由独立会话（子代理）执行
- 收集子代理结果，汇总为最终交付物
- 保持主代理对全局的掌控

---

## 2. 核心概念

### 2.1 术语定义

| 术语 | 定义 |
|------|------|
| **Master Agent** | 主代理，负责任务分解、协调、汇总 |
| **Sub-Agent** | 子代理，负责执行单一原子任务 |
| **Task Plan** | 任务计划，包含目标、步骤、依赖关系 |
| **Step** | 执行步骤，原子化的最小工作单元 |
| **Artifact** | 子代理产出的文件/代码/报告 |
| **Session Tree** | pi 的分支会话树，天然支持子代理隔离 |

### 2.2 任务分解原则

- 独立的（Independent）— 步骤之间无状态依赖
- 可验证的（Verifiable）— 产出可测试/可审查
- 有界的（Bounded）— 上下文窗口内可完成
- 可组合的（Composable）— 结果可汇总为整体

---

## 3. 系统架构

```
Master Session (主代理，用户可见)
├── Task Planner 任务规划器
├── Orchestrator 协调器
├── Summarizer 结果汇总
└── Session Tree (pi 分支机制)
    ├── Sub-Agent Step-1 (分支A)
    ├── Sub-Agent Step-2 (分支B)
    └── Sub-Agent Step-3 (分支C)
```

---

## 4. 接口设计

### 4.1 TaskPlan 数据结构

```typescript
interface TaskPlan {
  id: string;
  goal: string;
  createdAt: number;
  steps: Step[];
  sharedContext: string;
}

interface Step {
  id: string;
  name: string;
  instruction: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  status: "pending" | "running" | "completed" | "failed";
  sessionId?: string;
  result?: string;
}
```

### 4.2 命令与工具

- `/plan <任务描述>` — 创建任务计划
- `/execute-plan` — 执行当前计划
- `/show-plan` — 显示计划进度
- `/retry-step <stepId>` — 重试失败步骤
- `sub_agent` 工具 — AI 自动调用，创建子代理

---

## 5. 实现方案

### 5.1 基于 pi 分支机制

pi 的 Session Tree 天然支持子代理隔离：

- 子代理在独立分支运行，不污染主会话上下文
- 子代理完成后可 compact，释放上下文空间
- 结果通过 details 或文件传递回主代理

### 5.2 执行流程

1. 用户输入任务
2. AI 生成 TaskPlan (JSON)
3. 拓扑排序，按依赖执行
4. 每个步骤创建子代理会话（分支）
5. 收集结果，生成汇总报告

---

## 6. 使用示例

### 场景：为已有项目生成完整测试套件

**TaskPlan：**
- s1: 分析项目结构 → 输出 module-manifest.json
- s2: 为核心模块生成测试（依赖 s1）→ 并行
- s3: 为工具模块生成测试（依赖 s1）→ 并行
- s4: 验证并汇总（依赖 s2, s3）→ 最后执行

**最终结果：**
- tests/core.test.ts (15 个用例)
- tests/utils.test.ts (8 个用例)
- coverage/ (覆盖率 87%)

---

## 7. 风险和限制

| 限制 | 说明 | 缓解方案 |
|------|------|---------|
| 上下文传递 | 子代理无法直接访问主代理的完整上下文 | sharedContext + 输入文件 |
| 状态同步 | 文件需显式同步回主代理 | 定义明确的 outputs |
| 并行度 | pi 可能不支持真正的并行执行 | 串行模拟并行 |
| 错误恢复 | 单步骤失败导致阻塞 | retry-step，跳过非关键步骤 |

---

## 8. 演进路线

**Phase 1: 基础版**
- 手动创建计划 (/plan + /execute-step)
- 串行执行
- 基础 Widget 显示进度

**Phase 2: 自动版**
- AI 自动分解任务 (/auto-plan)
- 并行执行
- 智能重试和错误恢复

**Phase 3: 高级版**
- 子代理间通信（消息队列）
- 动态计划调整
- 计划模板库

---

*设计日期: 2026-05-29*
*状态: 设计完成，待实现*

> ⚠️ **注意**：此设计文档参考了基亍 pi-subagents 的现有实现（reviewer-zh 代理 + review-flow chain 已可用），但具体接口与本设计不完全一致。实际实现见 `~/.pi/agent/agents/reviewer-zh.md` 和 `~/.pi/agent/chains/review-flow.chain.md`。

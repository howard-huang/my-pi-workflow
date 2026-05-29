# MCP 服务器集成设计文档

## 1. 什么是 MCP

MCP (Model Context Protocol) 是 Anthropic 推出的开放协议，让 AI 模型能安全地连接外部工具和数据源。

## 2. 集成价值

| 能力 | 说明 |
|------|------|
| 文件系统 | 读写本地文件、遍历目录 |
| 数据库 | 查询 SQL、NoSQL 数据库 |
| API 调用 | 调用 REST/GraphQL API |
| Git 操作 | 提交、分支、PR 管理 |
| 浏览器 | 网页抓取、自动化测试 |

## 3. pi 中的实现方式

通过扩展调用 MCP 服务器：

```typescript
// extensions/mcp-bridge.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export default function (pi: ExtensionAPI) {
  const client = new Client({ name: "pi-mcp", version: "1.0.0" });

  pi.registerTool({
    name: "mcp_call",
    description: "调用 MCP 服务器工具",
    parameters: Type.Object({
      server: Type.String(),
      tool: Type.String(),
      args: Type.Record(Type.String(), Type.Any()),
    }),
    async execute(_id, params) {
      const result = await client.callTool(params.tool, params.args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    },
  });
}
```

## 4. 常用 MCP 服务器

| 服务器 | 功能 | 安装命令 |
|--------|------|---------|
| filesystem | 文件操作 | npx -y @modelcontextprotocol/server-filesystem |
| sqlite | SQLite 查询 | npx -y @modelcontextprotocol/server-sqlite |
| fetch | HTTP 请求 | npx -y @modelcontextprotocol/server-fetch |
| git | Git 操作 | npx -y @modelcontextprotocol/server-git |
| puppeteer | 浏览器自动化 | npx -y @modelcontextprotocol/server-puppeteer |

## 5. 安全考虑

- 只连接可信的 MCP 服务器
- 限制文件系统访问路径
- Permission Gate 拦截危险操作

---

*设计日期: 2026-05-29*
*状态: 调研完成，待实现*

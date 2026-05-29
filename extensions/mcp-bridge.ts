import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

// MCP SDK uses ESM, use dynamic import
async function loadMcp() {
	const { Client } = await import("@modelcontextprotocol/sdk/dist/esm/client/index.js");
	const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/dist/esm/client/stdio.js");
	return { Client, StdioClientTransport };
}

interface ServerConfig {
	name: string;
	command: string;
	args: string[];
}

const DEFAULT_SERVERS: ServerConfig[] = [
	{
		name: "filesystem",
		command: "npx",
		args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
	},
];

export default function (pi: ExtensionAPI) {
	const clients = new Map<string, any>();

	async function getClient(name: string): Promise<any | null> {
		if (clients.has(name)) return clients.get(name)!;

		const config = DEFAULT_SERVERS.find((s) => s.name === name);
		if (!config) return null;

		try {
			const { Client, StdioClientTransport } = await loadMcp();
			const transport = new StdioClientTransport({
				command: config.command,
				args: config.args,
			});
			const client = new Client({ name: "pi-mcp", version: "1.0.0" });
			await client.connect(transport);
			clients.set(name, client);
			return client;
		} catch (e) {
			console.error("MCP connect error:", e);
			return null;
		}
	}

	pi.registerTool({
		name: "mcp",
		label: "MCP",
		description: "调用 MCP 服务器工具 (filesystem, sqlite, fetch, git 等)",
		promptSnippet: "调用外部 MCP 工具",
		parameters: Type.Object({
			server: Type.String({ description: "MCP 服务器名称" }),
			tool: Type.String({ description: "工具名称" }),
			args: Type.Optional(Type.Record(Type.String(), Type.Any())),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			const client = await getClient(params.server);
			if (!client) {
				return {
					content: [{ type: "text", text: "MCP 服务器未找到或未启动: " + params.server }],
				};
			}

			try {
				const result = await client.callTool(params.tool, params.args || {});
				return {
					content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				};
			} catch (e) {
				return {
					content: [{ type: "text", text: "调用失败: " + (e as Error).message }],
				};
			}
		},
	});

	pi.registerCommand("mcp-list", {
		description: "列出可用的 MCP 服务器",
		handler: async (_args, ctx) => {
			const list = DEFAULT_SERVERS.map((s) => "• " + s.name).join("\n");
			ctx.ui.notify("可用 MCP 服务器:\n" + list, "info");
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🔗 MCP Bridge 已激活", "info");
	});
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	// /stats - 会话统计
	pi.registerCommand("stats", {
		description: "显示会话统计信息",
		handler: async (_args, ctx) => {
			const entries = ctx.sessionManager.getEntries();
			const turns = entries.filter((e) => e.type === "assistant").length;
			const tools = entries.filter((e) => e.type === "toolResult").length;

			ctx.ui.notify(
				`📊 会话统计: ${turns} 轮对话, ${tools} 次工具调用, ${entries.length} 条记录`,
				"info",
			);
		},
	});

	// /clear-history - 清空当前分支（保留文件）
	pi.registerCommand("clear-history", {
		description: "清空当前会话分支历史（保留文件）",
		handler: async (_args, ctx) => {
			const ok = await ctx.ui.confirm(
				"⚠️ 清空历史",
				"这将清空当前分支的所有消息，但保留文件更改。\n\n确认？",
			);

			if (!ok) return;

			// 使用 compact 来压缩历史
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

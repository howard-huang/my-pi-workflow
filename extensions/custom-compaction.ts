import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("session_before_compact", async (event, ctx) => {
		const { preparation, branchEntries } = event;

		// 识别代码相关消息
		const codeRelated = branchEntries.filter((e) => {
			if (e.type !== "assistant" && e.type !== "user") return false;
			const content = JSON.stringify(e.content || "");
			return (
				content.includes("```") ||
				content.includes("function") ||
				content.includes("class")
			);
		});

		ctx.ui.notify(
			`🗜️ 压缩中: 保留 ${codeRelated.length} 条代码相关消息`,
			"info",
		);

		// 使用默认压缩，但附加自定义指令
		return {
			compaction: {
				summary:
					preparation.summary +
					"\n\n[系统提示: 以上历史中包含代码实现，请保留关键代码片段的记忆]",
				firstKeptEntryId: preparation.firstKeptEntryId,
				tokensBefore: preparation.tokensBefore,
			},
		};
	});
}

import type { ExtensionAPI, isToolCallEventType } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	// 危险命令列表
	const DANGEROUS_PATTERNS = [
		/\brm\s+(-rf?|--recursive)/i,
		/\bsudo\b/i,
		/>.*\/dev\/null/,
		/\bmkfs\./i,
		/\bdd\s+if=/i,
		/\bchmod\b.*777/i,
		/\bchown\b.*777/i,
	];

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash") return;

		const command = event.input.command as string;

		// 检查危险模式
		const matched = DANGEROUS_PATTERNS.find((p) => p.test(command));
		if (!matched) return;

		// 无 UI 模式默认阻止
		if (!ctx.hasUI) {
			return {
				block: true,
				reason: "⚠️ 危险命令被阻止（无 UI 无法确认）",
			};
		}

		// 请求确认
		const ok = await ctx.ui.confirm(
			"⚠️ 检测到危险命令",
			`即将执行: ${command}\n\n匹配模式: ${matched}\n\n确认执行？`,
		);

		if (!ok) {
			return {
				block: true,
				reason: "用户取消了危险命令执行",
			};
		}
	});

	// 会话启动通知
	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🔒 Permission Gate 已激活", "info");
	});
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	const DANGEROUS_PATTERNS = [
		/\brm\s+(-rf?|--recursive)/i,
		/\bsudo\b/i,
		/>.*\/dev\/null/,
		/\bmkfs\./i,
		/\bdd\s+if=/i,
		/\bchmod\b.*777/i,
		/\bchown\b.*777/i,
	];

	function isDangerous(command: string): RegExp | undefined {
		return DANGEROUS_PATTERNS.find((p) => p.test(command));
	}

	// 拦截 AI 调用的 bash tool
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash") return;
		const command = event.input.command as string;
		const matched = isDangerous(command);
		if (!matched) return;
		if (!ctx.hasUI) {
			return { block: true, reason: "⚠️ 危险命令被阻止（无 UI 无法确认）" };
		}
		const ok = await ctx.ui.confirm(
			"⚠️ 检测到危险命令",
			"即将执行: " + command + "\n\n匹配模式: " + matched + "\n\n确认执行？",
		);
		if (!ok) {
			return { block: true, reason: "用户取消了危险命令执行" };
		}
	});

	// 拦截用户直接执行的 !bash / !!bash
	pi.on("user_bash", async (event, ctx) => {
		const command = event.command;
		const matched = isDangerous(command);
		if (!matched) return;
		if (ctx.hasUI) {
			const ok = await ctx.ui.confirm(
				"⚠️ 检测到危险命令",
				"即将执行: " + command + "\n\n匹配模式: " + matched + "\n\n确认执行？",
			);
			if (!ok) {
				return {
					result: {
						output: "🚫 危险命令已被 Permission Gate 拦截（用户取消）",
						exitCode: 1,
						cancelled: false,
						truncated: false,
					},
				};
			}
			return;
		}
		return {
			result: {
				output: "🚫 危险命令已被 Permission Gate 拦截（无 UI 模式）",
				exitCode: 1,
				cancelled: false,
				truncated: false,
			},
		};
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🔒 Permission Gate 已激活", "info");
	});
}

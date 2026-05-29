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
				if (
					relative.startsWith(pattern) ||
					relative.includes("/" + pattern)
				) {
					return pattern;
				}
			} else if (pattern.startsWith("*.")) {
				if (relative.endsWith(pattern.slice(1))) {
					return pattern;
				}
			} else {
				if (
					relative === pattern ||
					relative.endsWith("/" + pattern)
				) {
					return pattern;
				}
			}
		}
		return null;
	}

	pi.on("tool_call", async (event, ctx) => {
		const toolName = event.toolName;

		// 拦截 write/edit 工具
		if (toolName !== "write" && toolName !== "edit") return;

		const filePath = event.input.path as string;
		const protectedPattern = isProtected(filePath, ctx.cwd);

		if (protectedPattern) {
			if (ctx.hasUI) {
				const ok = await ctx.ui.confirm(
					"🛡️ 受保护路径",
					`文件 ${filePath} 匹配保护模式: ${protectedPattern}\n\n确认写入？`,
				);

				if (!ok) {
					return {
						block: true,
						reason: `路径受保护: ${protectedPattern}`,
					};
				}
				return; // 确认后允许执行
			} else {
				return {
					block: true,
					reason: `路径受保护: ${protectedPattern}`,
				};
			}
		}
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🛡️ Protected Paths 已激活", "info");
	});
}

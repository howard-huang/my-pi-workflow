import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as path from "node:path";

const EXACT = [".env", ".env.local", ".env.production"];
const DIRS = ["node_modules", "dist", "build", ".git", "secrets"];
const SUFFIX = [".key", ".pem"];

export default function (pi: ExtensionAPI) {
	function isProtected(fp: string, cwd: string): string | null {
		const base = path.basename(fp);
		if (EXACT.includes(base)) return base;
		const norm = path.resolve(cwd, fp).split(path.sep).join("/");
		for (const d of DIRS) {
			if (norm.includes("/" + d + "/") || norm.endsWith("/" + d)) return d + "/";
		}
		for (const s of SUFFIX) {
			if (base.endsWith(s)) return "*" + s;
		}
		return null;
	}

	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return;
		const p = event.input.path as string;
		const pat = isProtected(p, ctx.cwd);
		if (!pat) return;
		if (ctx.hasUI) {
			const ok = await ctx.ui.confirm(
				"🛡️ 受保护路径",
				"文件 " + p + " 匹配保护模式: " + pat + "\n\n确认写入？",
			);
			if (!ok) {
				return { block: true, reason: "路径受保护: " + pat };
			}
			return;
		}
		return { block: true, reason: "路径受保护: " + pat };
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🛡️ Protected Paths 已激活", "info");
	});
}

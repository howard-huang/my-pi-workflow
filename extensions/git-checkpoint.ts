import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	let checkpointCount = 0;

	// 检查是否是 git 仓库
	async function isGitRepo(cwd: string): Promise<boolean> {
		try {
			await pi.exec("git", ["rev-parse", "--git-dir"], { cwd, timeout: 2000 });
			return true;
		} catch {
			return false;
		}
	}

	pi.on("turn_start", async (event, ctx) => {
		// 检查是否是 git 仓库
		const isGit = await isGitRepo(ctx.cwd);
		if (!isGit) return;

		// 检查是否有未提交更改
		const statusResult = await pi.exec(
			"git",
			["status", "--porcelain"],
			{ cwd: ctx.cwd, timeout: 2000 },
		);
		if (!statusResult.stdout.trim()) return; // 没有更改

		checkpointCount++;
		const stashName = `pi-checkpoint-${Date.now()}-${checkpointCount}`;

		try {
			await pi.exec(
				"git",
				["stash", "push", "-m", stashName, "--include-untracked"],
				{ cwd: ctx.cwd, timeout: 5000 },
			);
			ctx.ui.notify(`💾 Checkpoint #${checkpointCount} 已保存`, "info");

			// 持久化记录到会话
			pi.appendEntry("git-checkpoint", {
				stashName,
				turnIndex: event.turnIndex,
				timestamp: Date.now(),
			});
		} catch (_e) {
			ctx.ui.notify("⚠️ Checkpoint 保存失败", "warning");
		}
	});

	// 注册恢复命令
	pi.registerCommand("restore-checkpoint", {
		description: "恢复最近的 git checkpoint",
		handler: async (_args, ctx) => {
			const entries = ctx.sessionManager
				.getEntries()
				.filter(
					(e) =>
						e.type === "custom" &&
						(e as any).customType === "git-checkpoint",
				);

			if (entries.length === 0) {
				ctx.ui.notify("没有可恢复的 checkpoint", "warning");
				return;
			}

			const lastEntry = entries[entries.length - 1];
			const data = (lastEntry as any).data as {
				stashName: string;
				turnIndex: number;
				timestamp: number;
			};

			try {
				await pi.exec("git", ["stash", "pop"], {
					cwd: ctx.cwd,
					timeout: 5000,
				});
				ctx.ui.notify(`✅ 已恢复: ${data.stashName}`, "info");
			} catch (_e) {
				ctx.ui.notify("恢复失败，可能有冲突", "error");
			}
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		const isGit = await isGitRepo(ctx.cwd);
		if (isGit) {
			ctx.ui.notify("💾 Git Checkpoint 已激活", "info");
		}
	});
}

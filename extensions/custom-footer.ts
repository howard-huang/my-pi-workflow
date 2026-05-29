import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
	let enabled = false;

	pi.registerCommand("footer", {
		description: "切换自定义 Footer",
		handler: async (_args, ctx) => {
			enabled = !enabled;

			if (enabled) {
				ctx.ui.setFooter((tui, theme, footerData) => {
					const unsub = footerData.onBranchChange(() => tui.requestRender());

					return {
						dispose: unsub,
						invalidate() {},
						render(width: number): string[] {
							// Git 分支
							const branch = footerData.getGitBranch() || "no-git";

							// 当前模型
							const model = ctx.model?.id || "unknown";

							// Token 使用量
							const usage = ctx.getContextUsage();
							const tokens = usage ? `${usage.tokens}` : "?";

							// 扩展状态
							const extStatuses = Array.from(
								footerData.getExtensionStatuses().entries(),
							)
								.map(([k, v]) => `${k}: ${v}`)
								.join(" | ");

							const left = theme.fg("muted", `⎇ ${branch}`);
							const mid = theme.fg("accent", model);
							const right = theme.fg("dim", `${tokens} tokens${extStatuses ? " | " + extStatuses : ""}`);

							const pad = " ".repeat(
								Math.max(
									1,
									width -
										visibleWidth(left) -
										visibleWidth(mid) -
										visibleWidth(right),
								),
							);
							const line = left + pad + mid + " " + right;
							return [truncateToWidth(line, width)];
						},
					};
				});
				ctx.ui.notify("自定义 Footer 已启用", "info");
			} else {
				ctx.ui.setFooter(undefined);
				ctx.ui.notify("默认 Footer 已恢复", "info");
			}
		},
	});
}

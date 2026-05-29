import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("model_select", async (event, ctx) => {
		const model = event.model;

		ctx.ui.setStatus("model", `🧠 ${model.id}`);

		if (event.source !== "restore") {
			ctx.ui.notify(`模型已切换: ${model.provider}/${model.id}`, "info");
		}
	});

	pi.on("thinking_level_select", async (event, ctx) => {
		const colors: Record<string, string> = {
			off: "dim",
			minimal: "muted",
			low: "success",
			medium: "accent",
			high: "warning",
			xhigh: "error",
		};

		const color = colors[event.level] || "text";
		ctx.ui.setStatus("thinking", ctx.ui.theme.fg(color as any, `💭 ${event.level}`));
	});

	pi.on("session_start", async (_event, ctx) => {
		const model = ctx.model;
		if (model) {
			ctx.ui.setStatus("model", `🧠 ${model.id}`);
		}
	});
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";

interface Step {
	id: string;
	name: string;
	instruction: string;
	dependencies: string[];
	status: "pending" | "running" | "completed" | "failed";
	result?: string;
}

interface TaskPlan {
	id: string;
	goal: string;
	steps: Step[];
}

export default function (pi: ExtensionAPI) {
	let plan: TaskPlan | null = null;

	// ═══════════════════════════════════════════════════
	// 命令注册
	// ═══════════════════════════════════════════════════

	// /plan <目标> — 创建计划
	pi.registerCommand("plan", {
		description: "创建任务计划",
		handler: async (args, ctx) => {
			if (!args.trim()) {
				if (plan) {
					showPlan(ctx);
				} else {
					ctx.ui.notify("用法: /plan <任务目标>", "warning");
				}
				return;
			}

			plan = {
				id: `plan-${Date.now()}`,
				goal: args.trim(),
				steps: [],
			};

			ctx.ui.notify(
				`📝 计划已创建: ${args.trim()}
` +
					"请让 AI 生成步骤，然后使用 /set-steps 设置",
				"info",
			);
			updateWidget(ctx);
		},
	});

	// /set-steps <json> — 设置步骤
	pi.registerCommand("set-steps", {
		description: "设置计划步骤 (JSON数组)",
		handler: async (args, ctx) => {
			if (!plan) {
				ctx.ui.notify("先使用 /plan <目标> 创建计划", "warning");
				return;
			}
			try {
				const steps = JSON.parse(args) as Step[];
				plan.steps = steps.map((s, i) => ({
					...s,
					id: s.id || `step-${i}`,
					status: s.status || "pending",
					dependencies: s.dependencies || [],
				}));
				ctx.ui.notify(`✅ 已设置 ${steps.length} 个步骤`, "info");
				showPlan(ctx);
				updateWidget(ctx);
			} catch (e) {
				ctx.ui.notify("JSON 解析失败，请检查格式", "error");
			}
		},
	});

	// /show-plan — 显示计划
	pi.registerCommand("show-plan", {
		description: "显示当前计划进度",
		handler: async (_args, ctx) => {
			showPlan(ctx);
		},
	});

	// /next — 执行下一个可用步骤
	pi.registerCommand("next", {
		description: "执行下一个可用步骤",
		handler: async (_args, ctx) => {
			if (!plan) {
				ctx.ui.notify("暂无计划", "warning");
				return;
			}

			const next = getNextStep(plan);
			if (!next) {
				const allDone = plan.steps.every((s) => s.status === "completed");
				if (allDone) {
					ctx.ui.notify("🎉 所有步骤已完成！", "info");
				} else {
					ctx.ui.notify("有步骤失败或被阻塞，请检查依赖", "warning");
				}
				return;
			}

			// 重置之前 running 的步骤
			plan.steps.forEach((s) => {
				if (s.status === "running") s.status = "pending";
			});
			next.status = "running";

			ctx.ui.notify(
				`▶️ 当前步骤: ${next.name}
` +
					`说明: ${next.instruction}

` +
					"执行完成后请使用 /done [结果] 标记完成",
				"info",
			);
			updateWidget(ctx);
		},
	});

	// /done [结果] — 标记完成
	pi.registerCommand("done", {
		description: "标记当前步骤完成",
		handler: async (args, ctx) => {
			if (!plan) return;

			const running = plan.steps.find((s) => s.status === "running");
			if (!running) {
				ctx.ui.notify("没有正在执行的步骤", "warning");
				return;
			}

			running.status = "completed";
			running.result = args.trim() || "完成";

			ctx.ui.notify(`✅ ${running.name} 完成`, "info");
			updateWidget(ctx);

			// 提示下一步
			const next = getNextStep(plan);
			if (next) {
				ctx.ui.notify(`提示: 使用 /next 执行「${next.name}」`, "info");
			} else {
				const allDone = plan.steps.every((s) => s.status === "completed");
				if (allDone) {
					ctx.ui.notify("🎉 全部完成！", "info");
				}
			}
		},
	});

	// /fail [原因] — 标记失败
	pi.registerCommand("fail", {
		description: "标记当前步骤失败",
		handler: async (args, ctx) => {
			if (!plan) return;
			const running = plan.steps.find((s) => s.status === "running");
			if (!running) {
				ctx.ui.notify("没有正在执行的步骤", "warning");
				return;
			}
			running.status = "failed";
			running.result = args.trim() || "失败";
			ctx.ui.notify(`❌ ${running.name} 标记为失败`, "error");
			updateWidget(ctx);
		},
	});

	// /reset-plan — 重置计划
	pi.registerCommand("reset-plan", {
		description: "重置所有步骤状态",
		handler: async (_args, ctx) => {
			if (!plan) return;
			plan.steps.forEach((s) => (s.status = "pending"));
			ctx.ui.notify("计划已重置", "info");
			updateWidget(ctx);
		},
	});

	// ═══════════════════════════════════════════════════
	// 工具函数
	// ═══════════════════════════════════════════════════

	function getNextStep(p: TaskPlan): Step | undefined {
		const doneIds = new Set(
			p.steps.filter((s) => s.status === "completed").map((s) => s.id),
		);
		return p.steps.find(
			(s) =>
				s.status === "pending" &&
				s.dependencies.every((d) => doneIds.has(d)),
		);
	}

	function showPlan(ctx: any) {
		if (!plan) {
			ctx.ui.notify("暂无计划", "warning");
			return;
		}

		let text = `🎯 ${plan.goal}

`;
		plan.steps.forEach((s) => {
			const icon =
				s.status === "completed"
					? "✅"
					: s.status === "running"
						? "▶️"
						: s.status === "failed"
							? "❌"
							: "⬜";
			text += `${icon} ${s.name}
`;
			if (s.result) text += `   → ${s.result}
`;
		});

		const done = plan.steps.filter((s) => s.status === "completed").length;
		const total = plan.steps.length;
		text += `
进度: ${done}/${total}`;

		ctx.ui.notify(text, "info");
	}

	function updateWidget(ctx: any) {
		if (!plan || plan.steps.length === 0) {
			ctx.ui.setWidget("sub-agent", undefined);
			return;
		}

		const total = plan.steps.length;
		const done = plan.steps.filter((s) => s.status === "completed").length;
		const running = plan.steps.find((s) => s.status === "running");

		ctx.ui.setWidget("sub-agent", (_tui: any, theme: any) => {
			let text = theme.fg("accent", "🎯 ") + theme.fg("text", plan!.goal);
			if (running) {
				text += "
" + theme.fg("dim", `▶️ ${running.name}`);
			}
			text += "
" + theme.fg("dim", `进度: ${done}/${total}`);
			return new Text(text, 0, 0);
		});
	}
}

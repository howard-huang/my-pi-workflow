import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { StringEnum } from "@earendil-works/pi-ai";
import { Text } from "@earendil-works/pi-tui";

interface TodoItem {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
}

interface TodoDetails {
	action: string;
	todos: TodoItem[];
}

export default function (pi: ExtensionAPI) {
	let todos: TodoItem[] = [];

	// 从会话恢复状态
	const reconstructState = (ctx: ExtensionContext) => {
		todos = [];
		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "message") continue;
			const msg = entry.message;
			if (msg.role !== "toolResult" || msg.toolName !== "todo") continue;
			const details = msg.details as TodoDetails | undefined;
			if (details) {
				todos = details.todos;
			}
		}
	};

	pi.on("session_start", async (_event, ctx) => {
		reconstructState(ctx);
		updateWidget(ctx);
	});

	pi.on("session_tree", async (_event, ctx) => {
		reconstructState(ctx);
		updateWidget(ctx);
	});

	// 注册 todo 工具
	pi.registerTool({
		name: "todo",
		label: "Todo",
		description: "管理待办事项列表: add, list, toggle, remove, clear",
		promptSnippet: "Add, list, toggle, or remove todo items",
		parameters: Type.Object({
			action: StringEnum(["add", "list", "toggle", "remove", "clear"] as const),
			text: Type.Optional(Type.String({ description: "Todo text (for add)" })),
			id: Type.Optional(Type.String({ description: "Todo ID (for toggle/remove)" })),
		}),
		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			switch (params.action) {
				case "add": {
					if (!params.text) {
						return {
							content: [{ type: "text", text: "❌ 需要 text 参数" }],
							details: { action: "add", todos: [...todos] } as TodoDetails,
						};
					}
					const todo: TodoItem = {
						id: `todo-${Date.now()}`,
						text: params.text,
						done: false,
						createdAt: Date.now(),
					};
					todos.push(todo);
					updateWidget(ctx);
					return {
						content: [{ type: "text", text: `✅ 添加: ${todo.text}` }],
						details: { action: "add", todos: [...todos] } as TodoDetails,
					};
				}
				case "list": {
					const lines = todos.map(
						(t) => `${t.done ? "✅" : "⬜"} ${t.text} (${t.id})`,
					);
					return {
						content: [
							{
								type: "text",
								text: lines.join("\n") || "暂无待办",
							},
						],
						details: { action: "list", todos: [...todos] } as TodoDetails,
					};
				}
				case "toggle": {
					const todo = todos.find((t) => t.id === params.id);
					if (!todo) {
						return {
							content: [{ type: "text", text: "❌ 未找到" }],
							details: { action: "toggle", todos: [...todos] } as TodoDetails,
						};
					}
					todo.done = !todo.done;
					updateWidget(ctx);
					return {
						content: [
							{
								type: "text",
								text: `${todo.done ? "✅" : "⬜"} ${todo.text}`,
							},
						],
						details: { action: "toggle", todos: [...todos] } as TodoDetails,
					};
				}
				case "remove": {
					const idx = todos.findIndex((t) => t.id === params.id);
					if (idx === -1) {
						return {
							content: [{ type: "text", text: "❌ 未找到" }],
							details: { action: "remove", todos: [...todos] } as TodoDetails,
						};
					}
					const removed = todos.splice(idx, 1)[0];
					updateWidget(ctx);
					return {
						content: [
							{ type: "text", text: `🗑️ 删除: ${removed.text}` },
						],
						details: { action: "remove", todos: [...todos] } as TodoDetails,
					};
				}
				case "clear": {
					todos = [];
					updateWidget(ctx);
					return {
						content: [{ type: "text", text: "🗑️ 已清空所有待办" }],
						details: { action: "clear", todos: [] } as TodoDetails,
					};
				}
				default:
					return {
						content: [{ type: "text", text: "❌ 未知操作" }],
						details: { action: "list", todos: [...todos] } as TodoDetails,
					};
			}
		},

		// 自定义渲染
		renderCall(args, theme, _context) {
			let text = theme.fg("toolTitle", theme.bold("todo ")) + theme.fg("muted", args.action);
			if (args.text) text += ` ${theme.fg("dim", `"${args.text}"`)}`;
			if (args.id) text += ` ${theme.fg("accent", args.id)}`;
			return new Text(text, 0, 0);
		},

		renderResult(result, { expanded }, theme, _context) {
			const details = result.details as TodoDetails | undefined;
			if (!details) {
				const t = result.content[0];
				return new Text(t?.type === "text" ? t.text : "", 0, 0);
			}

			const todoList = details.todos;
			if (todoList.length === 0) {
				return new Text(theme.fg("dim", "暂无待办事项"), 0, 0);
			}

			let text = theme.fg("accent", theme.bold("📋 Todo 列表")) + "\n";
			const display = expanded ? todoList : todoList.slice(0, 5);
			for (const t of display) {
				const icon = t.done
					? theme.fg("success", "✅")
					: theme.fg("dim", "⬜");
				const itemText = t.done
					? theme.fg("muted", t.text)
					: theme.fg("text", t.text);
				text += `\n${icon} ${itemText}`;
			}
			if (!expanded && todoList.length > 5) {
				text += `\n${theme.fg("dim", `... 还有 ${todoList.length - 5} 项`)}`;
			}
			return new Text(text, 0, 0);
		},
	});

	function updateWidget(ctx: ExtensionContext) {
		const pending = todos.filter((t) => !t.done);
		if (pending.length === 0) {
			ctx.ui.setWidget("todo", undefined);
			return;
		}

		ctx.ui.setWidget("todo", (_tui, theme) => {
			const lines: string[] = [
				theme.fg("accent", `📋 待办 (${pending.length})`),
			];
			for (const t of pending.slice(0, 3)) {
				lines.push(theme.fg("dim", `  • ${t.text}`));
			}
			if (pending.length > 3) {
				lines.push(
					theme.fg("dim", `  ... 还有 ${pending.length - 3} 项`),
				);
			}
			return new Text(lines.join("\n"), 0, 0);
		});
	}
}

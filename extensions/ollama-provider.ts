import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerProvider("ollama", {
		name: "Ollama (本地 LLM)",
		baseUrl: "http://localhost:11434/v1",
		apiKey: "ollama",
		api: "openai-completions",
		models: [
			{
				id: "qwen2.5vl:7b",
				name: "Qwen 2.5 VL 7B (本地)",
				reasoning: false,
				input: ["text", "image"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 128000,
				maxTokens: 4096,
				compat: {
					requiresToolResultName: false,
					requiresAssistantAfterToolResult: false,
				},
			},
		],
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🦙 Ollama 已加载 (qwen2.5vl:7b)", "info");
	});
}

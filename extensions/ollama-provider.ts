import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	// Ollama 本地模型配置
	// 注意：Ollama 的 OpenAI 兼容 API 目前不支持工具调用
	// 这些模型仅用于纯文本对话

	pi.registerProvider("ollama", {
		name: "Ollama (本地 LLM - 纯文本)",
		baseUrl: "http://localhost:11434/v1",
		apiKey: "ollama",
		api: "openai-completions",
		models: [
			{
				id: "llama3:latest",
				name: "Llama 3 (本地)",
				reasoning: false,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 128000,
				maxTokens: 4096,
			},
			{
				id: "qwen2.5vl:7b",
				name: "Qwen 2.5 VL 7B (本地)",
				reasoning: false,
				input: ["text", "image"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 128000,
				maxTokens: 4096,
			},
		],
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🦙 Ollama 已加载 (纯文本模式，不支持工具)", "info");
	});
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	// 直接注册已知的本地模型，不依赖动态获取
	// 用户可以通过环境变量或修改代码添加更多模型

	const models = [
		{
			id: "qwen2.5vl:7b",
			name: "Qwen 2.5 VL 7B (本地)",
			reasoning: false,
			input: ["text", "image"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 128000,
			maxTokens: 4096,
		},
	];

	pi.registerProvider("ollama", {
		name: "Ollama (本地 LLM)",
		baseUrl: "http://localhost:11434/v1",
		apiKey: "ollama",
		api: "openai-completions",
		models,
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("🦙 Ollama Provider 已加载 (qwen2.5vl:7b)", "info");
	});
}

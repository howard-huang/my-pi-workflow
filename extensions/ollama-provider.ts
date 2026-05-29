import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default async function (pi: ExtensionAPI) {
	try {
		const res = await fetch("http://localhost:11434/api/tags");
		const data = (await res.json()) as {
			models: Array<{ name: string; model: string }>;
		};

		if (!data.models || data.models.length === 0) {
			console.log("Ollama: 没有可用的本地模型");
			return;
		}

		pi.registerProvider("ollama", {
			name: "Ollama (本地 LLM)",
			baseUrl: "http://localhost:11434/v1",
			apiKey: "ollama",
			api: "openai-completions",
			models: data.models.map((m) => ({
				id: m.name,
				name: m.name,
				reasoning: false,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 128000,
				maxTokens: 4096,
			})),
		});

		console.log("Ollama: 已注册 " + data.models.length + " 个本地模型");
	} catch (e) {
		console.log("Ollama: 服务器未启动 (http://localhost:11434)");
	}
}

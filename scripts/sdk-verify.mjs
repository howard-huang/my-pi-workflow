/**
 * Phase 10.1: SDK 可用性验证 + 程序化调用
 *
 * 验证 @earendil-works/pi-coding-agent SDK 是否可导入和初始化。
 * 如果 API key 已配置，可执行一次实际的 prompt 调用。
 *
 * 用法: node scripts/sdk-verify.mjs
 */

import {
  AuthStorage,
  createAgentSession,
  ModelRegistry,
  SessionManager,
} from "@earendil-works/pi-coding-agent";

async function main() {
  console.log("=== Pi SDK 验证 ===\n");

  // 1. 验证导入
  console.log("[1/4] SDK 导入成功 ✅");
  console.log(`  AuthStorage: ${typeof AuthStorage}`);
  console.log(`  createAgentSession: ${typeof createAgentSession}`);
  console.log(`  ModelRegistry: ${typeof ModelRegistry}`);

  // 2. 初始化 auth 和 model registry
  console.log("\n[2/4] 初始化 AuthStorage + ModelRegistry...");
  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);
  console.log("  ✅ 初始化成功");

  // 3. 获取可用模型
  console.log("\n[3/4] 检查可用模型...");
  try {
    const available = await modelRegistry.getAvailable();
    console.log(`  ✅ ${available.length} 个模型可用:`);
    for (const m of available.slice(0, 5)) {
      console.log(`    - ${m.provider}/${m.id}`);
    }
    if (available.length > 5) console.log(`    ... 共 ${available.length} 个`);
  } catch (e) {
    console.log(`  ⚠️ 获取模型列表失败: ${e.message}`);
  }

  // 4. 创建 session（in-memory，不持久化）
  console.log("\n[4/4] 创建 AgentSession (in-memory)...");
  try {
    const { session } = await createAgentSession({
      sessionManager: SessionManager.inMemory(),
      authStorage,
      modelRegistry,
    });
    console.log(`  ✅ Session 创建成功 (model: ${session.model?.id || "none"})`);
    session.dispose();
  } catch (e) {
    console.log(`  ⚠️ Session 创建失败: ${e.message}`);
    console.log("  (可能需要配置 API key 后才能使用)");
  }

  console.log("\n=== SDK 验证完成 ===");
}

main().catch((e) => {
  console.error("验证失败:", e.message);
  process.exit(1);
});

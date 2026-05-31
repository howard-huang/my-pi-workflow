/**
 * Phase 10.2: 批量代码审查脚本
 *
 * 使用 pi SDK 对指定目录下的文件进行批量审查。
 * 如果文件名匹配 .test.* 或 .spec.*，使用测试审查角度；
 * 其他文件使用通用代码审查。
 *
 * 用法:
 *   node scripts/batch-review.mjs <目录路径> [选项]
 *
 * 选项:
 *   --dry-run       只列出文件，不实际审查
 *   --ext <ext>     指定文件扩展名（默认: .ts,.js,.mjs）
 *   --max <n>       最大审查文件数（默认: 5）
 *   --concurrency   审查角度（默认: "code-review,security,performance"）
 *
 * 示例:
 *   node scripts/batch-review.mjs src/
 *   node scripts/batch-review.mjs . --dry-run
 *   node scripts/batch-review.mjs src/ --ext .ts --max 3
 */

import { readdirSync, statSync } from "node:fs";
import { resolve, relative, extname } from "node:path";

// ==============================
// 文件发现
// ==============================

/**
 * 递归收集目录下的所有文件
 */
function collectFiles(dir, extensions, maxFiles) {
  const results = [];
  const absDir = resolve(dir);

  function walk(current) {
    if (results.length >= maxFiles) return;
    let entries;
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      const full = resolve(current, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        // 跳过 node_modules, .git, dist
        if (!["node_modules", ".git", "dist", ".pi", "safe-workspace"].includes(entry)) {
          walk(full);
        }
      } else if (st.isFile() && extensions.includes(extname(entry))) {
        results.push(full);
      }
    }
  }

  walk(absDir);
  return results;
}

// ==============================
// 主流程
// ==============================

function parseArgs() {
  const args = process.argv.slice(2);
  const targetDir = args.find((a) => !a.startsWith("--")) || ".";
  const dryRun = args.includes("--dry-run");
  const extIdx = args.indexOf("--ext");
  const extensions = extIdx >= 0
    ? args[extIdx + 1].split(",").map((e) => (e.startsWith(".") ? e : `.${e}`))
    : [".ts", ".js", ".mjs"];
  const maxIdx = args.indexOf("--max");
  const maxFiles = maxIdx >= 0 ? parseInt(args[maxIdx + 1], 10) : 5;

  return { targetDir, dryRun, extensions, maxFiles };
}

async function main() {
  const { targetDir, dryRun, extensions, maxFiles } = parseArgs();

  console.log(`=== 批量代码审查 ===`);
  console.log(`目标目录: ${resolve(targetDir)}`);
  console.log(`扩展名: ${extensions.join(", ")}`);
  console.log(`最大文件数: ${maxFiles}`);
  if (dryRun) console.log(`模式: dry-run (仅列出文件)\n`);
  else console.log("");

  const files = collectFiles(targetDir, extensions, maxFiles);

  if (files.length === 0) {
    console.log("未找到匹配文件。");
    return;
  }

  console.log(`找到 ${files.length} 个文件:\n`);
  for (const f of files) {
    console.log(`  - ${relative(process.cwd(), f)}`);
  }

  if (dryRun) {
    console.log("\n✅ dry-run 完成。添加 --review 参数可执行实际审查。");
    return;
  }

  // 实际审查模式 —— 使用 pi SDK
  console.log("\n--- 开始审查 ---\n");

  try {
    const { AuthStorage, createAgentSession, ModelRegistry, SessionManager } =
      await import("@earendil-works/pi-coding-agent");

    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);

    // 检查是否有可用模型
    const available = await modelRegistry.getAvailable();
    if (available.length === 0) {
      console.log("⚠️ 没有可用的模型（需要配置 API key）。");
      console.log("请设置 ANTHROPIC_API_KEY 或 OPENAI_API_KEY 环境变量。");
      return;
    }

    console.log(`使用模型: ${available[0].provider}/${available[0].id}\n`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = relative(process.cwd(), file);
      const isTest = file.includes(".test.") || file.includes(".spec.");
      const angle = isTest
        ? "测试质量：检查覆盖率、边界情况、mocking 是否正确"
        : "代码审查：关注逻辑错误、安全漏洞、性能瓶颈、可维护性";

      console.log(`[${i + 1}/${files.length}] 审查: ${relPath}`);

      const { session } = await createAgentSession({
        sessionManager: SessionManager.inMemory(),
        authStorage,
        modelRegistry,
        model: available[0],
      });

      try {
        await session.prompt(
          `审查文件 ${relPath}，角度：${angle}。\n` +
          `先读取文件内容，然后给出审查意见。`
        );
      } finally {
        session.dispose();
      }
    }
  } catch (e) {
    console.error(`审查过程出错: ${e.message}`);
  }

  console.log("\n=== 批量审查完成 ===");
}

main().catch((e) => {
  console.error("脚本失败:", e.message);
  process.exit(1);
});

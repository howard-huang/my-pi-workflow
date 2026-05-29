---
description: 生成子代理任务计划
---

将任务分解为 JSON 格式的步骤，配合 /set-steps 使用。

格式：
```json
[
  {
    "id": "step-1",
    "name": "步骤名称",
    "instruction": "详细说明",
    "dependencies": [],
    "status": "pending"
  }
]
```

原则：独立、可验证、有界、可组合。

---
name: review-flow
description: 标准代码审查流程：先侦察代码结构，再深度审查
---

## scout
phase: Context
label: 代码侦察
as: context

分析代码仓库结构，找到 {task} 相关的所有文件和入口点。列出关键依赖关系和潜在风险区域。

## reviewer-zh
phase: Review
label: 深度审查
reads: context.md

基于侦察结果，对 {task} 进行深度中文审查。关注逻辑错误、安全漏洞、性能瓶颈。

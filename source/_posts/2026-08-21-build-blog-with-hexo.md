---
title: 项目：用 Hexo 搭建 Snowtrace 博客
date: 2026-08-21 14:00:00
updated: 2026-08-21 14:00:00
tags: [Hexo, 博客]
categories: [项目]
description: 从零搭建个人博客的完整记录：技术选型、Hexo 安装、Butterfly 主题配置与部署流程。
---

## 项目背景

一直想有一个自己的博客，用来记录学过的知识、做过的项目和日常生活。比较了多种方案后，最终选择了 **Hexo + Butterfly 主题**，部署在 **GitHub Pages**。

## 技术选型

| 方案 | 优点 | 缺点 |
|------|------|------|
| Hexo + Butterfly ✅ | 主题丰富、二次元风格、中文资料多、免费部署 | 需要一点命令行操作 |
| Next.js + 后台 | 功能最全、在线写作 | 架构复杂、维护成本高 |
| VitePress | 适合文档 | 风格偏文档站 |

选择 Hexo 的原因：

1. 有大量现成的二次元简洁主题，配置即可用
2. 写文章只需 Markdown，对新手友好
3. 配合 GitHub Actions 可以完全免费地自动部署
4. 社区活跃，遇到问题容易搜到答案

## 站点规划

- **三大栏目**：知识 / 项目 / 生活
- **功能**：标签分类、全文搜索、网易云音乐播放器、暗色模式
- **写作方式**：本地 Markdown 写作 + GitHub 网页在线编辑，双管齐下

## 核心文件结构

```text
Snowtrace/
├── _config.yml            # 站点配置
├── _config.butterfly.yml  # 主题配置
├── scaffolds/             # 文章模板
├── source/
│   ├── _posts/            # 文章（Markdown）
│   ├── about/             # 关于页
│   └── categories/        # 分类页
└── .github/workflows/     # 自动部署脚本
```

## 常用命令备忘

```bash
hexo new "文章标题"   # 新建文章
hexo server           # 本地预览 http://localhost:4000
hexo clean            # 清理缓存
hexo generate         # 生成静态文件
```

## 经验总结

- 开始前先想清楚「要什么」，避免堆功能
- 用 GitHub Actions 自动部署后，发布文章只需要 `git push`
- 主题配置都在 `_config.butterfly.yml` 一个文件里，改坏了删掉重新生成即可

> 本项目就是本站的搭建记录，后续的博客改动都会同步更新这篇文章。

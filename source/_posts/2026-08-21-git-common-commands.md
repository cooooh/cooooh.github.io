---
title: Git 入门：常用命令速查
date: 2026-08-21 12:00:00
updated: 2026-08-21 12:00:00
tags: [Git, 学习笔记]
categories: [知识]
description: 一份适合新手的 Git 常用命令速查表，覆盖日常使用 90% 的场景。
---

## 为什么学 Git

Git 是程序员最基础也最重要的工具之一：管理代码版本、和他人协作、备份自己的项目，全都靠它。这篇笔记记录我学习 Git 时整理的常用命令，随学随补。

## 配置与基本概念

```bash
# 首次使用，设置身份（替换成你自己的名字和邮箱）
git config --global user.name "Ykcht"
git config --global user.email "you@example.com"

# 查看配置
git config --list
```

Git 有三个区域：

| 区域 | 说明 |
|------|------|
| 工作区 | 你电脑里正在修改的文件 |
| 暂存区 | 准备提交的文件（`git add` 之后） |
| 仓库 | 已经提交的历史（`git commit` 之后） |

## 日常最常用的命令

```bash
git init                  # 在当前目录初始化仓库
git status                # 查看当前状态（最常用的命令！）
git add 文件名            # 把文件加入暂存区
git add .                 # 把所有改动加入暂存区
git commit -m "说明"      # 提交，写清楚这次改了什么
git log --oneline         # 一行一条地查看提交历史
git diff                  # 查看还没 add 的改动
```

## 分支与远程

```bash
git branch                # 查看本地分支
git branch 分支名         # 创建分支
git checkout 分支名       # 切换分支（新版本可用 git switch 分支名）
git merge 分支名          # 把分支合并到当前分支

git remote add origin 仓库地址   # 关联远程仓库（只需一次）
git push -u origin main         # 推送到远程（首次）
git push                       # 之后直接 push 即可
git pull                       # 拉取远程最新代码
```

## 撤销与找回

```bash
git restore 文件名        # 丢弃工作区的改动（回到上次 add/commit 的状态）
git reset HEAD 文件名     # 把文件移出暂存区（不丢改动）
git reset --hard HEAD~1   # 撤销最近一次提交（慎用！）
git reflog                # 查看所有操作记录，误操作后找回用
```

## 学习心得

- `git status` 是万能起点：不知道发生了什么，先敲它
- 提交信息写清楚「做了什么」，三个月后的你会感谢现在的自己
- 不熟悉时多用 `git log`、`git status` 看，不要背命令
- 遇到问题直接搜报错信息，Git 的报错通常很直白

> 本文持续更新中，随着学习深入会补充更多内容。

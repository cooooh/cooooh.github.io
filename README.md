# Snowtrace ❄️

> 人生到处知何似，应似飞鸿踏雪泥。

个人博客，基于 **Hexo + Butterfly 主题**，部署于 GitHub Pages。

- 记录：知识（计算机学习笔记）/ 项目 / 生活
- 功能：标签分类、全文搜索、网易云音乐播放器、暗色模式

---

## 快速开始

### 1. 本地预览

```bash
npm install        # 首次克隆/换电脑后安装依赖
npm run server     # 启动本地预览，浏览器打开 http://localhost:4000
```

### 2. 写文章

**方式一：本地写（推荐）**

```bash
npm run new -- "文章标题"
```

这会根据模板在 `source/_posts/` 下生成新文章，打开它，修改开头的配置然后写正文：

```markdown
---
title: 文章标题
date: 2026-08-21 10:00:00
tags: [标签1, 标签2]
categories: [知识]        # 知识 / 项目 / 生活 三选一
description: 一句话摘要
---
正文从这里开始，用 Markdown 语法写即可。
```

**方式二：在线写（出门在外）**

1. 打开 GitHub 仓库 → 进入 `source/_posts/` 目录
2. 点右上角 **Add file → Create new file**
3. 文件名格式：`年-月-日-标题.md`（如 `2026-08-21-今天学了什么.md`）
4. 照上面的格式写上开头配置和正文，点 **Commit changes**
5. 一两分钟后自动发布上线 ✅

> 图片放到文章的「资源文件夹」里：本地写文章时 `hexo new` 会自动生成一个同名文件夹，把图片放进去，正文用 `![](图片名.png)` 引用即可。

### 3. 发布上线

本地写完后，推送到 GitHub 即自动部署：

```bash
git add .
git commit -m "新文章：xxx"
git push
```

之后等 1~2 分钟，访问你的博客地址就能看到更新。

---

## 常用配置

所有个性化配置都在这两个文件里：

| 文件 | 作用 |
|------|------|
| `_config.yml` | 站点配置（标题、作者、语言等） |
| `_config.butterfly.yml` | 主题配置（导航、头像、音乐、暗色模式等） |

### 改网易云歌单

1. 网易云音乐 App → 找到你的歌单 → 右上角分享 → 复制链接
2. 链接里的 `id=` 后面那串数字就是歌单 ID
3. 打开 `_config.butterfly.yml`，搜索 `meting-js`，把 `data-id="60198"` 改成你的歌单 ID：

```yaml
inject:
  bottom:
    - '<meting-js class="aplayer" data-server="netease" data-type="playlist" data-id="你的歌单ID" ...></meting-js>'
```

> 播放器默认放在页面左下角，点开即可展开歌单。想放单曲的话，把 `data-type="playlist"` 改为 `data-type="song"` 并填歌曲 ID。

### 换头像

替换 `source/img/avatar.svg`（或换成 jpg/png，同步修改 `_config.butterfly.yml` 里的 `avatar` 路径）。

### 改副标题/公告/友链

- 副标题：`_config.yml` 里的 `subtitle`
- 首页公告：`_config.butterfly.yml` 里搜 `card_announcement`
- 友链：`_config.butterfly.yml` 里搜 `flink`，按注释里的格式添加

---

## 常用命令

```bash
npm run new -- "标题"   # 新建文章
npm run server          # 本地预览
npm run clean           # 清理缓存（改配置没生效时先跑这个）
npm run generate        # 生成静态文件（本地部署时用）
```

## 目录结构

```text
Snowtrace/
├── _config.yml            # 站点配置
├── _config.butterfly.yml  # 主题配置
├── scaffolds/post.md      # 新文章模板
├── source/
│   ├── _posts/            # 所有文章
│   ├── about/             # 关于页
│   ├── categories/        # 分类页
│   ├── tags/              # 标签页
│   ├── link/              # 友链页
│   └── img/               # 头像、图标等图片
└── .github/workflows/     # GitHub Actions 自动部署脚本
```

---

## 首次部署到 GitHub Pages（只需做一次）

> 目标：博客地址将是 `https://cooooh.github.io`

1. **在 GitHub 上建仓库**：登录 github.com → 右上角 `+` → New repository
   - Repository name 填 **`cooooh.github.io`**（必须一字不差，这是用户名专属主页仓库）
   - 选 **Public**，不要勾选任何初始化选项（README/gitignore 都不要），点 Create
2. **本地关联并推送**（在本博客目录打开终端）：

   ```bash
   git remote add origin https://github.com/cooooh/cooooh.github.io.git
   git push -u origin main
   ```

   > 如果推送时连不上 GitHub（国内网络常见），需要先开启代理后再执行，或使用 GitHub 加速工具。
3. **开启 Pages**：仓库页面 → Settings → Pages → Build and deployment 的 Source 选 **Deploy from a branch**，Branch 选 **`gh-pages`** 文件夹选 `/ (root)` → Save
4. 之后每次 `git push`，Actions 会自动构建部署，1~2 分钟后即可在 `https://cooooh.github.io` 看到更新 ✅

> 首次推送后如果 Actions 显示红色失败，多半是网络问题导致依赖装不上，重新运行一次（Actions 页面 → 失败的工作流 → Re-run jobs）即可。

---

## 故障排查

- **改配置后页面没变**：先 `npm run clean` 再 `npm run server`
- **本地端口被占用**：`npm run server` 后加 `-- -p 5000` 换端口
- **推送失败连不上 GitHub**：国内网络可能需要代理，或尝试加速工具
- **部署后 404**：确认仓库 Pages 设置在 `gh-pages` 分支（首次部署时需要手动开启，见部署教程）

---

由 [Hexo](https://hexo.io/) 驱动 · 主题 [Butterfly](https://butterfly.js.org/)

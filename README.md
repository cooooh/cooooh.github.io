# Snowtrace ❄️

> 人生到处知何似，应似飞鸿踏雪泥。

个人博客，基于 **Hexo + Butterfly 主题**，部署于 GitHub Pages，访问地址 **https://snowtrace.top**。

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

### 音乐页（导航「音乐」）

- 独立的音乐播放页：`source/music/index.md`，黑胶唱片会随播放旋转发光
- **改歌单**：编辑 `source/js/music-page.js`，找到 `data-id` 那一行，把 `2338560987` 换成你的歌单 ID
- 网易云歌单 ID 获取：网易云 App → 歌单 → 分享 → 复制链接，链接里 `id=` 后面的数字就是
- 唱片封面自动跟随当前歌曲显示，播放器本身只在音乐页加载，不影响其他页面速度

### 更新日志（导航「关于 → 更新日志」弹窗）

- 日志内容在 `source/log/index.md`，按里面 `timeline` 的格式添加新条目即可，和写文章一样简单
- 弹窗样式在 `source/css/changelog.css`，脚本在 `source/js/changelog-modal.js`，一般不用动
- 该页也可以直接访问：`/log/`

> ⚠️ 修改 `_config.butterfly.yml` 后，本地预览需要**重启** `npm run server` 才能看到变化（改文章和页面不用）。

### 个人设置（站内换头像 / 首页背景）

打开「关于」页，底部有一张「🎨 个人设置」卡片：

- **更换头像**：点「选择图片」→「应用」，侧边栏和手机菜单的头像立刻更换
- **首页背景**：点「选择图片」→「应用」，回首页即可看到新背景
- 「恢复默认」一键还原；图片会自动压缩后保存在**本机浏览器**里

> ⚠️ 这是纯静态网站，没有服务器数据库，所以设置只对**当前浏览器**生效：
> 换浏览器、换设备、清除浏览器数据后都会恢复默认；访客看到的仍是默认头像/背景。

**想让所有访问者都看到（全局生效）**，用仓库换图的方式：

- 头像：替换 `source/img/avatar.svg`（文件名保持不变；若换成 jpg/png，再改 `_config.butterfly.yml` 里 `avatar` 的路径）
- 背景：把图片放进 `source/img/`，然后在 `_config.butterfly.yml` 里给 `background` 填上地址，例如 `background: url(/img/背景.jpg)`

改完推送部署即可。相关代码：面板在 `source/about/index.md`，脚本 `source/js/site-settings.js`，样式 `source/css/settings.css`。

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

> 目标：博客地址 `https://snowtrace.top`（GitHub Pages 仓库是 `cooooh.github.io`）

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
4. 之后每次 `git push`，Actions 会自动构建部署，1~2 分钟后即可在 `https://snowtrace.top` 看到更新 ✅

### 绑定自定义域名 snowtrace.top（已完成一次）

- 域名 DNS 在阿里云控制台解析：4 条 A 记录（`185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`）+ 1 条 CNAME（`www` → `cooooh.github.io`）
- 仓库里的 `source/CNAME` 文件与 `.github/workflows/deploy.yml` 里的 `cname:` 参数共同保证部署后 GitHub Pages 认出这个域名
- 换新域名时：改上述两处 + `_config.yml` 的 `url` + 阿里云解析即可

> 首次推送后如果 Actions 显示红色失败，多半是网络问题导致依赖装不上，重新运行一次（Actions 页面 → 失败的工作流 → Re-run jobs）即可。

---

## 查看更新日志

### 部署日志（每次 push 后）

1. 打开 GitHub 仓库 → 顶部 **Actions** 标签页
2. 列表里每一行就是一次推送的构建记录：
   - 🟡 进行中（正在构建，通常 1~2 分钟）
   - 🟢 绿色 ✓ 成功（线上已更新）
   - 🔴 红色 ✗ 失败（线上保持旧版本，不影响访问）
3. 点进任意一条 → 点 **build-and-deploy** → 展开每一步看详细日志：
   - `Install dependencies`：装依赖失败通常是网络问题，点 Re-run jobs 重跑
   - `Build`：文章或配置写错会在这里报错（日志会指出具体哪个文件）
   - `Deploy to GitHub Pages`：成功即代表新版本已推送到 gh-pages 分支
4. 失败时 GitHub 默认也会发邮件通知你

### 本地日志

- `npm run server` / `npm run generate` 的输出就是本地日志
- 报错信息看不懂时，加 `-- --debug` 输出更详细：`npx hexo generate --debug`
- 改配置后没生效：先 `npm run clean` 再重新运行

### 更新历史

- 本地查看：`git log --oneline`（每次提交一行）；`git log -p` 看具体改动
- 网页查看：GitHub 仓库 → 点左上角 **commits**（提交历史）

---

## 故障排查

- **改配置后页面没变**：先 `npm run clean` 再 `npm run server`
- **本地端口被占用**：`npm run server` 后加 `-- -p 5000` 换端口
- **推送失败连不上 GitHub**：国内网络可能需要代理，或尝试加速工具
- **部署后 404**：确认仓库 Pages 设置在 `gh-pages` 分支（首次部署时需要手动开启，见部署教程）

---

由 [Hexo](https://hexo.io/) 驱动 · 主题 [Butterfly](https://butterfly.js.org/)

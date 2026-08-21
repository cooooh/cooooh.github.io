---
title: 关于
date: 2026-08-21 15:30:00
top_img: false
comments: false
---

## 你好，我是 Ykcht 👋

欢迎来到 **Snowtrace**。

> 人生到处知何似，应似飞鸿踏雪泥。

这个博客用来记录三件事：

- **知识**：我学到的计算机知识、学习笔记与踩坑记录
- **项目**：我做过的项目、搭建过程与复盘
- **生活**：日常随想、读书观影与旅行见闻

### 关于我

<!-- 在这里写一段自我介绍吧，例如：目前在学习什么、对什么感兴趣 -->

- 🌱 正在学习：前端开发 / 计算机基础
- 🛠 常用工具：VS Code、Git
- 📮 联系方式：待补充

### 本站

- 由 [Hexo](https://hexo.io/) 驱动，主题 [Butterfly](https://butterfly.js.org/)
- 托管于 GitHub Pages

## 个人设置

<div class="settings-card" id="site-settings">
  <div class="settings-head">
    <span>🎨 个人设置</span>
    <span class="settings-tip">图片只保存在当前浏览器，不影响其他访客</span>
  </div>

  <div class="settings-row">
    <div class="settings-info">
      <div class="settings-name">更换头像</div>
      <div class="settings-desc">侧边栏 / 手机菜单中的头像</div>
    </div>
    <div class="settings-preview avatar">
      <img id="settings-avatar-preview" src="/img/avatar.svg" alt="头像预览">
    </div>
    <div class="settings-actions">
      <label class="settings-btn">
        <input type="file" id="settings-avatar-file" accept="image/*">
        <i class="fas fa-image"></i> 选择图片
      </label>
      <button class="settings-btn primary" id="settings-avatar-apply" type="button"><i class="fas fa-check"></i> 应用</button>
      <button class="settings-btn ghost" id="settings-avatar-reset" type="button">恢复默认</button>
    </div>
    <span class="settings-status" id="settings-avatar-status"></span>
  </div>

  <div class="settings-row">
    <div class="settings-info">
      <div class="settings-name">首页背景</div>
      <div class="settings-desc">首页大图背景（推荐横图）</div>
    </div>
    <div class="settings-preview bg" id="settings-bg-preview"><span>暂无图片</span></div>
    <div class="settings-actions">
      <label class="settings-btn">
        <input type="file" id="settings-bg-file" accept="image/*">
        <i class="fas fa-image"></i> 选择图片
      </label>
      <button class="settings-btn primary" id="settings-bg-apply" type="button"><i class="fas fa-check"></i> 应用</button>
      <button class="settings-btn ghost" id="settings-bg-reset" type="button">恢复默认</button>
    </div>
    <span class="settings-status" id="settings-bg-status"></span>
  </div>

  <p class="settings-note">
    说明：以上设置保存在<b>本机浏览器</b>中，换浏览器、换设备或清除浏览器数据后会恢复默认。
    若想让<b>所有访问者</b>都看到新头像 / 新背景，请把图片放进仓库 <code>source/img/</code> 并修改 <code>_config.butterfly.yml</code>（头像：<code>avatar.img</code>；背景：<code>background</code>），重新推送部署。
  </p>
</div>

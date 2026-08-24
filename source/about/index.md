---
title: 个人设置
date: 2026-08-21 15:30:00
top_img: false
comments: false
---

## 个人设置 🎨

在这里更换头像、个人简介和首页背景，修改立即生效并保存在当前浏览器中。

<div class="settings-card" id="site-settings">
  <div class="settings-head">
    <span>🎨 个人设置</span>
    <span class="settings-tip">修改只保存在当前浏览器，不影响其他访客</span>
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
      <div class="settings-name">个人简介</div>
      <div class="settings-desc">显示在侧边栏作者卡片中（80 字内）</div>
    </div>
    <div class="settings-bio">
      <input type="text" id="settings-bio-input" maxlength="80" placeholder="一句话介绍自己">
    </div>
    <div class="settings-actions">
      <button class="settings-btn primary" id="settings-bio-apply" type="button"><i class="fas fa-check"></i> 应用</button>
      <button class="settings-btn ghost" id="settings-bio-reset" type="button">恢复默认</button>
    </div>
    <span class="settings-status" id="settings-bio-status"></span>
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
    若想让<b>所有访问者</b>都看到：头像改 <code>_config.butterfly.yml</code> 的 <code>avatar.img</code>（图片放 <code>source/img/</code>）；
    简介改 <code>aside.card_author.description</code>；背景给 <code>background</code> 填图片地址，然后重新部署。
  </p>
</div>

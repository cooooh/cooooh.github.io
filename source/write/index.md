---
title: 写文章
date: 2026-08-21 18:00:00
top_img: false
comments: false
---

## 写文章 ✍️

在网页里直接写 Markdown 并发布：点「发布」后，脚本会通过 GitHub API 把文章提交到仓库，1~2 分钟后自动部署上线。

<div class="post-editor-card" id="post-editor">

  <div class="pe-auth">
    <div class="pe-auth-top">
      <span class="pe-auth-state" id="pe-auth-state">🔐 未登录——发布前请先登录</span>
      <div class="pe-auth-actions">
        <button class="pe-btn primary" id="pe-login-btn" type="button"><i class="fab fa-github"></i> GitHub 登录</button>
        <button class="pe-btn ghost" id="pe-logout-btn" type="button">退出登录</button>
      </div>
    </div>
    <div class="pe-device hidden" id="pe-device-panel">
      <p>① 授权码已复制到剪贴板，点右侧按钮去 GitHub 粘贴并授权：</p>
      <div class="pe-device-row">
        <code id="pe-user-code">XXXX-XXXX</code>
        <button class="pe-btn" id="pe-open-device" type="button">打开 GitHub 授权页 →</button>
      </div>
      <p>② 授权完成后回到本页，会自动检测并登录（约 <span id="pe-countdown">--</span> 秒后授权码过期）。</p>
    </div>
    <p class="pe-status" id="pe-auth-status"></p>
    <details class="pe-token">
      <summary>高级：手动粘贴令牌（备用方式，一般用不到）</summary>
      <ol>
        <li>打开 GitHub → 右上角头像 → <b>Settings</b> → 左下角 <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b></li>
        <li><b>Repository access</b> 选 <b>Only select repositories</b>，只勾选 <code>cooooh/cooooh.github.io</code></li>
        <li><b>Permissions</b> → <b>Contents</b> → 选 <b>Read and write</b>（其他权限一律不勾）</li>
        <li>生成后<b>复制令牌（只显示一次）</b>，粘贴到下面保存</li>
      </ol>
      <div class="pe-token-row">
        <input type="password" id="pe-token-input" placeholder="粘贴令牌（github_pat_ 开头）" autocomplete="off">
        <button class="pe-btn" id="pe-token-save" type="button">保存令牌</button>
        <button class="pe-btn ghost" id="pe-token-remove" type="button">移除令牌</button>
      </div>
      <p class="pe-status" id="pe-token-status"></p>
    </details>
  </div>

  <div class="pe-form">
    <div class="pe-row">
      <label>标题 *
        <input type="text" id="pe-title" placeholder="例如：我的第一篇网页文章">
      </label>
      <label>分类
        <input type="text" id="pe-category" list="pe-categories" placeholder="知识 / 项目 / 生活">
        <datalist id="pe-categories">
          <option value="知识">
          <option value="项目">
          <option value="生活">
        </datalist>
      </label>
    </div>
    <div class="pe-row">
      <label>标签（用逗号分隔）
        <input type="text" id="pe-tags" placeholder="例如：前端, 学习笔记">
      </label>
      <label>摘要（可选，显示在首页卡片上）
        <input type="text" id="pe-description" placeholder="一句话介绍这篇文章">
      </label>
    </div>
    <label>正文（Markdown） *
      <textarea id="pe-body" placeholder="在这里写正文，支持 Markdown 语法…"></textarea>
    </label>
    <div class="pe-preview hidden" id="pe-preview"></div>
    <div class="pe-actions">
      <button class="pe-btn" id="pe-preview-btn" type="button"><i class="fas fa-eye"></i> 预览</button>
      <button class="pe-btn ghost" id="pe-clear-btn" type="button">清空</button>
      <button class="pe-btn primary" id="pe-publish-btn" type="button"><i class="fas fa-paper-plane"></i> 发布</button>
    </div>
    <p class="pe-status" id="pe-status"></p>
  </div>

</div>

<p class="pe-note">说明：GitHub 登录有效期 8 小时，过期后重新点登录即可；登录凭据只保存在你当前浏览器，可随时点「退出登录」或去 GitHub 撤销授权；草稿自动保存在本地浏览器，刷新不丢失。</p>

<script src="/js/vendor/marked.umd.js"></script>
<script src="/js/post-editor.js"></script>

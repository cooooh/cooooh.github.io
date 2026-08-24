---
title: 写文章
date: 2026-08-21 18:00:00
top_img: false
comments: false
---

## 写文章 ✍️

在网页里直接写 Markdown 并发布：点「发布」后，脚本会通过 GitHub API 把文章提交到仓库，1~2 分钟后自动部署上线。

<div class="post-editor-card" id="post-editor">
  <details class="pe-token" open>
    <summary>🔑 发布密钥（一次性设置，之后发文不用再管）</summary>
    <ol>
      <li>打开 GitHub → 右上角头像 → <b>Settings</b> → 左下角 <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b></li>
      <li><b>Repository access</b> 选 <b>Only select repositories</b>，只勾选 <code>cooooh/cooooh.github.io</code></li>
      <li><b>Permissions</b> → <b>Contents</b> → 选 <b>Read and write</b>（其他权限一律不勾）</li>
      <li>生成后<b>复制令牌（只显示一次）</b>，粘贴到下面保存</li>
    </ol>
    <div class="pe-token-row">
      <input type="password" id="pe-token-input" placeholder="粘贴令牌（github_pat_ 开头）" autocomplete="off">
      <button class="pe-btn" id="pe-token-save" type="button">保存密钥</button>
      <button class="pe-btn ghost" id="pe-token-remove" type="button">移除密钥</button>
    </div>
    <p class="pe-status" id="pe-token-status"></p>
  </details>
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

<p class="pe-note">说明：密钥只保存在你当前浏览器，权限仅限本仓库的文章写入，可随时在 GitHub 撤销；草稿自动保存在本地浏览器，刷新不丢失。</p>

<script src="/js/vendor/marked.umd.js"></script>
<script src="/js/post-editor.js"></script>

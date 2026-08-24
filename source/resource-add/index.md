---
title: 添加资源
date: 2026-08-21 18:00:00
top_img: false
comments: false
---

## 添加资源 ➕

<span id="ra-type-label">正在加载…</span>——填写下方表单并保存，资源会直接写入仓库并部署上线（1~2 分钟）。

<div class="post-editor-card" id="resource-add">
  <div class="ra-token-warn hidden" id="ra-token-warn">
    ⚠️ 尚未设置发布密钥：请先到 <a href="/write/">写文章页</a> 顶部「发布密钥」保存一次 GitHub 令牌（两页共用同一把密钥）。
  </div>
  <div class="pe-form">
    <div class="pe-row">
      <label>名称 *
        <input type="text" id="ra-name" placeholder="例如：某部番剧 / 某本小说的名字">
      </label>
      <label>封面（可选）
        <input type="text" id="ra-cover" placeholder="https://… 或 /img/xxx.jpg，留空显示占位封面">
      </label>
    </div>
    <div class="pe-row">
      <label>简介（可选）
        <input type="text" id="ra-descr" placeholder="一句话介绍">
      </label>
      <label>标签（可选，用逗号分隔）
        <input type="text" id="ra-tags" placeholder="例如：日常, 治愈">
      </label>
    </div>
    <label>资源链接（可选，每行一个）
      <textarea id="ra-links" placeholder="每行一个链接，格式：按钮文字|网址&#10;例如：&#10;网盘|https://pan.example.com/s/xxx&#10;磁力|magnet:?xt=urn:btih:xxx&#10;在线观看|https://www.example.com"></textarea>
    </label>
    <div class="pe-actions">
      <button class="pe-btn" id="ra-back-btn" type="button"><i class="fas fa-arrow-left"></i> 返回分区</button>
      <button class="pe-btn primary" id="ra-save-btn" type="button"><i class="fas fa-plus"></i> 添加并保存</button>
    </div>
    <p class="pe-status" id="ra-status"></p>
  </div>
</div>

<p class="pe-note">说明：保存 = 把这条资源写入仓库的数据文件（<code>source/js/resource-data/</code>）并自动部署，所有访客可见；发布密钥与「写文章」页共用。</p>

<script src="/js/resource-add.js"></script>

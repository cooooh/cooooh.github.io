/**
 * Snowtrace 添加资源（番剧 / 小说共用）
 *
 * 通过 URL 参数 ?type=anime|novel 决定写入哪个数据文件。
 * 保存时：读取仓库里的数据 JS 文件 → 把新条目追加到资源数组末尾 → 提交回仓库，
 * GitHub Actions 自动构建部署，1~2 分钟后在分区页可见。
 *
 * 发布密钥与「写文章」页共用（localStorage 键 snowtrace.ghToken）。
 */
;(() => {
  'use strict'

  if (!document.getElementById('ra-name')) return

  const REPO = 'cooooh/cooooh.github.io'
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/'
  const LS_TOKEN = 'snowtrace.ghToken'

  const $ = id => document.getElementById(id)

  const params = new URLSearchParams(location.search)
  const type = params.get('type') === 'novel' ? 'novel' : 'anime'
  const typeName = type === 'novel' ? '小说' : '番剧'
  const dataPath = 'source/js/resource-data/' + type + '.js'
  const backUrl = type === 'novel' ? '/novel/' : '/anime/'

  const nameEl = $('ra-name')
  const coverEl = $('ra-cover')
  const descrEl = $('ra-descr')
  const tagsEl = $('ra-tags')
  const linksEl = $('ra-links')
  const statusEl = $('ra-status')

  /* ---------- 页面初始化 ---------- */

  const typeLabel = $('ra-type-label')
  if (typeLabel) typeLabel.textContent = '向「' + typeName + '」分区添加一条资源'

  const backBtn = $('ra-back-btn')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = backUrl
    })
  }

  const token = (() => {
    try { return localStorage.getItem(LS_TOKEN) || '' } catch (e) { return '' }
  })()

  const warnEl = $('ra-token-warn')
  if (!token && warnEl) {
    warnEl.classList.remove('hidden')
  }

  /* ---------- 工具 ---------- */

  function setStatus (text, ok) {
    statusEl.textContent = text
    statusEl.className = 'pe-status show ' + (ok ? 'ok' : 'warn')
    clearTimeout(statusEl._timer)
    statusEl._timer = setTimeout(() => { statusEl.className = 'pe-status' }, 8000)
  }

  function utf8ToBase64 (str) {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
  }

  function base64ToUtf8 (b64) {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  }

  function ghRequest (method, url, body) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
    if (token) headers.Authorization = 'Bearer ' + token
    const opts = { method, headers }
    if (body !== undefined) opts.body = JSON.stringify(body)
    return fetch(url, opts).then(async res => {
      const data = res.status === 204 ? null : await res.json().catch(() => null)
      if (!res.ok) {
        const err = new Error(data && data.message ? data.message : 'HTTP ' + res.status)
        err.status = res.status
        throw err
      }
      return data
    })
  }

  function friendlyError (status) {
    switch (status) {
      case 401: return '令牌无效或已过期，请到写文章页重新保存'
      case 403: return '没有权限：确认令牌的 Contents 权限是「Read and write」'
      case 409: return '数据文件刚被别人改过，稍等几秒再试一次'
      default: return '保存失败（HTTP ' + status + '），请稍后重试'
    }
  }

  /* ---------- 表单 → 条目对象 ---------- */

  function parseLinks (text) {
    return text.split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const sep = line.indexOf('|') !== -1 ? '|' : '｜'
        const idx = line.indexOf(sep)
        if (idx <= 0) return null
        const t = line.slice(0, idx).trim()
        const u = line.slice(idx + 1).trim()
        if (!t || !u) return null
        if (!/^(https?:|magnet:|\/)/i.test(u)) return null
        return { text: t, url: u }
      })
      .filter(Boolean)
  }

  function buildEntry () {
    const entry = { name: nameEl.value.trim() }
    const cover = coverEl.value.trim()
    if (cover) entry.cover = cover
    const descr = descrEl.value.trim()
    if (descr) entry.descr = descr
    const tags = tagsEl.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    if (tags.length) entry.tags = tags
    const links = parseLinks(linksEl.value)
    if (links.length) entry.links = links
    return entry
  }

  /* ---------- 追加条目到数据文件 ---------- */

  // 在 JS 数据文件的数组末尾（最后一个 ] 之前）插入新条目
  function appendEntry (content, entryJson) {
    const marker = 'window.SNOWTRACE_RESOURCES'
    const start = content.indexOf(marker)
    if (start === -1) throw new Error('数据文件格式异常：找不到 ' + marker)
    const eq = content.indexOf('=', start)
    const open = content.indexOf('[', eq)
    const close = content.lastIndexOf(']')
    if (open === -1 || close === -1 || close <= open) throw new Error('数据文件格式异常：找不到数组')

    const inner = content.slice(open + 1, close)
    const comma = inner.trim() ? ',' : ''
    const indented = entryJson.replace(/\n/g, '\n  ')
    return content.slice(0, open + 1) + inner + comma + '\n  ' + indented + '\n' + content.slice(close)
  }

  /* ---------- 保存 ---------- */

  const saveBtn = $('ra-save-btn')
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!token) {
        setStatus('请先到「写文章」页保存发布密钥（两页共用）', false)
        return
      }
      if (!nameEl.value.trim()) {
        setStatus('名称不能为空', false)
        return
      }

      saveBtn.disabled = true
      setStatus('正在读取数据文件…')

      try {
        const entry = buildEntry()
        const entryJson = JSON.stringify(entry, null, 2)

        // 第一步：读取现有数据文件
        const existing = await ghRequest('GET', API_BASE + dataPath)
        const content = base64ToUtf8(existing.content)
        const newContent = appendEntry(content, entryJson)

        // 第二步：提交新内容
        await ghRequest('PUT', API_BASE + dataPath, {
          message: '添加' + typeName + '资源：' + entry.name,
          content: utf8ToBase64(newContent),
          sha: existing.sha,
          branch: 'main'
        })

        ;[nameEl, coverEl, descrEl, tagsEl, linksEl].forEach(el => { if (el) el.value = '' })
        statusEl.innerHTML = '添加成功 ✓ 约 1~2 分钟后上线：' +
          '<a href="' + backUrl + '" target="_blank">返回' + typeName + '分区查看</a> · ' +
          '<a href="https://github.com/' + REPO + '/commits/main" target="_blank">GitHub 提交记录</a>'
        statusEl.className = 'pe-status show ok'
      } catch (err) {
        setStatus(friendlyError(err.status) + (err.status ? '' : '（' + err.message + '）'), false)
      } finally {
        saveBtn.disabled = false
      }
    })
  }
})()

/**
 * Snowtrace 网页发文（单用户版）
 *
 * 原理：静态站没有后端，这里把 GitHub API 当作「后门」——
 * 表单内容拼成 Markdown 文件，直接提交到仓库 source/_posts/，
 * 随后 GitHub Actions 自动构建部署，1~2 分钟后文章上线。
 *
 * 身份认证：fine-grained PAT（仅本仓库 Contents 读写权限），
 * 一次性粘贴保存在本机浏览器，之后发文无需重复操作。
 */
;(() => {
  'use strict'

  if (!document.getElementById('pe-title')) return

  const REPO = 'cooooh/cooooh.github.io'
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/'
  const POSTS_DIR = 'source/_posts/'
  const LS_TOKEN = 'snowtrace.ghToken'
  const LS_DRAFT = 'snowtrace.postDraft'

  const $ = id => document.getElementById(id)

  const titleEl = $('pe-title')
  const categoryEl = $('pe-category')
  const tagsEl = $('pe-tags')
  const descEl = $('pe-description')
  const bodyEl = $('pe-body')
  const statusEl = $('pe-status')

  /* ---------- 工具 ---------- */

  function setStatus (el, text, ok) {
    if (!el) return
    el.textContent = text
    el.className = 'pe-status show ' + (ok ? 'ok' : 'warn')
    clearTimeout(el._timer)
    el._timer = setTimeout(() => { el.className = 'pe-status' }, 6000)
  }

  // UTF-8 字符串 → base64（btoa 只能处理 latin1，中文必须走这里）
  function utf8ToBase64 (str) {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
    return btoa(bin)
  }

  // 标题 → 文件名片段（去掉非法字符，空格变横线）
  function fileSlug (title) {
    const cleaned = title.trim().replace(/[\\/:*?"<>|#%&{}]/g, '').replace(/\s+/g, '-')
    return cleaned || 'untitled'
  }

  function pad (n) { return String(n).padStart(2, '0') }

  function nowParts () {
    const d = new Date()
    return {
      ymd: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
      full: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
    }
  }

  /* ---------- 发布密钥 ---------- */

  const getToken = () => {
    try { return localStorage.getItem(LS_TOKEN) || '' } catch (e) { return '' }
  }

  const tokenInput = $('pe-token-input')
  const tokenRemoveBtn = $('pe-token-remove')
  const tokenBoxEl = document.querySelector('details.pe-token')

  const refreshTokenUI = () => {
    const has = !!getToken()
    if (tokenBoxEl) {
      const summary = tokenBoxEl.querySelector('summary')
      if (summary) {
        summary.innerHTML = has
          ? '🔑 发布密钥：<span class="pe-token-ok">已保存 ✓</span>（点击可更换或移除）'
          : '🔑 发布密钥（一次性设置，之后发文不用再管）'
      }
    }
    if (tokenRemoveBtn) tokenRemoveBtn.style.display = has ? '' : 'none'
    if (tokenInput) tokenInput.value = ''
  }

  const tokenSaveBtn = $('pe-token-save')
  if (tokenSaveBtn) {
    tokenSaveBtn.addEventListener('click', () => {
      const value = (tokenInput.value || '').trim()
      if (!value || value.length < 20) {
        setStatus($('pe-token-status'), '请先粘贴完整的令牌再保存', false)
        return
      }
      try {
        localStorage.setItem(LS_TOKEN, value)
      } catch (e) {
        setStatus($('pe-token-status'), '保存失败：浏览器存储异常', false)
        return
      }
      setStatus($('pe-token-status'), '密钥已保存 ✓ 现在可以发布文章了', true)
      refreshTokenUI()
    })
  }

  if (tokenRemoveBtn) {
    tokenRemoveBtn.addEventListener('click', () => {
      localStorage.removeItem(LS_TOKEN)
      setStatus($('pe-token-status'), '密钥已移除', true)
      refreshTokenUI()
    })
  }

  /* ---------- GitHub API ---------- */

  function ghRequest (method, url, token, body) {
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
      case 401: return '令牌无效或已过期，请重新生成并保存'
      case 403: return '没有权限或触发频率限制：确认令牌的 Contents 权限是「Read and write」且只用于本仓库'
      case 409: return '文件内容冲突（可能刚被别人改过），稍等片刻再点一次发布'
      case 422: return '内容校验失败，请检查标题是否包含特殊符号'
      default: return '发布失败（HTTP ' + status + '），请稍后重试'
    }
  }

  /* ---------- 草稿自动保存 ---------- */

  let saveTimer = null
  const collectDraft = () => ({
    title: titleEl.value,
    category: categoryEl.value,
    tags: tagsEl.value,
    description: descEl.value,
    body: bodyEl.value
  })

  const saveDraft = () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(LS_DRAFT, JSON.stringify(collectDraft()))
      } catch (e) { /* 存储满时静默失败 */ }
    }, 400)
  }

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(LS_DRAFT)
      if (!raw) return false
      const d = JSON.parse(raw)
      if (!d.title && !d.body) return false
      titleEl.value = d.title || ''
      categoryEl.value = d.category || ''
      tagsEl.value = d.tags || ''
      descEl.value = d.description || ''
      bodyEl.value = d.body || ''
      return true
    } catch (e) { return false }
  }

  const clearDraft = () => {
    localStorage.removeItem(LS_DRAFT)
  }

  ;[titleEl, categoryEl, tagsEl, descEl, bodyEl].forEach(el => {
    if (el) el.addEventListener('input', saveDraft)
  })

  /* ---------- Markdown 预览 ---------- */

  const previewEl = $('pe-preview')
  const previewBtn = $('pe-preview-btn')

  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      if (!window.marked) {
        setStatus(statusEl, '预览组件加载失败，请刷新页面重试', false)
        return
      }
      const showing = !previewEl.classList.contains('hidden')
      if (showing) {
        previewEl.classList.add('hidden')
        document.getElementById('post-editor').classList.remove('pe-previewing')
        previewBtn.innerHTML = '<i class="fas fa-eye"></i> 预览'
      } else {
        previewEl.innerHTML = window.marked.parse(bodyEl.value || '（正文还是空的）')
        previewEl.classList.remove('hidden')
        document.getElementById('post-editor').classList.add('pe-previewing')
        previewBtn.innerHTML = '<i class="fas fa-pen"></i> 编辑'
      }
    })
  }

  /* ---------- 清空 ---------- */

  const clearBtn = $('pe-clear-btn')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!window.confirm('确定清空标题、正文和草稿吗？')) return
      ;[titleEl, categoryEl, tagsEl, descEl, bodyEl].forEach(el => { if (el) el.value = '' })
      clearDraft()
      setStatus(statusEl, '已清空', true)
    })
  }

  /* ---------- 发布 ---------- */

  const buildPostFile = () => {
    const t = nowParts()
    const lines = ['---', 'title: ' + titleEl.value.trim()]
    lines.push('date: ' + t.full)
    const tags = tagsEl.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    if (tags.length) lines.push('tags: [' + tags.join(', ') + ']')
    // 分类支持多级：用逗号分隔，如「生活,番剧」→ categories: [生活, 番剧]
    const categories = categoryEl.value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    if (categories.length) lines.push('categories: [' + categories.join(', ') + ']')
    const description = descEl.value.trim()
    if (description) lines.push('description: ' + description)
    lines.push('---')
    lines.push('')
    lines.push(bodyEl.value.replace(/\s+$/, ''))
    lines.push('')
    return {
      filename: t.ymd + '-' + fileSlug(titleEl.value) + '.md',
      content: lines.join('\n'),
      slug: t.ymd.replace(/-/g, '/') + '/' + fileSlug(titleEl.value) + '/'
    }
  }

  const publishBtn = $('pe-publish-btn')
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      const token = getToken()
      if (!token) {
        setStatus(statusEl, '请先在上方保存发布密钥（GitHub 令牌）', false)
        return
      }
      if (!titleEl.value.trim() || !bodyEl.value.trim()) {
        setStatus(statusEl, '标题和正文不能为空', false)
        return
      }

      publishBtn.disabled = true
      setStatus(statusEl, '正在提交到 GitHub…')

      try {
        const post = buildPostFile()
        const path = POSTS_DIR + post.filename

        // 第一步：查这个文件名是否已存在（存在则拿到 sha，走「更新」流程）
        let sha = null
        try {
          const existing = await ghRequest('GET', API_BASE + path, token)
          sha = existing.sha
        } catch (e) {
          if (e.status !== 404) throw e
        }

        // 第二步：创建或更新文件（提交到 main 分支）
        const payload = {
          message: (sha ? '更新文章：' : '发布文章：') + titleEl.value.trim(),
          content: utf8ToBase64(post.content),
          branch: 'main'
        }
        if (sha) payload.sha = sha
        await ghRequest('PUT', API_BASE + path, token, payload)

        clearDraft()
        ;[titleEl, categoryEl, tagsEl, descEl, bodyEl].forEach(el => { if (el) el.value = '' })

        statusEl.innerHTML = '发布成功 ✓ 约 1~2 分钟后上线：' +
          '<a href="/' + post.slug + '" target="_blank">文章地址</a> · ' +
          '<a href="/archives/" target="_blank">归档页</a> · ' +
          '<a href="https://github.com/' + REPO + '/commits/main" target="_blank">GitHub 提交记录</a>' +
          (sha ? '（同名文件已更新）' : '')
        statusEl.className = 'pe-status show ok'
      } catch (err) {
        setStatus(statusEl, friendlyError(err.status), false)
      } finally {
        publishBtn.disabled = false
      }
    })
  }

  /* ---------- 启动 ---------- */

  refreshTokenUI()
  if (restoreDraft()) setStatus(statusEl, '已恢复上次未发布的草稿', true)

  // 从分类页跳转过来时（/write/?category=知识），自动预填分类
  const urlParams = new URLSearchParams(location.search)
  const presetCategory = urlParams.get('category')
  if (presetCategory && categoryEl && !categoryEl.value) {
    categoryEl.value = presetCategory
  }
})()

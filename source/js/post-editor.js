/**
 * Snowtrace 网页发文
 *
 * 原理：静态站没有后端，这里把 GitHub API 当作「后门」——
 * 表单内容拼成 Markdown 文件，直接提交到仓库 source/_posts/，
 * 随后 GitHub Actions 自动构建部署，1~2 分钟后文章上线。
 *
 * 身份认证两种方式（优先使用 GitHub 一键登录）：
 * 1. GitHub OAuth 设备流：点登录 → GitHub 授权页输码 → 自动拿到 8 小时有效的令牌
 *    （浏览器不能直连 GitHub 登录接口，需经 RELAY_URL 指定的免费中转服务转发）
 * 2. 手动令牌（高级备用）：fine-grained PAT，仅本仓库 Contents 读写权限
 */
;(() => {
  'use strict'

  if (!document.getElementById('pe-title')) return

  const REPO = 'cooooh/cooooh.github.io'
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/'
  const POSTS_DIR = 'source/_posts/'
  const RELAY_URL = '__RELAY_URL__' // 部署中转服务后替换为 Worker/服务器网址
  const LS_OAUTH = 'snowtrace.oauthToken'
  const LS_TOKEN = 'snowtrace.ghToken'
  const LS_DRAFT = 'snowtrace.postDraft'
  const OAUTH_TTL_MS = 7.5 * 60 * 60 * 1000 // GitHub 设备流令牌有效期 8 小时，提前半小时视为过期

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

  /* ---------- 登录状态 ---------- */

  const getOauth = () => {
    try {
      const raw = localStorage.getItem(LS_OAUTH)
      if (!raw) return ''
      const data = JSON.parse(raw)
      if (!data.token || Date.now() - data.savedAt > OAUTH_TTL_MS) {
        localStorage.removeItem(LS_OAUTH)
        return ''
      }
      return data.token
    } catch (e) { return '' }
  }

  const getPat = () => {
    try { return localStorage.getItem(LS_TOKEN) || '' } catch (e) { return '' }
  }

  // 优先级：OAuth 登录 > 手动令牌
  const getToken = () => getOauth() || getPat()

  const authStateEl = $('pe-auth-state')
  const loginBtn = $('pe-login-btn')
  const logoutBtn = $('pe-logout-btn')

  const refreshAuthUI = () => {
    const oauth = getOauth()
    const pat = getPat()
    if (authStateEl) {
      if (oauth) {
        authStateEl.textContent = '✅ 已登录（GitHub）'
        authStateEl.className = 'pe-auth-state ok'
      } else if (pat) {
        authStateEl.textContent = '✅ 已登录（手动令牌）'
        authStateEl.className = 'pe-auth-state ok'
      } else {
        authStateEl.textContent = '🔐 未登录——发布前请先登录'
        authStateEl.className = 'pe-auth-state'
      }
    }
    if (loginBtn) loginBtn.style.display = (oauth || pat) ? 'none' : ''
    if (logoutBtn) logoutBtn.style.display = (oauth || pat) ? '' : 'none'
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(LS_OAUTH)
      localStorage.removeItem(LS_TOKEN)
      refreshAuthUI()
      setStatus($('pe-auth-status'), '已退出登录', true)
    })
  }

  /* ---------- GitHub OAuth 设备流登录 ---------- */

  const devicePanel = $('pe-device-panel')
  const userCodeEl = $('pe-user-code')
  const openDeviceBtn = $('pe-open-device')
  const countdownEl = $('pe-countdown')

  let pollTimer = null
  let countdownTimer = null
  let pollStopped = false

  const stopDeviceFlow = () => {
    pollStopped = true
    clearInterval(pollTimer)
    clearInterval(countdownTimer)
  }

  if (openDeviceBtn) {
    openDeviceBtn.addEventListener('click', () => {
      const uri = openDeviceBtn.dataset.uri || 'https://github.com/login/device'
      window.open(uri, '_blank')
    })
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  async function startDeviceLogin () {
    if (RELAY_URL.indexOf('__RELAY') === 0) {
      setStatus($('pe-auth-status'), '中转服务尚未配置，暂时请使用下方「高级：手动粘贴令牌」', false)
      return
    }

    loginBtn.disabled = true
    setStatus($('pe-auth-status'), '正在向 GitHub 申请授权码…', true)

    try {
      // 第一步：申请设备码
      const res = await fetch(RELAY_URL + '/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('申请授权码失败（HTTP ' + res.status + '）')
      const data = await res.json()
      if (data.error) throw new Error(data.error_description || data.error)

      // 第二步：展示授权码，引导用户去 GitHub 完成授权
      pollStopped = false
      userCodeEl.textContent = data.user_code
      openDeviceBtn.dataset.uri = data.verification_uri + '?user_code=' + data.user_code
      devicePanel.classList.remove('hidden')

      try {
        navigator.clipboard.writeText(data.user_code)
        setStatus($('pe-auth-status'), '授权码已复制，点「打开 GitHub 授权页」粘贴并授权', true)
      } catch (e) {
        setStatus($('pe-auth-status'), '请复制上方授权码，点「打开 GitHub 授权页」粘贴并授权', true)
      }

      // 第三步：轮询换取令牌
      let deadline = Date.now() + (data.expires_in || 900) * 1000
      let interval = (data.interval || 5) * 1000
      countdownEl.textContent = Math.ceil((deadline - Date.now()) / 1000)
      countdownTimer = setInterval(() => {
        const left = Math.ceil((deadline - Date.now()) / 1000)
        countdownEl.textContent = left > 0 ? left : 0
      }, 1000)

      pollTimer = setInterval(async () => {
        if (pollStopped) return
        if (Date.now() > deadline) {
          stopDeviceFlow()
          setStatus($('pe-auth-status'), '授权码已过期，请重新点击登录', false)
          devicePanel.classList.add('hidden')
          return
        }
        try {
          const tRes = await fetch(RELAY_URL + '/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_code: data.device_code })
          })
          const t = await tRes.json()
          if (t.access_token) {
            stopDeviceFlow()
            localStorage.setItem(LS_OAUTH, JSON.stringify({ token: t.access_token, savedAt: Date.now() }))
            devicePanel.classList.add('hidden')
            setStatus($('pe-auth-status'), '登录成功 ✓ 现在可以发布文章了', true)
            refreshAuthUI()
          } else if (t.error === 'authorization_pending') {
            // 用户还没点授权，继续等
          } else if (t.error === 'slow_down') {
            interval += 5000 // GitHub 要求放慢轮询速度
          } else if (t.error === 'access_denied') {
            stopDeviceFlow()
            devicePanel.classList.add('hidden')
            setStatus($('pe-auth-status'), '你在 GitHub 上拒绝了授权，如需要可重新登录', false)
          } else if (t.error === 'expired_token') {
            stopDeviceFlow()
            devicePanel.classList.add('hidden')
            setStatus($('pe-auth-status'), '授权码已过期，请重新点击登录', false)
          }
        } catch (e) {
          // 单次网络抖动不中断，下轮继续
        }
      }, interval)
    } catch (err) {
      setStatus($('pe-auth-status'), err.message + '（若无法解决，可用下方手动令牌方式）', false)
    } finally {
      loginBtn.disabled = false
    }
  }

  if (loginBtn) loginBtn.addEventListener('click', startDeviceLogin)

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
      case 401: return '登录已失效（可能超过 8 小时），请重新登录'
      case 403: return '没有权限或触发频率限制：请确认登录账号对仓库有写入权限'
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

  /* ---------- 手动令牌（高级备用） ---------- */

  const tokenInput = $('pe-token-input')
  const tokenRemoveBtn = $('pe-token-remove')

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
      tokenInput.value = ''
      setStatus($('pe-token-status'), '令牌已保存 ✓（可在「高级」里移除）', true)
      refreshAuthUI()
    })
  }

  if (tokenRemoveBtn) {
    tokenRemoveBtn.addEventListener('click', () => {
      localStorage.removeItem(LS_TOKEN)
      setStatus($('pe-token-status'), '手动令牌已移除', true)
      refreshAuthUI()
    })
  }

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
    const category = categoryEl.value.trim()
    if (category) lines.push('categories: [' + category + ']')
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
        setStatus(statusEl, '请先登录（上方 GitHub 登录按钮，或高级手动令牌）', false)
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

  refreshAuthUI()
  if (restoreDraft()) setStatus(statusEl, '已恢复上次未发布的草稿', true)
})()

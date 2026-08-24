/**
 * Snowtrace 资源页渲染器（番剧 / 小说共用）
 *
 * 读取 window.SNOWTRACE_RESOURCES（由各页面的数据文件定义），
 * 渲染成资源卡片网格，并支持按标题/简介/标签实时过滤。
 *
 * 删除管理：仅当本机浏览器保存过发布密钥时，卡片上挂删除角标，
 * 在「管理模式」（左下角「管理」按钮开启）下显示；删除 = 从数据文件
 * 数组中移除该条目并提交回仓库。
 */
;(() => {
  'use strict'

  const grid = document.getElementById('resource-grid')
  if (!grid) return

  const REPO = 'cooooh/cooooh.github.io'
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/'
  const LS_TOKEN = 'snowtrace.ghToken'

  const data = window.SNOWTRACE_RESOURCES || []
  const searchEl = document.getElementById('resource-search')
  const emptyEl = document.getElementById('resource-empty')

  // 当前页面类型：由数据文件名推断（anime.js / novel.js）
  const pageScript = document.querySelector('script[src*="resource-data/"]')
  const dataFile = pageScript
    ? 'source/js/resource-data/' + (pageScript.getAttribute('src').split('/').pop())
    : ''

  const token = (() => {
    try { return localStorage.getItem(LS_TOKEN) || '' } catch (e) { return '' }
  })()

  /* ---------- 提示气泡 ---------- */

  let toastEl = null
  function toast (text, ok) {
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.className = 'snowtrace-toast'
      document.body.appendChild(toastEl)
    }
    toastEl.textContent = text
    toastEl.className = 'snowtrace-toast show ' + (ok ? 'ok' : 'err')
    clearTimeout(toastEl._timer)
    toastEl._timer = setTimeout(() => { toastEl.className = 'snowtrace-toast' }, 3500)
  }

  /* ---------- HTML 转义 ---------- */

  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  /* ---------- 单条资源 → 卡片 HTML ---------- */

  function cardHTML (item, index) {
    const name = esc(item.name || '未命名')
    const descr = esc(item.descr || '')
    const tags = (item.tags || [])
      .map(t => '<span class="resource-tag">' + esc(t) + '</span>')
      .join('')
    const links = (item.links || []).length
      ? item.links.map(l =>
          '<a class="resource-link" href="' + esc(l.url || '#') + '" target="_blank" rel="noopener">' +
          esc(l.text || '链接') + '</a>'
        ).join('')
      : '<span class="resource-nolink">暂无资源链接</span>'

    let cover
    const c = (item.cover || '').trim()
    if (c) {
      cover = '<div class="resource-cover" style="background-image:url(\'' + esc(c) + '\')"></div>'
    } else {
      cover = '<div class="resource-cover no-cover"><span>' + esc(name.charAt(0)) + '</span></div>'
    }

    return (
      '<article class="resource-card" data-index="' + index + '" data-search="' + esc((name + ' ' + descr + ' ' + (item.tags || []).join(' ')).toLowerCase()) + '">' +
        cover +
        '<div class="resource-body">' +
          '<div class="resource-name">' + name + '</div>' +
          (tags ? '<div class="resource-tags">' + tags + '</div>' : '') +
          (descr ? '<div class="resource-descr">' + descr + '</div>' : '') +
          '<div class="resource-links">' + links + '</div>' +
        '</div>' +
      '</article>'
    )
  }

  function render () {
    if (!data.length) {
      grid.innerHTML = ''
      if (emptyEl) {
        emptyEl.textContent = '还没有资源：点右上角「＋ 添加资源」即可添加。'
        emptyEl.classList.remove('hidden')
      }
      return
    }
    grid.innerHTML = data.map(cardHTML).join('')
  }

  /* ---------- 搜索过滤 ---------- */

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim().toLowerCase()
      let visible = 0
      grid.querySelectorAll('.resource-card').forEach(card => {
        const hit = !q || card.dataset.search.indexOf(q) !== -1
        card.style.display = hit ? '' : 'none'
        if (hit) visible++
      })
      if (emptyEl) {
        if (!visible) {
          emptyEl.textContent = '没有匹配的资源，换个关键词试试。'
          emptyEl.classList.remove('hidden')
        } else {
          emptyEl.classList.add('hidden')
        }
      }
    })
  }

  /* ---------- 删除管理 ---------- */

  function ghRequest (method, url, body) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
    if (token) headers.Authorization = 'Bearer ' + token
    const opts = { method, headers }
    if (body !== undefined) opts.body = JSON.stringify(body)
    return fetch(url, opts).then(async res => {
      const d = res.status === 204 ? null : await res.json().catch(() => null)
      if (!res.ok) {
        const err = new Error(d && d.message ? d.message : 'HTTP ' + res.status)
        err.status = res.status
        throw err
      }
      return d
    })
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

  async function deleteEntry (index) {
    const entry = data[index]
    if (!entry) throw new Error('条目不存在')

    // 读取数据文件
    const existing = await ghRequest('GET', API_BASE + dataFile)
    const content = base64ToUtf8(existing.content)

    // 定位数组并用 JS 求值取出条目（数据文件本身就是脚本，直接求值安全且兼容单引号写法）
    const marker = 'window.SNOWTRACE_RESOURCES'
    const start = content.indexOf(marker)
    if (start === -1) throw new Error('数据文件格式异常')
    const open = content.indexOf('[', content.indexOf('=', start))
    const close = content.lastIndexOf(']')
    if (open === -1 || close <= open) throw new Error('数据文件格式异常')
    const entries = new Function('return [' + content.slice(open + 1, close) + ']')()
    entries.splice(index, 1)

    // 重写数组部分并提交
    const newContent = content.slice(0, open + 1) + '\n' + JSON.stringify(entries, null, 2) + '\n' + content.slice(close)
    await ghRequest('PUT', API_BASE + dataFile, {
      message: '删除资源：' + entry.name,
      content: utf8ToBase64(newContent),
      sha: existing.sha,
      branch: 'main'
    })
  }

  function friendlyError (status) {
    switch (status) {
      case 401: return '令牌无效或已过期，请到写文章页重新保存'
      case 403: return '没有权限：确认令牌的 Contents 权限是「Read and write」'
      case 409: return '数据文件刚被别人改过，稍等几秒再试'
      default: return 'HTTP ' + status
    }
  }

  function attachDeleteBadges () {
    if (!token) return
    grid.querySelectorAll('.resource-card').forEach(card => {
      const index = Number(card.dataset.index)
      const badge = document.createElement('button')
      badge.type = 'button'
      badge.className = 'snowtrace-del-badge'
      badge.title = '删除这条资源'
      badge.innerHTML = '<i class="fas fa-trash-can"></i>'
      badge.addEventListener('click', async ev => {
        ev.preventDefault()
        ev.stopPropagation()
        const name = data[index] ? data[index].name : '这条资源'
        if (!window.confirm('确定删除《' + name + '》吗？')) return
        badge.disabled = true
        try {
          await deleteEntry(index)
          data.splice(index, 1)
          card.remove()
          toast('已删除《' + name + '》，1~2 分钟后全站生效', true)
        } catch (err) {
          badge.disabled = false
          toast('删除失败：' + friendlyError(err.status), false)
        }
      })
      card.appendChild(badge)
    })
  }

  /* ---------- 启动 ---------- */

  render()
  attachDeleteBadges()
})()

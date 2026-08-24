/**
 * Snowtrace 删除管理（文章）
 *
 * 只在「本机浏览器保存过发布密钥」时生效，普通访客完全无感知：
 * - 页面左下角出现「管理」开关按钮
 * - 开启后：文章列表（首页/归档/分类）每项右上角出现删除角标
 * - 文章详情页出现「删除本文」按钮
 * - 删除 = 调 GitHub API 删除仓库里对应的 .md 文件，Actions 自动重新部署
 */
;(() => {
  'use strict'

  const LS_TOKEN = 'snowtrace.ghToken'
  const REPO = 'cooooh/cooooh.github.io'
  const API_BASE = 'https://api.github.com/repos/' + REPO + '/contents/'

  const token = (() => {
    try { return localStorage.getItem(LS_TOKEN) || '' } catch (e) { return '' }
  })()
  if (!token) return

  const map = window.SNOWTRACE_POST_MAP || {}
  const postSource = window.SNOWTRACE_POST_SOURCE || ''

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

  /* ---------- GitHub API ---------- */

  function ghRequest (method, url, body) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: 'Bearer ' + token
    }
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

  async function deleteFile (path, name) {
    const info = await ghRequest('GET', API_BASE + path)
    await ghRequest('DELETE', API_BASE + path, {
      message: '删除：' + name,
      sha: info.sha,
      branch: 'main'
    })
  }

  function friendlyError (status) {
    switch (status) {
      case 401: return '令牌无效或已过期，请到写文章页重新保存'
      case 403: return '没有权限：确认令牌的 Contents 权限是「Read and write」'
      case 404: return '文件不存在（可能已被删除），刷新页面看看'
      case 409: return '文件刚被别人改过，稍等几秒再试'
      default: return 'HTTP ' + status
    }
  }

  /* ---------- 管理开关 ---------- */

  const mgrBtn = document.createElement('button')
  mgrBtn.type = 'button'
  mgrBtn.className = 'snowtrace-mgr-btn'
  mgrBtn.innerHTML = '<i class="fas fa-trash-can"></i> 管理'
  mgrBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('snowtrace-managing')
    mgrBtn.classList.toggle('on', on)
  })
  document.body.appendChild(mgrBtn)

  /* ---------- 文章详情页：删除本文 ---------- */

  if (postSource) {
    const delBtn = document.createElement('button')
    delBtn.type = 'button'
    delBtn.className = 'snowtrace-mgr-btn del-post'
    delBtn.innerHTML = '<i class="fas fa-trash-can"></i> 删除本文'
    delBtn.addEventListener('click', async () => {
      const title = (document.querySelector('.post-title') ? document.querySelector('.post-title').textContent.trim() : '') || '这篇文章'
      if (!window.confirm('确定删除《' + title + '》吗？删除后不可恢复，1~2 分钟后全站生效。')) return
      delBtn.disabled = true
      try {
        await deleteFile(postSource, title)
        toast('已删除，即将返回首页…', true)
        setTimeout(() => { window.location.href = '/' }, 1200)
      } catch (err) {
        delBtn.disabled = false
        toast('删除失败：' + friendlyError(err.status), false)
      }
    })
    document.body.appendChild(delBtn)
  }

  /* ---------- 列表页：每篇文章的删除角标 ---------- */

  const matchSource = href => {
    if (!href) return ''
    if (map[href]) return map[href]
    const h = href.replace(/\/$/, '')
    if (map[h]) return map[h]
    if (map[h + '/']) return map[h + '/']
    if (map[h.replace(/index\.html$/, '')]) return map[h.replace(/index\.html$/, '')]
    return ''
  }

  document.querySelectorAll('.recent-post-item, .article-sort-item').forEach(item => {
    const anchor = item.querySelector('a[href]')
    const src = matchSource(anchor && anchor.getAttribute('href'))
    if (!src) return

    const badge = document.createElement('button')
    badge.type = 'button'
    badge.className = 'snowtrace-del-badge'
    badge.title = '删除这篇文章'
    badge.innerHTML = '<i class="fas fa-trash-can"></i>'
    badge.addEventListener('click', async ev => {
      ev.preventDefault()
      ev.stopPropagation()
      const titleEl = item.querySelector('.article-title') || item.querySelector('h1, h2, h3')
      const title = titleEl ? titleEl.textContent.trim() : '这篇文章'
      if (!window.confirm('确定删除《' + title + '》吗？')) return
      badge.disabled = true
      try {
        await deleteFile(src, title)
        item.remove()
        toast('已删除《' + title + '》，1~2 分钟后全站生效', true)
      } catch (err) {
        badge.disabled = false
        toast('删除失败：' + friendlyError(err.status), false)
      }
    })
    item.appendChild(badge)
  })
})()

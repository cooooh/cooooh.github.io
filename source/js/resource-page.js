/**
 * Snowtrace 资源页渲染器（番剧 / 小说共用）
 *
 * 读取 window.SNOWTRACE_RESOURCES（由各页面的数据文件定义），
 * 渲染成资源卡片网格，并支持按标题/简介/标签实时过滤。
 */
;(() => {
  'use strict'

  const grid = document.getElementById('resource-grid')
  if (!grid) return

  const data = window.SNOWTRACE_RESOURCES || []
  const searchEl = document.getElementById('resource-search')
  const emptyEl = document.getElementById('resource-empty')

  // HTML 转义：防止资源数据里出现特殊符号破坏页面
  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // 单条资源 → 卡片 HTML
  function cardHTML (item) {
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
      '<article class="resource-card" data-search="' + esc((name + ' ' + descr + ' ' + (item.tags || []).join(' ')).toLowerCase()) + '">' +
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
        emptyEl.textContent = '还没有资源：编辑 source/js/resource-data/ 下的数据文件即可添加。'
        emptyEl.classList.remove('hidden')
      }
      return
    }
    grid.innerHTML = data.map(cardHTML).join('')
  }

  // 搜索过滤
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

  render()
})()

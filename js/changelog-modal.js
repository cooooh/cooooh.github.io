/**
 * Snowtrace 更新日志弹窗
 *
 * 点击导航「关于 → 更新日志」时，在屏幕中央弹出小窗口，
 * 展示 /log/ 页面的正文（内容来自 source/log/index.md）。
 */
;(() => {
  'use strict'

  let overlay = null
  let body = null
  let cache = null

  const build = () => {
    overlay = document.createElement('div')
    overlay.id = 'changelog-overlay'
    overlay.innerHTML = `
      <div class="changelog-dialog" role="dialog" aria-modal="true" aria-label="更新日志">
        <div class="changelog-header">
          <span class="changelog-title"><i class="fas fa-scroll"></i>更新日志</span>
          <button class="changelog-close" type="button" title="关闭">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="changelog-body"></div>
      </div>`
    document.body.appendChild(overlay)
    body = overlay.querySelector('.changelog-body')

    overlay.querySelector('.changelog-close').addEventListener('click', close)
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close()
    })
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close()
    })
  }

  const showLoading = () => {
    body.innerHTML = '<div class="changelog-loading"><i class="fas fa-spinner fa-pulse"></i> 加载中…</div>'
  }

  const load = () => {
    if (cache) {
      body.innerHTML = cache
      return
    }
    fetch('/log/')
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status)
        return response.text()
      })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const article = doc.getElementById('article-container')
        if (!article) throw new Error('content not found')
        cache = article.innerHTML
        body.innerHTML = cache
      })
      .catch(() => {
        body.innerHTML = '<p class="changelog-error">更新日志加载失败，请直接访问 <a href="/log/">/log/</a>。</p>'
      })
  }

  const open = () => {
    if (!overlay) build()
    showLoading()
    overlay.classList.add('active')
    document.body.style.overflow = 'hidden'
    load()
  }

  const close = () => {
    if (!overlay) return
    overlay.classList.remove('active')
    document.body.style.overflow = ''
  }

  // 事件委托：桌面导航和移动端侧边栏里的「更新日志」链接都会触发
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="/log/"]')
    if (link) {
      event.preventDefault()
      open()
    }
  })
})()

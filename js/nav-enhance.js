/**
 * Snowtrace 导航增强 + 分类页写文章入口
 *
 * 1. 二级下拉菜单：分类下拉里的「生活」项，悬停时向右展开「番剧 / 小说」
 *    （Butterfly 主题原生只支持一级下拉，这里用 JS 在渲染后补一层子菜单）
 * 2. 分类页（如 /categories/项目/）自动插入「写文章」按钮，点击跳转到
 *    写文章页并自动带该分类（?category=项目）
 */
;(() => {
  'use strict'

  /* ---------- 1. 二级下拉：生活 → 番剧 / 小说 ---------- */

  function buildSubMenu () {
    document.querySelectorAll('a.site-page.child').forEach(link => {
      if (link.textContent.trim() !== '生活') return
      const li = link.closest('li')
      if (!li || li.querySelector('.menus_item_subchild')) return // 已注入过则跳过

      const sub = document.createElement('ul')
      sub.className = 'menus_item_subchild'
      sub.innerHTML =
        '<li><a class="site-page" href="/anime/"><i class="fa-fw fas fa-tv"></i><span> 番剧</span></a></li>' +
        '<li><a class="site-page" href="/novel/"><i class="fa-fw fas fa-book"></i><span> 小说</span></a></li>'
      li.appendChild(sub)
    })
  }

  /* ---------- 2. 分类页插入「写文章」按钮 ---------- */

  function buildCategoryButton () {
    const match = location.pathname.match(/^\/categories\/(.+)\/$/)
    if (!match) return
    const category = decodeURIComponent(match[1])
    const container = document.getElementById('category')
    if (!container || container.querySelector('.category-add-btn')) return

    const btn = document.createElement('a')
    btn.className = 'category-add-btn'
    btn.href = '/write/?category=' + encodeURIComponent(category)
    btn.innerHTML = '<i class="fas fa-pen-nib"></i> 在「' + category + '」分类写文章'

    const title = container.querySelector('.article-sort-title')
    if (title) {
      title.insertAdjacentElement('afterend', btn)
    } else {
      container.insertBefore(btn, container.firstChild)
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildSubMenu()
    buildCategoryButton()
  })

  // 兼容 pjax
  document.addEventListener('pjax:complete', () => {
    buildSubMenu()
    buildCategoryButton()
  })
})()

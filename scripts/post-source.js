/**
 * 站点级 Hexo 脚本：为「删除文章」功能注入数据
 *
 * 在渲染后的每个 HTML 页面的 </body> 前注入：
 * - window.SNOWTRACE_POST_MAP：{文章网址: 源文件路径} 全站清单（列表页据此加删除角标）
 * - window.SNOWTRACE_POST_SOURCE：当前文章的源文件路径（仅文章详情页）
 *
 * 注意：本过滤器跑在所有页面上，必须全程防御——任何异常都只记录警告、
 * 原样返回 HTML，绝不能影响正常渲染。
 */
'use strict'

hexo.extend.filter.register('after_render:html', function (html, data) {
  try {
    if (!html || typeof html !== 'string') return html
    if (!data || !data.page) return html

    const root = (hexo.config && hexo.config.root) || '/'

    // 全站文章清单：网址 → 源文件路径
    const map = {}
    const posts = hexo.locals.get('posts')
    if (posts && typeof posts.toArray === 'function') {
      posts.toArray().forEach(post => {
        const p = post.path || ''
        if (!p || !post.source) return
        const url = root + p.replace(/index\.html$/, '')
        map[url] = post.source
      })
    }

    let script = '<script>window.SNOWTRACE_POST_MAP=' + JSON.stringify(map) + ';'
    if (data.page.layout === 'post' && data.page.source) {
      script += 'window.SNOWTRACE_POST_SOURCE=' + JSON.stringify(data.page.source) + ';'
    }
    script += '<\/script>'

    if (html.indexOf('</body>') !== -1) {
      return html.replace('</body>', script + '</body>')
    }
    return html
  } catch (err) {
    hexo.log.warn('[post-source] 注入失败，已跳过：' + (err && err.message ? err.message : err))
    return html
  }
})

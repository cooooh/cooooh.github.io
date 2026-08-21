/**
 * Snowtrace 音乐页脚本
 * 1. 在 #music-player 中创建网易云播放器（歌单 ID 在下方 data-id 处修改）
 * 2. 黑胶唱片联动：播放时旋转发光，暂停时停下，封面跟随当前歌曲
 */
;(() => {
  'use strict'

  const stage = document.querySelector('.music-stage')
  if (!stage) return

  // ---- 1. 创建播放器 ----
  const player = document.createElement('meting-js')
  player.className = 'aplayer'
  player.setAttribute('data-server', 'netease')
  player.setAttribute('data-type', 'playlist')
  player.setAttribute('data-id', '2338560987')
  player.setAttribute('data-api', 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r')
  player.setAttribute('data-fixed', 'false')
  player.setAttribute('data-mini', 'false')
  player.setAttribute('data-autoplay', 'false')
  player.setAttribute('data-order', 'list')
  player.setAttribute('data-preload', 'auto')
  player.setAttribute('data-volume', '0.7')
  player.setAttribute('data-theme', '#49b1f5')
  player.setAttribute('data-loop', 'all')
  player.setAttribute('data-listfolded', 'false')
  player.setAttribute('data-listmaxheight', '420px')
  player.setAttribute('data-lrctype', '0')
  player.setAttribute('data-mutex', 'true')
  document.getElementById('music-player').appendChild(player)

  // ---- 2. 唱片联动 ----
  const vinyl = document.querySelector('.vinyl')
  const cover = document.querySelector('.vinyl-cover')

  const applyCover = audio => {
    if (audio && audio.pic) cover.src = audio.pic
  }

  let tries = 0
  const timer = setInterval(() => {
    const ap = window.aplayers && window.aplayers[0]
    if (ap) {
      clearInterval(timer)

      ap.on('play', () => vinyl.classList.add('playing'))
      ap.on('pause', () => vinyl.classList.remove('playing'))
      ap.on('listswitch', data => {
        // APlayer 不同版本事件参数略有差异，兼容处理
        if (!data) return
        if (typeof data === 'number') return applyCover(ap.list.audios[data])
        if (data.audio) return applyCover(data.audio)
        if (data.index !== undefined) return applyCover(ap.list.audios[data.index])
      })

      const current = ap.list && ap.list.audios && ap.list.audios[ap.list.index]
      applyCover(current)
    } else if (++tries > 60) {
      clearInterval(timer)
    }
  }, 250)
})()

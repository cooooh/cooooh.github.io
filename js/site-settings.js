/* Snowtrace 个人设置
 * 功能：在「关于」页的「个人设置」卡片中更换头像 / 首页背景
 * 原理：图片压缩后保存在浏览器 localStorage 中，每次打开页面自动应用
 * 说明：设置只对当前浏览器生效；想让所有访问者看到，请替换仓库中的图片文件
 */
(function () {
  'use strict'

  var LS_AVATAR = 'snowtrace.avatar'
  var LS_HOMEBG = 'snowtrace.homeBg'
  var DEFAULT_AVATAR = '/img/avatar.svg'

  function qsa (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel))
  }

  function isHome () {
    var p = location.pathname
    return p === '/' || /^\/page\/\d+\/?$/.test(p)
  }

  /* ---------- 头像 ---------- */

  function avatarImgs () {
    // 主题里的侧边栏头像（桌面侧栏 + 手机菜单）以及设置面板里的预览图
    return qsa('img[alt="avatar"]').concat(qsa('#settings-avatar-preview'))
  }

  function applyAvatar () {
    var url = localStorage.getItem(LS_AVATAR)
    if (!url) return
    avatarImgs().forEach(function (img) {
      if (!img.dataset.origSrc) img.dataset.origSrc = img.getAttribute('src') || ''
      img.src = url
    })
  }

  function resetAvatar () {
    localStorage.removeItem(LS_AVATAR)
    avatarImgs().forEach(function (img) {
      if (img.dataset.origSrc) {
        img.src = img.dataset.origSrc
        delete img.dataset.origSrc
      }
    })
  }

  /* ---------- 首页背景 ---------- */

  function bgLayer () {
    var el = document.getElementById('snowtrace-home-bg')
    if (!el) {
      el = document.createElement('div')
      el.id = 'snowtrace-home-bg'
      document.body.appendChild(el)
    }
    return el
  }

  function removeBgLayer () {
    var el = document.getElementById('snowtrace-home-bg')
    if (el) el.parentNode.removeChild(el)
  }

  function applyHomeBg () {
    if (!isHome()) return
    var url = localStorage.getItem(LS_HOMEBG)
    if (!url) return
    var header = document.getElementById('page-header')
    if (header) {
      if (header.dataset.origBg === undefined) {
        header.dataset.origBg = header.getAttribute('style') || ''
      }
      // 让首页顶部区域变透明，透出下方的自定义背景层
      header.style.background = 'none'
    }
    bgLayer().style.backgroundImage = 'url("' + url + '")'
  }

  function resetHomeBg () {
    localStorage.removeItem(LS_HOMEBG)
    removeBgLayer()
    var header = document.getElementById('page-header')
    if (header && header.dataset.origBg !== undefined) {
      header.setAttribute('style', header.dataset.origBg)
      delete header.dataset.origBg
    }
  }

  /* ---------- 设置面板（仅在关于页存在） ---------- */

  function setStatus (id, text) {
    var el = document.getElementById(id)
    if (!el) return
    el.textContent = text
    el.classList.add('show')
    clearTimeout(el._timer)
    el._timer = setTimeout(function () { el.classList.remove('show') }, 3000)
  }

  // 读取并压缩图片：缩小尺寸、转成 JPEG，避免撑爆浏览器存储
  function loadFile (file, opts, cb) {
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      cb(new Error('图片太大，请选择 15MB 以内的图片'))
      return
    }
    var reader = new FileReader()
    reader.onload = function (e) {
      var img = new Image()
      img.onload = function () {
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        var w, h
        if (opts.square) {
          // 头像：取中间正方形区域裁剪
          var s = Math.min(img.width, img.height)
          w = h = Math.min(opts.maxW, s)
          canvas.width = w
          canvas.height = h
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, w, h)
        } else {
          var scale = Math.min(1, opts.maxW / img.width)
          w = Math.max(1, Math.round(img.width * scale))
          h = Math.max(1, Math.round(img.height * scale))
          canvas.width = w
          canvas.height = h
          ctx.drawImage(img, 0, 0, w, h)
        }
        cb(null, canvas.toDataURL('image/jpeg', opts.quality || 0.85))
      }
      img.onerror = function () { cb(new Error('无法读取该图片，请换一张试试')) }
      img.src = e.target.result
    }
    reader.onerror = function () { cb(new Error('读取文件失败')) }
    reader.readAsDataURL(file)
  }

  function saveOrWarn (key, value, statusId) {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (e) {
      setStatus(statusId, '保存失败：浏览器存储空间不足')
      return false
    }
  }

  function initPanel () {
    var card = document.getElementById('site-settings')
    if (!card) return

    var avatarPreview = document.getElementById('settings-avatar-preview')
    var bgPreview = document.getElementById('settings-bg-preview')
    var avatarFile = document.getElementById('settings-avatar-file')
    var bgFile = document.getElementById('settings-bg-file')
    var pending = { avatar: null, bg: null }

    // 打开页面时回显当前已保存的设置
    var savedAvatar = localStorage.getItem(LS_AVATAR)
    if (savedAvatar && avatarPreview) avatarPreview.src = savedAvatar
    var savedBg = localStorage.getItem(LS_HOMEBG)
    if (savedBg && bgPreview) {
      bgPreview.style.backgroundImage = 'url("' + savedBg + '")'
      bgPreview.classList.add('has-img')
    }

    if (avatarFile) {
      avatarFile.addEventListener('change', function () {
        loadFile(avatarFile.files[0], { square: true, maxW: 256, quality: 0.88 }, function (err, url) {
          if (err) { setStatus('settings-avatar-status', err.message); return }
          pending.avatar = url
          if (avatarPreview) avatarPreview.src = url
          setStatus('settings-avatar-status', '已选好，点击「应用」生效')
        })
      })
    }

    if (bgFile) {
      bgFile.addEventListener('change', function () {
        loadFile(bgFile.files[0], { maxW: 1920, quality: 0.82 }, function (err, url) {
          if (err) { setStatus('settings-bg-status', err.message); return }
          pending.bg = url
          if (bgPreview) {
            bgPreview.style.backgroundImage = 'url("' + url + '")'
            bgPreview.classList.add('has-img')
          }
          setStatus('settings-bg-status', '已选好，点击「应用」生效')
        })
      })
    }

    var avatarApply = document.getElementById('settings-avatar-apply')
    if (avatarApply) {
      avatarApply.addEventListener('click', function () {
        if (!pending.avatar) { setStatus('settings-avatar-status', '请先选择一张图片'); return }
        if (!saveOrWarn(LS_AVATAR, pending.avatar, 'settings-avatar-status')) return
        applyAvatar()
        setStatus('settings-avatar-status', '头像已应用 ✓')
      })
    }

    var avatarReset = document.getElementById('settings-avatar-reset')
    if (avatarReset) {
      avatarReset.addEventListener('click', function () {
        pending.avatar = null
        resetAvatar()
        if (avatarPreview) avatarPreview.src = DEFAULT_AVATAR
        if (avatarFile) avatarFile.value = ''
        setStatus('settings-avatar-status', '已恢复默认头像')
      })
    }

    var bgApply = document.getElementById('settings-bg-apply')
    if (bgApply) {
      bgApply.addEventListener('click', function () {
        if (!pending.bg) { setStatus('settings-bg-status', '请先选择一张图片'); return }
        if (!saveOrWarn(LS_HOMEBG, pending.bg, 'settings-bg-status')) return
        applyHomeBg()
        setStatus('settings-bg-status', '背景已应用，回首页看看效果吧 ✓')
      })
    }

    var bgReset = document.getElementById('settings-bg-reset')
    if (bgReset) {
      bgReset.addEventListener('click', function () {
        pending.bg = null
        resetHomeBg()
        if (bgPreview) {
          bgPreview.style.backgroundImage = ''
          bgPreview.classList.remove('has-img')
        }
        if (bgFile) bgFile.value = ''
        setStatus('settings-bg-status', '已恢复默认背景')
      })
    }
  }

  /* ---------- 启动 ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    applyAvatar()
    applyHomeBg()
    initPanel()
  })

  // 兼容 pjax（当前未开启，开启后也无需改动）
  document.addEventListener('pjax:complete', function () {
    applyAvatar()
    applyHomeBg()
    initPanel()
  })
})()

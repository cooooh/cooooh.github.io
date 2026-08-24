/**
 * Snowtrace GitHub 登录中转服务（Node.js 版，可用 Render 等免费平台托管）
 * 接口与 relay/worker.js 完全一致：POST /device 和 POST /token
 * 零依赖，Node 18+ 自带 fetch。
 *
 * 部署（Render 免费版）：
 * 1. 把 relay/ 目录上传到你的 GitHub 仓库
 * 2. render.com 注册登录 → New → Web Service → 连接该仓库
 * 3. Start Command 填：node server.js
 * 4. 部署后把网址发给网站作者，填入 source/js/post-editor.js 的 RELAY_URL
 */

const http = require('http')

const CLIENT_ID = 'REPLACE_ME' // GitHub OAuth App 的 Client ID
const SCOPE = 'public_repo'
const ALLOW_ORIGIN = 'https://snowtrace.top'

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  let raw = ''
  for await (const chunk of req) raw += chunk
  let json = {}
  try { json = JSON.parse(raw || '{}') } catch (e) {}

  try {
    if (req.url === '/device') {
      const upstream = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE })
      })
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
      res.end(await upstream.text())
      return
    }

    if (req.url === '/token') {
      const upstream = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: json.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      })
      res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
      res.end(await upstream.text())
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not_found' }))
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'relay_error', message: String(e) }))
  }
})

server.listen(process.env.PORT || 3000)

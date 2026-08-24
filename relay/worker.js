/**
 * Snowtrace GitHub 登录中转服务（Cloudflare Workers 版）
 *
 * 为什么需要它：GitHub 不允许浏览器直接调用 OAuth 设备流接口（CORS 限制），
 * 必须由一个小服务代为转发。本服务只做「转发」，不存储任何数据、不需要任何密钥
 * （设备流不需要 client_secret）。
 *
 * 部署步骤（一次性）：
 * 1. 注册/登录 Cloudflare（免费）→ 左侧 Workers & Pages → Create → Create Worker
 * 2. 随便起个名字 → Deploy
 * 3. 点 Edit code，把本文件全部内容粘贴进去
 * 4. 把下面 REPLACE_ME 换成你在 GitHub OAuth App 里拿到的 Client ID
 * 5. 点右上角 Deploy，记下该 Worker 的网址（形如 https://xxx.你的用户名.workers.dev）
 * 6. 把网址发给网站作者，填入 source/js/post-editor.js 的 RELAY_URL
 */

const CLIENT_ID = 'REPLACE_ME' // GitHub OAuth App 的 Client ID
const SCOPE = 'public_repo'     // 只需要写公开仓库的权限
const ALLOW_ORIGIN = 'https://snowtrace.top' // 只允许我们的网站跨域调用

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

async function handleRequest (request) {
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    if (url.pathname === '/device') {
      // 第一步：向 GitHub 申请设备码（返回 user_code 给用户去授权）
      const upstream = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE })
      })
      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (url.pathname === '/token') {
      // 第二步：轮询换取 access_token（前端定时来问「用户授权了吗」）
      const body = await request.json().catch(() => ({}))
      const upstream = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: body.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      })
      return new Response(await upstream.text(), {
        status: upstream.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'relay_error', message: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

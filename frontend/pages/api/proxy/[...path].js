// simple proxy handler for frontend dev - create file frontend/pages/api/proxy/[...path].js
export default async function handler(req, res){
  // Proxy to backend on localhost:8000 during dev. In production configure NEXT_PUBLIC_API_URL
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const path = req.query.path.join('/')
  const url = `${base}/${path}`
  const fetchRes = await fetch(url, { method: req.method, headers: req.headers, body: req.method==='GET' ? undefined : req.body })
  const data = await fetchRes.text()
  res.status(fetchRes.status).send(data)
}

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/api/proxy/auth/login', { email, password: pass })
      setMsg('Logged in')
      // Save token if backend returns it
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (err) {
      setMsg('Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl">Login</h1>
        <form onSubmit={submit} className="mt-4 bg-gray-800 p-4 rounded">
          <label className="block">Email</label>
          <input
            className="w-full p-2 mt-1 rounded bg-gray-700"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label className="block mt-3">Password</label>
          <input
            type="password"
            className="w-full p-2 mt-1 rounded bg-gray-700"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded">Login</button>
        </form>
        {msg && <p className="mt-3 text-green-300">{msg}</p>}
      </div>
    </div>
  )
}

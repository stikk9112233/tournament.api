import {useState} from 'react'
import axios from 'axios'
import {useRouter} from 'next/router'

export default function JoinPage(){
  const router = useRouter()
  const {tid} = router.query
  const [userId, setUserId] = useState('')
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')

  const submit = async (e)=>{
    e.preventDefault()
    if(!userId || !file){ setMsg('Please enter your user id and upload payment proof'); return }
    const form = new FormData()
    form.append('user_id', userId)
    form.append('file', file)
    try{
      const res = await axios.post(`/api/proxy/tournaments/${tid}/join`, form, { headers: {'Content-Type':'multipart/form-data'} })
      setMsg('Uploaded. '+res.data.message)
    }catch(err){ setMsg('Upload failed') }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl">Join Tournament {tid}</h1>
        <p className="text-gray-400">Scan the organizer UPI QR and pay. Upload screenshot below.</p>
        <form onSubmit={submit} className="mt-4 bg-gray-800 p-4 rounded">
          <label className="block">Your user id (from profile)</label>
          <input className="w-full p-2 mt-1 rounded bg-gray-700" value={userId} onChange={e=>setUserId(e.target.value)} />
          <label className="block mt-3">Upload payment screenshot</label>
          <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-1" />
          <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded">Upload & Request Join</button>
        </form>
        {msg && <p className="mt-3 text-green-300">{msg}</p>}
      </div>
    </div>
  )
}

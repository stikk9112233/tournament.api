import {useState} from 'react'
import axios from 'axios'

export default function Support(){
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')

  const submit = async (e)=>{
    e.preventDefault()
    if(!subject || !message){ setMsg('Please fill subject and message'); return }
    const form = new FormData()
    form.append('email', email)
    form.append('phone', phone)
    form.append('subject', subject)
    form.append('message', message)
    if(file) form.append('file', file)
    try{
      const res = await axios.post('/api/proxy/support/ticket', form, { headers: {'Content-Type':'multipart/form-data'} })
      setMsg('Ticket created. ID: '+res.data.ticket_id)
      setSubject(''); setMessage(''); setFile(null)
    }catch(err){ setMsg('Failed to create ticket') }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded">
        <h1 className="text-2xl">Support / Contact</h1>
        <p className="text-gray-400">Describe your issue and attach screenshots (optional). Our support will respond within 24-48 hours.</p>
        <form onSubmit={submit} className="mt-4">
          <input className="w-full p-2 mt-2 bg-gray-700 rounded" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full p-2 mt-2 bg-gray-700 rounded" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
          <input className="w-full p-2 mt-2 bg-gray-700 rounded" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
          <textarea className="w-full p-2 mt-2 bg-gray-700 rounded" placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
          <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-2" />
          <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded">Send Ticket</button>
        </form>
        {msg && <p className="mt-3 text-green-300">{msg}</p>}
        <div className="mt-4 text-sm text-gray-400">
          <p>Emergency / WhatsApp: <a className="text-blue-300" href={process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '#'} target="_blank">Contact</a></p>
        </div>
      </div>
    </div>
  )
}

import useSWR from 'swr'
import Link from 'next/link'
import axios from 'axios'

const fetcher = url => axios.get(url).then(r=>r.data)

export default function Tournaments(){
  const {data, error} = useSWR('/api/proxy/tournaments', fetcher)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        {!data && <p>Loading...</p>}
        {data && data.length===0 && <p className="mt-4">No tournaments yet.</p>}
        {data && data.map(t=> (
          <div key={t.id} className="mt-4 p-4 bg-gray-800 rounded">
            <h2 className="font-semibold">{t.title}</h2>
            <p>Mode: {t.mode} • Entry: ₹{t.entry_fee}</p>
            <div className="mt-2">
              <Link href={`/tournaments/${t.id}`}><a className="px-3 py-1 bg-yellow-400 text-black rounded">View / Join</a></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

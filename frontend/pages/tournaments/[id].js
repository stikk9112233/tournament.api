import axios from 'axios'
import {useRouter} from 'next/router'
export default function TournamentDetail(){
  const router = useRouter()
  const {id} = router.query
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl">Tournament {id}</h1>
        <p className="text-gray-400">Details will load from backend.</p>
        <div className="mt-4">
          <a href={`/join?tid=${id}`} className="px-3 py-1 bg-green-500 rounded">Join (Manual UPI)</a>
        </div>
      </div>
    </div>
  )
}

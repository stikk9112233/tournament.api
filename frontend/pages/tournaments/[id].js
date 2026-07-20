import {useRouter} from 'next/router'

export default function TournamentDetail(){
  const router = useRouter()
  const {id} = router.query
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl">Tournament {id}</h1>
        <p className="mt-2 text-gray-300">Details and join button here.</p>
      </div>
    </div>
  )
}

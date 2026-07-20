// frontend: simple landing page
import Link from 'next/link'

export default function Home(){
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold">BattleBounty - Tournament</h1>
        <p className="mt-2 text-gray-300">Join Free Fire style tournaments. Manual UPI payments: upload proof and wait for admin approval.</p>
        <div className="mt-6 flex gap-4">
          <Link href="/tournaments"><a className="px-4 py-2 bg-yellow-400 text-black rounded">Browse Tournaments</a></Link>
          <Link href="/login"><a className="px-4 py-2 border border-white rounded">Login</a></Link>
        </div>
      </div>
    </div>
  )
}

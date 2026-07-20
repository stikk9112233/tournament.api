import Link from 'next/link'

export default function Tournaments(){
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl">Tournaments</h1>
        <p className="mt-2 text-gray-300">List of tournaments will appear here.</p>
        <ul className="mt-4 space-y-2">
          <li><Link href="/tournaments/1"><a className="text-yellow-400">Tournament 1</a></Link></li>
        </ul>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApiPlayground() {
  const [apiKey, setApiKey] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    router.push(`/protected?key=${apiKey}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Key Playground</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label htmlFor="apiKey" className="block mb-2">
            Enter API Key
          </label>
          <input
            type="text"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded text-gray-800"
            placeholder="Enter your API key"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Validate Key
        </button>
      </form>
    </div>
  )
} 
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { validateApiKey } from '@/services/apiKeyOperations'

export default function ProtectedPage() {
  const searchParams = useSearchParams()
  const [validationStatus, setValidationStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkApiKey = async () => {
      const key = searchParams.get('key')
      if (!key) {
        setValidationStatus({ isValid: false, message: 'No API key provided' })
        setIsLoading(false)
        return
      }

      try {
        const { isValid } = await validateApiKey(key)
        setValidationStatus({
          isValid,
          message: isValid 
            ? 'Valid API key, /protected can be accessed' 
            : 'Invalid API Key'
        })
      } catch (error) {
        setValidationStatus({ 
          isValid: false, 
          message: 'Error validating API key' 
        })
      }
      setIsLoading(false)
    }

    checkApiKey()
  }, [searchParams])

  if (isLoading) {
    return <div className="p-6">Validating API key...</div>
  }

  return (
    <div className="p-6">
      {validationStatus && (
        <div
          className={`p-4 rounded ${
            validationStatus.isValid 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}
        >
          {validationStatus.message}
        </div>
      )}
    </div>
  )
} 
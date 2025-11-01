"use client"

import { useState, useEffect } from "react"
import type { AxiosError } from "axios"

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: AxiosError) => void
  retryCount?: number
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: AxiosError | null
  refetch: () => Promise<void>
}

export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AxiosError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const refetch = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result)
      options.onSuccess?.(result)
    } catch (err: any) {
      setError(err)
      options.onError?.(err)

    
      if (retryCount < (options.retryCount || 0)) {
        setRetryCount(retryCount + 1)
        setTimeout(refetch, 1000 * Math.pow(2, retryCount))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, loading, error, refetch }
}

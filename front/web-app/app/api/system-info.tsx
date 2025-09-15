'use client'
import useSWR from 'swr'
import { apiFetcher } from '../../lib/api-utils'

// Custom hook for system info using SWR
export function useSystemInfo(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/v1/system/info' : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 1000,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}

// Component for backward compatibility
export default function SystemInfo() {
  const { data, error, isLoading } = useSystemInfo()

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  console.log(data)

  return <div>hello {data?.version}!</div>
}
'use client'
import useSWR from 'swr'
import { apiFetcher } from '../../lib/api-utils'

export function useWifiScan() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/v1/wifi/scan',
        apiFetcher
    )

    return {
        networks: data?.networks || [],
        count: data?.count || 0,
        isLoading,
        error,
        mutate,
    }
}

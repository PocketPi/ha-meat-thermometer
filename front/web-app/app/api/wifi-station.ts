'use client'
import useSWR from 'swr'
import { apiFetcher, apiPostFetcher } from '../../lib/api-utils'

// Types for WiFi station data
export interface WiFiStationInfo {
  ssid: string
}

export interface WiFiCredentials {
  ssid: string
  password: string
}

// Hook for fetching current WiFi station info
export function useWiFiStationInfo(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/v1/wifi/station' : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  )

  return {
    data: data as WiFiStationInfo | undefined,
    error,
    isLoading,
    mutate,
  }
}

// Hook for setting WiFi credentials
export function useSetWiFiCredentials() {
  const setCredentials = async (credentials: WiFiCredentials) => {
    try {
      const response = await apiPostFetcher('/api/v1/wifi/credentials', credentials)
      return response
    } catch (error) {
      console.error('Failed to set WiFi credentials:', error)
      throw error
    }
  }

  return { setCredentials }
}

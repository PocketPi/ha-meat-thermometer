'use client'
import useSWR from 'swr'
import { apiFetcher, apiPostFetcher } from '../../lib/api-utils'

// Types for temperature data
export interface TemperatureData {
  temp_0: number
  temp_1: number
  temp_2: number
  temp_3: number
  temp_0_target: number
  temp_1_target: number
  temp_2_target: number
  temp_3_target: number
}

export interface TemperatureTargets {
  temp_0: number
  temp_1: number
  temp_2: number
  temp_3: number
}

// Hook for fetching current temperature data
export function useTemperatureData(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/v1/temp/current' : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 1000, // Refresh every 1 second
    }
  )

  return {
    data: data as TemperatureData | undefined,
    error,
    isLoading,
    mutate,
  }
}

// Hook for setting temperature targets
export function useSetTemperatureTargets() {
  const setTargets = async (targets: TemperatureTargets) => {
    try {
      const response = await apiPostFetcher('/api/v1/temp/target', targets)
      return response
    } catch (error) {
      console.error('Failed to set temperature targets:', error)
      throw error
    }
  }

  return { setTargets }
}

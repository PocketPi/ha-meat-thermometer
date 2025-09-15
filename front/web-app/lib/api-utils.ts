// Generic API utilities for SWR data fetching

export interface ApiResponse<T = unknown> {
  data?: T
  error?: Error
  isLoading: boolean
  mutate: () => void
}

// Generic fetcher function for SWR
export const apiFetcher = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Add timeout to prevent hanging
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Generic POST fetcher for API calls
export const apiPostFetcher = async (url: string, data: unknown, options: RequestInit = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Generic PUT fetcher for API calls
export const apiPutFetcher = async (url: string, data: unknown, options: RequestInit = {}) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Generic DELETE fetcher for API calls
export const apiDeleteFetcher = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000), // 10 second timeout
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

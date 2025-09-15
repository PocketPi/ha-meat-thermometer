# API Utilities

This directory contains generic utilities for making API calls in the application.

## Files

- `api-utils.ts` - Generic fetcher functions for different HTTP methods
- `api-hooks-template.ts` - Template for creating API hooks using the utilities

## Usage

### Generic Fetchers

The `api-utils.ts` file provides generic fetcher functions that can be used with SWR:

```typescript
import { apiFetcher, apiPostFetcher, apiPutFetcher, apiDeleteFetcher } from '../lib/api-utils'

// GET request
const { data, error, isLoading } = useSWR('/api/endpoint', apiFetcher)

// POST request
const result = await apiPostFetcher('/api/endpoint', { key: 'value' })

// PUT request
const result = await apiPutFetcher('/api/endpoint/123', { key: 'updated' })

// DELETE request
const result = await apiDeleteFetcher('/api/endpoint/123')
```

### Features

- **Timeout handling**: All requests have a 10-second timeout
- **Error handling**: Consistent error handling across all requests
- **TypeScript support**: Fully typed for better development experience
- **SWR integration**: Works seamlessly with SWR for data fetching

### Creating API Hooks

Use the template in `api-hooks-template.ts` to create new API hooks:

1. Copy the template
2. Replace `Example` with your endpoint name
3. Update the API endpoint URLs
4. Customize the SWR options as needed

### Example: WiFi Scan Hook

```typescript
'use client'
import useSWR from 'swr'
import { apiFetcher } from '../lib/api-utils'

export function useWifiScan(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/wifi-scan' : null,
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
```

### Benefits

- **Consistency**: All API calls use the same error handling and timeout logic
- **Reusability**: Generic functions can be used across different endpoints
- **Maintainability**: Centralized API logic makes updates easier
- **Type Safety**: TypeScript support prevents runtime errors

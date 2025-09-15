// Template for creating API hooks using the generic utilities
// Copy this template and modify for your specific API endpoints

'use client'
import useSWR from 'swr'
import { apiFetcher, apiPostFetcher, apiPutFetcher, apiDeleteFetcher } from '../../lib/api-utils'

// Example: GET endpoint hook
export function useExampleData(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/example' : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      errorRetryCount: 2,
    }
  )

  return {
    data: data || null,
    error,
    isLoading,
    mutate,
  }
}

// Example: POST endpoint hook
export function useCreateExample() {
  const createExample = async (data: unknown) => {
    try {
      const result = await apiPostFetcher('/api/example', data)
      return result
    } catch (error) {
      throw error
    }
  }

  return { createExample }
}

// Example: PUT endpoint hook
export function useUpdateExample() {
  const updateExample = async (id: string, data: unknown) => {
    try {
      const result = await apiPutFetcher(`/api/example/${id}`, data)
      return result
    } catch (error) {
      throw error
    }
  }

  return { updateExample }
}

// Example: DELETE endpoint hook
export function useDeleteExample() {
  const deleteExample = async (id: string) => {
    try {
      const result = await apiDeleteFetcher(`/api/example/${id}`)
      return result
    } catch (error) {
      throw error
    }
  }

  return { deleteExample }
}

// Example: Combined CRUD hook
export function useExampleCRUD() {
  const { data, error, isLoading, mutate } = useSWR('/api/example', apiFetcher)
  const { createExample } = useCreateExample()
  const { updateExample } = useUpdateExample()
  const { deleteExample } = useDeleteExample()

  const handleCreate = async (newData: unknown) => {
    const result = await createExample(newData)
    mutate() // Refresh the data
    return result
  }

  const handleUpdate = async (id: string, updatedData: unknown) => {
    const result = await updateExample(id, updatedData)
    mutate() // Refresh the data
    return result
  }

  const handleDelete = async (id: string) => {
    const result = await deleteExample(id)
    mutate() // Refresh the data
    return result
  }

  return {
    data: data || [],
    error,
    isLoading,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    refresh: mutate,
  }
}

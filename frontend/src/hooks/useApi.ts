import { useState, useEffect, useCallback } from 'react'
import type { AxiosError } from 'axios'
import api from '../services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(url: string | null, deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })

  const fetchData = useCallback(async () => {
    if (!url) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { data } = await api.get<T>(url)
      setState({ data, loading: false, error: null })
    } catch (err) {
      const message = (err as AxiosError<{ message?: string }>).response?.data?.message
      setState({ data: null, loading: false, error: message ?? 'Erro ao carregar dados' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

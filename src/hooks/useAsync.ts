import { useCallback, useEffect, useState } from 'react'

type Settled<T> =
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

export type AsyncState<T> = { status: 'loading' } | Settled<T>


export function useAsync<T>(load: () => Promise<T>) {
  const [settled, setSettled] = useState<{
    load: () => Promise<T>
    attempt: number
    result: Settled<T>
  } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false 

    load()
      .then((data) => {
        if (!cancelled) {
          setSettled({ load, attempt, result: { status: 'success', data } })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSettled({
            load,
            attempt,
            result: {
              status: 'error',
              error: error instanceof Error ? error : new Error(String(error)),
            },
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const state: AsyncState<T> =
    settled && settled.load === load && settled.attempt === attempt
      ? settled.result
      : { status: 'loading' }

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { state, retry }
}
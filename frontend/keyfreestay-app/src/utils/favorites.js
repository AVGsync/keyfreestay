import { useEffect, useState, useCallback } from 'react'

const KEY = 'keyfreestay:favorites'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function write(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {}
}

export function useFavorites() {
  const [ids, setIds] = useState(read)

  useEffect(() => {
    const h = () => setIds(read())
    window.addEventListener('storage', h)
    return () => window.removeEventListener('storage', h)
  }, [])

  const toggle = useCallback((id) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      write(next)
      return next
    })
  }, [])

  const has = useCallback((id) => ids.includes(id), [ids])
  return { ids, has, toggle }
}

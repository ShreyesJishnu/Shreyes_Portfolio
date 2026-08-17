import { useCallback, useEffect, useState } from 'react'

const KEY = 'sj:visited'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    // private mode / storage disabled — the site still works, it just forgets
    return new Set()
  }
}

// Which projects the visitor has actually opened. Persisted, because a map that
// resets every reload records nothing worth showing.
export function useVisited() {
  const [visited, setVisited] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...visited]))
    } catch {
      // ignore: nothing here is worth breaking the page for
    }
  }, [visited])

  const markVisited = useCallback((slug) => {
    setVisited((prev) => {
      if (prev.has(slug)) return prev // same reference, no re-render
      const next = new Set(prev)
      next.add(slug)
      return next
    })
  }, [])

  return { visited, markVisited }
}

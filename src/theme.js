import { useCallback, useEffect, useState } from 'react'

const KEY = 'sj:theme'

const systemLight =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)') : null

function stored() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    // private mode: the site still works, it just forgets the choice
    return null
  }
}

// Theme resolves in two layers: the visitor's own choice wins, and until they
// make one the OS preference decides. Storing only an explicit choice is what
// keeps "follow the system" a real state rather than a snapshot of it.
export function useTheme() {
  const [choice, setChoice] = useState(stored)
  const [prefersLight, setPrefersLight] = useState(() => Boolean(systemLight?.matches))

  useEffect(() => {
    if (!systemLight) return
    const onChange = (e) => setPrefersLight(e.matches)
    systemLight.addEventListener('change', onChange)
    return () => systemLight.removeEventListener('change', onChange)
  }, [])

  const theme = choice ?? (prefersLight ? 'light' : 'dark')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    // tells the browser which form to draw scrollbars and form controls in
    root.style.colorScheme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setChoice((prev) => {
      const current = prev ?? (systemLight?.matches ? 'light' : 'dark')
      const next = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        // ignore: a forgotten preference is not worth breaking the page for
      }
      return next
    })
  }, [])

  return { theme, toggle }
}

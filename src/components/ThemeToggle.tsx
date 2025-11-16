'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true) // Default to dark mode
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const shouldBeDark = saved ? saved === 'dark' : true // Default to dark if no preference saved
    setDark(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    console.log('Theme toggled:', next ? 'dark' : 'light')
    console.log('HTML classList:', document.documentElement.classList)
  }
  return (
    <button 
      onClick={toggle} 
      className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-white/80 dark:bg-gray-800/90 border border-brand-gray-200 dark:border-gray-600 rounded-data text-sm font-sans text-brand-primary dark:text-white backdrop-blur-sm transition-all hover:scale-105"
      aria-label="Toggle dark mode"
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}

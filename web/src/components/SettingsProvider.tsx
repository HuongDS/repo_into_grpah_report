'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type NavPosition = 'top' | 'bottom' | 'left' | 'right'

interface SettingsContextType {
  navPosition: NavPosition
  setNavPosition: (pos: NavPosition) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [navPosition, setNavPosition] = useState<NavPosition>('top')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('navPosition') as NavPosition | null
    if (stored && ['top', 'bottom', 'left', 'right'].includes(stored)) {
      setNavPosition(stored)
    }
  }, [])

  const handleSetNavPosition = (pos: NavPosition) => {
    setNavPosition(pos)
    localStorage.setItem('navPosition', pos)
  }

  return (
    <SettingsContext.Provider value={{ navPosition: mounted ? navPosition : 'top', setNavPosition: handleSetNavPosition }}>
      <div className={`min-h-screen transition-all duration-300 ${
        mounted ? (
          navPosition === 'top' ? 'pt-24' :
          navPosition === 'bottom' ? 'pb-28' :
          navPosition === 'left' ? 'pl-20 md:pl-28' :
          navPosition === 'right' ? 'pr-20 md:pr-28' : 'pt-24'
        ) : 'pt-24'
      }`}>
        {children}
      </div>
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}

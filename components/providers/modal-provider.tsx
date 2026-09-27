'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ModalContextType = {
  commandMenuOpen: boolean
  setCommandMenuOpen: (open: boolean) => void
  architectureModalOpen: boolean
  setArchitectureModalOpen: (open: boolean) => void
  openArchitectureModal: () => void
  openCommandMenu: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

export function SystemModalProvider({ children }: { children: ReactNode }) {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandMenuOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const openArchitectureModal = () => {
    setCommandMenuOpen(false)
    setArchitectureModalOpen(true)
  }

  const openCommandMenu = () => {
    setArchitectureModalOpen(false)
    setCommandMenuOpen(true)
  }

  return (
    <ModalContext.Provider
      value={{
        commandMenuOpen,
        setCommandMenuOpen,
        architectureModalOpen,
        setArchitectureModalOpen,
        openArchitectureModal,
        openCommandMenu,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useSystemModals() {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    return {
      commandMenuOpen: false,
      setCommandMenuOpen: () => {},
      architectureModalOpen: false,
      setArchitectureModalOpen: () => {},
      openArchitectureModal: () => {},
      openCommandMenu: () => {},
    }
  }
  return ctx
}

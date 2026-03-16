import React, { createContext, useContext, useState, useEffect } from 'react'

const StockThresholdContext = createContext()

export function StockThresholdProvider({ children }){
  const [threshold, setThreshold] = useState(() => {
    const saved = localStorage.getItem('lowStockThreshold')
    return saved ? Number(saved) : 10
  })

  useEffect(() => {
    localStorage.setItem('lowStockThreshold', threshold)
  }, [threshold])

  return (
    <StockThresholdContext.Provider value={{ threshold, setThreshold }}>
      {children}
    </StockThresholdContext.Provider>
  )
}

export function useStockThreshold(){
  const ctx = useContext(StockThresholdContext)
  if(!ctx) throw new Error('useStockThreshold must be used within provider')
  return ctx
}

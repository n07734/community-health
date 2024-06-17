import { createContext, useContext, useState } from 'react'

const ThemeModeContext = createContext({});

export const ThemeModeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark')

  const toggleThemeMode = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')

  const values = { themeMode, toggleThemeMode }
  return (
    <ThemeModeContext.Provider value={values}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeModeContext)

import { createContext, useContext, useState } from 'react'

const SubPageProviderContext = createContext({});

export const SubPageProvider = ({ children }) => {
  const [showPvP, setPvP] = useState(false)
  const [userPage, setUser] = useState('')

  const togglePvPPage = () => {
      setPvP(!showPvP)
      setUser('')
  }
  const setUserPage = (user = '') => {
    setPvP(false)
    setUser(user)
  }
  const clearUserPage = () => {
    setPvP(false)
    setUser('')
  }

  const values = { showPvP, togglePvPPage, userPage, setUserPage, clearUserPage }
  return (
    <SubPageProviderContext.Provider value={values}>
      {children}
    </SubPageProviderContext.Provider>
  )
}

export const useSubPage = () => useContext(SubPageProviderContext)
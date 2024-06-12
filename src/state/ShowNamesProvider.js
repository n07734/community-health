import { createContext, useContext, useState } from 'react'

const ShowNamesContext = createContext({});

export const ShowNamesProvider = ({ children }) => {
  const [showNames, setShowNames] = useState(true)

  const toggleShowNames = () => setShowNames(!showNames)

  const values = { showNames, toggleShowNames }
  return (
    <ShowNamesContext.Provider value={values}>
      {children}
    </ShowNamesContext.Provider>
  )
}

export const useShowNames = () => useContext(ShowNamesContext)
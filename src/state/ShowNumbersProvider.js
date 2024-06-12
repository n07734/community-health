import { createContext, useContext, useState } from 'react'

const ShowNumbersContext = createContext({});

export const ShowNumbersProvider = ({ children }) => {
  const [showNumbers, setShowNumbers] = useState(true)

  const toggleShowNumbers = () => setShowNumbers(!showNumbers)

  const values = { showNumbers, toggleShowNumbers }
  return (
    <ShowNumbersContext.Provider value={values}>
      {children}
    </ShowNumbersContext.Provider>
  )
}

export const useShowNumbers = () => useContext(ShowNumbersContext)

import { createContext, useContext, useState, ReactNode } from 'react'

const ShowNumbersContext = createContext({});

export const ShowNumbersProvider = ({ children }:{ children: ReactNode }) => {
    const [showNumbers, setShowNumbers] = useState(true)

    const toggleShowNumbers = () => setShowNumbers(!showNumbers)

    const values = { showNumbers, toggleShowNumbers }
    return (
        <ShowNumbersContext.Provider value={values}>
            {children}
        </ShowNumbersContext.Provider>
    )
}

export const useShowNumbers = () => useContext(ShowNumbersContext) as { showNumbers: boolean, toggleShowNumbers: () => void }

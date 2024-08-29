import { createContext, useContext, useState, ReactNode } from 'react'

const ShowNamesContext = createContext({});

export const ShowNamesProvider = ({ children }:{ children: ReactNode }) => {
    const [showNames, setShowNames] = useState(true)

    const toggleShowNames = () => setShowNames(!showNames)

    const values = { showNames, toggleShowNames }
    return (
        <ShowNamesContext.Provider value={values}>
            {children}
        </ShowNamesContext.Provider>
    )
}

export const useShowNames = () => useContext(ShowNamesContext) as { showNames: boolean, toggleShowNames: () => void }
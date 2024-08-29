import { createContext, useContext, useState, ReactNode } from 'react'

const SubPageProviderContext = createContext({});

export const SubPageProvider = ({ children }: { children: ReactNode }) => {
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

    const values: {
    showPvP: boolean,
    togglePvPPage: () => void,
    userPage: string,
    setUserPage: (user: string) => void,
    clearUserPage: () => void
  } = { showPvP, togglePvPPage, userPage, setUserPage, clearUserPage }
    return (
        <SubPageProviderContext.Provider value={values}>
            {children}
        </SubPageProviderContext.Provider>
    )
}

export const useSubPage = () => useContext(SubPageProviderContext) as { showPvP: boolean, togglePvPPage: () => void,userPage: string, clearUserPage: () => void, setUserPage: (user: string) => void}
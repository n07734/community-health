import { createContext, useContext, useEffect, useState } from "react"

export type ThemeMode = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
}

type ThemeProviderState = {
  theme: ThemeMode
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
    theme: "dark",
    toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export const ThemeProvider = ({
    children,
    defaultTheme = "dark",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<ThemeMode>(
        () => (localStorage.getItem(storageKey) as ThemeMode) || defaultTheme,
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")
        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        toggleTheme: () => {
            const newTheme:ThemeMode = theme === 'dark' ? 'light' : 'dark'
            localStorage.setItem(storageKey, newTheme)
            setTheme(newTheme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
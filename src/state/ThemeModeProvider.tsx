import { createContext, useContext, useState, ReactNode, FC } from 'react';
import { PaletteMode } from '@mui/material'

type ThemeModeContextType = {
  themeMode: string;
  toggleThemeMode: () => void;
};
const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const ThemeModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<PaletteMode>('dark');

    const toggleThemeMode = () => setThemeMode(themeMode === 'dark' ? 'light' : 'dark');

    const values = { themeMode, toggleThemeMode };

    return <ThemeModeContext.Provider value={values}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = (): ThemeModeContextType => {
    const context = useContext(ThemeModeContext);
    if (context === undefined) {
        throw new Error('useThemeMode must be used within a ThemeModeProvider');
    }
    return context;
};
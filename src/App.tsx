import './app/globals.css'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { ThemeProvider as  ThemeProviderCN } from "@/components/ThemeProvider"

import { PaletteMode } from '@mui/material'

import { useThemeMode } from './state/ThemeModeProvider'

import Page from './components/home/Page'
import Loader from './components/Loader'
import theme from './theme'

import './fonts.css';

const App: React.FC = () => {
    const { themeMode } = useThemeMode()
    const resolvedTheme = theme(themeMode as PaletteMode)

    return (
        <ThemeProvider theme={resolvedTheme}>
            <StyledEngineProvider injectFirst>
                <ThemeProviderCN defaultTheme="dark" storageKey="vite-ui-theme">
                    <div className={themeMode}>
                        <Loader />
                        <Page />
                    </div>
                </ThemeProviderCN>
            </StyledEngineProvider>
        </ThemeProvider>
    );
};

export default App

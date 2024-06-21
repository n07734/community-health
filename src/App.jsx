import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { useThemeMode } from './state/ThemeModeProvider'

import Page from './components/home/Page'
import Loader from './components/Loader'
import theme from './theme'

import './fonts.css'

const App = () => {
    const { themeMode } = useThemeMode()
    const resolvedTheme = theme(themeMode);

    return (
        <ThemeProvider theme={resolvedTheme}>
            <StyledEngineProvider injectFirst>
                <Loader />
                <Page />
            </StyledEngineProvider>
        </ThemeProvider>
    )
}

export default App

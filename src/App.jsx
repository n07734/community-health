import { useEffect } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import { pathOr } from 'ramda'

import { useThemeMode } from './state/ThemeModeProvider'

import Page from './components/home/Page'
import Loader from './components/Loader'
import * as actions from './state/actions'
import theme from './theme'

import './fonts.css'

const App = ({
    setReposUserId,
} = {}) => {
    useEffect(() => {
        const quertString = pathOr('', ['location', 'search'], window)
        const urlParams = new URLSearchParams(quertString);
        const user = urlParams.get('user') || '';

        setReposUserId(user)
    }, [setReposUserId])

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

const mapDispatchToProps = dispatch => ({
    setReposUserId: (x) => dispatch(actions.setUser(x)),
})

export default connect(() => ({}),mapDispatchToProps)(App)

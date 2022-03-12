import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { pathOr } from 'ramda'

import theme from './theme'
import Page from './components/home/Page'
import Loader from './components/Loader'

import * as actions from './state/actions'

const App = ({ getPreFetchedData, themeType, setUser } = {}) => {
    useEffect(() => {
        const quertString = pathOr('', ['location', 'search'],window)
        const urlParams = new URLSearchParams(quertString);
        const repo = urlParams.get('repo') || 'react';
        const user = urlParams.get('user') || '';

        getPreFetchedData(repo)
        setUser(user)
    }, [getPreFetchedData, setUser])

    return (
        <MuiThemeProvider theme={theme(themeType)}>
            <Loader />
            <Page />
        </MuiThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    themeType: state.themeType,
})

const mapDispatchToProps = dispatch => ({
    getPreFetchedData: (x) => dispatch(actions.getPreFetchedData(x)),
    setUser: (x) => dispatch(actions.setUser(x)),
})

export default connect(mapStateToProps,mapDispatchToProps)(App)

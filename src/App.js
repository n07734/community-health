import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core/styles'
import _get from 'lodash/get'

import theme from './theme'
import Page from './components/home/Page'

import * as actions from './state/actions'

const App = ({ getPreFetchedData, themeType, setUser } = {}) => {
    useEffect(() => {
        const quertString = _get(window, 'location.search', '')
        const [, urlRepo] = (quertString.match(/repo=([^&]+)/) || [])
        getPreFetchedData(urlRepo || 'react')
    }, [])

    return (
        <MuiThemeProvider theme={theme(themeType)}>
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

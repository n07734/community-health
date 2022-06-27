import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { pathOr } from 'ramda'

import theme from './theme'
import Page from './components/home/Page'
import Loader from './components/Loader'
import {
    preFetchedRepos,
    preFetchedTeams,
} from './preFetchedInfo'
import * as actions from './state/actions'

const App = ({
    getPreFetched,
    themeType,
    setReposUserId
} = {}) => {
    useEffect(() => {
        const quertString = pathOr('', ['location', 'search'],window)
        const urlParams = new URLSearchParams(quertString);
        const repo = urlParams.get('repo') || 'facebook-jest';
        const user = urlParams.get('user') || '';

        const allItems = [
            ...preFetchedRepos,
            ...preFetchedTeams,
        ]
        const repoInfo = allItems
            .find(x => x.file === repo)

        getPreFetched(repoInfo)
        setReposUserId(user)
    }, [getPreFetched, setReposUserId])

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
    getPreFetched: (x) => dispatch(actions.getPreFetched(x)),
    setReposUserId: (x) => dispatch(actions.setUser(x)),
})

export default connect(mapStateToProps,mapDispatchToProps)(App)

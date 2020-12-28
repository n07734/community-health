import React from 'react'
import { connect } from 'react-redux'
import { pathOr } from 'ramda'

import {
    TextField,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../shared/Paper'
import Button from '../shared/Button'
import ChartDescription from '../shared/ChartDescription'
import { P, OL, LI } from '../shared/StyledTags'
import Message from './Message'

import types from '../../state/types'
import {
    storeOrg,
    storeToken,
    storeRepo,
    getAPIData,
    getPreFetchedData,
} from '../../state/actions'

const buttonText = (fetching, preFetchedRepo, pullRequests = []) => [
    fetching && 'fetching',
    preFetchedRepo && 'Get new data',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)

const FetchForm = (props) => {
    const {
        setValue,
        getData,
        fetching,
        repo,
        token,
        org,
        error,
        pullRequests = [],
        classes,
        preFetchedRepo,
        getPreFetchedRepo,
    } = props

    return (
        <Paper className={classes.dataPaper} >
            <ChartDescription
                className={classes.formDescription}
                title=""
                expandText="go here"
                intro="To get data for other repositories, "
            >
                <OL>
                    <LI>*Token is required for GitHub GraphQL API calls, go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page</LI>
                    <LI>Click on 'generate new token'</LI>
                    <LI>Choose the settings 'repo' (all) and 'read:org', click 'Generate token'</LI>
                    <LI>Use that token here</LI>
                </OL>
                <form
                    className={classes.form}
                    onSubmit={
                        (e) => {
                            e.preventDefault()

                            !fetching
                                && getData()
                        }
                    }
                >
                    <TextField
                        variant="outlined"
                        className={classes.child}
                        label="Token*"
                        margin="normal"
                        value={token}
                        onChange={setValue('token')}
                    />
                    <TextField
                        variant="outlined"
                        className={classes.child}
                        label="Organisation"
                        margin="normal"
                        value={org}
                        onChange={setValue('org')}
                    />

                    <TextField
                        variant="outlined"
                        className={classes.child}
                        label="Repository"
                        margin="normal"
                        value={repo}
                        onChange={setValue('repo')}
                    />

                    <Button
                        className={classes.child}
                        type={fetching ? 'disabled' : 'submit'}
                        variant="contained"
                        color="primary"
                        value={buttonText(fetching, preFetchedRepo, pullRequests)}
                    />

                    {
                        error
                            && <Message
                                error={error}
                                className={classes.fullRow}
                            />
                    }
                </form>
            </ChartDescription>
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    token: state.token,
    org: state.org,
    repo: state.repo,
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    preFetchedRepo: state.preFetchedRepo,
})

const mapDispatchToProps = dispatch => ({
    setValue: (key) => (event) => {
        const actions = {
            token: storeToken,
            org: storeOrg,
            repo: storeRepo,
        }
        const action = actions[key]

        const value = pathOr('', ['target', 'value'], event)
        const isDirty = /[^\w-.]/.test(value)

        !isDirty && action
            ? dispatch(action(value))
            : dispatch({
                type: types.FETCH_ERROR,
                payload: {
                    level: 'error',
                    message: 'Input validation error',
                },
            })
    },

    getData: (x) => dispatch(getAPIData(x)),
    getPreFetchedRepo: (x) => dispatch(getPreFetchedData(x)),
})

const styles = theme => ({
    form: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, max-content)',
        marginBottom: '1rem',
        columnGap: '8px',
        rowGap: '8px', // BUG: theme.spacing.unit does not have px for row but does for column, odd
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(1, 1fr)',
            gridAutoRows: '1fr'
        }
    },
    link: {
        color: theme.palette.link,
    },
    fullRow: {
        gridColumn:'1 / -1',
    },
    formDescription: {
        marginBottom: '0',
    },
    dataPaper: {
        display: 'block',
    },
    child: {
        margin: 0,
    },
    copy: {
        display: 'inline',
    },
    preFetched: {
        marginBottom: '1rem',
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))
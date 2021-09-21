import React, { useState } from 'react'
import { connect } from 'react-redux'
import { pathOr } from 'ramda'

import {
    TextField,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import ChartDescription from '../../shared/ChartDescription'
import Button from '../../shared/Button'
import { P } from '../../shared/StyledTags'
import Message from '../Message'
import styles from './styles'

import {
    storeToken,
    getAPIData,
    getPreFetchedData,
} from '../../../state/actions'

const buttonText = (fetching, preFetchedRepo, pullRequests = []) => [
    fetching && 'fetching',
    preFetchedRepo && `Get new ${preFetchedRepo} data`,
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)

const validate = (value) => /^[\w-.]+$/.test(value)

const FetchForm = (props) => {
    const {
        setToken,
        getData,
        fetching,
        error,
        pullRequests = [],
        classes,
        preFetchedRepo,
        getPreFetchedRepo,
    } = props

    const [tokenError, setTokenError] = useState(false)

    const [formToken, setFormToken] = useState('')

    const inputProps = () => ({
        className: classes.child,
        error: tokenError,
        value: formToken,
        variant: 'outlined',
        margin: 'normal',
        helperText: tokenError && 'Invalid input',
        onBlur: (event) => {
            const value = pathOr('', ['target', 'value'], event)

            const isValid = validate(value)
            setTokenError(isValid ? false : true)

            isValid
                && setFormToken(value)
        },
        onChange: (event) => {
            const value = pathOr('', ['target', 'value'], event)
            setTokenError(false)

            setFormToken(value)
        },
        onFocus: () => setTokenError(false)
    })

    const handleSubmit = (event) => {
        event.preventDefault()

        const isValid = validate(formToken)

        setTokenError(!isValid)

        isValid && !fetching
            && setToken(formToken)

        isValid && !fetching
            && getData({ appendData: true, order: 'ASC' })
    }

    return (
        <div className={classes.preFetched}>
                <P>
                    Or take a look at contribution data from some popular Open Source repositories.
                </P>
                {
                    [
                        'react',
                        'svelte',
                        'vue-next',
                        'TypeScript',
                        'material-ui',
                        'xstate',
                        'react-testing-library',
                        'node',
                        'deno',
                        'vscode',
                        'electron',
                        'kotlin',
                        'swift',
                        'ramda',
                        'babel',
                        'jest',
                        'prettier',
                        'cypress',
                    ]
                        .map((repo, i) => <Button
                            value={repo}
                            key={i}
                            color={preFetchedRepo === repo ? 'primary' : 'secondary'}
                            onClick={(e) => {
                                e.preventDefault()
                                getPreFetchedRepo(repo)
                            }}
                        />)
                }
                {
                    preFetchedRepo
                    &&  <ChartDescription
                        className={classes.formDescription}
                        title=""
                        expandText="expand this"
                        intro={`To top up ${preFetchedRepo} data`}
                    >
                        <form
                            className={classes.form}
                            onSubmit={handleSubmit}
                        >
                            <TextField
                                {...inputProps('token')}
                                label="Token*"
                            />
                            <Button
                                className={`${classes.child} ${classes.fullRow}`}
                                type={fetching ? 'disabled' : 'submit'}
                                variant="contained"
                                color="primary"
                                value={buttonText(fetching, preFetchedRepo, pullRequests)}
                            />
                        </form>
                    </ChartDescription>
                }
                {
                    error
                    && <Message
                        error={error}
                        className={classes.fullRow}
                    />
                }
            </div>
    )
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    preFetchedRepo: state.preFetchedRepo,
})

const mapDispatchToProps = dispatch => ({
    setToken: (token) => dispatch(storeToken(token)),
    getData: (x) => dispatch(getAPIData(x)),
    getPreFetchedRepo: (x) => dispatch(getPreFetchedData(x)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))

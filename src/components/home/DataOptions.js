import React, { useState } from 'react'
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

import {
    storeOrg,
    storeToken,
    storeRepo,
    storeEnterpriseAPI,
    getAPIData,
    getPreFetchedData,
    getDownloadProps,
} from '../../state/actions'

const buttonText = (fetching, preFetchedRepo, pullRequests = []) => [
    fetching && 'fetching',
    preFetchedRepo && 'Get new data',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)

const validate = ({ key, value }) => {
    const isValid = key === 'enterpriseAPI'
        ? /^(https:\/\/.+\..+|^$)/.test(value)
        : /^[\w-.]+$/.test(value)

    return isValid
}

const errorValue = formInfo => key => {
    const value = formInfo[key]
    const isValid = validate({ key, value })

    return isValid ? false : true
}

const FetchForm = (props) => {
    const {
        setValues,
        getData,
        fetching,
        error,
        pullRequests = [],
        classes,
        preFetchedRepo,
        getPreFetchedRepo,
        getDownloadInfo,
    } = props

    const [inputError, setInputError] = useState({
        token: false,
        repo: false,
        org: false,
        enterpriseAPI: false
    })

    const [formInfo, setFormInfo] = useState({
        token: '',
        repo: '',
        org: '',
        enterpriseAPI: ''
    })

    const setValue = (key, value) => setFormInfo({
        ...formInfo,
        [key]: value
    })

    const inputProps = (key) => ({
        className: classes.child,
        error: inputError[key],
        value: formInfo[key],
        variant: 'outlined',
        margin: 'normal',
        helperText: inputError[key] && 'Invalid input',
        onBlur: (event) => {
            const value = pathOr('', ['target', 'value'], event)

            const isValid = validate({ key, value })
            setInputError({
                ...inputError,
                [key]: isValid ? false : true
            })

            isValid
                && setValue(key, value)
        },
        onChange: (event) => {
            const value = pathOr('', ['target', 'value'], event)
            setInputError({
                ...inputError,
                [key]: false,
            })

            setValue(key, value)
        },
        onFocus: () => setInputError({
            ...inputError,
            [key]: false,
        })
    })

    const handleSubmit = (event) => {
        event.preventDefault()

        const getErrorValue = errorValue(formInfo)
        const newInputError = {
            'token': getErrorValue('token'),
            'org': getErrorValue('org'),
            'repo': getErrorValue('repo'),
            'enterpriseAPI': getErrorValue('enterpriseAPI'),
        }

        setInputError(newInputError)

        const allPass = Object.values(newInputError)
            .every(x => !x)

        allPass && !fetching
            && setValues(formInfo)

        allPass && !fetching
            && getData()
    }

    return (
        <Paper className={classes.dataPaper} >
            <ChartDescription
                className={classes.formDescription}
                title=""
                expandText="go here"
                intro="To get data for any repository, "
            >
                <OL>
                    <LI>*Token is required for GitHub GraphQL API calls, go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page</LI>
                    <LI>Click on 'generate new token'</LI>
                    <LI>Choose the settings 'repo' (all) and 'read:org', click 'Generate token'</LI>
                    <LI>Use that token here</LI>
                </OL>
                <form
                    className={classes.form}
                    onSubmit={handleSubmit}
                >
                    <TextField
                        {...inputProps('token')}
                        label="Token*"
                    />
                    <TextField
                        {...inputProps('org')}
                        label="Organisation"
                    />

                    <TextField
                        {...inputProps('repo')}
                        label="Repository"
                    />

                    <ChartDescription
                        className={`${classes.formDescription} ${classes.fullRow}`}
                        title=""
                        expandText="add this"
                        intro="For an enterprise GitHub repository "
                    >
                        <TextField
                            {...inputProps('enterpriseAPI')}
                            label="Enterprise API full url"
                        />
                    </ChartDescription>

                    <Button
                        className={`${classes.child} ${classes.fullRow}`}
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
                {
                    !fetching
                        && !preFetchedRepo
                        && pullRequests.length > 0
                        && <P><a className={classes.link} {...getDownloadInfo()}>Download report data</a></P>
                }
            </ChartDescription>
            <div className={classes.preFetched}>
                 <P>
                     Or take a look at contribution data from some popular Open Source repositories.
                 </P>
                 {
                     [
                         'react',
                         'vue-next',
                         'TypeScript',
                         'material-ui',
                         'node',
                         'deno',
                         'vscode',
                         'electron',
                         'kotlin',
                         'swift',
                         'ramda',
                         'babel',
                         'jest',
                         'prettier'
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
             </div>
        </Paper>
    )
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    preFetchedRepo: state.preFetchedRepo,
})

const mapDispatchToProps = dispatch => ({
    setValues: ({ token, org, repo, enterpriseAPI }) => {
        dispatch(storeToken(token))
        dispatch(storeOrg(org))
        dispatch(storeRepo(repo))
        dispatch(storeEnterpriseAPI(enterpriseAPI))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
    getPreFetchedRepo: (x) => dispatch(getPreFetchedData(x)),
})

const styles = theme => ({
    form: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        marginBottom: '1rem',
        columnGap: '8px',
        rowGap: '8px', // BUG: theme.spacing.unit does not have px for row but does for column, odd
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(1, 1fr)',
        },
        '& button': {
            minHeight: '3rem',
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
        width: '100%'
    },
    copy: {
        display: 'inline',
    },
    preFetched: {
        marginBottom: '1rem',
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))

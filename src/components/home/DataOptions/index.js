import React, { useState } from 'react'
import { connect } from 'react-redux'
import { pathOr } from 'ramda'
import {
    TextField,
    Select,
    MenuItem,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import Paper from '../../shared/Paper'
import Button from '../../shared/Button'
import ChartDescription from '../../shared/ChartDescription'
import { P } from '../../shared/StyledTags'
import Message from '../Message'
import PrefetchedOptions from './PrefetchedOptions'
import styles from './styles'

import {
    storeOrg,
    storeToken,
    storeRepo,
    storeEnterpriseAPI,
    storeAmountOfData,
    storeSortDirection,
    getAPIData,
    getPreFetchedData,
    getDownloadProps,
} from '../../../state/actions'

const buttonText = (fetching, preFetchedRepo, pullRequests = []) => [
    fetching && 'fetching',
    preFetchedRepo && `Get new ${preFetchedRepo} data`,
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
        getDownloadInfo,
    } = props

    const [inputError, setInputError] = useState({
        token: false,
        repo: false,
        org: false,
        enterpriseAPI: false
    })

    const [formInfo, setFormInfo] = useState({
        startingPoint: 'now',
        amountOfData: 1,
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
            <PrefetchedOptions />
            <ChartDescription
                className={classes.formDescription}
                title=""
                expandText="here"
                intro="Or get community contribution health data for any repository"
            >
                <form
                    className={classes.form}
                    onSubmit={handleSubmit}
                >
                    <Select
                        value={formInfo.startingPoint}
                        onChange={(e) => setValue('startingPoint', e.target.value)}
                        inputProps={{ 'aria-label': 'Starting point' }}
                        >
                        <MenuItem value="now" >Starting from now</MenuItem>
                        <MenuItem value="start">Starting from creation of the repo</MenuItem>
                    </Select>
                    <Select
                        value={formInfo.amountOfData}
                        onChange={(e) => setValue('amountOfData', e.target.value)}
                        inputProps={{ 'aria-label': 'Amount of data' }}
                        >
                        <MenuItem value={1} default>Get 100 more PRs</MenuItem>
                        <MenuItem value={20} >Get 2,000 more PRs</MenuItem>
                        <MenuItem value={100} >Get 10,000 more PRs</MenuItem>
                        <MenuItem value="all">Get it all</MenuItem>
                    </Select>

                    <TextField
                        {...inputProps('org')}
                        label="Organisation"
                    />

                    <TextField
                        {...inputProps('repo')}
                        label="Repository"
                    />
                    <TextField
                        {...inputProps('token')}
                        label="Token*"
                    />
                <P className="tokenText">
                    * To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all) and 'read:org' then click 'Generate token'.
                </P>

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
                        value={buttonText(fetching, '', preFetchedRepo ? [] : pullRequests)}
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
    setValues: ({ token, org, repo, enterpriseAPI, amountOfData, startingPoint }) => {
        dispatch(storeToken(token))
        dispatch(storeOrg(org))
        dispatch(storeRepo(repo))
        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(startingPoint === 'now'
            ? 'DESC'
            : 'ASC'
        ))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
    getPreFetchedRepo: (x) => dispatch(getPreFetchedData(x)),
})


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FetchForm))

import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    always,
    equals,
    pathOr,
    cond,
    T as alwaysTrue,
    keys,
} from 'ramda'
import {
    TextField,
    Select,
    MenuItem,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import ChartDescription from '../../shared/ChartDescription'
import { P, H } from '../../shared/StyledTags'
import Message from '../Message'
import styles from './styles'
import types from '../../../state/types'

import {
    storeOrg,
    storeRepo,
    storeToken,
    storeUserIds,
    storeTeamName,
    storeEnterpriseAPI,
    storeExcludeIds,
    storeAmountOfData,
    storeFormUntilDate,
    storeSortDirection,
    getAPIData,
    getDownloadProps,
} from '../../../state/actions'
import { pick } from 'ramda'

const buttonText = (fetching, pullRequests = []) => [
    fetching && 'fetching',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
        [equals('excludeIds'), always(/^([\w-.,\s]+|)$/.test(value))],
        [equals('userIds'), always(/^([\w-.,\s]+)$/.test(value))],
        [alwaysTrue, always(/^[\w-.]+$/.test(value))],
    ])(key)
    return isValid
}

const errorValue = formInfo => key => {
    const value = formInfo[key]
    const isValid = validate({ key, value })

    return isValid ? false : true
}

const inputLabels = {
    org: 'Organization',
    repo: 'Repository',
    token: 'Token*',
    excludeIds: "Exclude GitHub ids e.g. bots, ',' separated",
    enterpriseAPI: 'Enterprise API full url',
    userIds: 'Comma separated list of user ids',
    teamName: 'Team name',
}

const FormSection = (props) => {
    const {
        setValues,
        getData,
        fetches,
        fetching,
        error,
        pullRequests = [],
        preFetchedName = '',
        preFetchedReport = false,
        reportType = 'repo',
        classes,
        getDownloadInfo,
    } = props

    const commonInputs = {
        sortDirection: 'DESC',
        amountOfData: 1,
        token: '',
        excludeIds: '',
        enterpriseAPI: '',
    }

    const primaryInputs = reportType === 'repo'
        ? {
            org: '',
            repo: '',
        }
        : {
            userIds: '',
            teamName: '',
        }

    const defaultInputs = {
        ...commonInputs,
        ...primaryInputs,
    }

    const inputKeys = keys(defaultInputs)

    const [inputError, setInputError] = useState({})

    const inputs = preFetchedReport
        ? pick(inputKeys, fetches)
        : defaultInputs

    const [formInfo, setFormInfo] = useState(inputs)

    const setValue = (key, value) => setFormInfo({
        ...formInfo,
        [key]: value
    })

    const inputProps = (key) => ({
        label: inputLabels[key],
        className: classes.child,
        error: inputError[key] || false,
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

        const newInputError = {}
        inputKeys
            .forEach(key => newInputError[key] = getErrorValue(key))

        setInputError(newInputError)

        const allPass = Object.values(newInputError)
            .every(x => !x)

        allPass && !fetching
            && setValues(formInfo)

        allPass && !fetching
            && getData()
    }

    const hasTeamData = !preFetchedName && pullRequests.length > 0

    const itemText = (amount) => `Get ${amount} ${amount === 1 ? 'month' : 'months'} ${hasTeamData ? 'more ' : ''}data`

    return (
        <div className={classes.formDescription} >
            {
                !preFetchedReport
                    && <H level={3}>Get community data for any Team(list of users)</H>
            }
            <form
                onSubmit={handleSubmit}
            >
                <div className={classes.inputGrid}>
                    <Select
                        value={formInfo.sortDirection}
                        onChange={(e) => setValue('sortDirection', e.target.value)}
                        inputProps={{ 'aria-label': 'Starting point' }}
                    >
                        <MenuItem value="DESC" >Starting from now</MenuItem>
                        {
                            hasTeamData && <MenuItem value="ASC">Starting from current team data</MenuItem>
                        }
                    </Select>
                    <Select
                        value={formInfo.amountOfData}
                        onChange={(e) => setValue('amountOfData', e.target.value)}
                        inputProps={{ 'aria-label': 'Amount of data' }}
                    >
                        <MenuItem value={1} default>{itemText(1)}</MenuItem>
                        <MenuItem value={3} >{itemText(3)}</MenuItem>
                        <MenuItem value={6} >{itemText(6)}</MenuItem>
                        <MenuItem value={12} >{itemText(12)}</MenuItem>
                        <MenuItem value={24} >{itemText(24)}</MenuItem>
                        <MenuItem value={36} >{itemText(36)}</MenuItem>
                        <MenuItem value="all">Get it all!</MenuItem>
                    </Select>
                    {
                        keys(primaryInputs)
                            .map((inputKey) => <TextField
                                key={inputKey}
                                {...inputProps(inputKey)}
                            />)
                    }
                    <TextField
                        {...inputProps('token')}
                    />
                    <P className="tokenText">
                        * To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all) and 'read:org' then click 'Generate token'.
                    </P>
                </div>

                <ChartDescription
                    className={`${classes.formDescription} ${classes.fullRow}`}
                    title=""
                    expandText="add this"
                    intro="Advanced options"
                >
                    <div className={classes.inputGrid}>
                        <TextField
                            {...inputProps('excludeIds')}
                        />
                        <TextField
                            {...inputProps('enterpriseAPI')}
                        />
                    </div>
                </ChartDescription>

                <div className={classes.inputGrid}>
                    <Button
                        className={`${classes.child} ${classes.fullRow}`}
                        type={fetching ? 'disabled' : 'submit'}
                        variant="contained"
                        color="primary"
                        value={buttonText(fetching, '', pullRequests)}
                    />
                    {
                        error
                            && <Message
                                error={error}
                                className={classes.fullRow}
                            />
                    }
                </div>
            </form>
            {
                !fetching
                    && !preFetchedName
                    && pullRequests.length > 0
                    && <P><a className={classes.link} {...getDownloadInfo()}>Download report data</a></P>
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    preFetchedName: state.preFetchedName,
})

const mapDispatchToProps = dispatch => ({
    setValues: ({
        token,
        org,
        repo,
        userIds,
        teamName,
        enterpriseAPI,
        excludeIds,
        amountOfData,
        sortDirection
    }) => {
        dispatch(
            org
                ? storeOrg(org)
                : { type: types.CLEAR_ORG }
        )
        dispatch(
            repo
                ? storeRepo(repo)
                : { type: types.CLEAR_REPO }
        )
        userIds && dispatch(storeUserIds(userIds))
        teamName && dispatch(storeTeamName(teamName))

        dispatch(storeToken(token))
        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeExcludeIds(excludeIds))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeFormUntilDate(amountOfData))
        dispatch(storeSortDirection(sortDirection))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps,
    mapDispatchToProps)(withStyles(styles)(FormSection))

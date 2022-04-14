import React, { useState } from 'react'
import { connect } from 'react-redux'
import {
    always,
    equals,
    pathOr,
    cond,
    T as alwaysTrue
} from 'ramda'
import {
    TextField,
    Select,
    MenuItem,
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import Button from '../../shared/Button'
import ChartDescription from '../../shared/ChartDescription'
import { P } from '../../shared/StyledTags'
import Message from '../Message'
import styles from './styles'

import {
    storeToken,
    storeUserIds,
    storeTeamName,
    storeEnterpriseAPI,
    storeAmountOfData,
    storeSortDirection,
    getAPIData,
    getDownloadProps,
} from '../../../state/actions'

const buttonText = (fetching, pullRequests = []) => [
    fetching && 'fetching',
    pullRequests.length && 'Get more data',
    'Get data',
].find(Boolean)

const validate = ({ key, value }) => {
    const isValid = cond([
        [equals('enterpriseAPI'), always(/^(https:\/\/.+\..+|^$)/.test(value))],
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

const RepoData = (props) => {
    const {
        setValues,
        getData,
        fetching,
        error,
        pullRequests = [],
        classes,
        getDownloadInfo,
    } = props

    const [inputError, setInputError] = useState({
        token: false,
        enterpriseAPI: false,
        userIds: false,
        teamName: false,
    })

    const [formInfo, setFormInfo] = useState({
        startingPoint: 'now',
        amountOfData: 1,
        token: '',
        teamName: '',
        enterpriseAPI: '',
        userIds: '',
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

            console.log('-=-=--key,value,isValid', key,value,isValid)

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
            'enterpriseAPI': getErrorValue('enterpriseAPI'),
            'userIds': getErrorValue('userIds'),
            'teamName': getErrorValue('teamName'),
        }

        setInputError(newInputError)

        const allPass = Object.values(newInputError)
            .every(x => !x)

        console.log('-=-=--handleSubmitformInfo', formInfo)
        allPass && !fetching
            && setValues(formInfo)

        allPass && !fetching
            && getData()
    }

    return (
        <ChartDescription
            className={classes.formDescription}
            title=""
            expandText="here"
            intro="Or get community contribution health data for any team"
        >
            <form
                onSubmit={handleSubmit}
            >
                <div className={classes.inputGrid}>
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
                        <MenuItem value={5} >Get 500 more PRs</MenuItem>
                        <MenuItem value={100} >Get 10,000 more PRs</MenuItem>
                        <MenuItem value="all">Get it all</MenuItem>
                    </Select>

                    <TextField
                        {...inputProps('userIds')}
                        label="Comma separated list of user ids"
                    />
                    <TextField
                        {...inputProps('teamName')}
                        label="Team name"
                    />
                    <TextField
                        {...inputProps('token')}
                        label="Token*"
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
                    <TextField
                        {...inputProps('enterpriseAPI')}
                        label="Enterprise API full url"
                    />
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
                    && pullRequests.length > 0
                    && <P><a className={classes.link} {...getDownloadInfo()}>Download report data</a></P>
            }
        </ChartDescription>
    )
}

const mapStateToProps = (state) => ({
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
})

const mapDispatchToProps = dispatch => ({
    setValues: ({ token, userIds, teamName, enterpriseAPI, amountOfData, startingPoint }) => {
        dispatch(storeToken(token))
        dispatch(storeUserIds(userIds))
        dispatch(storeTeamName(userIds))
        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(startingPoint === 'now'
            ? 'DESC'
            : 'ASC'
        ))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
})


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RepoData))

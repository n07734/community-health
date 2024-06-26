import { useState } from 'react'
import { connect } from 'react-redux'
import {
    Select,
    MenuItem,
} from '@mui/material'
import { withStyles } from '@mui/styles'

import ButtonWithMessage from './ButtonWithMessage'
import SelectAmountData from './SelectAmountData'
import TextInput from './TextInput'
import TeamModal from './TeamModal'
import Download from './Download'
import ChartDescription from '../../shared/ChartDescription'

import { P } from '../../shared/StyledTags'
import styles from './styles'
import {
    inputLabels,
    formValue,
    validateForm,
} from './utils'

import {
    storeToken,
    storeAmountOfData,
    storeEvents,
    storeFormUntilDate,
    storeSortDirection,
    storeExcludeIds,
    getAPIData,
    getDownloadProps,
    checkUntilDate,
    storeUsersInfo,
} from '../../../state/actions'

const PrefetchedForm = (props) => {
    const {
        setValues,
        getData,
        fetches = {},
        fetching,
        classes,
        userIds = [],
        usersInfo = {},
        events = [],
    } = props

    const {
        repo,
        org,
        excludeIds = [],
    } = fetches

    const reportType = userIds.length > 1 && 'team'
        || userIds.length === 1 && 'user'
        || repo && org && 'repo'
        || org && 'org'

    const eventsText = events
        .map(({name, date} = {}) => `${name}=${date}`)
        .join(', ')

    const excludeIdsText = excludeIds
        .join(', ')

    const [formInfo, setFormInfo] = useState({
        sortDirection: fetches.sortDirection,
        amountOfData: fetches.amountOfData,
        token: fetches.token,
        ...( eventsText && { events: eventsText }),
        ...( excludeIdsText && { excludeIds: excludeIdsText }),
        ...( fetches.org && { org: fetches.org }),
        ...( fetches.repo && { repo: fetches.repo }),
    })

    const [inputError, setInputError] = useState({})

    const setValue = (key, value) => setFormInfo({
        ...formInfo,
        [key]: value,
    })

    const setFormValues = (newValues = {}) => {
        const updatedInfo = {
            ...formInfo,
            ...newValues,
        }

        setFormInfo(updatedInfo)
    }

    const inputStates = {
        inputError,
        setInputError,
        formInfo,
        setValue,
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const {
            isValid,
            validationErrors,
        } = validateForm(formInfo)

        setInputError(validationErrors)

        isValid && !fetching
            && setValues(formInfo)

        isValid && !fetching
            && getData()
    }

    const reportInputsHash = {
        'repo': [
            'org',
            'repo',
        ],
        'org': ['org'],
        'team': ['teamName'],
        'user': [
            'userId',
            'name',
        ],
    }
    const reportKeys = reportInputsHash[reportType]

    const hardCodedKeys = [
        ...reportKeys,
        'enterpriseAPI',
    ]

    return (
        <ChartDescription
            className={`${classes.formDescription} ${classes.fullRow}`}
            title=""
            expandText="here"
            intro="Top up this report's data"
        >
            <div className={classes.formDescription} >
                <form
                    onSubmit={handleSubmit}
                >
                    <div className={classes.inputGrid}>
                        <div className="inputDesc">
                            {
                                hardCodedKeys
                                    .filter((inputKey) => formValue(fetches, inputKey))
                                    .map((inputKey) => <P key={inputKey}>{inputLabels[inputKey]}: <b>{formValue(fetches, inputKey) || 'N/A'}</b></P>)
                            }
                            {
                                reportType === 'team' &&
                                    <TeamModal
                                        usersInfo={usersInfo}
                                        setParentValues={setFormValues}
                                    />
                            }
                        </div>
                        <TextInput
                            type="events"
                            className="inputDesc"
                            { ...inputStates }
                        />
                        <P className="inputDesc">
                            Key events can impact the data e.g. starting or launching a new feature or major version. These events can help give more context while viewing the data. e.g. ProjectA=2013-12-01.
                        </P>
                        <TextInput
                            type='excludeIds'
                            { ...inputStates }
                        />
                        <TextInput
                            type="token"
                            { ...inputStates }
                        />
                        <P className="inputDesc">
                            To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all), 'read:org' and 'user' then click 'Generate token'.
                        </P>

                        <Select
                            value={formInfo.sortDirection}
                            onChange={(e) => setValue('sortDirection', e.target.value)}
                            inputProps={{ 'aria-label': 'Starting point' }}
                        >
                            <MenuItem value="DESC" >Prepend data</MenuItem>
                            <MenuItem value="ASC">Append data</MenuItem>
                        </Select>
                        <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                    </div>
                    <ButtonWithMessage />
                </form>
                <Download />
            </div>
        </ChartDescription>
    )
}

const mapStateToProps = (state) => ({
    fetches: state.fetches,
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
    userIds: state.fetches.userIds,
    usersInfo: state.fetches.usersInfo,
    events: state.fetches.events,
})

const mapDispatchToProps = dispatch => ({
    setValues: (values) => {
        const {
            token,
            amountOfData,
            sortDirection,
            excludeIds,
            events,
            userId,
            usersInfo = {},
        } = values

        if (userId) {
            usersInfo[userId] = {
                userId,
                name,
            }
        }

        dispatch(checkUntilDate(sortDirection))
        dispatch(storeToken(token))
        dispatch(storeExcludeIds(excludeIds))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(sortDirection))
        dispatch(storeFormUntilDate(amountOfData))
        dispatch(storeEvents(events))
        Object.keys(usersInfo).length > 0 && dispatch(storeUsersInfo(usersInfo))
    },
    getData: (x) => dispatch(getAPIData(x)),
    getDownloadInfo: () => dispatch(getDownloadProps),
})

export default connect(mapStateToProps,
    mapDispatchToProps)(withStyles(styles)(PrefetchedForm))

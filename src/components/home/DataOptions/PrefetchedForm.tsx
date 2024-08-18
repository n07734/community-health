import { useState } from 'react'
import { connect } from 'react-redux'
import {
    Select,
    MenuItem,
} from '@mui/material'
import { withStyles } from '@mui/styles'
import { AmountOfData, SortDirection } from '../../../types/Querys'
import { AnyForLib, AnyForNow, FetchInfo, ReportType, UsersInfo } from '../../../types/State'
import { PullRequest } from '../../../types/FormattedData'

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

type SetValues = {
    repo?: string | undefined
    org?: string | undefined
    excludeIds?: string | undefined
    events?: string | undefined
    sortDirection: SortDirection
    amountOfData: AmountOfData
    token: string
    userId?: string | undefined
    name?: string | undefined
    usersInfo?: UsersInfo | undefined
}

type PrefetchedFormProps = {
    setValues: (values: SetValues) => void
    getData: () => void
    fetches: FetchInfo
    fetching: boolean
    classes: Record<string, string>
}
const PrefetchedForm = (props: PrefetchedFormProps) => {
    const {
        setValues,
        getData,
        fetches,
        fetching,
        classes,
    } = props

    const {
        repo,
        org,
        excludeIds = [],
        userIds = [],
        usersInfo = {},
        events = [],
    } = fetches

    const reportType:ReportType = userIds.length > 1 && 'team'
        || userIds.length === 1 && 'user'
        || !repo && org && 'org'
        || 'repo'

    const eventsText = events
        .map(({ name, date }) => `${name}=${date}`)
        .join(', ')

    const excludeIdsText = excludeIds
        .join(', ')

    const [formInfo, setFormInfo] = useState({
        sortDirection: fetches.sortDirection,
        amountOfData: fetches.amountOfData || 'all',
        token: fetches.token,
        ...(eventsText && { events: eventsText }),
        ...(excludeIdsText && { excludeIds: excludeIdsText }),
        ...(fetches.org && { org: fetches.org }),
        ...(fetches.repo && { repo: fetches.repo }),
    })

    const [inputError, setInputError] = useState({})

    const setValue = (key: string, value: string | object) => setFormInfo({
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

    const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
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
            expandQaId="expand-prefetch-form"
        >
            <div className={classes.formDescription} >
                <form
                    onSubmit={handleSubmit}
                >
                    <div className={classes.inputGrid}>
                        <div className="inputDesc">
                            {
                                hardCodedKeys
                                    .filter((inputKey:AnyForNow) => formValue(fetches, inputKey))
                                    .map((inputKey:AnyForNow) => <P key={inputKey}>{inputLabels[inputKey]}: <b>{formValue(fetches, inputKey) as string}</b></P>)
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
                            {...inputStates}
                        />
                        <P className="inputDesc">
                            Key events can impact the data e.g. starting or launching a new feature or major version. These events can help give more context while viewing the data. e.g. ProjectA=2013-12-01.
                        </P>
                        <TextInput
                            type='excludeIds'
                            {...inputStates}
                        />
                        <TextInput
                            type="token"
                            {...inputStates}
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
                    <ButtonWithMessage qaId="prefetch-top-up" />
                </form>
                <Download />
            </div>
        </ChartDescription>
    )
}

type State = {
    fetches: FetchInfo
    fetching: boolean
    error: string
    pullRequests: PullRequest[]
}
const mapStateToProps = (state: State) => ({
    fetches: state.fetches,
    fetching: state.fetching,
    error: state.error,
    pullRequests: state.pullRequests,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    setValues: (values: SetValues) => {
        const {
            token,
            amountOfData,
            sortDirection,
            excludeIds,
            events,
            userId,
            usersInfo = {},
            name,
        } = values

        if (userId && name) {
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
    getData: () => dispatch(getAPIData()),
    getDownloadInfo: () => dispatch(getDownloadProps),
})

const StyledPrefetchedForm = withStyles(styles)(PrefetchedForm)

// eslint-disable-next-line react-refresh/only-export-components
export default connect(mapStateToProps,mapDispatchToProps)(StyledPrefetchedForm)

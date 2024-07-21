import { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@mui/styles'
import { Users } from '../../../types/Components'
import { AnyForLib, ReportType } from '../../../types/State'
import { AmountOfData } from '../../../types/Querys'

import ChartDescription from '../../shared/ChartDescription'
import SelectAmountData from './SelectAmountData'
import ButtonWithMessage from './ButtonWithMessage'
import TeamModal from './TeamModal'
import TextInput from './TextInput'

import Download from './Download'
import { P, H } from '../../shared/StyledTags'
import styles from './styles'
import { validateForm } from './utils'

import {
    clearPastSearch,
    storeOrg,
    storeRepo,
    storeToken,
    storeUsersInfo,
    storeTeamName,
    storeEnterpriseAPI,
    storeExcludeIds,
    storeEvents,
    storeAmountOfData,
    storeFormUntilDate,
    storeSortDirection,
    getAPIData,
} from '../../../state/actions'

type FormSectionProps = {
    setValues: (values: any) => void
    getData: () => void
    fetching: boolean
    reportType: ReportType
    classes: Record<string, string>
}
const FormSection = (props:FormSectionProps) => {
    const {
        setValues,
        getData,
        fetching,
        reportType = 'repo',
        classes,
    } = props

    const titles = {
        repo: 'Get community data for any repo',
        team: 'Get community data for any Team(list of users)',
        user: 'Get data for an individual',
        org: 'Get community data for any Org',
    }
    const formTitle = titles[reportType]

    const reportTypeInputsHash = {
        repo: {
            org: '',
            repo: '',
        },
        org: {
            org: '',
        },
        team: {
            usersInfo: {},
            teamName: '',
        },
        user: {
            userId: '',
            name: '',
        },
    }

    type ReportTypeInputs = {
        org: string
        repo?: string
    } | {
        teamName: string
        usersInfo: Users
    } | {
        userId: string
        name: string
    }
    const reportInputs: ReportTypeInputs = reportTypeInputsHash[reportType]

    type FormInfo = {
        sortDirection: string
        amountOfData: AmountOfData
        token: string
        excludeIds: string
        enterpriseAPI: string
        usersInfo?: Users
    } & ReportTypeInputs

    const defaultInputs: FormInfo = {
        sortDirection: 'DESC',
        amountOfData: 1,
        token: '',
        excludeIds: '',
        enterpriseAPI: '',
        ...reportInputs,
    }

    const [inputError, setInputError] = useState({})
    const [formInfo, setFormInfo] = useState(defaultInputs)

    const setFormValues = (newValues = {}) => {
        const updatedInfo = {
            ...formInfo,
            ...newValues,
        }

        setFormInfo(updatedInfo)
    }

    useEffect(() => {
        setFormInfo(defaultInputs)
    }, [reportType, setFormInfo])


    const setValue = (key: string, value: string | object) => setFormInfo({
        ...formInfo,
        [key]: value,
    })

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

    const inputsHash = {
        repo: [
            {type:'org'},
            {type:'repo'},
        ],
        org: [
            {type:'org', className: 'inputDesc'},
        ],
        team: [
            {type:'teamName', className: 'inputDesc'},
        ],
        user: [
            {type:'userId'},
            {type:'name'},
        ],
    }
    const inputs = inputsHash[reportType]

    type Input = {
        type: string
        className?: string
    }
    return (
        <div className={classes.formDescription} >
            <H level={3}>{formTitle}</H>
            <form
                onSubmit={handleSubmit}
            >
                <div className={classes.inputGrid}>
                    {
                        inputs
                            .map((input: Input) => <TextInput
                                className={input.className}
                                key={input.type}
                                type={input.type}
                                { ...inputStates }
                            />)
                    }
                    {
                        reportType === 'team' &&
                            <TeamModal
                                usersInfo={formInfo.usersInfo as Users}
                                setParentValues={setFormValues}
                            />
                    }
                    <TextInput
                        className="inputDesc"
                        type='events'
                        { ...inputStates }
                    />
                    <P className="inputDesc">
                        Key events can give context when viewing the data e.g. started using copilot, launched a feature. These events can help give more context while viewing the data. e.g.  Copilot adopted=2024-02-01,Feature A=2024-04-10.
                    </P>
                    <TextInput
                        type="token"
                        { ...inputStates }
                    />
                    <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                    <P className="inputDesc">
                        To create a token go to your GitHub <a className={classes.link} href="https://github.com/settings/tokens">tokens</a> page, click on &#39;generate new token&#39;, choose the settings &#39;repo&#39; (all), &#39;read:org&#39; and &#39;user&#39; then click &#39;Generate token&#39;.
                    </P>
                </div>

                <ChartDescription
                    className={`${classes.formDescription} ${classes.fullRow}`}
                    expandText="show"
                    intro="Advanced options"
                >
                    <div className={classes.inputGrid}>
                        <TextInput
                            type="excludeIds"
                            { ...inputStates }
                        />
                        <TextInput
                            type="enterpriseAPI"
                            { ...inputStates }
                        />
                    </div>
                </ChartDescription>

                <ButtonWithMessage />
            </form>
            <Download />
        </div>
    )
}

type State = {
    fetching: boolean
    error: string
}
const mapStateToProps = (state: State) => ({
    fetching: state.fetching,
    error: state.error,
})

type SetValues = {
    org: string
    repo: string
    token: string
    amountOfData: AmountOfData
    sortDirection: string
    teamName: string
    usersInfo: any
    userId: string
    name: string
    enterpriseAPI: string
    excludeIds: string
    events: string
}
const mapDispatchToProps = (dispatch: AnyForLib) => ({
    setValues: (values: SetValues) => {
        const {
            org,
            repo,
            token,
            amountOfData,
            sortDirection,
            teamName,
            usersInfo = {},
            userId,
            name,
            enterpriseAPI,
            excludeIds,
            events,
        } = values

        if (userId) {
            usersInfo[userId] = {
                userId,
                name,
            }
        }

        dispatch(clearPastSearch({
            ...values,
            usersInfo,
        }))

        dispatch(storeToken(token))
        dispatch(storeAmountOfData(amountOfData))
        dispatch(storeSortDirection(sortDirection))
        dispatch(storeFormUntilDate(amountOfData))

        org && dispatch(storeOrg(org))
        repo && dispatch(storeRepo(repo))
        Object.keys(usersInfo).length > 0 && dispatch(storeUsersInfo(usersInfo))
        teamName && dispatch(storeTeamName(teamName))

        dispatch(storeEnterpriseAPI(enterpriseAPI))
        dispatch(storeExcludeIds(excludeIds))
        events && dispatch(storeEvents(events))
    },
    getData: () => dispatch(getAPIData()),
})

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(FormSection))

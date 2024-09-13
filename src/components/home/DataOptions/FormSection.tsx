import { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import { Users } from '@/types/Components'
import { AnyForLib, ReportType } from '@/types/State'

import ChartDescription from '@/components/shared/ChartDescription'
import SelectAmountData from './SelectAmountData'
import ButtonWithMessage from './ButtonWithMessage'
import TeamModal from './TeamModal'
import TextInput from './TextInput'

import Download from './Download'
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
} from '@/state/actions'

type SetValues = {
    org?: string | undefined
    repo?: string
    teamName?: string | undefined
    usersInfo?: Users | undefined
    userId?: string | undefined
    name?: string | undefined
    sortDirection: string
    amountOfData: number
    token: string
    excludeIds: string
    enterpriseAPI: string
    events?: string | undefined
}

type FormSectionProps = {
    setValues: (values: SetValues) => void
    getData: () => void
    fetching: boolean
    reportType: ReportType
}
const FormSection = (props:FormSectionProps) => {
    const {
        setValues,
        getData,
        fetching,
        reportType = 'repo',
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
        teamName: string
        usersInfo: Users
        userId: string
        name: string
    }
    const reportInputs: Partial<ReportTypeInputs> = reportTypeInputsHash[reportType]

    const defaultInputs  = {
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


    const setValue = (key: string, value: string | object | number) => setFormInfo({
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
            {type:'org', className: 'col-span-full'},
        ],
        team: [
            {type:'teamName', className: 'col-span-full'},
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
        <div className="mb-3">
            <h3>{formTitle}</h3>
            <form
                onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-2 gap-2 max-mm:grid-cols-1 items-end">
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
                        className="col-span-full"
                        type='events'
                        { ...inputStates }
                    />
                    <p className="col-span-full">
                        Key events can give context when viewing the data e.g. started using copilot, launched a feature. These events can help give more context while viewing the data. e.g.  Copilot adopted=2024-02-01,Feature A=2024-04-10.
                    </p>
                    <TextInput
                        type="token"
                        { ...inputStates }
                    />
                    <SelectAmountData className="mb-3 max-mm:mb-0" setValue={setValue} amountOfData={formInfo.amountOfData} />
                    <p className="col-span-full">
                        To create a token go to your GitHub <a className="text-primary" href="https://github.com/settings/tokens">tokens</a> page, click on &#39;generate new token&#39;, choose the settings &#39;repo&#39; (all), &#39;read:org&#39; and &#39;user&#39; then click &#39;Generate token&#39;.
                    </p>
                </div>

                <ChartDescription
                    className="mb-0 col-span-full"
                    expandText="show"
                    intro="Advanced options"
                >
                    <div className="grid grid-cols-2 gap-2 max-mm:grid-cols-1 items-end">
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

        if (userId && name) {
            usersInfo[userId] = {
                userId,
                name,
                dates: [],
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

export default connect(mapStateToProps, mapDispatchToProps)(FormSection)

import { useState, useEffect, useMemo } from 'react'
import { ReportType, FormSubmitData, FormSubmitDataValuesByReportType } from '@/types/State'

import ChartDescription from '@/components/shared/ChartDescription'
import SelectAmountData from './SelectAmountData'
import ButtonWithMessage from './ButtonWithMessage'
import TeamModal from './TeamModal'
import TextInput from './TextInput'

import Download from './Download'
import { validateForm } from './utils'
import { fetchInfoFromFormData, useFetchStore } from '@/state/fetch'
import { fetchGitHubDataUI } from '@/state/actions'

type FormSectionProps = {
    reportType: ReportType
}
const FormSection = ({ reportType = 'repo' }:FormSectionProps) => {
    const fetches = useFetchStore((state) => state)

    const {
        fetching = false,
    } = fetches

    const titles = {
        repo: 'Get community data for any repo',
        team: 'Get community data for any Team(list of users)',
        user: 'Get data for an individual',
        org: 'Get community data for any Org',
    }
    const formTitle = titles[reportType]

    const reportTypeInputsHash: Record<ReportType, FormSubmitDataValuesByReportType> = {
        repo: {
            reportType: 'repo',
            org: '',
            repo: '',
        },
        org: {
            reportType: 'org',
            org: '',
        },
        team: {
            reportType: 'team',
            usersInfo: {},
            teamName: '',
        },
        user: {
            reportType: 'user',
            userId: '',
            name: '',
        },
    }

    const reportInputs: FormSubmitDataValuesByReportType = reportTypeInputsHash[reportType]

    const defaultInputs: FormSubmitData = useMemo(() => ({
        sortDirection: 'DESC',
        amountOfData: 1,
        token: '',
        excludeIds: '',
        enterpriseAPI: '',
        events: '',
        ...reportInputs,
    }), [reportInputs])

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
    }, [defaultInputs, setFormInfo])

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

        if (!fetching && isValid) {
            const fetchInfo = fetchInfoFromFormData(formInfo)
            fetchGitHubDataUI({
                ...fetches,
                ...fetchInfo,
            })
        }
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
                <div className="grid grid-cols-2 gap-2 max-mm:grid-cols-1 items-start">
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
                        formInfo.reportType === 'team' &&
                            <TeamModal
                                usersInfo={formInfo.usersInfo}
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
                    <SelectAmountData className="mb-3 max-mm:mb-0 self-end" setValue={setValue} amountOfData={formInfo.amountOfData} />
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

export default FormSection

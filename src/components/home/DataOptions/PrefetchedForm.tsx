import { useState } from 'react'

import {
    AnyForNow,
    FormSubmitData,
    FormSubmitDataValuesByReportType,
    ReportType,
} from '@/types/State'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import ButtonWithMessage from './ButtonWithMessage'
import SelectAmountData from './SelectAmountData'
import TextInput from './TextInput'
import TeamModal from './TeamModal'
import Download from './Download'
import ChartDescription from '@/components/shared/ChartDescription'

import {
    inputLabels,
    formValue,
    validateForm,
} from './utils'

import { fetchGitHubData } from '@/state/actions'
import { fetchInfoFromFormData, useFetchStore } from '@/state/fetch'

const PrefetchedForm = () => {
    const fetches = useFetchStore((state) => state)
    const {
        repo = '',
        org = '',
        fetching = false,
        excludeIds = [],
        events = [],
        usersInfo = {},
        token = '',
        amountOfData = 'all',
        enterpriseAPI = '',
        reportType,
    } = fetches

    const sortDirection = 'ASC'

    const eventsText = events
        .map(({ name, date }) => `${name}=${date}`)
        .join(', ')

    const excludeIdsText = excludeIds
        .join(', ')

    const reportTypeFormValuesMap: Record<ReportType, FormSubmitDataValuesByReportType> = {
        'repo': {
            reportType: 'repo',
            org,
            repo,
        },
        'org': {
            reportType: 'org',
            org,
        },
        'team': {
            reportType: 'team',
            usersInfo,
            teamName: '',
        },
        'user': {
            reportType: 'user',
            userId: org,
            name: '',
        },
    }

    const [formInfo, setFormInfo] = useState<FormSubmitData>({
        sortDirection,
        amountOfData,
        token,
        excludeIds: excludeIdsText,
        enterpriseAPI,
        events: eventsText,
        ...reportTypeFormValuesMap[reportType],
    })

    const [inputError, setInputError] = useState({})
    const [showDowload, setShowDownload] = useState(false)

    const setValue = (key: string, value: string | number | object) => setFormInfo({
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

        if (isValid && !fetching) {
            const fetchInfo = fetchInfoFromFormData(formInfo)
            fetchGitHubData({
                ...fetches,
                ...fetchInfo,
            })
            setShowDownload(true)
        }
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
            className="mb-0 col-span-full"
            title=""
            expandText="here"
            intro="Top up this report's data"
            expandQaId="expand-prefetch-form"
        >
            <div className="mb-3">
                <form
                    onSubmit={handleSubmit}
                >
                    <div className="grid grid-cols-2 gap-2 max-mm:grid-cols-1 items-end mb-4">
                        <div className="col-span-full">
                            {
                                hardCodedKeys
                                    .filter((inputKey:AnyForNow) => formValue(fetches, inputKey))
                                    .map((inputKey:AnyForNow) => <p key={inputKey}>{inputLabels[inputKey]}: <b>{formValue(fetches, inputKey) as string}</b></p>)
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
                            className="col-span-full"
                            {...inputStates}
                        />
                        <p className="col-span-full">
                            Key events can impact the data e.g. starting or launching a new feature or major version. These events can help give more context while viewing the data. e.g. ProjectA=2013-12-01.
                        </p>
                        <TextInput
                            type='excludeIds'
                            {...inputStates}
                        />
                        <TextInput
                            type="token"
                            {...inputStates}
                        />
                        <p className="col-span-full">
                            To create a token go to your GitHub <a className="text-primary" href="https://github.com/settings/tokens">tokens</a> page, click on 'generate new token', choose the settings 'repo' (all), 'read:org' and 'user' then click 'Generate token'.
                        </p>
                        <Select
                            onValueChange={(sortDirection) => setValue('sortDirection', sortDirection)}
                            value={formInfo.sortDirection}
                        >
                            <SelectTrigger className="w-auto">
                                <SelectValue>
                                    {
                                        formInfo.sortDirection === 'DESC'
                                            ? 'Prepend data'
                                            : 'Append data'
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="DESC" >Prepend data</SelectItem>
                                    <SelectItem value="ASC">Append data</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <SelectAmountData setValue={setValue} amountOfData={formInfo.amountOfData} />
                    </div>
                    <ButtonWithMessage qaId="prefetch-top-up" />
                </form>
                { showDowload && <Download />}
            </div>
        </ChartDescription>
    )
}

export default PrefetchedForm

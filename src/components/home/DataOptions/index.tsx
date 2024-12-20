import { useState } from 'react'
import { connect } from 'react-redux'
import cond from 'ramda/es/cond'
import always from 'ramda/es/always'
import equals from 'ramda/es/equals'

import { AnyForLib } from '@/types/State'

import { clearAllData } from '@/state/actions'
import Paper from '@/components/shared/Paper'
import { Button } from '@/components/ui/button'
import PrefetchedOptions from './PrefetchedOptions'
import FormSection from './FormSection'
import {
    myPreFetchedReports,
} from '@/myReports/myReportsConfig'
import {
    preFetchedSRank23,
    preFetchedRepos,
    preFetchedOrgs,
    preFetchedTeams,
} from '@/preFetchedInfo'

type FetchFormProps = {
    clearReport: () => void
}
const FetchForm = ({ clearReport }: FetchFormProps) => {
    const queryString = window?.location?.search
    const urlParams = new URLSearchParams(queryString);
    const chosenReport =  urlParams.get('report') || myPreFetchedReports[0]?.fileName || 'facebook-react'

    const allPreFetched = [
        ...preFetchedSRank23,
        ...preFetchedRepos,
        ...preFetchedOrgs,
        ...preFetchedTeams,
        ...myPreFetchedReports,
    ]
    const isAnOSSReport = allPreFetched
        .some(x => x.fileName === chosenReport)

    const [selectedOption, setLocalOption] = useState('oss')

    const setOption = (option: string) => {
        option !== selectedOption
            && clearReport()
        setLocalOption(option)
    }

    const ossCopy = myPreFetchedReports.length > 0
        ? 'Saved and OSS Reports'
        : 'OSS Reports'

    const preFetchedText = myPreFetchedReports.length > 0
        ? 'Saved Reports'
        : ossCopy

    const allTypes = [
        ...( isAnOSSReport ? [[preFetchedText, 'oss']] : []),
        ['Make individual report', 'user'],
        ['Make team report', 'team'],
        ['Make repo report', 'repo'],
        ['Make org report', 'org'],
    ]
    const [showAllTypes, setAllTypes] = useState(false)

    const showText = selectedOption === 'oss'
        ? 'Make a report...'
        : 'Show all'

    return (
        <Paper className="block">
            <div>
                {
                    showAllTypes && allTypes
                        .map(([text, type], i: number) => <Button
                            className="text-xl normal-case mr-2 mb-3"
                            key={`${i}`}
                            variant={selectedOption === type ? undefined : 'secondary'}
                            onClick={(e: React.MouseEvent<HTMLElement>) => {
                                e.preventDefault()
                                setOption(type)
                            }}
                        >
                            {text}
                        </Button>)
                }
                {
                    <Button
                        className="text-xl normal-case mr-2 mb-3"
                        variant={showAllTypes ? undefined : 'secondary'}
                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                            e.preventDefault()
                            setAllTypes(!showAllTypes)
                        }}
                    >
                        {showAllTypes ? 'Hide unselected' : showText}
                    </Button>
                }
            </div>
            {
                cond([
                    [equals('oss'), always(<PrefetchedOptions />)],
                    [equals('repo'), always(<FormSection reportType="repo" />)],
                    [equals('org'), always(<FormSection reportType="org" />)],
                    [equals('team'), always(<FormSection reportType="team" />)],
                    [equals('user'), always(<FormSection reportType="user" />)],
                ])(selectedOption)
            }
        </Paper>
    )
}

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    clearReport: () => dispatch(clearAllData),
})

export default connect(() => ({}), mapDispatchToProps)(FetchForm)
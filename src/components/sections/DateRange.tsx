import { useState } from 'react'
import { connect } from 'react-redux'
import add from 'date-fns/add'
import sub from 'date-fns/sub'
import format from 'date-fns/format'
import formatISO from 'date-fns/formatISO'
import differenceInDays from 'date-fns/differenceInDays'

import { AnyForLib, FetchInfo, UsersInfo } from '@/types/State'
import { PullRequest, Issue } from '@/types/FormattedData'

import { Slider } from "@/components/ui/slider"
import { trimItems } from '@/state/actions'

type DateRangeProps = {
    pullRequests: PullRequest[]
    itemsDateRange: string[]
    issues: Issue[]
    usersInfo: UsersInfo
    trim: (from: string, to: string) => void
}
const DateRange = ({
    pullRequests = [],
    itemsDateRange = ['', ''],
    issues = [],
    usersInfo,
    trim,
}:DateRangeProps) => {
    /// need stable start and end dates
    const [startDate, endDate] = itemsDateRange

    const daysDiff = startDate
        ? differenceInDays(new Date(endDate), new Date(startDate))
        : 0

    const dayPercent = daysDiff / 100

    const [[left, right], setValue] = useState([0, 100])

    const leftDays = Math.floor(dayPercent * left)
    const rightDays = Math.ceil(dayPercent * right)

    const leftDate = startDate
        ? formatISO(add(new Date(startDate), { days: leftDays }), { representation: 'date' })
        : ''

    const rightDate = endDate
        ? formatISO(sub(new Date(endDate), { days: daysDiff -  rightDays}), { representation: 'date' })
        : ''
     
    const handleChange = ( newValue: number[]) => {
        if (Array.isArray(newValue) && newValue.length === 2) {
            setValue(newValue as [number, number]);
        }
    }

    const handleDone = () => {
        trim(leftDate, rightDate)
    }

    const userCount = Object.keys(usersInfo).length
    const userText = userCount > 1
        ? `by ${userCount} contributors`
        : ''

    const issuesText = issues.length > 0
        ? `and ${issues.length} issues`
        : ''

    return pullRequests.length > 0 && leftDate && <>
        <p className="w-full"><b>Showing {pullRequests.length} PRs {userText} {issuesText}</b>. Drag the points to change the date range of the report.</p>
        <div className="w-full flex justify-between">
            <p className="text-2xl mb-1">{format(new Date(leftDate), 'do MMM yy')}</p><p className="text-2xl mb-1">{format(new Date(rightDate), 'do MMM yy')}</p>
        </div>
        <Slider
            value={[left, right]}
            onValueChange={handleChange}
            onValueCommit={handleDone}
            className="pb-08"
        />
    </>
}

type State = {
    pullRequests: PullRequest[]
    issues: Issue[]
    fetches: FetchInfo
    itemsDateRange: string[]
}
const mapStateToProps = (state:State) => ({
    pullRequests: state.pullRequests,
    issues: state.issues,
    itemsDateRange: state.itemsDateRange,
    usersInfo: state.fetches.usersInfo,
})

const mapDispatchToProps = (dispatch: AnyForLib) => ({
    trim: (from:string,to:string) => dispatch(trimItems(from,to)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DateRange)

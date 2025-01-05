import { useFetchStore, useDataStore } from '@/state/fetch'

const DateRangeInfo = () => {
    const pullRequests = useDataStore(state => state.pullRequests)
    const issues = useDataStore(state => state.issues)
    const usersInfo = useFetchStore(state => state.usersInfo)

    const userCount = Object.keys(usersInfo).length
    const userText = userCount > 1
        ? `by ${userCount} contributors`
        : ''

    const issuesText = issues.length > 0
        ? `and ${issues.length} issues`
        : ''

    return pullRequests.length > 0 && <>
        <p className="w-full"><b>Showing {pullRequests.length} PRs {userText} {issuesText}</b>. Drag the points to change the date range of the report.</p>
    </>
}

export default DateRangeInfo

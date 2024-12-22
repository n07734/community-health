
import { connect } from 'react-redux'
import differenceInDays from 'date-fns/differenceInDays'
import always from 'ramda/es/always'
import cond from 'ramda/es/cond'
import alwaysTrue from 'ramda/es/T'
import equals from 'ramda/es/equals'

import { FetchInfo, FetchStatus } from '../types/State'
import { PullRequest } from '../types/FormattedData'

import {
    Dialog,
    DialogContentNoClose,
} from '@/components/ui/dialog'
import { Progress } from './ui/progress'

const getDaysRemainingText = cond([
    [equals(1), x => `${x} day remaining`],
    [x => x > 1 , x => `${x} days remaining`],
    [x => x < 0 , always('Wrapping up')],
    [alwaysTrue, always('')],
])

type LoaderProps = {
    fetches: FetchInfo
    fetching?: boolean
    fetchStatus?: FetchStatus
    pullRequests?: PullRequest[]
    formUntilDate?: string
}
const Loader = ({
    fetches,
    fetching = false,
    fetchStatus = {},
    pullRequests: pastPRs = [],
    formUntilDate = '',
}: LoaderProps) => {
    const {
        userIds = [],
        sortDirection = '',
    } = fetches

    const {
        user = '',
        prCount = 0,
        latestItemDate = '',
        issueCount = 0,
        savedReportName = '',
        reviewCount = 0,
        repoCount = 0,
    } = fetchStatus

    const isTeamSearch = userIds.length > 1

    const dayDiff = (a: Date,b: Date) => sortDirection === 'DESC'
        ? differenceInDays(a, b)
        : differenceInDays(b, a)

    const prIndex = sortDirection === 'DESC'
        ? 0
        : -1

    const startDate = pastPRs.length > 0
        ? new Date((pastPRs.at(prIndex) as PullRequest).mergedAt)
        : new Date()

    const uptoDate = latestItemDate
        ? new Date(latestItemDate)
        : startDate

    const untilDate = new Date(formUntilDate)

    const daysTotal = dayDiff(startDate, untilDate)
    const daysLoaded = dayDiff(startDate, uptoDate)
    const daysRemaining = daysTotal - daysLoaded
    const daysRemainingText = getDaysRemainingText(daysRemaining)

    const oneDayPercent = 100 / (daysTotal || 10)
    const loadedPercent = (daysLoaded * oneDayPercent)

    const usersPosition = user
        ? userIds.findIndex((userId: string) => userId === user)
        : 0

    const loadedUsers = usersPosition > 0
        ? userIds.slice(0, usersPosition)
        : []

    const oneUserPercent = 100 / (userIds.length || 10)
    const loadedUserPercent = (usersPosition * oneUserPercent)

    return (
        fetching && <Dialog open={true}>
            <DialogContentNoClose data-qa-id="loader" className="overflow-scroll max-h-full w-4/5">
                {
                    isTeamSearch
                        && <>
                            <h2>
                                Loading {usersPosition + 1} of {userIds.length} {userIds.length === 1 ? 'user' : 'users'}
                            </h2>
                            <Progress value={loadedUserPercent} />
                        </>
                }
                {
                    daysRemainingText && <h2>
                        {daysRemainingText}
                    </h2>
                }
                {
                    savedReportName
                        && <h2>
                            Fetching {savedReportName}
                        </h2>
                }
                <Progress value={loadedPercent} />
                {
                    repoCount > 0
                        && <h2>
                            {repoCount} Repos
                        </h2>
                }
                {
                    !savedReportName
                        && !isTeamSearch
                        && <>
                            <h2>
                                {prCount} Pull Requests
                            </h2>
                            <h2>
                                {issueCount} Issues
                            </h2>
                        </>
                }
                {
                    reviewCount > 0
                        && <h2>
                            {reviewCount} Reviews
                        </h2>
                }
                {
                    isTeamSearch
                        && loadedUsers.length > 0
                        && <p>
                            Loaded users: {loadedUsers.join(', ')}
                        </p>
                }
            </DialogContentNoClose>
        </Dialog>
    )
}

type State = {
    fetches: FetchInfo
    fetching: boolean
    fetchStatus: FetchStatus
    pullRequests: PullRequest[]
    formUntilDate: string
}
const mapStateToProps = (state: State) => ({
    fetches: state.fetches,
    fetching: state.fetching,
    fetchStatus: state.fetchStatus,
    pullRequests: state.pullRequests,
    formUntilDate: state.formUntilDate,
})

export default connect(mapStateToProps)(Loader)

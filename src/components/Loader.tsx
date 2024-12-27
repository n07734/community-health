
import { connect } from 'react-redux'
import differenceInDays from 'date-fns/differenceInDays'

import { FetchInfo, FetchStatus } from '../types/State'
import { PullRequest } from '../types/FormattedData'

import {
    Dialog,
    DialogTitle,
    DialogContentNoClose,
} from '@/components/ui/dialog'
import { Progress } from './ui/progress'

type TeamLoaderProps = {
    userIds: string[]
    user: string
    loadedPercent: number
}
const TeamLoader = ({ userIds, user }: TeamLoaderProps) => {
    const usersPosition = user
        ? userIds.findIndex((userId: string) => userId === user)
        : 0

    const loadedUsers = usersPosition > 0
        ? userIds.slice(0, usersPosition)
        : []

    const oneUserPercent = 100 / (userIds.length || 10)
    const loadedUserPercent = (usersPosition * oneUserPercent)

    return (
        <>
            <DialogTitle className="text-6xl font-extralight mb-08">
                Fetching {usersPosition + 1} of {userIds.length} {userIds.length === 1 ? 'user' : 'users'}
            </DialogTitle>
            <Progress value={loadedUserPercent} />
            {
                loadedUsers.length > 0
                    && <p>
                        Fetched users: {loadedUsers.join(', ')}
                    </p>
            }
        </>
    )
}

type OrgLoaderProps = {
    repo: string
    repos: string[]
    loadedPercent: number
    prCount: number
    issueCount: number
}
const OrgLoader = ({ repo, repos, loadedPercent, prCount, issueCount }: OrgLoaderProps) => {
    const repoPosition = repo
        ? repos.findIndex((repoFromList: string) => repoFromList === repo)
        : 0

    const loadedRepos = repoPosition > 0
        ? repos.slice(0, repoPosition)
        : []
    return (
        <>
            <DialogTitle className="text-6xl font-extralight mb-08">
            Fetching <span className="text-primary">{repo}</span>
            </DialogTitle>
            <Progress value={loadedPercent} />
            <h3>
                {prCount} Pull Requests
            </h3>
            <h3>
                {issueCount} Issues
            </h3>
            {
                loadedRepos.length > 0
                    && <p>
                        Fetched repos: {loadedRepos.join(', ')}
                    </p>
            }
        </>
    )}

type CommonLoaderProps = {
    user: string
    repo: string
    loadedPercent: number
    prCount: number
    issueCount: number
}
const CommonLoader = ({ user, repo, loadedPercent, prCount, issueCount }: CommonLoaderProps) => (
    <>
        <DialogTitle className="text-6xl font-extralight mb-08">
            Fetching <span className="text-primary">{user || repo}</span>
        </DialogTitle>
        <Progress value={loadedPercent} />
        <h3>
            {prCount} Pull Requests
        </h3>
        <h3>
            {issueCount} Issues
        </h3>
    </>
)

type SavedLoaderProps = {
    savedReportName: string
}
const SavedLoader = ({ savedReportName }: SavedLoaderProps) => (
    <DialogTitle className="text-6xl font-extralight mb-08">
        Fetching <span className="text-primary">{savedReportName}</span>
    </DialogTitle>
)

const loaderMap = {
    team: TeamLoader,
    user: CommonLoader,
    repo: CommonLoader,
    org: OrgLoader,
    saved: SavedLoader,
}

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
        repo = '',
        repos = [],
        savedReportName = '',
        prCount = 0,
        latestItemDate = '',
        issueCount = 0,
        paused = false,
    } = fetchStatus

    type FetchType = 'saved' | 'org' | 'repo' | 'team' | 'user'
    const fetchType: FetchType = savedReportName && 'saved'
        || userIds.length > 1 && 'team'
        || userIds.length === 1 && 'user'
        || repos.length > 1 && 'org'
        || 'repo'

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

    const oneDayPercent = 100 / (daysTotal || 10)
    const loadedPercent = (daysLoaded * oneDayPercent)

    const LoaderComponent = loaderMap[fetchType]

    return (
        fetching && <Dialog open={true}>
            <DialogContentNoClose
                aria-describedby={undefined}
                data-qa-id="loader"
                className="overflow-scroll max-h-full w-4/5"
            >
                {
                    paused
                        && <p> Fetching paused briefly due to Github api throttling.</p>
                }
                <LoaderComponent
                    userIds={userIds}
                    user={user}
                    repo={repo}
                    repos={repos}
                    prCount={prCount}
                    issueCount={issueCount}
                    savedReportName={savedReportName}
                    loadedPercent={loadedPercent}
                />
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

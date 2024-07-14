
import { connect } from 'react-redux'
import { withStyles, CSSProperties } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'
import { H, P } from './shared/StyledTags'
import differenceInDays from 'date-fns/differenceInDays'
import {
    always,
    cond,
    equals,
    T as alwaysTrue,
} from 'ramda'
import { FetchInfo, FetchStatus } from '../types/State'
import { PullRequest } from '../types/FormattedData'

type TagStyles = {
    [key: string]: CSSProperties
}
const styles = (theme: Theme): TagStyles => ({
    'root': {
        position: 'relative',
    },
    'modal': {
        position: 'fixed',
        width: '80%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: theme.palette.background.paper,
        padding: `${theme.mySpacing.x.large} ${theme.mySpacing.y.large}`,
        '& .MuiLinearProgress-dashed': {
            background: 'none',
            backgroundColor: theme.palette.primary.dark,
            animation: 'none',
        },
        '& .MuiLinearProgress-root': {
            height: '14px',
            marginBottom: theme.mySpacing.y.large,
        },
    },
    'overlay': {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 999,
        backgroundColor: theme.palette.primary.dark,
        animation: 'pulse 1s infinite alternate',
        opacity: 0.6,
    },
    '@keyframes pulse': {
        '100%': {
            opacity: 0.9,
        },
    },
})

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
    classes?: Record<string, string>
}
const Loader = ({
    fetches,
    fetching = false,
    fetchStatus = {},
    pullRequests: pastPRs = [],
    formUntilDate = '',
    classes = {},
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
        fetching && <div>
            <div className={ classes.overlay }></div>
            <div className={ classes.modal }>
                {
                    isTeamSearch
                        && <>
                            <H level={2}>
                                Loading {usersPosition + 1} of {userIds.length} {userIds.length === 1 ? 'user' : 'users'}
                            </H>
                            <LinearProgress className={classes.dashed} variant="determinate" value={loadedUserPercent} valueBuffer={oneUserPercent + loadedUserPercent}/>
                        </>
                }
                {
                    daysRemainingText && <H level={2}>
                        {daysRemainingText}
                    </H>
                }
                {
                    savedReportName
                        && <H level={2}>
                            Fetching {savedReportName}
                        </H>
                }
                <LinearProgress className={classes.dashed} variant="determinate" value={loadedPercent} valueBuffer={oneDayPercent + loadedPercent}/>
                {
                    repoCount > 0
                        && <H level={2}>
                            {repoCount} Repos
                        </H>
                }
                {
                    !savedReportName
                        && !isTeamSearch
                        && <>
                            <H level={2}>
                                {prCount} Pull Requests
                            </H>
                            <H level={2}>
                                {issueCount} Issues
                            </H>
                        </>
                }
                {
                    reviewCount > 0
                        && <H level={2}>
                            {reviewCount} Reviews
                        </H>
                }
                {
                    isTeamSearch
                        && loadedUsers.length > 0
                        && <P>
                            Loaded users: {loadedUsers.join(', ')}
                        </P>
                }
            </div>
        </div>
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

const StyledLoader = withStyles(styles)(Loader)

export default connect(mapStateToProps)(StyledLoader)

import {
    AllState,
    FormSubmitData,
    SavedEvent,
    ReportType,
    UserData,
    FetchStatus,
    FetchInfoFromForm,
    AnyForNow,
    ErrorUI,
} from '@/types/State'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { getStartEndDates, trimmer, userIdsFromString } from './actions'
import formatUserData from '@/format/userData'
import { Users } from '@/types/Components'
import { Graph } from '@/types/Graphs'
import { colors } from '@/components/colors'
import { EventInfo, Issue, PullRequest } from '@/types/FormattedData'
import { AmountOfData, OldNew, SortDirection } from '@/types/Queries'

const chartConfigDefault: Graph[] = [{
    graphId: 1,
    left: [
        {
            label: '*Trimmed Average PR Age (days)',
            color: colors[2],
            dataKey: 'age',
            groupMath: 'trimmedAverage',
        },
    ],
    right: [
        {
            label: '*Trimmed Average PR Size',
            color: colors[0],
            dataKey: 'prSize',
            groupMath: 'trimmedAverage',
        },
    ],
}]

type InitialFetchState = {
    fetching: boolean
    error: ErrorUI
    fetchStatus: FetchStatus
    preFetchedError: ErrorUI

    // From form
    usersInfo: Users
    events: SavedEvent[]
    repo: string
    org: string
    teamName: string
    excludeIds: string[]
    token: string
    sortDirection: SortDirection
    amountOfData: AmountOfData
    enterpriseAPI: string

    // Derived
    reportType: ReportType
    // repos: string[]
    userIds: string[]
    formUntilDate: string

    // API pagination
    prPagination: OldNew
    usersReviewsPagination: OldNew
    releasesPagination: OldNew
    issuesPagination: OldNew
}
const initialFetchState:InitialFetchState = {
    fetching: false,
    error: {
        level: '',
        message: '',
    },
    fetchStatus: {},
    preFetchedError: {
        level: '',
        message: '',
    },

    // From form
    usersInfo: {},
    events: [],
    repo: '',
    org: '',
    teamName: '',
    excludeIds: [],
    token: '',
    sortDirection: 'ASC',
    amountOfData: 'all',
    enterpriseAPI: '',

    // Derived
    reportType: 'repo',
    // repos: [],
    userIds: [],
    formUntilDate: '',


    // API pagination
    prPagination: {},
    usersReviewsPagination: {},
    releasesPagination: {},
    issuesPagination: {},
}

type InitialDataState = {
    reportDescription: string
    pullRequests: PullRequest[]
    reviewedPullRequests: PullRequest[]
    issues: Issue[]
    releases: EventInfo[]
    usersData: UserData[]

    // Formatted data hidden
    filteredPRs: PullRequest[]
    filteredReviewedPRs: PullRequest[]
    filteredReleases: EventInfo[]
    filteredIssues: Issue[]

    trimmedItems: {
        trimmedPRs: {
            trimmedLeftPrs: PullRequest[]
            trimmedRightPrs: PullRequest[]
        }
        trimmedReviewedPRs: {
            trimmedLeftReviewedPrs: PullRequest[]
            trimmedRightReviewedPrs: PullRequest[]
        }
        trimmedReleases: {
            trimmedLeftReleases: EventInfo[]
            trimmedRightReleases: EventInfo[]
        }
        trimmedIssues: {
            trimmedLeftIssues: Issue[]
            trimmedRightIssues: Issue[]
        }
    }

    // Prefetched data
    preFetchedName: string

    // Display config
    chartConfig: Graph[]
    itemsDateRange: string[]
}
const initialDataState:InitialDataState = {
    reportDescription: '',
    pullRequests: [],
    reviewedPullRequests: [],
    issues: [],
    releases: [],
    usersData: [],

    // Formatted data hidden
    filteredPRs: [],
    filteredReviewedPRs: [],
    filteredReleases: [],
    filteredIssues: [],
    // trimmedLeftPrs: [],
    // trimmedRightPrs: [],
    // trimmedLeftReviewedPrs: [],
    // trimmedRightReviewedPrs: [],
    // trimmedLeftIssues: [],
    // trimmedRightIssues: [],
    // trimmedLeftReleases: [],
    // trimmedRightReleases: [],
    trimmedItems: {
        trimmedPRs: {
            trimmedLeftPrs: [],
            trimmedRightPrs: [],
        },
        trimmedReviewedPRs: {
            trimmedLeftReviewedPrs: [],
            trimmedRightReviewedPrs: [],
        },
        trimmedReleases: {
            trimmedLeftReleases: [],
            trimmedRightReleases: [],
        },
        trimmedIssues: {
            trimmedLeftIssues:[],
            trimmedRightIssues:[],
        },
    },

    // Prefetched data
    preFetchedName: '',

    // Display config
    chartConfig: chartConfigDefault,
    itemsDateRange: ['', ''],
}

export const useDataStore = create(devtools<InitialDataState>(() => initialDataState))
export const useFetchStore = create(() => initialFetchState)

export const addItemsToState = (items: Partial<AllState>) => useDataStore.setState(items)

export const trimItems = (dateFrom = '', dateTo = '') => {
    console.log('trimItems', dateFrom, dateTo)
    const {
        trimmedItems: {
            trimmedPRs: {
                trimmedLeftPrs = [],
                trimmedRightPrs = [],
            } = {},
            trimmedReviewedPRs: {
                trimmedLeftReviewedPrs = [],
                trimmedRightReviewedPrs = [],
            } = {},
            trimmedReleases: {
                trimmedLeftReleases = [],
                trimmedRightReleases = [],
            } = {},
            trimmedIssues: {
                trimmedLeftIssues = [],
                trimmedRightIssues = [],
            } = {},
        } = {},
        pullRequests = [],
        reviewedPullRequests = [],
        releases = [],
        issues = [],
    } = useDataStore.getState();

    const {usersInfo} = useFetchStore.getState()

    const itemsTrimmer = trimmer(dateFrom, dateTo)

    const allPrs = [
        trimmedLeftPrs,
        pullRequests,
        trimmedRightPrs,
    ]
    const [
        newTrimmedLeftPrs,
        keptPrs,
        newTrimmedRightPrs,
    ] = itemsTrimmer<PullRequest>('mergedAt', allPrs)

    const allReviewedPrs = [
        trimmedLeftReviewedPrs,
        reviewedPullRequests,
        trimmedRightReviewedPrs,
    ]
    const [
        newTrimmedLeftReviewedPrs,
        keptReviewedPrs,
        newTrimmedRightReviewedPrs,
    ] = itemsTrimmer<PullRequest>('mergedAt', allReviewedPrs)

    const allReleases = [
        trimmedLeftReleases,
        releases,
        trimmedRightReleases,
    ]
    const [
        newTrimmedLeftReleases,
        keptReleases,
        newTrimmedRightReleases,
    ] = itemsTrimmer<EventInfo>('date', allReleases)

    const allIssues = [
        trimmedLeftIssues,
        issues,
        trimmedRightIssues,
    ]

    const [
        newTrimmedLeftIssues,
        keptIssues,
        newTrimmedRightIssues,
    ] = itemsTrimmer('mergedAt', allIssues)

    useDataStore.setState({
        pullRequests: keptPrs,
        reviewedPullRequests: keptReviewedPrs,
        usersData: formatUserData(keptPrs.concat(keptReviewedPrs), usersInfo),
        releases: keptReleases,
        issues: keptIssues,
        trimmedItems: {
            trimmedPRs: {
                trimmedLeftPrs: newTrimmedLeftPrs,
                trimmedRightPrs: newTrimmedRightPrs,
            },
            trimmedReviewedPRs: {
                trimmedLeftReviewedPrs: newTrimmedLeftReviewedPrs,
                trimmedRightReviewedPrs: newTrimmedRightReviewedPrs,
            },
            trimmedReleases: {
                trimmedLeftReleases: newTrimmedLeftReleases,
                trimmedRightReleases: newTrimmedRightReleases,
            },
            trimmedIssues: {
                trimmedLeftIssues: newTrimmedLeftIssues,
                trimmedRightIssues: newTrimmedRightIssues,
            },
        },
    })
}

export const useReportType = () => useFetchStore((state):ReportType => {
    const reportType = state.reportType
    if (reportType) {
        return reportType
    }

    const {
        teamName = '',
        userIds = [],
        repo = '',
        org = '',
    } = state

    const derivedReportType:ReportType = (teamName && 'team')
        || (userIds.length === 1 && 'user')
        || (!repo && org && 'org')
        || 'repo'

    return derivedReportType
})

export const resetStateToInitialState = () => {
    useDataStore.setState(initialDataState)
    useFetchStore.setState(initialFetchState)
}

export const setChartConfig = (config: Graph[]) => useDataStore.setState({ chartConfig: config })

export const setStateFetchStart = (optionalState:Partial<InitialFetchState> = {}) => useFetchStore.setState({
    fetching: true,
    error: {
        level: '',
        message: '',
    },
    ...optionalState,
})

export const setStateFetchEnd = () => useFetchStore.setState({ fetching: false })

export const setStateFetchFailed = (error: ErrorUI) => useFetchStore.setState({
    fetching: false,
    error,
})
export const fetchInfoFromFormData = (values: FormSubmitData): FetchInfoFromForm => {
    const {
        token,
        sortDirection,
        amountOfData,
        excludeIds: formExcludeIds,
        events: formEvents,
        reportType,
        enterpriseAPI,
    } = values

    const eventStrings = userIdsFromString(formEvents)
    const events = eventStrings
        .map((item = '') => {
            const [name = '', date = ''] = item.split('=')
            const event: SavedEvent = {
                name: name.trim(),
                date: date.trim(),
            }

            return event
        })

    const fetchInfo = ({
        reportType,
        ...(
            reportType === 'repo'
                && {
                    repo: values.repo,
                    org: values.org,
                }
        ),
        ...(
            reportType === 'org'
                && {
                    org: values.org,
                }
        ),
        ...(
            reportType === 'user'
                && {
                    [values.userId]: {
                        userId: values.userId,
                        name: values.name,
                    },
                }
        ),
        ...(
            reportType === 'team'
                && {
                    teamName: values.teamName,
                    usersInfo: values.usersInfo,
                    userIds: Object.keys(values.usersInfo),
                }
        ),
        sortDirection,
        amountOfData,
        token,
        excludeIds: userIdsFromString(formExcludeIds) || [],
        events,
        enterpriseAPI,
    })

    return fetchInfo
}

export const setStateFromGitHubFetch = (data:Partial<AllState> = {}) => {
    useDataStore.setState((state) => ({
        ...state,
        ...data,
    }))
    useFetchStore.setState((state):AnyForNow => ({
        ...state,
        ...data.fetches,
    }))
}

export const setSateFromPreFetchedData = (data: AnyForNow) => {
    const {
        usersData = [],
        fetches: {
            usersInfo = {},
        },
        pullRequests = [],
        reviewedPullRequests = [],
    } = data

    const dates = getStartEndDates(pullRequests)

    const reportSate = {
        ...data,
        fetching: false,
        itemsDateRange: dates,
        usersData: usersData.length
            ? usersData
            : formatUserData(pullRequests.concat(reviewedPullRequests), usersInfo),
    }
    reportSate.fetches = {}

    useDataStore.setState(() => ({
        ...initialDataState,
        ...reportSate,
    }))

    useFetchStore.setState(() => ({
        ...initialFetchState,
        ...data.fetches,
    }))
}


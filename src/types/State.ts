/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventInfo, PullRequest, Issue } from './FormattedData'
import { Graph } from './Graphs'
import { AmountOfData, OldNew, SortDirection } from './Queries'

export type AnyForNow = any
export type AnyForLib = any

export type ReportType = 'user' | 'team' | 'repo' | 'org'

export type UserDate = {
    startDate?: string
    endDate?: string

}
export type UserInfo = {
    userId: string
    name?: string
    dates?: UserDate[]
}

export type UsersInfo = {
    [key: string]: UserInfo
}

export type RepoInfo = {
    name?: string
    fileName: string
}

export type UserData = {
    author: string
    name: string
    approvalsByUser:Record<string, number>
    commentsByUser:Record<string, number>
    user: string
    approvalsGiven: number
    uniquePRsApproved: number
    commentsGiven: number
    commentsReceived: number
    codeCommentsGiven: number
    codeCommentsReceived: number
    generalCommentsGiven: number
    generalCommentsReceived: number
    totalPRs: number
    uniquePRsContributedTo: number
    prTotalAdditions: number
    prTotalDeletions: number
    orgCount: number
    repoCount: number
    approvalsReceived: number
    prSize: number
    prTotalAge: number
    age: number
    sentimentAveragePositiveScore: number
    sentimentTotalPositiveScore: number
    sentimentAverageNegativeScore: number
    sentimentTotalNegativeScore: number
}

export type KeysOfValue<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition
      ? K
      : never;
  }[keyof T];

export type UserDataNumbersKeys = KeysOfValue<UserData, number>
export type UserDataByUserKeys = KeysOfValue<UserData, Record<string, number>>

export type SavedEvent = {
    name: string
    date: string
}

export type FetchFormInfo = {
    usersInfo: UsersInfo
    events: SavedEvent[]
    repo: string
    org: string
    teamName: string
    excludeIds: string[]
    token: string
    sortDirection: SortDirection
    amountOfData?: AmountOfData
    enterpriseAPI?: string
}

export type FetchApiInfo = {
    repos?: string[]
    userIds?: string[]
    prPagination: OldNew
    usersReviewsPagination?: OldNew
    releasesPagination?: OldNew
    issuesPagination: OldNew
}

export type FetchInfoShared = {
    sortDirection: SortDirection
    amountOfData: AmountOfData
    token: string
    excludeIds: string[]
    enterpriseAPI: string
    events: SavedEvent[]
}

export type FetchInfoRepo = {
    reportType: 'repo'
    org: string
    repo: string
    prPagination: OldNew
    releasesPagination: OldNew
    issuesPagination: OldNew
}

export type FetchInfoOrg = {
    reportType: 'org'
    org: string
    prPagination: OldNew
    issuesPagination: OldNew
}

export type FetchInfoUserOrUser = {
    reportType: 'user'
    usersInfo: UsersInfo
    prPagination: Record<string, OldNew>
    usersReviewsPagination: Record<string, OldNew>
    issuesPagination: Record<string, OldNew>
}

export type FetchInfoUserOrTeam = {
    reportType: 'team'
    usersInfo: UsersInfo
    prPagination: Record<string, OldNew>
    issuesPagination: Record<string, OldNew>
}

export type FetchInfoFromForm = {
    sortDirection: SortDirection
    amountOfData: AmountOfData
    token: string
    excludeIds: string[]
    enterpriseAPI: string
    events: SavedEvent[]
    reportType: ReportType
    org?: string
    repo?: string
    usersInfo?: UsersInfo
    userIds?: string[]
    teamName?: string
}

export type FetchInfo = FetchInfoFromForm & {
    // For API calls
    fetchStatus: FetchStatus
    repos?: string[]
    user?: string
    prPagination: OldNew
    usersReviewsPagination?: OldNew
    releasesPagination?: OldNew
    issuesPagination: OldNew
}

type RequireKeys<T extends object, rType extends ReportType, K extends keyof T> =
  Required<Pick<T, K>> & Omit<T, K> & { reportType: rType } ;


export type FetchInfoForRepo = RequireKeys<FetchInfo, 'repo', 'repo' | 'org'>
type NestedPagination = {
    prPagination: Record<string, OldNew>
    usersReviewsPagination: Record<string, OldNew>
    issuesPagination: Record<string, OldNew>
}
export type FetchInfoForOrg = RequireKeys<FetchInfo, 'org', 'org'> & NestedPagination
export type FetchInfoForUser = RequireKeys<FetchInfo, 'user', 'usersInfo' | 'userIds'> & NestedPagination
export type FetchInfoForTeam = RequireKeys<FetchInfo, 'team', 'teamName' | 'usersInfo' | 'userIds'> & NestedPagination

export type FetchInfoRequired = FetchInfoForOrg | FetchInfoForRepo | FetchInfoForUser | FetchInfoForTeam

export type FetchInfozz = FetchInfoShared & (
    FetchInfoRepo
    | FetchInfoOrg
    | FetchInfoUserOrUser
    | FetchInfoUserOrTeam
)

export type FetchStatus = {
    user?: string
    repo?: string
    repos?: string[]
    prCount?: number
    latestItemDate?: string
    issueCount?: number
    savedReportName?: string
    reviewCount?: number
    repoCount?: number
    paused?: boolean
    fetching?: boolean
}

export type FormSubmitDataShared = {
    reportType: ReportType
    sortDirection: SortDirection
    amountOfData: AmountOfData
    token: string
    excludeIds: string
    enterpriseAPI: string
    events: string
}

export type FormSubmitDataRepo = {
    reportType: 'repo'
    org: string
    repo: string
}

export type FormSubmitDataOrg = {
    reportType: 'org'
    org: string
}

export type FormSubmitDataUser = {
    reportType: 'user'
    userId: string
    name: string
}

export type FormSubmitDataTeam = {
    reportType: 'team'
    teamName: string
    usersInfo: UsersInfo
}

export type FormSubmitDataValuesByReportType =
    FormSubmitDataRepo
    | FormSubmitDataOrg
    | FormSubmitDataUser
    | FormSubmitDataTeam

export type FormSubmitData =
    FormSubmitDataShared
    & (FormSubmitDataValuesByReportType)

export type ErrorUI = {
    level: 'warn' | 'error' | ''
    message: string
}

export type AllState = {
    fetching: boolean
    fetchStatus: FetchStatus
    error: ErrorUI
    preFetchedError: ErrorUI
    fetches: FetchInfo
    formUntilDate: string
    reportDescription: string
    pullRequests: PullRequest[]
    reviewedPullRequests: PullRequest[]
    issues: Issue[]
    releases: EventInfo[]
    usersData: UserData[]
    filteredPRs: PullRequest[]
    filteredReviewedPRs: PullRequest[]
    filteredReleases: EventInfo[]
    filteredIssues: Issue[]
    // TODO: Flatten trimmedItems
    // trimmedLeftPrs: PullRequest[]
    // trimmedRightPrs: PullRequest[]
    // trimmedLeftReviewedPrs: PullRequest[]
    // trimmedRightReviewedPrs: PullRequest[]
    // trimmedLeftIssues: Issue[]
    // trimmedRightIssues: Issue[]
    // trimmedLeftReleases: EventInfo[]
    // trimmedRightReleases: EventInfo[]
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
        },
        trimmedIssues: {
            trimmedLeftIssues: Issue[]
            trimmedRightIssues: Issue[]
        }
    }
    preFetchedName: string
    chartConfig: Graph[]
    itemsDateRange: string[]
}

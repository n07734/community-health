import { ObjNumbers, ObjStrings } from './Components'
import { EventInfo, PullRequest, Issue } from './FormattedData'
import { SortDirection } from './Querys'

export type AnyForNow = any
export type AnyForLib = any

export type ReportType = 'user' | 'team' | 'repo' | 'org'

type UserDate = {
    startDate: string
    endDate: string
}

type UserDate = {
    startDate?: string
    endDate?: string

}
type UserInfo = {
    userId: string
    name?: string
    dates?: UserDate[]
}

export type UsersInfo = {
    [key: string]: UserInfo
}

type RepoInfo = {
    name?: string
    fileName: string
}

export type UserData = {
    author: string
    user: string
    name: string
    approvalsByUser: ObjNumbers
    commentsByUser: ObjNumbers
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
export type UserDataByUserKeys = KeysOfValue<UserData, ObjNumbers>

export type FetchInfo = {
    usersInfo: UsersInfo
    events: EventInfo[]
    repo: string
    org: string
    teamName: string
    userIds: string[]
    excludeIds: string[]
    token: string
    sortDirection: SortDirection
    enterpriseAPI?: string
    prPagination?: ObjStrings
    usersReviewsPagination?: ObjStrings
    releasesPagination?: ObjStrings
    issuesPagination?: ObjStrings
}

type FetchStatus = {
    user?: string
    prCount?: number
    latestItemDate?: string
    issueCount?: number
    savedReportName?: string
    reviewCount?: number
    repoCount?: number
}

export type AllState = {
    fetches: FetchInfo
    preFetchedName: string
    reportDescription: string
    filteredPRs: PullRequest[]
    pullRequests: PullRequest[]
    filteredReviewedPRs: PullRequest[]
    reviewedPullRequests: PullRequest[]
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
    }
    usersData: UserData[]
    issues: Issue[]
    filteredIssues: Issue[]
    formUntilDate: string
    releases: EventInfo[]
    filteredReleases: EventInfo[]
    isValid: boolean
}
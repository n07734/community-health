/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventInfo, PullRequest, Issue } from './FormattedData'
import { AmountOfData, SortDirection } from './Queries'

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
export type FetchInfo = {
    usersInfo: UsersInfo
    events: SavedEvent[]
    repo: string
    org: string
    teamName: string
    userIds: string[]
    excludeIds: string[]
    token: string
    sortDirection: SortDirection
    amountOfData?: AmountOfData
    enterpriseAPI?: string
    prPagination?:Record<string, string>
    usersReviewsPagination?:Record<string, string>
    releasesPagination?:Record<string, string>
    issuesPagination?:Record<string, string>
}

export type FetchStatus = {
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
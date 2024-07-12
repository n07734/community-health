import { ObjNumbers } from "./Components"

type State = {
    [key: string]: any
}

export type ReportType = 'user' | 'team' | 'repo' | 'org'

type UserDate = {
    startDate: string
    endDate: string
}

type UserInfo = {
    userId: string
    name: string
    dates?: any[]
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

type KeysOfValue<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition
      ? K
      : never;
  }[keyof T];

type UserDataNumbersKeys = KeysOfValue<UserData, number>
export type UserDataNumbers = Pick<UserData, UserDataNumbersKeys>

export type FetchInfo = {
    usersInfo: UsersInfo
    events: any[]
    repo: string
    org: string
    teamName: string
    userIds: string[]
    token: string
}

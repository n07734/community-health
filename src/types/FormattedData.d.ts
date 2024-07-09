import { is } from "ramda"

export type PullRequest = {
    id: string
    number: number
    repo: string
    org: string
    author: string
    url: string
    additions: number
    deletions: number
    prSize: number
    mergedAt: string
    cycleTime: number
    age: number
    approvals: number
    approvers: ObjNumbers

    comments: number
    commentsAuthor: number
    commenters: ObjNumbers

    codeComments: number
    codeCommentsAuthor: number
    codeCommenters: ObjNumbers
    teamApprovers?: ObjNumbers
    teamCommenters?: ObjNumbers

    generalComments: number
    generalCommentsAuthor: number
    generalCommenters: ObjNumbers

    generalCommentSentimentScore: number
    generalCommentSentiments: ObjNumbers

    commentSentimentScore: number
    commentSentimentTotalScore: number
    commentSentiments: ObjNumbers

    commentAuthorSentimentScore: number

    commentSentimentTotalScore: number
    [key:`repo-${string}`]: number
    [key:`${string}-commentsSentimentScore`]: number
    [key:`${string}-commentAuthorSentimentScore`]: number
}

export type Issue = {
    mergedAt: string
    age: number
    url: string
    isBug: boolean
}

type ReleaseType = 'MAJOR' | 'MINOR' | 'PATCH'

export type EventInfo = {
    date: string
    description: string
    releaseType: ReleaseType
}
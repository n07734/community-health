export type PullRequest = {
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
    approvers: Record<string, number>

    comments: number
    commentsAuthor: number
    commenters: Record<string, number>

    codeComments: number
    codeCommentsAuthor: number
    codeCommenters: Record<string, number>
    teamApprovers?: Record<string, number>
    teamCommenters?: Record<string, number>

    generalComments: number
    generalCommentsAuthor: number
    generalCommenters: Record<string, number>

    generalCommentSentimentScore: number
    generalCommentSentiments: Record<string, number>

    commentSentimentScore: number
    commentSentimentTotalScore: number
    commentSentiments: Record<string, number>

    commentAuthorSentimentScore: number
}

export type Issue = {
    mergedAt: string
    createdAt: string
    age: number
    url: string
    isBug: boolean
}

export type ReleaseType = 'MAJOR' | 'MINOR' | 'PATCH' | "EVENT"

export type EventInfo = {
    date: string
    description: string
    releaseType: ReleaseType
}
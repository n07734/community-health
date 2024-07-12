
import { PullRequest } from './PullRequest'

type LineDataKey =
    | 'commentSentimentScore'
    | 'commentAuthorSentimentScore'
    | 'commentSentimentTotalScore'
    | 'prSize'
    | 'age'
    | 'comments'
    | 'codeComments'
    | 'generalComments'
    | 'approvals'
    | 'additions'
    | 'deletions'
    | 'author'
    | 'cycleTime'

type IssuesDataKey =
    | 'isBug'
    | 'isFeature'

type CustomDataKey =
    | 'growth'

type CustomLineDataKey = LineDataKey | CustomDataKey | IssuesDataKey

type UserDataKey =
    | 'teamOnlyComments'
    | 'teamOnlyApprovals'
    | 'commentsGiven'
    | 'commentsReceived'
    | 'approvalsGiven'
    | 'approvalsReceived'
    | 'totalPRs'
    | 'uniquePRsApproved'

export type LineInfo = {
    label: string
    color: AllowedColors
    data: any[]
    filterForKey?: boolean
    groupMath?: GroupMath
    dataKey: LineDataKey
    lineStyles?: any
    yMax?: number
}

export type Lines = {
    lines: LineInfo[]
    xAxis: 'left' | 'right'
    data: any[]
}

export type LineForGraph = {
    id: string
    color: AllowedColors
    data: LinePlot[]
}

type LinePlot = {
    x: string
    y: number
}

type LinePlotRight = LinePlot & {
    originalY: number
}

type CalculationArgs = { filteredBatch: PullRequest[], dataKey:LineDataKey }
export type GroupMathCalculation = {
    sum: () => number
    average: () => number
    count: () => number
    median: (arg:CalculationArgs) => number
    teamDistribution: (arg:CalculationArgs) => number
    trimmedAverage: (arg:CalculationArgs) => number
    percentWith: (arg:CalculationArgs) => number
    growth: (arg:{ filteredBatch: PullRequest[] }) => number
    averagePerDev: (arg:{ filteredBatch: PullRequest[] }) => number
}

export type GroupMath = keyof GroupMathCalculation

export type GraphLine = {
    label: string,
    color: AllowedColors,
    dataKey: CustomLineDataKey,
    groupMath: GroupMath,
}

export type Graph = {
    graphId: number,
    left: GraphLine[],
    right: GraphLine[],
}

type GraphOptions = {
    label: string,
    dataKey: CustomLineDataKey,
    groupMaths: GroupMath[],
}

type GraphFormInfo = {
    label: string,
    dataKey: CustomLineDataKey,
    color: AllowedColors,
    lineSide: 'left' | 'right',
    groupMath: GroupMath,
}

export type ColumnKeys =
    | 'comments'
    | 'codeComments'
    | 'generalComments'
    | 'approvals'
    | 'prSize'
    | 'additions'
    | 'deletions'
    | 'age'
    | 'mergedAt'
    | 'commentSentimentScore'
    | 'commentAuthorSentimentScore'
    | 'commentSentimentTotalScore'
    | 'commentsGiven'
    | 'url'
    | 'author'
    | 'growth'
    | 'repo'
    | 'isBug'